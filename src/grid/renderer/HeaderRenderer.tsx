// src/grid/components/HeaderRenderer.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { HeaderRenderProps, IHeaderRenderer } from '../base/GridInterfaces';
import { Column } from '../models/column';
import { Row } from '../models/row';
import { Cell } from '../models/cell';
import { RowRenderer } from './RowRenderer';
import { CellType } from '../base/enum';
import * as events from '../base/constant';
import * as literals from '../base/string-literals';
import { getStyleValue } from '../base/util';
import { Scroll, useScroll } from '../actions/useScroll';



/**
 * Content module is used to render grid header
 *
 * @hidden
 */
export const HeaderRenderer = forwardRef<IHeaderRenderer, HeaderRenderProps>((props, ref) => {
  const { parent, serviceLocator, onHeaderRendered } = props;
  const headerPanelRef = useRef<HTMLDivElement>(null);
  const headerTableRef = useRef<HTMLTableElement>(null);
  const colgroupRef = useRef<HTMLTableColElement>(null);
  const [rows, setRows] = useState<Row<Column>[]>([]);
  const [colDepth, setColDepth] = useState(0);
  const scroll = parent?.scrollModule as Scroll
  const { headerContentBorder = {}, headerPadding = {} } = scroll || {};
  
  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    renderPanel: () => renderPanel(),
    renderTable: () => renderTable(),
    getPanel: () => headerPanelRef.current,
    getTable: () => headerTableRef.current,
    getColGroup: () => colgroupRef.current,
    setColGroup: (colGroup: HTMLElement) => {
      if (colgroupRef.current) {
        colgroupRef.current.innerHTML = '';
        Array.from(colGroup.children).forEach(child => {
          colgroupRef.current?.appendChild(child.cloneNode(true));
        });
      }
    },
    getRowObject: () => rows,
    refreshUI: () => refreshUI(),
  }));

  /**
   * The function is used to render grid header div
   */
  const renderPanel = useCallback(() => {
    // This component already creates the panel in the render
    return headerPanelRef.current;
  }, []);

  /**
   * The function is used to render grid header table
   */
  const renderTable = useCallback(() => {
    // Generate rows and cells data
    const columns = parent?.getColumns() || [];
    const depth = measureColumnDepth(columns);
    setColDepth(depth);
    
    // Generate rows based on column depth
    const generatedRows: Row<Column>[] = [];
    for (let i = 0; i < depth; i++) {
      generatedRows[i] = generateRow(i);
      generatedRows[i].cells = [];
    }
    
    // Process rows to add cells
    const processedRows = ensureColumns(generatedRows);
    const rowsWithCells = generateHeaderCells(processedRows);
    
    setRows(rowsWithCells);
    
    // Notify that header is refreshed
    if (onHeaderRendered) {
      onHeaderRendered(rowsWithCells);
    }
    
    return headerTableRef.current;
  }, [parent]);

  // Measure the depth of nested columns
  const measureColumnDepth = useCallback((columns: Column[]): number => {
    let depth = 1;
    for (const column of columns) {
      if (column.columns) {
        depth = Math.max(depth, 1 + measureColumnDepth(column.columns as Column[]));
      }
    }
    return depth;
  }, []);

  // Generate a row data object
  const generateRow = useCallback((index: number): Row<Column> => {
    return Row<Column>({});
  }, []);

  // Add special columns (grouping, details, etc)
  const ensureColumns = useCallback((rows: Row<Column>[]): Row<Column>[] => {
    if (!parent) return rows;
    
    // for (let i = 0; i < rows.length; i++) {
    //   // Add grouping columns if needed
    //   if (parent.allowGrouping) {
    //     for (let c = 0; c < (parent.groupSettings?.columns?.length || 0); c++) {
    //       rows[i].cells.push(generateCell({} as Column, CellType.HeaderIndent));
    //     }
    //   }
      
    //   // Add detail template or child grid column if needed
    //   if (parent.detailTemplate || parent.childGrid) {
    //     rows[i].cells.push(generateCell({} as Column, CellType.DetailHeader));
    //   }
    // }
    
    return rows;
  }, [parent]);

  // Generate header cells based on columns
  const generateHeaderCells = useCallback((rows: Row<Column>[]): Row<Column>[] => {
    if (!parent) return rows;
    
    const cols = parent.getColumns() as Column[];
    
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      
      if (!col.columns) {
        // Simple column
        rows[0].cells.push(generateCell(
          col, 
          CellType.Header, 
          colDepth,
          i === 0 ? 'e-firstcell' : '',
          0,
          i
        ));
      } else {
        // Stacked column
        const colSpan = calculateColumnSpan(col);
        
        rows[0].cells.push(Cell<Column>({
          cellType: CellType.StackedHeader,
          column: col,
          colSpan: colSpan,
          className: i === 0 ? 'e-firstcell' : ''
        }));
        
        // Process nested columns
        processNestedColumns(col, rows, 1, i === 0, i === (cols.length - 1));
      }
    }
    
    return rows;
  }, [parent, colDepth]);

  // Calculate total span of a column with nested columns
  const calculateColumnSpan = useCallback((column: Column): number => {
    if (!column.columns) return 1;
    
    let span = 0;
    for (const col of column.columns) {
      span += calculateColumnSpan(col as Column);
    }
    return span;
  }, []);

  // Process nested columns recursively
  const processNestedColumns = useCallback((
    column: Column, 
    rows: Row<Column>[], 
    depth: number, 
    isFirstObj: boolean,
    isLastObj: boolean
  ) => {
    if (!column.columns) return;
    
    for (let i = 0; i < column.columns.length; i++) {
      const col = column.columns[i] as Column;
      const isFirstCol = i === 0;
      const isLastCol = i === column.columns.length - 1 && isLastObj;
      
      if (!col.columns) {
        // Simple column
        rows[depth].cells.push(generateCell(
          col, 
          CellType.Header, 
          colDepth - depth,
          (isFirstObj && isFirstCol ? 'e-firstcell' : '') + (isLastCol ? ' e-lastcell' : ''),
          depth,
          i
        ));
      } else {
        // Another stacked column
        const colSpan = calculateColumnSpan(col);
        
        rows[depth].cells.push(Cell<Column>({
          cellType: CellType.StackedHeader,
          column: col,
          colSpan: colSpan,
          className: (isFirstObj && isFirstCol ? 'e-firstcell' : '') + (isLastCol ? ' e-lastcell' : '')
        }));
        
        // Process nested columns
        processNestedColumns(col, rows, depth + 1, isFirstObj && isFirstCol, isLastCol);
      }
    }
  }, [colDepth]);

  // Generate a cell data object
  const generateCell = useCallback(
    (column: Column, cellType?: CellType, rowSpan?: number, className?: string, rowIndex?: number, colIndex?: number): Cell<Column> => {
      const opt: any = {
        'visible': column.visible,
        'isDataCell': false,
        'isTemplate': !isNullOrUndefined(column.headerTemplate),
        'rowID': '',
        'column': column,
        'cellType': cellType,
        'rowSpan': rowSpan,
        'className': className,
        'index': rowIndex,
        'colIndex': colIndex
      };

      if (!opt.rowSpan || opt.rowSpan < 2) {
        delete opt.rowSpan;
      }

      return Cell<Column>(opt);
    }, []);

  /**
   * Refresh the header of the Grid.
   */
  const refreshUI = useCallback(() => {
    renderTable();
  }, [renderTable]);

  // Memoize the colgroup content
  const renderColGroup = useMemo(() => {
    if (!parent) return null;
    
    const columns = parent.getColumns() as Column[];
    
    return (
      <colgroup ref={colgroupRef} id={parent.element?.id + "_colgroup"}>
        {/* {parent.allowGrouping && parent.groupSettings?.columns?.map((_, i) => (
          <col key={`group-${i}`} className="e-group-intent" />
        ))}
        
        {(parent.detailTemplate || parent.childGrid) && (
          <col className="e-detail-intent" />
        )} */}
        
        {columns.map((col, i) => (
          <col 
            key={`col-${i}`} 
            style={{ display: col.visible === false ? 'none' : undefined, width: getStyleValue(col.width) }}
          />
        ))}
      </colgroup>
    );
  }, [parent?.getColumns()]);//, parent?.allowGrouping, parent?.detailTemplate, parent?.childGrid

  // Helper function
  const isNullOrUndefined = (value: any): boolean => {
    return value === undefined || value === null;
  };

  return (
    <div className="e-gridheader" ref={headerPanelRef} style={headerPadding}>
      <div className={literals.headerContent} style={headerContentBorder}>
        <table 
          ref={headerTableRef}
          className={literals.table}
          role="presentation"
          style={{ borderCollapse: 'separate', borderSpacing: '.25px' }}
        >
          <caption className="e-hide">{parent?.element?.id}_header_table</caption>
          {renderColGroup}
          
          <thead role="rowgroup">
            {rows.map((row, rowIndex) => (
              <RowRenderer 
                key={`header-row-${rowIndex}`}
                serviceLocator={serviceLocator}
                cellType={CellType.Header}
                parent={parent}
                row={row}
                columns={parent?.getColumns() || []}
              />
            ))}
          </thead>
          
          {/* <tbody 
            className={parent?.frozenRows || ((parent?.enableVirtualization || parent?.enableInfiniteScrolling) && parent?.editSettings?.showAddNewRow) ? '' : 'e-hide'} 
            role="rowgroup"
          > */}
            {/* Frozen rows can be added here if needed */}
          {/* </tbody> */}
        </table>
      </div>
    </div>
  );
});
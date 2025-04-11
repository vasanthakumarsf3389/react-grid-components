// src/grid/components/ContentRenderer.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ContentRenderProps, IContentRender } from '../base/GridInterfaces';
import { RowRenderer } from './RowRenderer';
import { Column } from '../models/column';
import { Row } from '../models/row';
import { RowModelGenerator } from '../services/row-model-generator';
import * as events from '../base/constant';
import * as literals from '../base/string-literals';
import { getStyleValue } from '../base/util';
import { formatUnit, IL10n } from '@syncfusion/react-base';

/**
 * Content module is used to render grid content
 *
 * @hidden
 */
export const ContentRenderer = forwardRef<IContentRender, ContentRenderProps>((props, ref) => {
  const { parent, serviceLocator, onContentRendered } = props;
  const contentPanelRef = useRef<HTMLDivElement>(null);
  const contentTableRef = useRef<HTMLTableElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const colgroupRef = useRef<HTMLTableColElement>(null);
  const [rows, setRows] = useState<Row<Column>[]>([]);
  const [rowElements, setRowElements] = useState<HTMLTableRowElement[]>([]);
  const localizer = serviceLocator.getService<IL10n>('localization');
  // Create model generator
  const generator = useMemo(() => {
    return RowModelGenerator(parent);
  }, [parent]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    renderPanel: () => renderPanel(),
    renderTable: () => renderTable(),
    getPanel: () => contentPanelRef.current,
    getTable: () => contentTableRef.current,
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
    getRowElements: () => rowElements,
    setRowElements: (elements: HTMLTableRowElement[]) => setRowElements(elements),
    refreshContentRows: (args = {}) => refreshContentRows(args),
    renderEmpty: () => renderEmpty(),
  }));

  /**
   * The function is used to render grid content div
   */
  const renderPanel = useCallback(() => {
    // This component already creates the panel in the render
    return contentPanelRef.current;
  }, []);

  /**
   * The function is used to render grid content table
   */
  const renderTable = useCallback(() => {
    // This component already creates the table in the render
    // We just need to copy the colgroup from header
    if (parent) {
      const headerColGroup = parent.getHeaderTable()?.querySelector(literals.colGroup);
      if (headerColGroup && colgroupRef.current) {
        // Copy colgroup from header table
        colgroupRef.current.innerHTML = '';
        Array.from(headerColGroup.children).forEach(child => {
          colgroupRef.current?.appendChild(child.cloneNode(true));
        });
      }
      
    //   // Setup selection attributes if needed
    //   if (parent.selectionSettings?.type === 'Multiple') {
    //     parent.element.setAttribute('aria-multiselectable', 'true');
    //   }
    }
    
    return contentTableRef.current;
  }, [parent]);

  /**
   * Refresh the content of the Grid.
   *
   * @param {NotifyArgs} args - specifies the args
   */
  const refreshContentRows = useCallback((args = {}) => {
    if (!parent || !parent.currentViewData || parent.currentViewData.length === 0) {
      renderEmpty();
      return;
    }
    
    // Generate row models from data
    const modelData = generator.generateRows(parent.currentViewData, args);
    setRows(modelData);
    
    // Capture row elements after render
    if (tbodyRef.current) {
      setRowElements(Array.from(tbodyRef.current.children) as HTMLTableRowElement[]);
    }
    
    // Notify content ready
    if (onContentRendered) {
      onContentRendered(modelData);
    }
    
    // Trigger dataBound event when content is ready
    parent.dataBound && parent.dataBound({});
  }, [parent.currentViewData, generator]);

  /**
   * Renders empty row to Grid which is used when there are no records.
   */
  const renderEmpty = useCallback(() => {
    setRows([]);
    // Special empty row will be rendered in the component's return
  }, []);

  /**
   * Memoize the empty row to avoid unnecessary re-renders
   */
  const emptyRow = useMemo(() => {
    if (!parent) return null;
    
    const colSpan = (parent.getColumns()?.length || 0) + 0;
                    // (parent.allowGrouping ? parent.groupSettings?.columns?.length || 0 : 0) + 
                    // (parent.detailTemplate || parent.childGrid ? 1 : 0);
    
    return (
      <tr className="e-emptyrow" role="row">
        <td 
          colSpan={colSpan} 
          className="e-leftfreeze"
          style={{ left: '0px' }}
        >
          {/* {parent.emptyRecordTemplate ? (
            <div dangerouslySetInnerHTML={{ __html: parent.emptyRecordTemplate }} />
          ) : (
            localizer?.getConstant('EmptyRecord')
          )} */}
          {localizer?.getConstant('EmptyRecord')}
          {/* No records to display */}
        </td>
      </tr>
    );
  }, [parent]);

  return (
    <div className={literals.gridContent} ref={contentPanelRef}>
      <div className={literals.content} style={{height: formatUnit(parent?.height as string | number)}}>
        <table 
          ref={contentTableRef}
          className={literals.table}
          role="presentation"
          id={parent?.element?.id + '_content_table'}
          style={{ borderCollapse: 'separate', borderSpacing: '.25px' }}
        >
          <colgroup ref={colgroupRef} id={`content-${parent?.element?.id}_colgroup`}>
            {(parent?.getColumns() || []).map((col, i) => (
              <col 
                key={`col-${i}`} 
                style={{ display: col.visible === false ? 'none' : undefined, width: getStyleValue(col.width) }}
              />
            ))}
          </colgroup>
          
          <tbody ref={tbodyRef} role="rowgroup">
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <RowRenderer
                  key={`row-${row.uid || rowIndex}`}
                  serviceLocator={serviceLocator}
                  parent={parent}
                  row={row}
                  columns={parent?.getColumns() || []}
                />
              ))
            ) : (
              emptyRow
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
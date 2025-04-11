// src/grid/components/RowRenderer.tsx
import React, { forwardRef, HTMLAttributes, useCallback, useMemo } from 'react';
import { RowRenderProps } from '../base/GridInterfaces';
import { CellRenderer } from './CellRenderer';
import { HeaderCellRenderer } from './HeaderCellRenderer';
import { CellType } from '../base/enum';
import * as literals from '../base/string-literals';
import * as events from '../base/constant';

/**
 * RowRenderer component which responsible for building row content.
 *
 * @hidden
 */
export const RowRenderer = forwardRef<HTMLTableRowElement, RowRenderProps>((props, ref) => {
    const { serviceLocator, cellType, parent, row, columns, attributes, rowTemplate, onRowRendered } = props;

    /**
     * Function to build attributes from row data
     */
    const buildAttributeFromRow = useCallback(() => {
        const attrs: any = {};
        const classes: string[] = [];

        if (row.isDataRow) {
            classes.push(literals.row);
        }

        if (row.isAltRow) {
            classes.push('e-altrow');
        }

        if (row.isCaptionRow) {
            classes.push(literals.groupCaptionRow);
        }

        if (row.isAggregateRow && row.parentUid) {
            classes.push('e-groupfooterrow');
        }

        if (row.index !== undefined) {
            attrs[literals.ariaRowIndex] = row.index + 1;
        }

        if (row.rowSpan) {
            attrs.rowSpan = row.rowSpan;
        }

        if (row.uid) {
            attrs['data-uid'] = row.uid;
        }

        if (row.isSelected) {
            attrs['aria-selected'] = true;
        }

        if (row.visible === false) {
            classes.push('e-hide');
        }

        if (row.cssClass) {
            classes.push(row.cssClass);
        }

        if (row.lazyLoadCssClass) {
            classes.push(row.lazyLoadCssClass);
        }

        // if (parent?.rowRenderingMode === 'Vertical' && parent?.allowTextWrap &&
        //     (parent?.textWrapSettings?.wrapMode === 'Header' || parent?.textWrapSettings?.wrapMode === 'Both')) {
        //     classes.push('e-verticalwrap');
        // }

        return { attrs, className: classes.join(' ') };
    }, [row, parent]);

    /**
     * Render cells based on row data
     */
    const renderCells = useCallback(() => {
        if (!row.cells || !parent) return [];

        // // Get cell renderer based on cell type if needed
        // const cellRendererFact = serviceLocator.getService('cellRendererFactory');

        return row.cells.map((cell, cellIndex) => {
            // Set selection state on cell
            cell.isSelected = row.isSelected;
            cell.isColumnSelected = cell.column?.isSelected;

            // Cell attributes for rendering
            const cellAttrs = { 'index': row.index !== undefined ? row.index.toString() : '' };

            // if (row.isExpand && cell.cellType === CellType.DetailExpand) {
            //     cellAttrs['class'] = parent.isPrinting ? 'e-detailrowcollapse' : 'e-detailrowexpand';
            // }

            // Choose renderer based on cell type
            if (cell.cellType === CellType.Header || cell.cellType === CellType.StackedHeader) {
                return (
                    <HeaderCellRenderer
                        key={`cell-${cellIndex}`}
                        cell={cell}
                        parent={parent}
                        serviceLocator={serviceLocator}
                    />
                );
            } else {
                return (
                    <CellRenderer
                        key={`cell-${cellIndex}`}
                        cell={cell}
                        data={row.data}
                        parent={parent}
                        serviceLocator={serviceLocator}
                        attributes={cellAttrs}
                        isExpand={row.isExpand}
                    />
                );
            }
        });
    }, [row, parent, serviceLocator]);

    // Build row attributes
    const { attrs, className } = useMemo(() => buildAttributeFromRow(), [buildAttributeFromRow]);

    // Combine all row attributes
    const rowAttributes = useMemo<HTMLAttributes<HTMLTableRowElement>>(() => ({
        ...attrs,
        ...(attributes || {}),
        style: {
            ...(row.attributes?.style || {}),
            height: parent?.rowHeight ? `${parent.rowHeight}px` : undefined
        },
        role: 'row',
        className
    }), [attrs, attributes, row, parent?.rowHeight, className]);

    // Effect to notify when row is rendered
    const handleRowRef = useCallback((rowElement: HTMLTableRowElement) => {
        if (rowElement && onRowRendered) {
            onRowRendered(rowElement);
        }

        // Forward ref
        if (typeof ref === 'function') {
            ref(rowElement);
        } else if (ref) {
            ref.current = rowElement;
        }

        // Trigger rowDataBound event
        if (row.isDataRow && parent?.rowDataBound) {
            parent.rowDataBound({ data: row.data, row: rowElement });
        }
    }, [ref, onRowRendered, row, parent]);

    // Handle row template if provided
    if (rowTemplate) {
        return (
            <tr
                ref={handleRowRef}
                {...rowAttributes}
                dangerouslySetInnerHTML={{ __html: rowTemplate }}
            />
        );
    }

    return (
        <tr ref={handleRowRef} {...rowAttributes} className={literals.row}>
            {renderCells()}
        </tr>
    );
});
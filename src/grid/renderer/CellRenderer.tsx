// src/grid/components/CellRenderer.tsx
import React, { forwardRef, useMemo, useCallback } from 'react';
import { CellRenderProps, IValueFormatter } from '../base/GridInterfaces';
import { CheckBox } from '@syncfusion/react-buttons/src/check-box/check-box';
import * as literals from '../base/string-literals';
import { CellType } from '../base/enum';
import * as events from '../base/constant';
import { IL10n } from '@syncfusion/react-base';

/**
 * CellRenderer component which responsible for building cell content.
 *
 * @hidden
 */
export const CellRenderer = forwardRef<HTMLTableCellElement, CellRenderProps>((props, ref) => {
    const { parent, serviceLocator, cell, data, attributes, isExpand, isEdit, onCellRendered } = props;

    const localizer = serviceLocator.getService<IL10n>('localization');
    const formatter = serviceLocator.getService<IValueFormatter>('valueFormatter');

    /**
     * Build cell attributes from cell data
     */
    const buildAttributeFromCell = useCallback(() => {
        const attrs: any = {};
        const classes: string[] = [literals.rowCell];

        if (cell.colSpan) {
            attrs.colSpan = cell.colSpan;
        }

        if (cell.rowSpan) {
            attrs.rowSpan = cell.rowSpan;
        }

        if (cell.isTemplate) {
            classes.push('e-templatecell');
        }

        if (cell.isSelected) {
            classes.push('e-selectionbackground', 'e-active');
        }

        if (cell.isColumnSelected) {
            classes.push('e-columnselection');
        }

        if (cell.cellType === CellType.Header) {
            attrs['aria-colindex'] = cell.colIndex as number + 1;
        } else if (cell.index !== undefined) {
            attrs['aria-colindex'] = cell.index + 1;
        }

        if (!cell.visible) {
            classes.push('e-hide');
        }

        if (cell.column?.type === 'checkbox') {
            classes.push(literals.gridChkBox);
        }

        if (cell.column?.type === 'boolean' && cell.column?.displayAsCheckBox) {
            classes.push('e-gridchkbox-cell');
        }

        return { attrs, className: classes.join(' ') };
    }, [cell]);

    /**
     * Format cell value based on column settings
     */
    const formatValue = useCallback((value: any, column: any): string => {
        if (!value) return '';

        if (column.format !== undefined) {
            if (column.type === 'number' && isNaN(parseInt(value, 10))) {
                value = null;
            }

            if (column.type === 'dateonly' && typeof value === 'string' && value) {
                const arr = value.split(/[^0-9.]/);
                value = new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, parseInt(arr[2], 10));
            }

            value = formatter.toView(value, column.getFormatter());
        }

        if (value === null || value === undefined) return '';

        // Handle boolean display
        if (column.type === 'boolean' && !column.displayAsCheckBox) {
            const localeStr = (value !== 'true' && value !== 'false') ? null : value === 'true' ? 'True' : 'False';
            return localeStr ? localizer.getConstant(localeStr) : value.toString();
        }

        return value.toString();
    }, [formatter, localizer]);

    /**
     * Get value from data using column's valueAccessor
     */
    const getValue = useCallback((field: string, data: any, column: any): any => {
        return column.valueAccessor(field, data, column);
    }, []);

    /**
     * Apply custom formatter if defined
     */
    const invokeFormatter = useCallback((column: any, value: any, data: any): any => {
        if (!column.formatter) return value;

        if (typeof column.formatter === 'function') {
            return column.formatter(column, data);
        } else if (column.formatter.getValue) {
            return column.formatter.getValue(column, data);
        }

        return value;
    }, []);

    /**
     * Handle cell rendering
     */
    const renderCellContent = useMemo(() => {
        if (!cell || !cell.column) return null;

        const column = cell.column;

        // Handle foreign key data
        let fData;
        if (cell.isForeignKey) {
            fData = (cell.foreignKeyData as Object[])[0] || { [column.foreignKeyValue as string]: column.format ? null : '' };
        }

        // Get raw value
        let value = cell.isForeignKey
            ? getValue(column.foreignKeyValue as string, fData, column)
            : getValue(column.field as string, data, column);

        // Process date values
        if ((column.type === 'date' || column.type === 'datetime') && value !== undefined && value !== null) {
            value = new Date(value);
        }

        if (column.type === 'dateonly' && value !== undefined && value !== null && typeof value === 'string') {
            const arr = value.split(/[^0-9.]/);
            value = new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, parseInt(arr[2], 10));
        }

        // Format the value
        let formattedValue = formatValue(value, column);

        // // Apply custom formatter if available
        // if (column.formatter) {
        //     const formatterResult = invokeFormatter(column, formattedValue, data);
        //     formattedValue = formatterResult === undefined || formatterResult === null
        //         ? ''
        //         : formatterResult.toString();
        // }

        // // Render based on cell type
        // if (column.type === 'checkbox') {
        //     // Checkbox cell
        //     const isChecked = parent?.selectionSettings?.persistSelection ? formattedValue === 'true' : false;

        //     return (
        //         <CheckBox
        //             checked={isChecked}
        //             label=" "
        //             className={parent?.cssClass}
        //             disabled={!cell.isSelectable}
        //         />
        //     );
        // } else
        if (column.type === 'boolean' && column.displayAsCheckBox) {
            // Boolean as checkbox
            const checked = isNaN(parseInt(formattedValue, 10))
                ? formattedValue === 'true'
                : parseInt(formattedValue, 10) > 0;

            return (
                <CheckBox
                    checked={checked}
                    label=" "
                    className={parent?.className}
                    disabled={true}
                />
            );
        } else if (cell.isTemplate && column.template) {
            // Template cell
            return (
                <CellTemplate
                    template={column.template}
                    data={data}
                    column={column}
                    foreignKeyData={fData}
                    parent={parent}
                    index={attributes?.index}
                />
            );
        } else {
            // Regular cell with formatted value
            return <div dangerouslySetInnerHTML={{ __html: parent?.sanitize?.(formattedValue) as string | TrustedHTML }} />;
        }
    }, [cell, data, attributes, parent, getValue, formatValue, invokeFormatter]);

    // Build cell attributes
    const { attrs, className } = useMemo(() => buildAttributeFromCell(), [buildAttributeFromCell]);

    // Add text alignment classes
    const textAlignClass = useMemo(() => {
        if (!cell.column?.textAlign) return '';

        const alignment = cell.column.textAlign.toLowerCase();
        if (alignment === 'right') return 'e-rightalign';
        if (alignment === 'left') return 'e-leftalign';
        if (alignment === 'center') return 'e-centeralign';
        if (alignment === 'justify') return 'e-justifyalign';
        return '';
    }, [cell.column?.textAlign]);

    // Add clip mode classes
    const clipModeClass = useMemo(() => {
        const column = cell.column;
        if (!column) return '';

        if (column.clipMode === 'Clip' || (!column.clipMode && parent?.clipMode === 'Clip')) {
            return 'e-gridclip';
        } else if (column.clipMode === 'EllipsisWithTooltip' || (!column.clipMode && parent?.clipMode === 'EllipsisWithTooltip')
            && !(parent?.allowTextWrap && (parent?.textWrapSettings?.wrapMode === 'Content'
                || parent?.textWrapSettings?.wrapMode === 'Both'))) {
            if (column.type !== 'checkbox') {
                return 'e-ellipsistooltip';
            }
        }
        return '';
    }, [cell.column, parent]);

    // Combine all cell attributes
    const cellAttributes = useMemo(() => {
        const combinedClasses = [
            className,
            textAlignClass,
            clipModeClass
        ].filter(Boolean).join(' ');

        return {
            ...attrs,
            ...(attributes || {}),
            ...(cell.attributes || {}),
            ...(cell.column?.customAttributes || {}),
            'e-mappinguid': cell.column?.uid,
            'role': 'gridcell',
            'tabIndex': -1,
            'className': combinedClasses,
            'data-cell': undefined
            //   'data-cell': parent?.rowRenderingMode === 'Vertical' ? cell.column?.headerText : undefined
        };
    }, [attrs, attributes, cell, className, textAlignClass, clipModeClass, parent]);

    // Handle cell ref
    const handleCellRef = useCallback((cellElement: HTMLTableCellElement) => {
        if (cellElement && onCellRendered) {
            onCellRendered(cellElement);
        }

        // Forward ref
        if (typeof ref === 'function') {
            ref(cellElement);
        } else if (ref) {
            ref.current = cellElement;
        }

        // Trigger queryCellInfo event
        if (parent.queryCellInfo && cell.column) {//parent?.trigger && 
            parent.queryCellInfo({
                data,
                cell: cellElement,
                column: cell.column,
                foreignKeyData: cell.foreignKeyData
            });
        }
    }, [ref, onCellRendered, cell, data, parent]);

    return (
        <td ref={handleCellRef} {...cellAttributes}>
            {renderCellContent}
        </td>
    );
});

/**
 * Template Cell component for handling cell templates
 */
const CellTemplate = (props: any) => {
    const { template, data, column, foreignKeyData, parent, index } = props;
    // Render template content
    const renderTemplate = useCallback(() => {
        if (!template) return null;

        // Prepare data for template
        const templateData = {
            data,
            column,
            foreignKeyData,
            index
        };

        // React component template
        if (typeof template === 'function') {
            //   const TemplateComponent = template;
            //   return <TemplateComponent {...templateData} />;
            return <>{template()}</>
        }

        // String template
        if (typeof template === 'string') {
            // Create template function from string
            const templateFn = new Function('data', 'return `' + template + '`');
            return <div dangerouslySetInnerHTML={{ __html: templateFn(templateData) }} />;
        }

        return null;
    }, [template, data, column, foreignKeyData, parent, index]);

    return (
        <div className="e-templatecell-container">
            {renderTemplate()}
        </div>
    );
};
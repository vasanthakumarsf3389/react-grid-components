// src/grid/components/HeaderCellRenderer.tsx
import React, { forwardRef, useMemo, useCallback } from 'react';
import { HeaderCellProps, IGrid } from '../base/GridInterfaces';
import { CheckBox } from '@syncfusion/react-buttons/src/check-box/check-box';
import * as events from '../base/constant';
import { Column } from '../models/column';
import { IL10n } from '@syncfusion/react-base';

/**
 * HeaderCellRenderer component which responsible for building header cell content.
 *
 * @hidden
 */
export const HeaderCellRenderer = forwardRef<HTMLTableCellElement, HeaderCellProps>((props, ref) => {
    const { cell, parent, serviceLocator, onCellRendered } = props;

    // const localizer = serviceLocator.getService<IL10n>('localization');

    const column = cell.column;

    /**
     * Determine if sorting is enabled for this column
     */
    const sortEnabled = useMemo(() => {
        // return parent?.allowSorting && column?.allowSorting && column?.field !== undefined;
        return false;
    }, [column?.allowSorting, column?.field]);//parent?.allowSorting, 

    /**
     * Determine if filtering is enabled for this column
     */
    const filterEnabled = useMemo(() => {
        // return (parent?.allowFiltering && parent?.filterSettings?.type !== 'FilterBar') &&
        //   (column?.allowFiltering && column?.field !== undefined) &&
        //   !(parent?.showColumnMenu && column?.showColumnMenu);
        return false;
    }, [column?.allowFiltering, column?.field, column?.showColumnMenu]);//parent?.allowFiltering, parent?.filterSettings?.type, parent?.showColumnMenu

    /**
     * Determine if column menu should be shown
     */
    const showColumnMenu = useMemo(() => {
        // return parent?.showColumnMenu && column?.showColumnMenu && column?.field !== undefined;
        return false;
    }, [column?.showColumnMenu, column?.field]);//parent?.showColumnMenu, 

    //   /**
    //    * Build description text for accessibility
    //    */
    //   const elementDesc = useMemo(() => {
    //     let desc = '';

    //     if (filterEnabled) {
    //       desc = localizer.getConstant('FilterDescription');
    //     }

    //     if (sortEnabled) {
    //       desc = desc.length 
    //         ? desc + '. ' + localizer.getConstant('SortDescription') 
    //         : localizer.getConstant('SortDescription');
    //     }

    //     if ((parent?.allowGrouping && column?.allowGrouping) || (parent?.allowReordering && column?.allowReordering)) {
    //       desc = desc.length 
    //         ? desc + '. ' + localizer.getConstant('GroupDescription') 
    //         : localizer.getConstant('GroupDescription');
    //     }

    //     if (showColumnMenu && column?.type !== 'checkbox' && !column?.template) {
    //       desc = desc.length 
    //         ? desc + '. ' + localizer.getConstant('ColumnMenuDescription') 
    //         : localizer.getConstant('ColumnMenuDescription');
    //     }

    //     return desc;
    //   }, [filterEnabled, sortEnabled, parent, column, localizer, showColumnMenu]);

    /**
     * Build header cell attributes
     */
    const cellAttributes = useMemo(() => {
        const attrs: any = {
            role: 'columnheader',
            tabIndex: -1,
            'aria-rowspan': (!cell.rowSpan ? 1 : cell.rowSpan).toString(),
            'aria-colspan': '1',
            'e-mappinguid': column?.uid
        };

        const classes = ['e-headercell'];

        if (cell.className) {
            classes.push(cell.className);
        }

        // if (sortEnabled) {
        //   attrs['aria-sort'] = 'none';
        //   classes.push('e-sort-icon');
        // }

        // if (filterEnabled) {
        //   classes.push('e-fltr-icon');
        // }

        // if ((parent?.allowGrouping && column?.allowGrouping) || (parent?.allowReordering && column?.allowReordering)) {
        //   attrs['aria-grabbed'] = false;
        // }

        // if (elementDesc) {
        //   const titleId = 'headerTitle-' + column?.uid;
        //   attrs['aria-describedby'] = titleId;
        // }

        // Add alignment classes
        if (column?.headerTextAlign || column?.textAlign) {
            const alignment = column.headerTextAlign || column.textAlign;
            if (alignment) {
                if (alignment.toLowerCase() === 'right') {
                    classes.push('e-rightalign');
                } else if (alignment.toLowerCase() === 'left') {
                    classes.push('e-leftalign');
                } else if (alignment.toLowerCase() === 'center') {
                    classes.push('e-centeralign');
                } else if (alignment.toLowerCase() === 'justify') {
                    classes.push('e-justifyalign');
                }
            }
        }

        // Add clip mode classes
        if (column?.clipMode === 'Clip' || (!column?.clipMode && parent?.clipMode === 'Clip')) {
            classes.push('e-gridclip');
        } else if ((column?.clipMode === 'EllipsisWithTooltip' || (!column?.clipMode && parent?.clipMode === 'EllipsisWithTooltip'))
            && !(parent?.allowTextWrap && (parent?.textWrapSettings?.wrapMode === 'Header'
                || parent?.textWrapSettings?.wrapMode === 'Both'))) {
            if (column?.type !== 'checkbox') {
                classes.push('e-ellipsistooltip');
            }
        }

        if (cell.column?.customAttributes) {
            Object.assign(attrs, cell.column.customAttributes);
        }

        attrs.className = classes.join(' ');
        return attrs;
    }, [cell, column, sortEnabled, filterEnabled, parent]);//, elementDesc

    /**
     * Render column menu icon
     */
    const renderColumnMenu = useCallback(() => {
        if (!showColumnMenu) return null;

        // Check if column has filter applied
        // const isFiltered = parent?.filterSettings?.columns?.some(
        //   filterCol => filterCol.field === column?.field
        // );
        const isFiltered = false;

        return (
            <div
                className={`e-icons e-columnmenu${isFiltered ? ' e-filtered' : ''}`}
                aria-hidden="true"
            />
        );
    }, [showColumnMenu, column?.field]);//, parent?.filterSettings?.columns

    /**
     * Render filter icon
     */
    const renderFilterIcon = useCallback(() => {
        if (!filterEnabled) return null;

        // Check if column has filter applied
        // const isFiltered = parent?.filterSettings?.columns?.some(
        //   filterCol => filterCol.field === column?.field
        // );
        const isFiltered = false;

        return (
            <div
                className={`e-filtermenudiv e-icons e-icon-filter${isFiltered ? ' e-filtered' : ''}`}
                aria-hidden="true"
                e-mappinguid={`e-flmenu-${column?.uid}`}
            />
        );
    }, [filterEnabled, column?.field, column?.uid]);//, parent?.filterSettings?.columns

    /**
     * Render resize handler
     */
    const renderResizeHandler = useCallback(() => {
        if (!parent?.allowResizing) return null;

        return (
            <div className={column?.allowResizing ? 'e-rhandler e-rcursor' : 'e-rsuppress'} />
        );
    }, [parent?.allowResizing, column?.allowResizing]);

    /**
     * Render header content
     */
    const renderHeaderContent = useCallback(() => {
        if (column?.type === 'checkbox') {
            return (
                <div className="e-headerchkcelldiv">
                    <CheckBox
                        checked={false}
                        label=" "
                        // cssClass={parent?.cssClass}
                        className={parent?.className}
                    />
                </div>
            );
        }

        if (column?.headerTemplate) {
            return (
                <div className="e-headertemplate-container">
                    <HeaderTemplate
                        template={column.headerTemplate}
                        column={column}
                        parent={parent}
                    />
                </div>
            );
        }

        return (
            <div className="e-headercelldiv" e-mappinguid={column?.uid}>
                <span className="e-headertext">
                    {/* {column?.headerValueAccessor 
            ? column.headerValueAccessor(column.headerText, column) 
            : column?.headerText} */}
                    {column?.headerText}
                </span>
            </div>
        );
    }, [column, parent?.className]);

    // Handle header cell ref
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

        // Trigger headerCellInfo event
        if (parent?.headerCellInfo) {
            parent.headerCellInfo({ cell, node: cellElement });
        }
    }, [ref, onCellRendered, cell, parent]);

    return (
        <th ref={handleCellRef} {...cellAttributes}>
            {renderHeaderContent()}

            <div className="e-sortfilterdiv e-icons" aria-hidden="true" />
            {renderFilterIcon()}
            {renderColumnMenu()}
            {renderResizeHandler()}

            {/* {elementDesc && (
        <span 
          id={`headerTitle-${column?.uid}`} 
          style={{ display: 'none' }}
        >
          {elementDesc}
        </span>
      )} */}
        </th>
    );
});

interface HeaderTemplateProps {
    template: Function | string;
    column: Column;
    parent: IGrid
}

/**
 * Header Template component for handling header templates
 */
const HeaderTemplate = (props: HeaderTemplateProps) => {
    const { template, column, parent } = props;
    // Get column index
    const colIndex = parent?.getColumnIndexByField?.(column?.field as string);

    // Render template content
    const renderTemplate = useCallback(() => {
        if (!template) return null;

        // Prepare data for template
        const templateData = {
            index: colIndex,
            ...column
        };

        // React component template
        if (typeof template === 'function') {
            // const TemplateComponent = template;
            // return <TemplateComponent {...templateData} />;
            return <>{template()}</>
        }

        // String template
        if (typeof template === 'string') {
            // Create template function from string
            const templateFn = new Function('data', 'return `' + template + '`');
            return <div dangerouslySetInnerHTML={{ __html: templateFn(templateData) }} />;
        }

        return null;
    }, [template, colIndex, column, parent]);

    return renderTemplate();
};
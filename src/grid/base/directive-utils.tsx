import React, { ReactNode, ReactElement } from 'react';
import { Column, ColumnDirective, ColumnModel, ColumnsDirective } from '../models/column';
import { getValue, isNullOrUndefined } from '@syncfusion/react-base';
import { prepareColumns, valueAccessor } from './util';
import { IGrid } from './GridInterfaces';

/**
 * Utility function to find all React elements of a specific type among children.
 * @param children - The React children nodes.
 * @param targetType - The target component type to find.
 * @returns An array of matching React elements.
 */
export const getReactChildrenByType = (children: ReactNode, targetType: React.ElementType): ReactElement[] => {
    const childArray = React.Children.toArray(children) as ReactElement[];
    return childArray.filter((child) => React.isValidElement(child) && child.type === targetType);
};

/**
 * Utility function to find the first React element of a specific type among children.
 * @param children - The React children nodes.
 * @param targetType - The target component type to find.
 * @returns The first matching React element or undefined if no match is found.
 */
export const getReactChildByType = (children: ReactNode, targetType: React.ElementType): ReactElement | undefined => {
    const childArray = React.Children.toArray(children) as ReactElement[];
    return childArray.find((child) => React.isValidElement(child) && child.type === targetType);
};


export const prepareDirectiveColumns = (children: React.ReactNode, autoWidth?: boolean, gObj?: IGrid): Column[] => {
    let columns: Column[] = [];
    if (children) {

        const columnsDirective = getReactChildByType(children, ColumnsDirective); // get first valid columns directive alone.

        if (columnsDirective) {
            // Extract ColumnDirective children
            const columnDirective = getReactChildrenByType(columnsDirective.props.children, ColumnDirective); // get all columndirective inside 1st valid columnsdirective.

            // columnDirective.forEach(child => {
            //     if (child.props.field) {
            //         columns?.push({
            //             ...child.props
            //         } as (Column & string & ColumnModel));
            //     }
            // });


            for (let c: number = 0, len: number = (!isNullOrUndefined(columnDirective) ? columnDirective.length : 0); c < len; c++) {

                let column: Column;

                if (!(columnDirective[parseInt(c.toString(), 10)].props instanceof Column) || (columnDirective[parseInt(c.toString(), 10)].props as Column).columns) {
                    if (!(columnDirective[parseInt(c.toString(), 10)].props as Column).columns) {
                        column = Column(columnDirective[parseInt(c.toString(), 10)].props as ColumnModel, gObj);
                    } else {
                        if (!isNullOrUndefined((columnDirective[parseInt(c.toString(), 10)].props as Column).columns)) {
                            (columnDirective[parseInt(c.toString(), 10)].props as Column).columns = prepareColumns(
                                (columnDirective[parseInt(c.toString(), 10)].props as Column).columns as Column[], false, gObj);
                        } else {
                            (columnDirective[parseInt(c.toString(), 10)].props as Column).columns = prepareDirectiveColumns(columnDirective[parseInt(c.toString(), 10)].props.children)
                        }
                        column = Column(columnDirective[parseInt(c.toString(), 10)] as ColumnModel, gObj);
                    }
                } else {
                    column = columnDirective[parseInt(c.toString(), 10)].props as Column;
                }

                if (column.type && column.type.toLowerCase() === 'checkbox') {
                    column.allowReordering = false;
                }

                column.headerText = isNullOrUndefined(column.headerText) ? column.foreignKeyValue || column.field || '' : column.headerText;

                column.foreignKeyField = column.foreignKeyField || column.field;

                column.valueAccessor = (typeof column.valueAccessor === 'string' ? getValue(column.valueAccessor, window)
                    : column.valueAccessor) || valueAccessor;

                column.headerValueAccessor = typeof column.headerValueAccessor === 'string' ? getValue(column.headerValueAccessor, window)
                    : column.headerValueAccessor;

                column.width = autoWidth && isNullOrUndefined(column.width) ? 200 : column.width;

                if (isNullOrUndefined(column.visible)) {
                    column.visible = true;
                }

                columns[parseInt(c.toString(), 10)] = column;
            }
        }
    }
    return columns;
}
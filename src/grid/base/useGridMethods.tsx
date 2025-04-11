import { isNullOrUndefined, SanitizeHtmlHelper } from "@syncfusion/react-base";
import { Column } from "../models/column";
import { ExposeRender, GridMethods, GridPrivateMethods, GridPrivateProps, IContentRender, IGrid, IGridProps, IHeaderRenderer } from "./GridInterfaces";
import { Dispatch, MutableRefObject, SetStateAction, useCallback } from "react";
import { getRowHeight } from "./util";

export const useGridMethods = (allProps: IGrid & GridPrivateProps, exposeRef: MutableRefObject<ExposeRender>) => {
    const grid = allProps;
    const { headerRef = null, contentRef = null } = exposeRef.current ? exposeRef.current.privateProps : {};
    // public methods
    const publicMethods: GridMethods = {
        getColumns: useCallback((isRefresh?: boolean): Column[] => {
            grid.columnModel = [];
            grid.updateColumnModel?.(grid.columns as Column[]);
            const columns: Column[] = grid.columnModel;
            let left: Column[] = [];
            let right: Column[] = [];
            const movable: Column[] = [];
            for (let i = 0; i < columns.length; i++) {
                if (columns[i].freeze === 'Left' || columns[i].isFrozen) {
                    left.push(columns[i]);
                } else if (columns[i].freeze === 'Right') {
                    right.push(columns[i]);
                } else {
                    movable.push(columns[i]);
                }
            }
            return left.concat(movable).concat(right);
        }, [grid.columnModel, grid.columns, grid.getColumns]),

        // Apply useCallback to the following functions
        getHeaderContent: useCallback(() => headerRef?.current?.getPanel() as HTMLElement, [headerRef]),
        getContent: useCallback(() => contentRef?.current?.getPanel() as HTMLElement, [contentRef]),
        getHeaderTable: useCallback(() => headerRef?.current?.getTable() as HTMLTableElement, [headerRef]),
        getContentTable: useCallback(() => contentRef?.current?.getTable() as HTMLTableElement, [contentRef]),
        getRowsObject: useCallback(() => contentRef?.current?.getRowObject() || [], [contentRef]),
        getDataRows: useCallback(() => {
            const contentTable = contentRef?.current?.getTable();
            return contentTable ? Array.from(contentTable.querySelectorAll('tr.e-row')) as HTMLTableRowElement[] : [];
        }, [contentRef]),
        getRows: useCallback(() => {
            const contentTable = contentRef?.current?.getTable();
            return contentTable ? Array.from(contentTable.querySelectorAll('tbody tr')) as HTMLTableRowElement[] : [];
        }, [contentRef]),
        getRowHeight: useCallback((accurateHeight?: boolean) => {
            return grid.rowHeight ? grid.rowHeight : getRowHeight(grid.element as HTMLElement, accurateHeight)
        }, [grid.rowHeight, grid.element]),

        getColumnIndexByField: useCallback((field: string) => {
            const cols = grid.getColumns();
            for (let i = 0; i < cols.length; i++) {
                if (cols[i].field === field) {
                    return i;
                }
            }
            return -1;
        }, [grid.getColumns]),

        sanitize: useCallback((value: string) => {
            if (grid.enableHtmlSanitizer) {
                return SanitizeHtmlHelper.sanitize(value);
            }
            return value;
        }, [grid.enableHtmlSanitizer]),
    };

    // private methods
    const privateMethods: GridPrivateMethods = {
        updateColumnModel: useCallback((columns: Column[], isRecursion?: boolean): void => {
            for (let i = 0, len = (columns ? columns.length : 0); i < len; i++) {
                if (columns[i].columns) {
                    grid.updateColumnModel?.(columns[i].columns as Column[], true);
                } else {
                    grid.columnModel?.push(columns[i] as Column);
                }
            }
        }, [grid.columnModel, grid.updateColumnModel]),
    };
    Object.assign(allProps, publicMethods, privateMethods);
    // allProps = { ...allProps, ...publicMethods, ...privateMethods };
    // return {...publicMethods, ...privateMethods};
};
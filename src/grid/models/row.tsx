import { merge } from '@syncfusion/react-base';
import { Cell } from './cell';
import { IGrid } from '../base/GridInterfaces';
import { DataManager } from '@syncfusion/react-data';
import { useRef } from 'react';

/**
 * Row
 *
 * @hidden
 */
export interface RowInterface<T> {
    parent?: IGrid;
    uid: string;
    data: {[key: string]: keyof Row<T>};
    tIndex: number;
    isCaptionRow: boolean;
    isAggregateRow: boolean;
    changes: Object;
    isDirty: boolean;
    aggregatesCount: number;
    edit: string;
    isSelected: boolean;
    isFreezeRow: boolean;
    isReadOnly: boolean;
    isAltRow: boolean;
    isDataRow: boolean;
    isExpand: boolean;
    rowSpan: number;
    cells: Cell<T>[];
    index: number;
    indent: number;
    subRowDetails: Object;
    height: string;
    visible: boolean;
    attributes: { [x: string]: Object };
    cssClass: string;
    lazyLoadCssClass: string;
    foreignKeyData: Object;
    isDetailRow: boolean;
    childGrid: IGrid | null;
    parentUid: string;
    isSelectable?: boolean;
}

export interface Row<T> extends RowInterface<T> {
    clone: () => Row<T> & RowInterface<T>;
    // setRowValue: (data: Object) => void;
    // setCellValue: (field: string, value: string | number | boolean | Date | null) => void;
}

/**
 * Row
 *
 * @hidden
 */
export const Row = <T,>(options: { [x: string]: Object }, parent?: IGrid): Row<T> & RowInterface<T> => {
    const rowProps: RowInterface<T> = {
        parent,
        uid: '',
        data: {},
        tIndex: 0,
        isCaptionRow: false,
        isAggregateRow: false,
        changes: {},
        isDirty: false,
        aggregatesCount: 0,
        edit: '',
        isSelected: false,
        isFreezeRow: false,
        isReadOnly: false,
        isAltRow: false,
        isDataRow: false,
        isExpand: false,
        rowSpan: 0,
        cells: [],
        index: 0,
        indent: 0,
        subRowDetails: {},
        height: '',
        visible: true,
        attributes: {},
        cssClass: '',
        lazyLoadCssClass: '',
        foreignKeyData: {},
        isDetailRow: false,
        childGrid: null,
        parentUid: '',
        isSelectable: undefined
    };

    merge(rowProps, options);

    /**
     * Creates a clone of the current row
     *
     * @returns {RowProps<T> & RowInterface<T>} The cloned row
     */
    const clone = (): Row<T> & RowInterface<T> => {
        const row = Row<T>({}, rowProps.parent);
        merge(row, rowProps);
        row.cells = rowProps.cells.map((cell: Cell<T>) => cell.clone?.()) as Cell<T>[];
        return row;
    };

    // /**
    //  * Replaces the row data and grid refresh the particular row element only.
    //  *
    //  * @param  {Object} data - To update new data for the particular row.
    //  * @returns {void}
    //  */
    // const setRowValue = (data: Object): void => {
    //     if (!rowProps.parent) {
    //         return;
    //     }
    //     const key: string | number = rowProps.data[rowProps.parent?.getPrimaryKeyFieldNames?.()[0] as string];
    //     rowProps.parent.setRowData(key, data);
    // };

    // /**
    //  * Replaces the given field value and refresh the particular cell element only.
    //  *
    //  * @param {string} field - Specifies the field name which you want to update.
    //  * @param {string | number | boolean | Date} value - To update new value for the particular cell.
    //  * @returns {void}
    //  */
    // const setCellValue = (field: string, value: string | number | boolean | Date | null): void => {
    //     if (!rowProps.parent) {
    //         return;
    //     }
    //     const isValDiff: boolean = !((rowProps as unknown as {data: {[key: string]: keyof Row<T>}}).data[`${field}`].toString() === value?.toString());
    //     if (isValDiff) {
    //         const pKeyField: string = rowProps.parent.getPrimaryKeyFieldNames?.()[0] as string;
    //         const key: string | number = rowProps.data[`${pKeyField}`];
    //         rowProps.parent.setCellValue(key, field, value);
    //         makechanges(pKeyField, rowProps.data);
    //     } else {
    //         return;
    //     }
    // };

    // /**
    //  * Makes changes to the data
    //  *
    //  * @param {string} key - The primary key field name
    //  * @param {Object} data - The data to update
    //  * @returns {void}
    //  */
    // const makechanges = (key: string, data: Object): void => {
    //     if (!rowProps.parent) {
    //         return;
    //     }
    //     const gObj: IGrid = rowProps.parent;
    //     const dataManager: DataManager = gObj.getDataModule?.().dataManager as DataManager;
    //     dataManager.update(key, data);
    // };

    return {
        ...rowProps,
        clone,
        // setRowValue,
        // setCellValue
    };
};

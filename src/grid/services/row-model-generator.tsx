import { isNullOrUndefined, getValue, setValue } from '@syncfusion/react-base';
import {
    // IModelGenerator,
    ICell, IRow, IGrid,
    // InfiniteScrollArgs, SaveEventArgs
} from '../base/GridInterfaces';
import { Row } from '../models/row';
import { CellType, Action } from '../base/enum';
import { Column } from '../models/column';
import { Cell } from '../models/cell';
import { getUid,
    // getForeignData
} from '../base/util';
import * as events from '../base/constant';
import { useRef } from 'react';

/**
 * RowModelGenerator is used to generate grid data rows.
 *
 * @hidden
 */
export interface RowModelGeneratorProps<T = Column> {
    generateRows(data: Object, args?: { startIndex?: number, requestType?: Action }): Row<T>[];
    generateCell(
        column: T, rowId?: string, cellType?: CellType, colSpan?: number,
        oIndex?: number, foreignKeyData?: Object): Cell<T>;
    refreshRows(input?: Row<T>[]): Row<T>[];
    generateRow(data: Object, index: number, cssClass?: string, indent?: number, pid?: number, tIndex?: number, parentUid?: string): Row<T>;
    generateCells(options: IRow<T>): Cell<T>[];
}

export interface RowModelGeneratorInterface<T = Column> extends RowModelGeneratorProps<T> {
    parent: IGrid | undefined;
}

export const RowModelGenerator = <T extends Column = Column>(parent?: IGrid): RowModelGeneratorInterface<T> => {
    // References
    // const parentRef = useRef<IGrid | undefined>(parent);

    /**
     * Generates rows based on provided data
     *
     * @param {Object} data - The data to generate rows from
     * @param {{ startIndex?: number, requestType?: Action }} args - Optional arguments for row generation
     * @returns {Row<T>[]} Array of generated rows
     */
    const generateRows = (data: Object, args?: { startIndex?: number, requestType?: Action }): Row<T>[] => {
        const rows: Row<T>[] = [];
        let startIndex: number = 0;
        // let startIndex: number = (parent?.enableVirtualization && args ? args.startIndex : 0) as number;
        // startIndex = parent?.enableInfiniteScrolling && args ? getInfiniteIndex(args) : startIndex;
        // if (parent?.enableImmutableMode && args && args.startIndex) {
        //     startIndex = args.startIndex;
        // }
        for (let i: number = 0, len: number = Object.keys(data).length; i < len; i++, startIndex++) {
            rows[parseInt(i.toString(), 10)] = generateRow((data as { [key: number]: Object })[parseInt(i.toString(), 10)], startIndex);
        }
        return rows;
    };

    /**
     * Ensures columns for specific functionalities like detail view and row drag
     *
     * @returns {Cell<T>[]} Array of cells
     */
    const ensureColumns = (): Cell<T>[] => {
        //TODO: generate dummy column for group, detail here;
        const cols: Cell<T>[] = [];

        // if (parent?.detailTemplate || parent?.childGrid) {
        //     const args: object = {};
        //     parent?.notify?.(events.detailIndentCellInfo, args);
        //     cols.push(generateCell(args as T, undefined, CellType.DetailExpand));
        // }

        // if (parent?.isRowDragable()) {
        //     cols.push(generateCell({} as T, undefined, CellType.RowDragIcon));
        // }

        return cols;
    };

    /**
     * Generates a row based on the provided data and options
     *
     * @param {Object} data - The data for the row
     * @param {number} index - Row index
     * @param {string} cssClass - CSS class for the row
     * @param {number} indent - Indentation level
     * @param {number} pid - Parent ID
     * @param {number} tIndex - Tree index
     * @param {string} parentUid - Parent UID
     * @returns {Row<T>} Generated row
     */
    const generateRow = (
        data: Object, index: number, cssClass?: string, indent?: number,
        pid?: number, tIndex?: number, parentUid?: string): Row<T> => {
        const options: IRow<T> = {};
        options.foreignKeyData = {};
        options.uid = getUid('grid-row');
        options.data = data;
        options.index = index;
        options.indent = indent;
        options.tIndex = tIndex;
        options.isDataRow = true;
        options.parentGid = pid;
        options.parentUid = parentUid;
        // if (parent?.isPrinting) {
        //     if (parent.hierarchyPrintMode === 'All') {
        //         options.isExpand = true;
        //     } else if (parent.hierarchyPrintMode === 'Expanded' &&
        //         parent.expandedRows &&
        //         parent.expandedRows[parseInt(index.toString(), 10)]) {
        //         options.isExpand = parent.expandedRows[parseInt(index.toString(), 10)].isExpand;
        //     }
        // }
        options.cssClass = cssClass;
        options.isAltRow = parent?.enableAltRow ? index % 2 !== 0 : false;
        // options.isSelected = (parent?.getSelectedRowIndexes?.().indexOf(index) as number) > -1;
        // refreshForeignKeyRow(options);
        const cells: Cell<T>[] = ensureColumns();
        const row: Row<T> = Row<T>(options as { [x: string]: Object }, parent);
        // row.cells = parent?.getFrozenMode?.() === 'Right' ?
        //     generateCells(options).concat(cells) :
        //     cells.concat(generateCells(options));
        row.cells = cells.concat(generateCells(options));
        return row;
    };

    // /**
    //  * Refreshes the foreign key data for a row
    //  *
    //  * @param {IRow<T>} options - Row options
    //  */
    // const refreshForeignKeyRow = (options: IRow<T>): void => {
    //     const foreignKeyColumns: T[] = parent?.getForeignKeyColumns?.() as T[];
    //     for (let i: number = 0; i < foreignKeyColumns.length; i++) {
    //         setValue(
    //             foreignKeyColumns[parseInt(i.toString(), 10)].field as string,
    //             getForeignData(foreignKeyColumns[parseInt(i.toString(), 10)], options.data),
    //             options.foreignKeyData
    //         );
    //     }
    // };

    /**
     * Generates cells for a row
     *
     * @param {IRow<T>} options - Row options
     * @returns {Cell<T>[]} Array of generated cells
     */
    const generateCells = (options: IRow<T>): Cell<T>[] => {
        const dummies: T[] = parent?.getColumns?.() as T[];
        const tmp: Cell<T>[] = [];

        for (let i: number = 0; i < dummies.length; i++) {
            tmp.push(generateCell(
                dummies[parseInt(i.toString(), 10)],
                options.uid,
                // isNullOrUndefined(dummies[parseInt(i.toString(), 10)].commands) ?
                //     undefined : CellType.CommandColumn,
                undefined,
                undefined,
                i,
                options.foreignKeyData
            ));
        }
        return tmp;
    };

    /**
     * Generates a cell with the provided options
     *
     * @param {T} column - Defines column details
     * @param {string} rowId - Defines row id
     * @param {CellType} cellType  - Defines cell type
     * @param {number} colSpan - Defines colSpan
     * @param {number} oIndex - Defines index
     * @param {Object} foreignKeyData - Defines foreign key data
     * @returns {Cell<T>} returns cell model
     * @hidden
     */
    const generateCell = (
        column: T, rowId?: string, cellType?: CellType, colSpan?: number,
        oIndex?: number, foreignKeyData?: Object): Cell<T> => {
        const opt: ICell<T> = {
            'visible': column.visible,
            'isDataCell': !isNullOrUndefined(column.field || column.template),
            'isTemplate': !isNullOrUndefined(column.template),
            'rowID': rowId,
            'column': column,
            'cellType': !isNullOrUndefined(cellType) ? cellType : CellType.Data,
            'colSpan': colSpan,
            // 'commands': column.commands,
            'isForeignKey': column.isForeignColumn && column.isForeignColumn(),
            'foreignKeyData': column.isForeignColumn && column.isForeignColumn() &&
                getValue(column.field as string, foreignKeyData)
        };

        if (opt.isDataCell || opt.column?.type === 'checkbox') {// || opt.commands
            opt.index = oIndex;
        }

        return Cell<T>(opt as { [x: string]: Object });
    };

    /**
     * Refreshes the rows with updated data
     *
     * @param {Row<T>[]} input - Array of rows to refresh
     * @returns {Row<T>[]} Array of refreshed rows
     */
    const refreshRows = (input?: Row<T>[]): Row<T>[] => {
        for (let i: number = 0; input && i < input.length; i++) {
            // refreshForeignKeyRow(input[parseInt(i.toString(), 10)]);
            input[parseInt(i.toString(), 10)].cells = generateCells(input[parseInt(i.toString(), 10)]);
        }
        return input as Row<T>[];
    };

    // /**
    //  * Gets the index for infinite scrolling operations
    //  *
    //  * @param {InfiniteScrollArgs} args - Arguments for infinite scrolling
    //  * @returns {number} The calculated index
    //  */
    // const getInfiniteIndex = (args: InfiniteScrollArgs): number => {
    //     return args.requestType === 'infiniteScroll' ||
    //         args.requestType === 'delete' ||
    //         (args as SaveEventArgs).action === 'add'
    //         ? (isNullOrUndefined(args.startIndex) ? (args['index'] as number) : args.startIndex as number) : 0;
    // };

    // Return the public interface
    const props: RowModelGeneratorInterface<T> = {
        parent: parent,
        generateRows,
        generateCell,
        refreshRows,
        generateRow,
        generateCells
    };

    return props;
};

import { merge } from '@syncfusion/react-base';
import { CellType } from '../base/enum';
// import { CommandModel } from '../base/interface';

/**
 * Cell
 *
 * @hidden
 */
export interface Cell<T> {
    colSpan?: number;
    rowSpan?: number;
    cellType?: CellType;
    visible?: boolean;
    isTemplate?: boolean;
    isDataCell?: boolean;
    isSelected?: boolean;
    isColumnSelected?: boolean;
    column?: T;
    rowID?: string;
    index?: number;
    colIndex?: number;
    className?: string;
    attributes?: { [a: string]: Object };
    isSpanned?: boolean;
    cellSpan?: number;
    isRowSpanned?: boolean;
    rowSpanRange?: number;
    colSpanRange?: number;
    spanText?: string | number | boolean | Date;
    // commands?: CommandModel[];
    isForeignKey?: boolean;
    foreignKeyData?: Object;
    clone?(): Cell<T>;
}

/**
 * Cell
 *
 * @hidden
 */
export const Cell = <T,>(initialProps: Cell<T> = {}): Cell<T> => {
    // Initialize with default values or provided values
    const props: Cell<T> = {
        colSpan: initialProps.colSpan,
        rowSpan: initialProps.rowSpan,
        cellType: initialProps.cellType,
        visible: initialProps.visible,
        isTemplate: initialProps.isTemplate,
        isDataCell: initialProps.isDataCell,
        isSelected: initialProps.isSelected,
        isColumnSelected: initialProps.isColumnSelected,
        column: initialProps.column,
        rowID: initialProps.rowID,
        index: initialProps.index,
        colIndex: initialProps.colIndex,
        className: initialProps.className,
        attributes: initialProps.attributes,
        isSpanned: initialProps.isSpanned || false,
        cellSpan: initialProps.cellSpan,
        isRowSpanned: initialProps.isRowSpanned || false,
        rowSpanRange: initialProps.rowSpanRange,
        colSpanRange: initialProps.colSpanRange,
        spanText: initialProps.spanText,
        // commands: initialProps.commands,
        isForeignKey: initialProps.isForeignKey,
        foreignKeyData: initialProps.foreignKeyData
    };

    /**
     * Creates a copy of the current cell
     * @returns {Cell<T>} The cloned cell
     */
    const clone = (): Cell<T> => {
        const cellClone: Cell<T> = {};
        merge(cellClone, props);
        return cellClone;
    };

    return {
        ...props,
        clone
    };
};

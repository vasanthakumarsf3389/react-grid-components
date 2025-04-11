import { isNullOrUndefined, getEnumValue } from '@syncfusion/react-base';
import { ICellRenderer } from '../base/GridInterfaces';
import { CellType } from '../base/enum';

/**
 * CellRendererFactory
 *
 * @hidden
 */
export const useCellRendererFactory = () => {
    // Public members
    const cellRenderMap: { [c: string]: ICellRenderer<{}> } = {};

    /**
     * Adds a cell renderer with the specified name and type to the cell renderer map.
     * 
     * @param {string | CellType} name - The name or type of cell renderer to add
     * @param {ICellRenderer<{}>} type - The ICellRenderer instance to add
     * @returns {void}
     */
    const addCellRenderer = (name: string | CellType, type: ICellRenderer<{}>): void => {
        name = typeof name === 'string' ? name : getEnumValue(CellType, name as CellType) as string;

        if (isNullOrUndefined(cellRenderMap[`${name}`])) {
            cellRenderMap[`${name}`] = type;
        }
    };

    /**
     * Gets a cell renderer with the specified name from the cell renderer map.
     * 
     * @param {string | CellType} name - The name or type of cell renderer to retrieve
     * @returns {ICellRenderer<{}>} - The ICellRenderer instance
     * @throws {string} - Throws an error if the specified cell renderer is not found
     */
    const getCellRenderer = (name: string | CellType): ICellRenderer<{}> => {
        name = typeof name === 'string' ? name : getEnumValue(CellType, name as CellType) as string;

        if (isNullOrUndefined(cellRenderMap[`${name}`])) {
            // eslint-disable-next-line no-throw-literal
            throw `The cellRenderer ${name} is not found`;
        } else {
            return cellRenderMap[`${name}`];
        }
    };

    // Return the public API
    return {
        cellRenderMap,
        addCellRenderer,
        getCellRenderer
    };
};

// Interface for CellRendererFactory return type
export interface CellRendererFactory {
    cellRenderMap: { [c: string]: ICellRenderer<{}> };
    addCellRenderer: (name: string | CellType, type: ICellRenderer<{}>) => void;
    getCellRenderer: (name: string | CellType) => ICellRenderer<{}>;
}




// import { isNullOrUndefined, getEnumValue } from '@syncfusion/ej2-base';
// import { ICellRenderer } from '../base/interface';
// import { CellType } from '../base/enum';


// /**
//  * CellRendererFactory
//  *
//  * @hidden
//  */
// export class CellRendererFactory {

//     public cellRenderMap: { [c: string]: ICellRenderer<{}> } = {};

//     public addCellRenderer(name: string | CellType, type: ICellRenderer<{}>): void {
//         name = typeof name === 'string' ? name : <string>getEnumValue(CellType, <CellType>name);

//         if (isNullOrUndefined(this.cellRenderMap[`${name}`])) {
//             this.cellRenderMap[`${name}`] = type;
//         }
//     }

//     public getCellRenderer(name: string | CellType): ICellRenderer<{}> {
//         name = typeof name === 'string' ? name : <string>getEnumValue(CellType, <CellType>name);

//         if (isNullOrUndefined(this.cellRenderMap[`${name}`])) {
//             // eslint-disable-next-line no-throw-literal
//             throw `The cellRenderer ${name} is not found`;
//         } else {
//             return this.cellRenderMap[`${name}`];
//         }
//     }
// }

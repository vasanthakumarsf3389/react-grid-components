
import { setValue, IInternationalization, Internationalization, isUndefined } from '@syncfusion/react-base';
import { extend as baseExtend, isNullOrUndefined, getValue, classList, NumberFormatOptions } from '@syncfusion/react-base';
import { setStyleAttribute, addClass, attributes, remove, createElement, DateFormatOptions, removeClass } from '@syncfusion/react-base';
import { isObject, IKeyValue, select, selectAll } from '@syncfusion/react-base';
import {
    // IPosition,
    IGrid,
    // IValueFormatter, IRow, ICell, IExpandedRow,
    // PdfExportProperties,
    // ExcelExportProperties, DataStateChangeEventArgs, RowDropEventArgs
} from './GridInterfaces';
import { ServiceLocator } from '../services/service-locator';
import { DataUtil, Query, DataManager, Predicate, UrlAdaptor, Deferred } from '@syncfusion/react-data';
import { Column } from '../models/column';
import { Row } from '../models/row';
import { ColumnModel,
    // AggregateColumnModel
} from '../models/models';
import { AggregateType, HierarchyGridPrintMode } from './enum';
import {
    // Dialog,
    calculateRelativeBasedPosition, Popup, calculatePosition
} from '@syncfusion/react-popups';
// import { PredicateModel } from './grid-model';
// import { Print } from '../actions/print';
// import { FilterStateObj, IXLFilter } from '../common/filter-interface';
// import { CheckBoxFilterBase } from '../common/checkbox-filter-base';
// import { GroupedData } from '../services/group-model-generator';
import * as literals from './string-literals';

//https://typescript.codeplex.com/discussions/401501
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {Object} target - specifies the target
 * @param  {string} checkFor - specifies the checkfors
 * @returns {boolean} returns the boolean
 * @hidden
 */
export function doesImplementInterface(target: Object, checkFor: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target as { prototype: Function }).prototype && checkFor in (target as { prototype: Function }).prototype ? true : false;
}

/**
 * Function to get value from provided data
 *
 * @param  {string} field - specifies the field
 * @param  {Object} data - specifies the data
 * @param  {ColumnModel} column - specifies the column
 * @returns {Object} returns the object
 * @hidden
 */
// eslint-disable-next-line
export function valueAccessor(field: string, data: Object, column: ColumnModel): Object {
    return (isNullOrUndefined(field) || field === '') ? '' : DataUtil.getObject(field, data);
}

/**
 * Defines the method used to apply custom header cell values from external function and display this on each header cell rendered.
 *
 * @param  {string} field - specifies the field
 * @param  {ColumnModel} column - specifies the column
 * @returns {object} headerValueAccessor
 * @hidden
 */
export function headerValueAccessor(field: string, column: ColumnModel): Object {
    return (isNullOrUndefined(field) || field === '') ? '' : DataUtil.getObject(field, column);
}

/**
 * The function used to update Dom using requestAnimationFrame.
 *
 * @param {Function} updateFunction - Function that contains the actual action
 * @param {object} callBack - defines the callback
 * @returns {void}
 * @hidden
 */
// eslint-disable-next-line
export function getUpdateUsingRaf<T>(updateFunction: Function, callBack: Function): void {
    requestAnimationFrame(() => {
        try {
            callBack(null, updateFunction());
        } catch (e) {
            callBack(e);
        }
    });
}

// /**
//  * @hidden
//  * @param {PdfExportProperties | ExcelExportProperties} exportProperties - Defines the export properties
//  * @returns {boolean} Returns isExportColumns
//  */
// export function isExportColumns(exportProperties: PdfExportProperties | ExcelExportProperties): boolean {

//     return !isNullOrUndefined(exportProperties) &&
//         !isNullOrUndefined(exportProperties.columns) && exportProperties.columns.length > 0;
// }

// /**
//  * @param {PdfExportProperties | ExcelExportProperties} exportProperties - Defines the export properties
//  * @param {IGrid} gObj - Defines the grid object
//  * @returns {void}
//  * @hidden
//  */
// export function updateColumnTypeForExportColumns(exportProperties: PdfExportProperties | ExcelExportProperties, gObj: IGrid): void {
//     const exportColumns: Column[] = exportProperties.columns as Column[];
//     const gridColumns: Column[] = gObj.columns as Column[];
//     for (let i: number = 0; i < exportColumns.length; i++) {
//         if (gridColumns.length - 1 >= i) {
//             if (gridColumns[parseInt(i.toString(), 10)].columns) {
//                 for (let j: number = 0; gridColumns[parseInt(i.toString(), 10)].columns && j < gridColumns[parseInt(i.toString(), 10)].columns.length; j++) {
//                     (exportColumns[parseInt(i.toString(), 10)].columns[parseInt(j.toString(), 10)] as Column)
//                         .type = (gridColumns[parseInt(i.toString(), 10)].columns[parseInt(j.toString(), 10)] as Column).type;
//                 }
//             } else {
//                 exportColumns[parseInt(i.toString(), 10)].type = gridColumns[parseInt(i.toString(), 10)].type;
//             }
//         }
//     }
// }

// /**
//  * @hidden
//  * @param {IGrid} grid - Defines the grid
//  * @returns {void}
//  */
// export function updatecloneRow(grid: IGrid): void {
//     const nRows: Row<Column>[] = []; const actualRows: Row<Column>[] = grid.vRows as Row<Column>[];
//     for (let i: number = 0; i < actualRows.length; i++) {
//         if (actualRows[parseInt(i.toString(), 10)].isDataRow) {
//             nRows.push(actualRows[parseInt(i.toString(), 10)]);
//         } else if (!actualRows[parseInt(i.toString(), 10)].isDataRow) {
//             nRows.push(actualRows[parseInt(i.toString(), 10)]);
//             if (!actualRows[parseInt(i.toString(), 10)].isExpand && actualRows[parseInt(i.toString(), 10)].isCaptionRow) {
//                 i += getCollapsedRowsCount(actualRows[parseInt(i.toString(), 10)], grid);
//             }
//         }
//     }
//     grid.vcRows = nRows;
// }


let count: number = 0;
// /**
//  * @hidden
//  * @param {Row<Column>} val - Defines the value
//  * @param {IGrid} grid - Defines the grid
//  * @returns {number} Returns the collapsed row count
//  */
// export function getCollapsedRowsCount(val: Row<Column>, grid: IGrid): number {
//     count = 0;
//     const gSummary: string = 'gSummary'; const total: string = 'count';
//     const gLen: number = grid.groupSettings.columns.length;
//     const records: string = 'records';
//     const items: string = 'items';
//     const value: number = val[`${gSummary}`];
//     let dataRowCnt: number = 0;
//     const agrCnt: string = 'aggregatesCount';
//     if (value === val.data[`${total}`]) {
//         if (grid.groupSettings.columns.length && !isNullOrUndefined(val[`${agrCnt}`]) && val[`${agrCnt}`]) {
//             if (grid.groupSettings.columns.length !== 1) {
//                 count += (val.indent !== 0 && (value) < 2) ? (val[`${gSummary}`] * ((gLen - val.indent) + (gLen - val.indent) * val[`${agrCnt}`])) :
//                     (val[`${gSummary}`] * ((gLen - val.indent) + (gLen - val.indent - 1) * val[`${agrCnt}`])) + val[`${agrCnt}`];
//             } else if (grid.groupSettings.columns.length === 1) {
//                 count += (val[`${gSummary}`] * (gLen - val.indent)) + val[`${agrCnt}`];
//             }
//         } else if (grid.groupSettings.columns.length) {
//             if (grid.groupSettings.columns.length !== 1) {
//                 count += val[`${gSummary}`] * (grid.groupSettings.columns.length - val.indent);
//             } else {
//                 count += val[`${gSummary}`];
//             }
//         }
//         return count;
//     } else {
//         for (let i: number = 0, len: number = val.data[`${items}`].length; i < len; i++) {
//             const gLevel: Object[] = val.data[`${items}`][parseInt(i.toString(), 10)];
//             count += gLevel[`${items}`].length + ((gLen !== grid.columns.length) &&
//                 !isNullOrUndefined(gLevel[`${items}`][`${records}`]) ? gLevel[`${items}`][`${records}`].length : 0);
//             dataRowCnt += (!isNullOrUndefined(gLevel[`${items}`][`${records}`]) && !isNullOrUndefined(val[`${agrCnt}`])) ? gLevel[`${items}`][`${records}`].length :
//                 gLevel[`${items}`].length;
//             if (gLevel[`${items}`].GroupGuid && gLevel[`${items}`].childLevels !== 0) {
//                 recursive(gLevel);
//             }
//         }
//         count += val.data[`${items}`].length;
//         if (!isNullOrUndefined(val[`${agrCnt}`])) {
//             if (val[`${agrCnt}`] && count && dataRowCnt !== 0) {
//                 count += ((count - dataRowCnt) * val[`${agrCnt}`]) + val[`${agrCnt}`];
//             }
//         }
//     }
//     return count;
// }

// /**
//  * @param {Object[]} row - Defines the row
//  * @returns {void}
//  * @hidden
//  */
// export function recursive(row: Object[]): void {
//     const items: string = 'items';
//     const rCount: string = 'count';
//     for (let j: number = 0, length: number = row[`${items}`].length; j < length; j++) {
//         const nLevel: Object[] = row[`${items}`][parseInt(j.toString(), 10)];
//         count += nLevel[`${rCount}`];
//         if (nLevel[`${items}`].childLevels !== 0) {
//             recursive(nLevel);
//         }
//     }
// }


/**
 * Iterates over a collection, applying a predicate, and returns an array of results.
 * The collection can be an array of objects, and the predicate can transform each item.
 *
 * @template T - The type of elements in the resulting array.
 * @template U - The type of elements in the collection.
 * @param {U[]} collection - An array of objects over which to iterate.
 * @param {(item: U, index: number) => T} predicate - A function that takes an item and its index, returning a transformed element.
 * @returns {T[]} - An array of transformed elements.
 * @hidden
 */
export function iterateArrayOrObject<T, U extends Record<string, any>>(collection: U[], predicate: (item: U, index: number) => T): T[] {
    const result: T[] = [];
    for (let i: number = 0, len: number = collection.length; i < len; i++) {
        const pred: T = predicate(collection[parseInt(i.toString(), 10)], i);
        if (!isNullOrUndefined(pred)) {
            result.push(pred);
        }
    }
    return result;
}

/**
 * @param {Object[]} array - Defines the array
 * @returns {Object} Returns the object
 * @hidden
 */
export function iterateExtend(array: Object[]): Object[] {
    const obj: Object[] = [];
    for (let i: number = 0; i < array.length; i++) {
        obj.push(baseExtend({}, getActualProperties(array[parseInt(i.toString(), 10)]), {}, true));
    }
    return obj;
}

/**
 * Compiles a given template, checking whether it's a valid selector or function, and returns a compiled function.
 *
 * @param {string | Function} template - The template which could either be an HTML string or a function.
 * @returns {Function | undefined} - A compiled function or undefined.
 * @hidden
 */
export function templateCompiler(template: string | Function): Function | undefined {
    // if (template) {
    //     try {
    //         // Type guard to check if template is a string before accessing its index
    //         const validSelector: boolean = typeof template === 'string' && template[0] !== '<';
    //         if (typeof template === 'function') {
    //             return baseTemplateComplier(template);
    //         }
    //         else if (validSelector && document.querySelectorAll(template).length) {
    //             return baseTemplateComplier((document.querySelector(template) as HTMLElement).innerHTML.trim());
    //         } else {
    //             return baseTemplateComplier(template);
    //         }
    //     } catch (e) {
    //         return baseTemplateComplier(template);
    //     }
    // }
    return undefined;
}

/**
 * @param {Element} node - Defines the column
 * @param {Object} customAttributes - Defines the index
 * @returns {void}
 * @hidden
 */
export function setStyleAndAttributes(node: Element, customAttributes: { [x: string]: Object }): void {
    const copyAttr: { [x: string]: Object } = {}; const literals: string[] = ['style', 'class'];

    //Dont touch the original object - make a copy
    baseExtend(copyAttr, customAttributes, {});

    if ('style' in copyAttr) {
        setStyleAttribute(node as HTMLElement, copyAttr[literals[0]] as { [x: string]: Object });
        delete copyAttr[literals[0]];
    }

    if ('class' in copyAttr) {
        addClass([node], copyAttr[literals[1]] as string | string[]);
        delete copyAttr[literals[1]];
    }

    attributes(node, copyAttr as { [x: string]: string });
}

/**
 * @param {Object} copied - Defines the column
 * @param {Object} first - Defines the inndex
 * @param {Object} second - Defines the second object
 * @param {string[]} exclude - Defines the exclude
 * @returns {Object} Returns the object
 * @hidden
 */
export function extend(copied: Object, first: Object, second?: Object, exclude?: string[]): Object {
    const moved: { [key: string]: unknown } = baseExtend(copied, first, second) as { [key: string]: unknown };
    const values: string[] = Object.keys(moved);
    for (let i: number = 0; i < values.length; i++) {
        if (exclude && exclude.indexOf(values[parseInt(i.toString(), 10)]) !== -1) {
            delete moved[values[parseInt(i.toString(), 10)]];
        }
    }

    return moved;
}

/**
 * @param {Column[]} columnModel - Defines the column
 * @param {number} ind - Defines the inndex
 * @returns {number} - Returns the columnindex
 * @hidden
 */
export function setColumnIndex(columnModel: Column[], ind: number = 0): number {
    for (let i: number = 0, len: number = (!isNullOrUndefined(columnModel) ? columnModel.length : 0); i < len; i++) {
        if ((columnModel[parseInt(i.toString(), 10)] as Column).columns) {
            (columnModel[parseInt(i.toString(), 10)] as Column).index = isNullOrUndefined(
                (columnModel[parseInt(i.toString(), 10)] as Column).index) ? ind
                : (columnModel[parseInt(i.toString(), 10)] as Column).index;
            ind++;
            ind = setColumnIndex((columnModel[parseInt(i.toString(), 10)] as Column).columns as Column[], ind);
        } else {
            (columnModel[parseInt(i.toString(), 10)] as Column).index = isNullOrUndefined(
                (columnModel[parseInt(i.toString(), 10)] as Column).index) ? ind
                : (columnModel[parseInt(i.toString(), 10)] as Column).index;
            ind++;
        }
    }
    return ind;
}

/**
 * @param {Column[] | string[] | ColumnModel[]} columns - Defines the column
 * @param {boolean} autoWidth - Defines the autowidth
 * @param {IGrid} gObj - Defines the class name
 * @returns {Column} - Returns the columns
 * @hidden
 */
export function prepareColumns(columns: Column[] | string[] | ColumnModel[], autoWidth?: boolean, gObj?: IGrid): Column[] {
    for (let c: number = 0, len: number = (!isNullOrUndefined(columns) ? columns.length : 0); c < len; c++) {

        let column: Column;

        if (typeof columns[parseInt(c.toString(), 10)] === 'string') {
            column = Column({ field: columns[parseInt(c.toString(), 10)] as string }, gObj);
        } else if (!(columns[parseInt(c.toString(), 10)] instanceof Column) || (columns[parseInt(c.toString(), 10)] as Column).columns) {
            if (!(columns[parseInt(c.toString(), 10)] as Column).columns) {
                column = Column(columns[parseInt(c.toString(), 10)] as ColumnModel, gObj);
            } else {
                (columns[parseInt(c.toString(), 10)] as Column).columns = prepareColumns(
                    (columns[parseInt(c.toString(), 10)] as Column).columns as Column[], false, gObj);
                column = Column(columns[parseInt(c.toString(), 10)] as ColumnModel, gObj);
            }
        } else {
            column = columns[parseInt(c.toString(), 10)] as Column;
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
    return columns as Column[];
}

// /**
//  * @param {HTMLElement} popUp - Defines the popup element
//  * @param {MouseEvent | TouchEvent} e - Defines the moouse event
//  * @param {string} className - Defines the class name
//  * @returns {void}
//  * @hidden
//  */
// export function setCssInGridPopUp(popUp: HTMLElement, e: MouseEvent | TouchEvent, className: string): void {
//     const popUpSpan: HTMLElement = popUp.querySelector('span') as HTMLSpanElement;
//     const position: DOMRect = popUp.parentElement?.getBoundingClientRect() as DOMRect;
//     const targetPosition: { top: number, left: number, right: number } = (e.target as HTMLElement).getBoundingClientRect();
//     popUpSpan.className = className;
//     popUp.style.display = '';
//     const isBottomTail: boolean = (isNullOrUndefined((e as MouseEvent).clientY) ? (e as TouchEvent).changedTouches[0].clientY :
//         (e as MouseEvent).clientY) > popUp.offsetHeight + 10;
//     popUp.style.top = targetPosition.top - position.top +
//         (isBottomTail ? -(popUp.offsetHeight + 10) : popUp.offsetHeight + 10) + 'px'; //10px for tail element
//     popUp.style.left = getPopupLeftPosition(popUp, e, targetPosition, position.left) + 'px';
//     if (isBottomTail) {
//         (popUp.querySelector('.e-downtail') as HTMLElement).style.display = '';
//         (popUp.querySelector('.e-uptail') as HTMLElement).style.display = 'none';
//     } else {
//         (popUp.querySelector('.e-downtail') as HTMLElement).style.display = 'none';
//         (popUp.querySelector('.e-uptail') as HTMLElement).style.display = '';
//     }
// }

// /**
//  * @param {HTMLElement} popup - Defines the popup element
//  * @param {MouseEvent | TouchEvent} e  - Defines the mouse event
//  * @param {Object} targetPosition - Defines the target position
//  * @param {number} targetPosition.top - Defines the top position
//  * @param {number} targetPosition.left  - Defines the left position
//  * @param {number} targetPosition.right  - Defines the right position
//  * @param {number} left - Defines the left position
//  * @returns {number} Returns the popup left position
//  * @hidden
//  */
// function getPopupLeftPosition(
//     popup: HTMLElement, e: MouseEvent | TouchEvent, targetPosition: { top: number, left: number, right: number }, left: number): number {
//     const width: number = popup.offsetWidth / 2;
//     const x: number = getPosition(e).x;
//     if (x - targetPosition.left < width) {
//         return targetPosition.left - left;
//     } else if (targetPosition.right - x < width) {
//         return targetPosition.right - left - width * 2;
//     } else {
//         return x - left - width;
//     }
// }

/**
 * @param {Object} obj - Defines the object
 * @returns {Object} Returns the Properties
 * @hidden
 */
export function getActualProperties<T>(obj: T): T {
    // if (obj instanceof ChildProperty) {
    //     return <T>getValue('properties', obj);
    // } else {
    return obj;
    // }
}

/**
 * @param {Element} elem - Defines the element
 * @param {string} selector - Defines the string selector
 * @param {boolean} isID - Defines the isID
 * @returns {Element} Returns the element
 * @hidden
 */
export function parentsUntil(elem: Element, selector: string, isID?: boolean): Element {
    let parent: Element = elem;
    while (parent) {
        if (isID ? parent.id === selector : parent.classList.contains(selector)) {
            break;
        }
        parent = parent.parentElement as HTMLElement;
    }
    return parent;
}

/**
 * @param {Element} element - Defines the element
 * @param {Element} elements - Defines the element
 * @returns {number} Returns the element index
 * @hidden
 */
export function getElementIndex(element: Element, elements: Element[]): number {
    let index: number = -1;
    for (let i: number = 0, len: number = elements.length; i < len; i++) {
        if (elements[parseInt(i.toString(), 10)].isEqualNode(element)) {
            index = i;
            break;
        }
    }
    return index;
}

/**
 * @param {Object} value - Defines the value
 * @param {Object} collection - defines the collection
 * @returns {number} Returns the array
 * @hidden
 */
export function inArray(value: Object, collection: Object[]): number {
    for (let i: number = 0, len: number = collection.length; i < len; i++) {
        if (collection[parseInt(i.toString(), 10)] === value) {
            return i;
        }
    }
    return -1;
}

/**
 * @param {Object} collection - Defines the collection
 * @returns {Object} Returns the object
 * @hidden
 */
export function getActualPropFromColl(collection: Object[]): Object[] {
    const coll: Object[] = [];
    for (let i: number = 0, len: number = collection.length; i < len; i++) {
        // eslint-disable-next-line no-prototype-builtins
        if (collection[parseInt(i.toString(), 10)].hasOwnProperty('properties')) {
            coll.push((collection[parseInt(i.toString(), 10)] as { properties: Object }).properties);
        } else {
            coll.push(collection[parseInt(i.toString(), 10)]);
        }
    }
    return coll;
}

/**
 * @param {Element} target - Defines the target element
 * @param {string} selector - Defines the selector
 * @returns {void}
 * @hidden
 */
export function removeElement(target: Element, selector: string): void {
    const elements: HTMLElement[] = [].slice.call(target.querySelectorAll(selector));
    for (let i: number = 0; i < elements.length; i++) {
        remove(elements[parseInt(i.toString(), 10)]);
    }
}

// /**
//  * @param {MouseEvent | TouchEvent} e Defines the mouse event
//  * @returns {IPosition} Returns the position
//  * @hidden
//  */
// export function getPosition(e: MouseEvent | TouchEvent): IPosition {
//     const position: IPosition = {} as IPosition;
//     position.x = (isNullOrUndefined((e as MouseEvent).clientX) ? (e as TouchEvent).changedTouches[0].clientX :
//         (e as MouseEvent).clientX);
//     position.y = (isNullOrUndefined((e as MouseEvent).clientY) ? (e as TouchEvent).changedTouches[0].clientY :
//         (e as MouseEvent).clientY);
//     return position;
// }


let uid: number = 0;
/**
 * @param {string} prefix - Defines the prefix string
 * @returns {string} Returns the uid
 * @hidden
 */
export function getUid(prefix: string): string {
    return prefix + uid++;
}

/**
 * @param {Element | DocumentFragment} elem - Defines the element
 * @param {Element[] | NodeList} children - Defines the Element
 * @returns {Element} Returns the element
 * @hidden
 */
export function appendChildren(elem: Element | DocumentFragment, children: Element[] | NodeList): Element {
    for (let i: number = 0, len: number = children.length; i < len; i++) {
        if (len === children.length) {
            elem.appendChild(children[parseInt(i.toString(), 10)]);
        } else {
            elem.appendChild(children[0]);
        }
    }
    return elem as Element;
}

/**
 * @param {Element} elem - Defines the element
 * @param {string} selector - Defines the selector
 * @param {boolean} isID - Defines isID
 * @returns {Element} Return the element
 * @hidden
 */
export function parents(elem: Element, selector: string, isID?: boolean): Element[] {
    let parent: Element = elem;
    const parents: Element[] = [];
    while (parent) {
        if (isID ? parent.id === selector : parent.classList.contains(selector)) {
            parents.push(parent);
        }
        parent = parent.parentElement as HTMLElement;
    }
    return parents;
}

// /**
//  * @param {AggregateType | string} type - Defines the type
//  * @param {Object} data - Defines the data
//  * @param {AggregateColumnModel} column - Defines the column
//  * @param {Object} context - Defines the context
//  * @returns {Object} Returns the calculated aggragate
//  * @hidden
//  */
// export function calculateAggregate(type: AggregateType | string, data: Object, column?: AggregateColumnModel, context?: Object): Object {
//     if (type === 'Custom') {
//         let temp: Function = column?.customAggregate as Function;
//         if (typeof temp === 'string') {
//             temp = getValue(temp, window);
//         }
//         return temp ? temp.call(context, data, column) : '';
//     }
//     return (column.field in data || data instanceof Array) ? DataUtil.aggregates[type.toLowerCase()](data, column.field) : null;
// }
/** @hidden */
let scrollWidth: number | null = null;

/** @hidden
 * @returns {number} - Returns the scrollbarwidth
 */
export function getScrollBarWidth(): number {
    if (scrollWidth !== null) { return scrollWidth; }
    const divNode: HTMLDivElement = document.createElement('div');
    let value: number = 0;
    divNode.style.cssText = 'width:100px;height: 100px;overflow: scroll;position: absolute;top: -9999px;';
    document.body.appendChild(divNode);
    value = (divNode.offsetWidth - divNode.clientWidth) | 0;
    document.body.removeChild(divNode);
    return scrollWidth = value;
}

/** @hidden */
let rowHeight: number;
/** @hidden */
let accurateRowHeight: number;
/**
 * @param {HTMLElement} element - Defines the element
 * @param {boolean} accurateHeight - Defines the accurate row height
 * @returns {number} Returns the roww height
 * @hidden
 */
export function getRowHeight(element?: HTMLElement, accurateHeight?: boolean): number {
    if (accurateHeight && accurateRowHeight !== undefined) {
        return accurateRowHeight;
    }
    if (rowHeight !== undefined) {
        return rowHeight;
    }
    const table: HTMLTableElement = createElement('table', { className: literals.table, attrs: { role: 'grid' } }) as HTMLTableElement;
    table.style.visibility = 'hidden';
    table.innerHTML = '<tr><td class="e-rowcell">A<td></tr>';
    element?.appendChild(table);
    const rect: DOMRect = table.querySelector('td')?.getBoundingClientRect() as DOMRect;
    element?.removeChild(table);
    accurateRowHeight = rect.height;
    rowHeight = Math.ceil(rect.height);
    if (accurateHeight) {
        return accurateRowHeight;
    }
    return rowHeight;
}

/**
 * @param {HTMLElement} element - Defines the HTMl element
 * @returns {number} Returns the row height
 * @hidden
 */
export function getActualRowHeight(element?: HTMLElement): number {
    const table: HTMLTableElement = createElement('table', { className: literals.table, attrs: { role: 'grid' } }) as HTMLTableElement;
    table.style.visibility = 'hidden';
    table.innerHTML = '<tr><td class="e-rowcell">A<td></tr>';
    element?.appendChild(table);
    const rect: DOMRect = table.querySelector('tr')?.getBoundingClientRect() as DOMRect;
    element?.removeChild(table);
    return rect.height;
}

/**
 * @param {string} field - Defines the field
 * @returns {boolean} - Returns is complex field
 * @hidden
 */
export function isComplexField(field: string): boolean {
    return field.split('.').length > 1;
}

/**
 * @param {string} field - Defines the field
 * @returns {string} - Returns the get complex field ID
 * @hidden
 */
export function getComplexFieldID(field: string = ''): string {
    return field.replace(/\./g, '___');
}

/**
 * @param {string} field - Defines the field
 * @returns {string} - Returns the parsed column field id
 * @hidden
 */
export function getParsedFieldID(field: string = ''): string {
    return field.replace(/[^a-zA-Z0-9_.]/g, '\\$&');
}

/**
 * @param {string} field - Defines the field
 * @returns {string} - Returns the set complex field ID
 * @hidden
 */
export function setComplexFieldID(field: string = ''): string {
    return field.replace(/___/g, '.');
}

/**
 * @param {Column} col - Defines the column
 * @param {string} type - Defines the type
 * @param {Element} elem - Defines th element
 * @returns {boolean} Returns is Editable
 * @hidden
 */
export function isEditable(col: Column, type: string, elem: Element): boolean {
    const row: Element = parentsUntil(elem, literals.row);
    const isOldRow: boolean = !row ? true : row && !row.classList.contains('e-insertedrow');
    if (type === 'beginEdit' && isOldRow) {
        if (col.isIdentity || col.isPrimaryKey || !col.allowEditing) {
            return false;
        }
        return true;
    } else if (type === 'add' && col.isIdentity) {
        return false;
    } else {
        if (isOldRow && !col.allowEditing && !col.isIdentity && !col.isPrimaryKey) {
            return false;
        }
        return true;
    }
}

/**
 * @param {Element} elem - Defines th element
 * @returns {boolean} Returns is Editable
 * @hidden
 */
export function isCellHaveWidth(elem: Element): boolean {
    return elem.getBoundingClientRect().width === 0 ? false : true;
}

// /**
//  * @param {IGrid} inst - Defines the IGrid
//  * @returns {boolean} Returns is action prevent in boolean
//  * @hidden
//  */
// export function isActionPrevent(inst: IGrid): boolean {
//     const dlg: HTMLElement = select('#' + inst.element.id + 'EditConfirm', inst.element) as HTMLElement;
//     return inst.editSettings.mode === 'Batch' &&
//         (selectAll('.e-updatedtd', inst.element).length || selectAll('.e-gridform.e-formvalidator', inst.element).length)
//         && inst.editSettings.showConfirmDialog && (dlg ? dlg.classList.contains('e-popup-close') : true);
// }

/**
 * @param {any} elem - Defines the element
 * @param {boolean} action - Defines the boolean for action
 * @returns {void}
 * @hidden
 */
// eslint-disable-next-line
export function wrap(elem: any, action: boolean): void {
    const clName: string = 'e-wrap';
    elem = elem instanceof Array ? elem : [elem];
    for (let i: number = 0; i < elem.length; i++) {
        if (action) {
            elem[parseInt(i.toString(), 10)].classList.add(clName);
        } else {
            elem[parseInt(i.toString(), 10)].classList.remove(clName);
        }
    }
}

// /**
//  * @param {ServiceLocator} serviceLocator - Defines the service locator
//  * @param {Column} column  - Defines the column
//  * @returns {void}
//  * @hidden
//  */
// export function setFormatter(serviceLocator?: ServiceLocator, column?: Column): void {
//     const fmtr: IValueFormatter = serviceLocator.getService<IValueFormatter>('valueFormatter');
//     const format: string = 'format';
//     let args: object;
//     if (column.type === 'date' || column.type === 'datetime' || column.type === 'dateonly') {
//         args = { type: column.type === 'dateonly' ? 'date' : column.type, skeleton: column.format };
//         if ((typeof (column.format) === 'string') && column.format !== 'yMd') {
//             args[`${format}`] = column.format;
//         }
//     }
//     switch (column.type) {
//     case 'date':
//         column.setFormatter(
//             fmtr.getFormatFunction(args as DateFormatOptions));
//         column.setParser(
//             fmtr.getParserFunction(args as DateFormatOptions));
//         break;
//     case 'dateonly':
//         column.setFormatter(
//             fmtr.getFormatFunction(args as DateFormatOptions));
//         column.setParser(
//             fmtr.getParserFunction(args as DateFormatOptions));
//         break;
//     case 'datetime':
//         column.setFormatter(
//             fmtr.getFormatFunction(args as DateFormatOptions));
//         column.setParser(
//             fmtr.getParserFunction(args as DateFormatOptions));
//         break;
//     case 'number':
//         column.setFormatter(
//             fmtr.getFormatFunction({ format: column.format } as NumberFormatOptions));
//         column.setParser(
//             fmtr.getParserFunction({ format: column.format } as NumberFormatOptions));
//         break;
//     }
// }

/**
 * @param {Element} cells - Defines the cell element
 * @param {boolean} add - Defines the add
 * @param {string} args - Defines the args
 * @returns {void}
 * @hidden
 */
export function addRemoveActiveClasses(cells: Element[], add: boolean, ...args: string[]): void {
    for (let i: number = 0, len: number = cells.length; i < len; i++) {
        if (add) {
            classList(cells[parseInt(i.toString(), 10)], [...args], []);
            cells[parseInt(i.toString(), 10)].setAttribute('aria-selected', 'true');
        } else {
            classList(cells[parseInt(i.toString(), 10)], [], [...args]);
            cells[parseInt(i.toString(), 10)].removeAttribute('aria-selected');
        }
    }
}

/**
 * @param {string} result - Defines th string
 * @returns {string} Returns the distinct staing values
 * @hidden
 */
export function distinctStringValues(result: string[]): string[] {
    const temp: { [key: string]: unknown } = {};
    const res: string[] = [];
    for (let i: number = 0; i < result.length; i++) {
        if (!(result[parseInt(i.toString(), 10)] in temp)) {
            res.push(result[parseInt(i.toString(), 10)].toString());
            temp[result[parseInt(i.toString(), 10)]] = 1;
        }
    }
    return res;
}

// /**
//  * @param {Element} target - Defines the target
//  * @param {Dialog} dialogObj - Defines the dialog
//  * @returns {void}
//  * @hidden
//  */
// export function getFilterMenuPostion(target: Element, dialogObj: Dialog): void {
//     const elementVisible: string = dialogObj.element.style.display;
//     dialogObj.element.style.display = 'block';
//     const dlgWidth: number = dialogObj.width as number;
//     const newpos: { top: number, left: number } = calculateRelativeBasedPosition((<HTMLElement>target), dialogObj.element);
//     dialogObj.element.style.display = elementVisible;
//     dialogObj.element.style.top = (newpos.top + target.getBoundingClientRect().height) - 5 + 'px';
//     const leftPos: number = ((newpos.left - dlgWidth) + target.clientWidth);
//     if (leftPos < 1) {
//         dialogObj.element.style.left = (dlgWidth + leftPos) - 16 + 'px'; // right calculation
//     } else {
//         dialogObj.element.style.left = leftPos + -4 + 'px';
//     }
// }

// /**
//  * @param {Object} args - Defines the args
//  * @param {Popup} args.popup - Defines the args for popup
//  * @param {Dialog} dialogObj - Defines the dialog obj
//  * @returns {void}
//  * @hidden
//  */
// export function getZIndexCalcualtion(args: { popup: Popup }, dialogObj: Dialog): void {
//     args.popup.element.style.zIndex = (dialogObj.zIndex + 1).toString();
// }

// /**
//  * @param {string} operator - Defines the operator
//  * @param {string} columnUid - Defines the column uid
//  * @param {Column} column - Defines the column
//  * @param {string} columnType - Defines the column type
//  * @param {Dialog} dlgObj - Defines the dialog
//  * @param {string} previousValue - Defines the previous operator
//  * @returns {void}
//  * @hidden
//  */
// export function toggleFilterUI(
//     operator: string, columnUid: string, column: Column, columnType: string,
//     dlgObj: Dialog, previousValue: string
// ): void {
//     if (isNullOrUndefined(column.filterTemplate)) {
//         let columnID: string = '';
//         if (columnType === 'string') {
//             columnID = 'strui-' + columnUid;
//         } else if (columnType === 'number') {
//             columnID = 'numberui-' + columnUid;
//         } else if (columnType === 'boolean') {
//             columnID = 'bool-ui-' + columnUid;
//         } else if (columnType === 'date') {
//             columnID = 'dateui-' + columnUid;
//         }
//         const isPreviousValue: boolean = previousValue === 'in' || previousValue === 'notin';
//         const isMultiSelect: boolean = operator === 'in' || operator === 'notin';
//         const multiselectParent: HTMLElement = parentsUntil(dlgObj.element.querySelector(`#multiselect${columnID}`) as Element, 'e-control-wrapper') as HTMLElement;
//         const singleInputParent: HTMLElement = parentsUntil(dlgObj.element.querySelector(`#${columnID}`) as Element, 'e-popup-flmenu') as HTMLElement;
//         if (multiselectParent) {
//             multiselectParent.style.display = isMultiSelect ? 'inline-flex' : 'none';
//         }
//         if (singleInputParent) {
//             singleInputParent.style.display = isMultiSelect ? 'none' : 'inline-flex';
//         }
//     }
// }

/**
 * @param {Element} elem - Defines the element
 * @returns {void}
 * @hidden
 */
export function toogleCheckbox(elem: Element): void {
    const span: Element = elem.querySelector('.e-frame') as Element;
    const input: HTMLInputElement = span.previousSibling as HTMLInputElement;
    if (span.classList.contains('e-check')) {
        input.checked = false;
        classList(span, ['e-uncheck'], ['e-check']);
    } else {
        input.checked = true;
        classList(span, ['e-check'], ['e-uncheck']);
    }
}

/**
 * @param {HTMLInputElement} elem - Defines the element
 * @param {boolean} checked - Defines is checked
 * @returns {void}
 * @hidden
 */
export function setChecked(elem: HTMLInputElement, checked: boolean): void {
    elem.checked = checked;
}

/**
 * @param {string} uid - Defines the string
 * @param {Element} elem - Defines the Element
 * @param {string} className - Defines the classname
 * @returns {Element} Returns the box wrap
 * @hidden
 */
export function createCboxWithWrap(uid: string, elem: Element, className?: string): Element {
    const div: Element = createElement('div', { className: className });
    div.appendChild(elem);
    div.setAttribute('uid', uid);
    return div;
}

/**
 * @param {Element} elem - Defines the element
 * @param {boolean} checked - Defines is checked
 * @returns {void}
 * @hidden
 */
export function removeAddCboxClasses(elem: Element, checked: boolean): void {
    removeClass([elem], ['e-check', 'e-stop', 'e-uncheck']);
    if (checked) {
        elem.classList.add('e-check');
    } else {
        elem.classList.add('e-uncheck');
    }
}

// /**
//  * Refreshes the foreign key data in a given Grid row model based on updated data.
//  * Iterates through the columns and cells to update the corresponding foreign key data.
//  *
//  * @param {IRow<Column>} row - Grid Row model object.
//  * @param {Column[]} columns - Array of foreign columns to be refreshed.
//  * @param {Object} data - Updated Row data with potential foreign data changes.
//  * @returns {void}
//  * @hidden
//  */
// export function refreshForeignData(row: IRow<Column>, columns: Column[], data: Object): void {
//     if (!isNullOrUndefined(columns)) {
//         for (let i = 0; i < columns.length; i++) {
//             const column = columns[i];
//             setValue(column.field as string, getForeignData(column, data), row.foreignKeyData);
//         }
//     }

//     const cells: ICell<Column>[] = row.cells as ICell<Column>[];
//     for (let i = 0; i < cells.length; i++) {
//         const cell = cells[i];
//         if (cell && cell.isForeignKey) {
//             setValue('foreignKeyData', getValue(cell.column?.field as string, row.foreignKeyData), cell);
//         }
//     }
// }

// /**
//  * Get the foreign data for the corresponding cell value.
//  *
//  * @param {Column} column - Foreign Key column
//  * @param {Object} data - Row data.
//  * @param {string | number} lValue - cell value.
//  * @param {Object} foreignKeyData - foreign data source.
//  * @returns {Object} Returns the object
//  * @hidden
//  */
// export function getForeignData(column: Column | ColumnModel, data?: Object, lValue?: string | number, foreignKeyData?: Object[]): Object[] {
//     const fField: string = column.foreignKeyField as string;
//     let key: string | Date = (!isNullOrUndefined(lValue) ? lValue : valueAccessor(column.field as string, data as Object, column as ColumnModel)) as string | Date;
//     key = isNullOrUndefined(key) ? '' : key;
//     const query: Query = new Query();
//     const fdata: Object[] = foreignKeyData || ((column.dataSource instanceof DataManager) && column.dataSource.dataSource.json?.length ?
//         (column.dataSource as DataManager).dataSource.json : column.columnData) as Object[];
//     if ((key as Date).getDay) {
//         query.where(getDatePredicate({ field: fField, operator: 'equal', value: key, matchCase: false }));
//     } else {
//         query.where(fField, '==', key, false);
//     }
//     return new DataManager(fdata).executeLocal(query);
// }

/**
 * To use to get the column's object by the foreign key value.
 *
 * @param {string} foreignKeyValue - Defines ForeignKeyValue.
 * @param {Column[]} columns - Array of column object.
 * @returns {Column} Returns the element
 * @hidden
 */
export function getColumnByForeignKeyValue(foreignKeyValue: string, columns: Column[]): Column | boolean {
    let column: Column | boolean = false;
    return columns.some((col: Column) => {
        column = col;
        return col.foreignKeyValue === foreignKeyValue;
    }) && column;
}

/**
 * @param {number} value - Defines the date or month value
 * @returns {string} Returns string
 * @hidden
 */
export function padZero(value: number): string {
    if (value < 10) {
        return '0' + value;
    }
    return String(value);
}

// /**
//  * @param {PredicateModel} filterObject - Defines the filterObject
//  * @param {string} type - Defines the type
//  * @param {boolean} isExecuteLocal - Defines whether the data actions performed in client and used for dateonly type field
//  * @returns {Predicate} Returns the Predicate
//  * @hidden
//  */
// export function getDatePredicate(filterObject: PredicateModel, type?: string, isExecuteLocal?: boolean): Predicate {
//     let datePredicate: Predicate;
//     let prevDate: Date;
//     let nextDate: Date;
//     const prevObj: PredicateModel = baseExtend({}, getActualProperties(filterObject)) as PredicateModel;
//     const nextObj: PredicateModel = baseExtend({}, getActualProperties(filterObject)) as PredicateModel;
//     if (isNullOrUndefined(filterObject.value) || filterObject.value === '') {
//         datePredicate = new Predicate(prevObj.field as string, prevObj.operator as string, prevObj.value as string | number | Date | boolean | Predicate | Predicate[] | (string | number | boolean | Date)[] | null, false);
//         return datePredicate;
//     }
//     const value: Date = new Date(filterObject.value as string);
//     if (type === 'dateonly' && !isExecuteLocal) {
//         if (typeof (prevObj.value) === 'string') {
//             prevObj.value = new Date(prevObj.value);
//         }
//         const dateOnlyString: string = (prevObj.value as Date).getFullYear() + '-' + padZero((prevObj.value as Date).getMonth() + 1) + '-' + padZero((prevObj.value as Date).getDate());
//         const predicates: Predicate = new Predicate(prevObj.field as string, prevObj.operator as string, dateOnlyString, false);
//         datePredicate = predicates;
//     } else {
//         filterObject.operator = filterObject.operator?.toLowerCase();
//         if (filterObject.operator === 'equal' || filterObject.operator === 'notequal') {
//             if (type === 'datetime') {
//                 prevDate = new Date(value.setSeconds(value.getSeconds() - 1));
//                 nextDate = new Date(value.setSeconds(value.getSeconds() + 2));
//                 filterObject.value = new Date(value.setSeconds(nextDate.getSeconds() - 1));
//             } else {
//                 prevDate = new Date(value.setHours(0) - 1);
//                 nextDate = new Date(value.setHours(24));
//             }
//             prevObj.value = prevDate;
//             nextObj.value = nextDate;
//             if (filterObject.operator === 'equal') {
//                 prevObj.operator = 'greaterthan';
//                 nextObj.operator = 'lessthan';
//             } else if (filterObject.operator === 'notequal') {
//                 prevObj.operator = 'lessthanorequal';
//                 nextObj.operator = 'greaterthanorequal';
//             }
//             const predicateSt: Predicate = new Predicate(prevObj.field as string, prevObj.operator as string, prevObj.value, false);
//             const predicateEnd: Predicate = new Predicate(nextObj.field as string, nextObj.operator as string, nextObj.value, false);
//             datePredicate = filterObject.operator === 'equal' ? predicateSt.and(predicateEnd) : predicateSt.or(predicateEnd);
//         } else {
//             if (type === 'date' && (filterObject.operator === 'lessthanorequal' || filterObject.operator === 'greaterthan')) {
//                 prevObj.value = new Date(value.setHours(24) - 1);
//             }
//             if (typeof (prevObj.value) === 'string') {
//                 prevObj.value = new Date(prevObj.value);
//             }
//             const predicates: Predicate = new Predicate(prevObj.field as string, prevObj.operator as string, prevObj.value as string | number | Date | boolean | Predicate | Predicate[] | (string | number | boolean | Date)[] | null, false);
//             datePredicate = predicates;
//         }
//     }
//     if ((filterObject as { setProperties: Function }).setProperties) {
//         (filterObject as { setProperties: Function }).setProperties({ ejpredicate: datePredicate }, true);
//     } else {
//         filterObject.ejpredicate = datePredicate;
//     }
//     return datePredicate;
// }

// /**
//  * @param {IGrid} grid - Defines the IGrid
//  * @returns {boolean} Returns true if group adaptive is true
//  * @hidden
//  */
// export function isGroupAdaptive(grid: IGrid): boolean {
//     return (grid.enableVirtualization && grid.groupSettings?.columns?.length as number > 0 && grid.isVirtualAdaptive &&
//         !grid.groupSettings?.enableLazyLoading) as boolean;
// }

// /**
//  * @param {string} field - Defines the Field
//  * @param {Object} object - Defines the objec
//  * @returns {any} Returns the object
//  * @hidden
//  */
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function getObject(field: string = '', object?: Object): any {
//     if (field) {
//         let value: (Object | unknown) = object;
//         const splits: string[] = field.split('.');
//         for (let i: number = 0; i < splits.length && !isNullOrUndefined(value); i++) {
//             value = (value as { [key: string]: unknown })[splits[parseInt(i.toString(), 10)]];
//             if (isUndefined(value)) {
//                 const newCase: string = splits[parseInt(i.toString(), 10)].charAt(0).toUpperCase()
//                     + splits[parseInt(i.toString(), 10)].slice(1);
//                 value = object[`${newCase}`] || object[`${newCase}`.charAt(0).toLowerCase() + `${newCase}`.slice(1)];
//             }
//         }
//         return value as string;
//     }
// }

// /**
//  * @param {string | Object} format - defines the format
//  * @param {string} colType - Defines the coltype
//  * @returns {string} Returns the custom Data format
//  * @hidden
//  */
// export function getCustomDateFormat(format: string | Object, colType: string): string {
//     const intl: Internationalization = new Internationalization();
//     let formatvalue: string;
//     const formatter: string = 'format';
//     const type: string = 'type';
//     if (colType === 'date') {
//         formatvalue = typeof (format) === 'object' ?
//             intl.getDatePattern({ type: format[`${type}`] ? format[`${type}`] : 'date', format: format[`${formatter}`] }, false) :
//             intl.getDatePattern({ type: 'dateTime', skeleton: format }, false);
//     } else {
//         formatvalue = typeof (format) === 'object' ?
//             intl.getDatePattern({ type: format[`${type}`] ? format[`${type}`] : 'dateTime', format: format[`${formatter}`] }, false) :
//             intl.getDatePattern({ type: 'dateTime', skeleton: format }, false);
//     }
//     return formatvalue;
// }

// /**
//  * @param {IGrid} gObj - Defines the IGrid
//  * @param {HierarchyGridPrintMode} hierarchyPrintMode - Defines the hierarchyPrintMode
//  * @returns {Object} Returns the object
//  * @hidden
//  */
// export function getExpandedState(gObj: IGrid, hierarchyPrintMode: HierarchyGridPrintMode): { [index: number]: IExpandedRow } {
//     const rows: Row<Column>[] = gObj.getRowsObject();
//     const obj: { [index: number]: IExpandedRow } = {};
//     for (const row of rows) {
//         if (row.isExpand && !row.isDetailRow) {
//             const index: number = gObj.allowPaging && gObj.printMode === 'AllPages' ? row.index +
//                 (gObj.pageSettings.currentPage * gObj.pageSettings.pageSize) - gObj.pageSettings.pageSize : row.index;
//             if (!isNullOrUndefined(index)) {
//                 obj[parseInt(index.toString(), 10)] = {};
//                 obj[parseInt(index.toString(), 10)].isExpand = true;
//                 if (gObj.childGrid) {
//                     obj[parseInt(index.toString(), 10)].gridModel = getPrintGridModel(row.childGrid, hierarchyPrintMode);
//                     (<{ query: Query }>obj[parseInt(index.toString(), 10)].gridModel).query = gObj.childGrid.query;
//                 }
//             }
//         }
//     }
//     return obj;
// }

// /**
//  * @param {IGrid} gObj - Defines the grid objct
//  * @param {HierarchyGridPrintMode} hierarchyPrintMode - Defines the hierarchyPrintMode
//  * @returns {IGrid} Returns the IGrid
//  * @hidden
//  */
// export function getPrintGridModel(gObj: IGrid, hierarchyPrintMode: HierarchyGridPrintMode = 'Expanded'): IGrid {
//     const printGridModel: IGrid = {} as IGrid;
//     if (!gObj) {
//         return printGridModel;
//     }
//     for (const key of Print.printGridProp) {
//         if (key === 'columns') {
//             printGridModel[`${key}`] = getActualPropFromColl(gObj[`${key}`]);
//         } else if (key === 'allowPaging') {
//             printGridModel[`${key}`] = gObj.printMode === 'CurrentPage';
//         } else {
//             printGridModel[`${key}`] = getActualProperties(gObj[`${key}`]);
//         }
//     }
//     printGridModel['enableHover'] = false;
//     if ((gObj.childGrid || gObj.detailTemplate) && hierarchyPrintMode !== 'None') {
//         (<IGrid>printGridModel).expandedRows = getExpandedState(gObj, hierarchyPrintMode);
//     }
//     return printGridModel;
// }

/**
 * @param {Object} copied - Defines the copied object
 * @param {Object} first - Defines the first object
 * @param {Object} second - Defines the second object
 * @param {boolean} deep - Defines the deep
 * @returns {Object} Returns the extended object
 * @hidden
 */
export function extendObjWithFn(copied: Object, first: Object, second?: Object, deep?: boolean): Object {
    const res: IKeyValue = copied as IKeyValue || {} as IKeyValue;
    let len: number = arguments.length;
    if (deep) {
        len = len - 1;
    }
    for (let i: number = 1; i < len; i++) {
        // eslint-disable-next-line prefer-rest-params
        if (!arguments[parseInt(i.toString(), 10)]) {
            continue;
        }
        // eslint-disable-next-line prefer-rest-params
        const obj1: { [key: string]: Object } = arguments[parseInt(i.toString(), 10)];
        const keys: string[] = Object.keys(Object.getPrototypeOf(obj1)).length ?
            Object.keys(obj1).concat(getPrototypesOfObj(obj1)) : Object.keys(obj1);
        for (let i: number = 0; i < keys.length; i++) {
            const source: Object = res[keys[parseInt(i.toString(), 10)]];
            const cpy: Object = obj1[keys[parseInt(i.toString(), 10)]];
            let cln: Object;
            if (deep && (isObject(cpy) || Array.isArray(cpy))) {
                if (isObject(cpy)) {
                    cln = source ? source : {};
                    res[keys[parseInt(i.toString(), 10)]] = baseExtend({}, cln, cpy, deep);
                } else {
                    cln = source ? source : [];
                    res[keys[parseInt(i.toString(), 10)]] = baseExtend([], cln, cpy, deep);
                }
            } else {
                res[keys[parseInt(i.toString(), 10)]] = cpy;
            }
        }
    }
    return res;
}

/**
 * @param {Object} obj - Defines the obj
 * @returns {string[]} Returns the string
 * @hidden
 */
export function getPrototypesOfObj(obj: Object): string[] {
    let keys: string[] = [];
    while (Object.getPrototypeOf(obj) && Object.keys(Object.getPrototypeOf(obj)).length) {
        keys = keys.concat(Object.keys(Object.getPrototypeOf(obj)));
        obj = Object.getPrototypeOf(obj);
    }
    return keys;
}

/**
 * @param {Column[]} column - Defines the Column
 * @returns {number} Returns the column Depth
 * @hidden
 */
export function measureColumnDepth(column: Column[]): number {
    let max: number = 0;
    for (let i: number = 0; i < (!isNullOrUndefined(column) ? column.length : 0); i++) {
        const depth: number = checkDepth(column[parseInt(i.toString(), 10)], 0);
        if (max < depth) {
            max = depth;
        }
    }
    return max + 1;
}

/**
 * @param {Column} col - Defines the Column
 * @param {number} index - Defines the index
 * @returns {number} Returns the depth
 * @hidden
 */
export function checkDepth(col: Column, index: number): number {
    let max: number = index;
    const indices: number[] = [];
    if (col.columns) {
        index++;
        for (let i: number = 0; i < col.columns.length; i++) {
            indices[parseInt(i.toString(), 10)] = checkDepth((col.columns[parseInt(i.toString(), 10)] as Column), index);
        }
        for (let j: number = 0; j < indices.length; j++) {
            if (max < indices[parseInt(j.toString(), 10)]) {
                max = indices[parseInt(j.toString(), 10)];
            }
        }
        index = max;
    }
    return index;
}

// /**
//  * @param {IGrid} gObj - Defines the IGrid
//  * @param {PredicateModel[]} filteredCols - Defines the PredicateModel
//  * @returns {void}
//  * @hidden
//  */
// export function refreshFilteredColsUid(gObj: IGrid, filteredCols: PredicateModel[]): void {
//     for (let i: number = 0; i < filteredCols.length; i++) {
//         filteredCols[parseInt(i.toString(), 10)].uid = filteredCols[parseInt(i.toString(), 10)].isForeignKey ?
//             (getColumnByForeignKeyValue(filteredCols[parseInt(i.toString(), 10)].field as string, gObj.getForeignKeyColumns?.() as Column[]) as Column).uid
//             : gObj.enableColumnVirtualization ? getColumnModelByFieldName(gObj, filteredCols[parseInt(i.toString(), 10)].field as string)?.uid
//                 : gObj.getColumnByField?.(filteredCols[parseInt(i.toString(), 10)].field as string).uid;
//     }
// }

// /** @hidden */
// // eslint-disable-next-line @typescript-eslint/no-namespace
// export namespace Global {
//     // eslint-disable-next-line prefer-const
//     export let timer: Object | null = null;
// }

/** @hidden */

// Instead of using a namespace, use a plain object to store global variables.
export const Global = {
    // Initialize timer
    timer: null as Object | null
};

/**
 * @param {Element} element - Defines the element
 * @returns {Object} Returns the transform values
 * @hidden
 */
export function getTransformValues(element: Element): { width: number, height: number } {
    const style: CSSStyleDeclaration = document.defaultView?.getComputedStyle(element, null) as CSSStyleDeclaration;
    const transformV: string = (style as { getPropertyValue?: Function }).getPropertyValue?.('transform');
    const replacedTv: string = transformV.replace(/,/g, '');
    const translateX: number = parseFloat((replacedTv).split(' ')[4]);
    const translateY: number = parseFloat((replacedTv).split(' ')[5]);
    return { width: translateX, height: translateY };
}

/**
 * @param {Element} rootElement - Defines the root Element
 * @param {Element} element - Defines the element
 * @returns {void}
 * @hidden
 */
export function applyBiggerTheme(rootElement: Element, element: Element): void {
    if (rootElement.classList.contains('e-bigger')) {
        element.classList.add('e-bigger');
    }
}

/**
 * @param {IGrid} gObj - Defines grid object
 * @returns {number}  - Returns scroll width
 * @hidden
 */
export function getScrollWidth(gObj: IGrid): number {
    const scrollElem: HTMLElement = gObj.getContent?.().firstElementChild as HTMLElement;
    return scrollElem.scrollWidth > scrollElem.offsetWidth ? getScrollBarWidth() : 0;
}

// /**
//  * @param {IGrid} gObj - Defines grid object
//  * @param {number} idx - Defines the index
//  * @returns {number} Returns colSpan index
//  * @hidden
//  */
// export function resetColspanGroupCaption(gObj: IGrid, idx: number): number {
//     let colspan: number = 0;
//     const cols: Column[] = gObj.getColumns?.() ?? [];
//     let width: number = idx * 30;
//     if (gObj.isRowDragable()) {
//         colspan++;
//         width += 30;
//     }
//     colspan += (gObj.groupSettings.columns.length - idx);
//     width += (30 * (gObj.groupSettings.columns.length - idx));
//     const gridWidth: number = (gObj.width === 'auto' ? gObj.element.offsetWidth : gObj.width.toString().indexOf('%') !== -1 ?
//         gObj.element.getBoundingClientRect().width : parseInt(gObj.width.toString(), 10)) - getScrollWidth(gObj);
//     for (let i: number = 0; i < cols.length; i++) {
//         if (cols[parseInt(i.toString(), 10)].visible) {
//             width += parseInt(cols[parseInt(i.toString(), 10)].width.toString(), 10);
//             colspan++;
//         }
//         if (width > gridWidth) {
//             colspan--;
//             break;
//         }
//     }
//     return colspan;
// }

// /**
//  * @param {HTMLElement} tr - Defines the tr Element
//  * @param {IGrid} gObj - Defines grid object
//  * @returns {void}
//  * @hidden
//  */
// export function groupCaptionRowLeftRightPos(tr: Element, gObj: IGrid): void {
//     let width: number = 0;
//     let idx: number = 0;
//     const frozenCount: number = gObj.getVisibleFrozenLeftCount?.() as number;
//     for (let j: number = 0; j < tr.childNodes.length; j++) {
//         const td: HTMLElement = tr.childNodes[parseInt(j.toString(), 10)] as HTMLElement;
//         if (frozenCount === idx) {
//             break;
//         }
//         if (td.classList.contains('e-groupcaption') || td.classList.contains('e-summarycell')) {
//             idx += parseInt(td.getAttribute('colspan') as string, 10);
//         }
//         td.classList.add('e-leftfreeze');
//         if (td.classList.contains('e-groupcaption') && parseInt(td.getAttribute('colspan') as string, 10) === 1) {
//             td.classList.add('e-freezeleftborder');
//         }
//         applyStickyLeftRightPosition(td, width, gObj.enableRtl as boolean, 'Left');
//         if (td.classList.contains('e-indentcell') || td.classList.contains('e-recordplusexpand') ||
//             td.classList.contains('e-recordpluscollapse')) {
//             width += 30;
//         }
//         if (td.classList.contains('e-groupcaption')) {
//             let colspan: number = parseInt(td.getAttribute('colspan') as string, 10);
//             if (gObj.isRowDragable()) {
//                 colspan--;
//                 width += 30;
//             }
//             colspan = colspan - (gObj.groupSettings.columns.length - j);
//             width = width + (30 * (gObj.groupSettings.columns.length - j));
//             const cols: Column[] = gObj.getColumns();
//             for (let i: number = 0; i < cols.length; i++) {
//                 if ((parseInt(td.getAttribute('colspan') as string, 10) > 1) &&
//                     (parseInt(cols[parseInt(i.toString(), 10)].width.toString(), 10)
//                     + width) > (parseInt(gObj.width.toString(), 10) - getScrollWidth(gObj))) {
//                     const newColspan: number = resetColspanGroupCaption(gObj, j);
//                     td.setAttribute('colspan', newColspan.toString());
//                     break;
//                 }
//                 if (cols[parseInt(i.toString(), 10)].visible) {
//                     width += parseInt(cols[parseInt(i.toString(), 10)].width.toString(), 10);
//                     colspan--;
//                 }
//                 if (colspan === 0) { break; }
//             }
//         }
//         if (td.classList.contains('e-summarycell')) {
//             const uid: string = td.getAttribute('e-mappinguid');
//             const column: Column = gObj.getColumnByUid(uid);
//             width += parseInt(column.width.toString(), 10);
//         }
//     }
// }

/**
 * @param {Element} row - Defines row element
 * @param {IGrid} gridObj - Defines grid object
 * @returns {boolean} Returns isRowEnteredInGrid
 * @hidden
 */
export function ensureLastRow(row: Element, gridObj: IGrid): boolean {
    const content: HTMLElement = gridObj.getContent?.().firstElementChild as HTMLElement;
    return row && (row.getBoundingClientRect().top - content.getBoundingClientRect().top +
        (gridObj.getRowHeight?.() ?? 37)) > content.offsetHeight;
}

/**
 * @param {Element} row - Defines row element
 * @param {number} rowTop - Defines row top number
 * @returns {boolean} Returns first row is true
 * @hidden
 */
export function ensureFirstRow(row: Element, rowTop: number): boolean {
    return row && row.getBoundingClientRect().top < rowTop;
}

/**
 * @param {number} index - Defines index
 * @param {IGrid} gObj - Defines grid object
 * @returns {boolean} Returns isRowEnteredInGrid
 * @hidden
 */
export function isRowEnteredInGrid(index: number, gObj: IGrid): boolean {
    const rowHeight: number = gObj.getRowHeight?.() ?? 37;
    const startIndex: number = (gObj.getContent?.().firstElementChild as Element).scrollTop / rowHeight;
    const endIndex: number = startIndex + ((gObj.getContent?.().firstElementChild as HTMLElement).offsetHeight / rowHeight);
    return index < endIndex && index > startIndex;
}

// /**
//  * @param {IGrid} gObj - Defines the grid object
//  * @param {Object} data - Defines the query
//  * @returns {number} Returns the edited data index
//  * @hidden
//  */
// export function getEditedDataIndex(gObj: IGrid, data: Object): number {
//     const keyField: string = gObj.getPrimaryKeyFieldNames?.()[0] as string;
//     let dataIndex: number;
//     gObj.getCurrentViewRecords().filter((e: Object, index: number) => {
//         if (keyField.includes('.')) {
//             const currentValue: number = getObject(keyField, e);
//             const originalValue: number =  getObject(keyField, data);
//             if (currentValue === originalValue) {
//                 dataIndex = index;
//             }
//         }
//         else {
//             if (e[`${keyField}`] === data[`${keyField}`]) {
//                 dataIndex = index;
//             }
//         }
//     });
//     return dataIndex;
// }

// /**
//  * @param {Object} args - Defines the argument
//  * @param {Query} query - Defines the query
//  * @returns {FilterStateObj} Returns the filter state object
//  * @hidden
//  */
// export function eventPromise(args: Object, query: Query): FilterStateObj {
//     const state: DataStateChangeEventArgs = getStateEventArgument(query);
//     const def: Deferred = new Deferred();
//     state.dataSource = def.resolve;
//     state.action = args;
//     return {state: state, deffered: def};
// }

/**
 * @param {Query} query - Defines the query
 * @returns {Object} Returns the state event argument
 * @hidden
 */
export function getStateEventArgument(query: Query): Object {
    const adaptr: UrlAdaptor = new UrlAdaptor();
    const dm: DataManager = new DataManager({ url: '', adaptor: new UrlAdaptor });
    const state: { data?: string } = adaptr.processQuery(dm, query);
    const data: Object = JSON.parse(state.data as string);
    return data;
}

// /**
//  * @param {IGrid} gObj - Defines the Igrid
//  * @returns {boolean} Returns the ispercentageWidth
//  * @hidden
//  */
// export function ispercentageWidth(gObj: IGrid): boolean | number | undefined {
//     const columns: Column[] = gObj.getVisibleColumns?.() ?? [];
//     let percentageCol: number = 0;
//     let undefinedWidthCol: number = 0;
//     for (let i: number = 0; i < columns.length; i++) {
//         if (isUndefined(columns[parseInt(i.toString(), 10)].width)) {
//             undefinedWidthCol++;
//         } else if (columns[parseInt(i.toString(), 10)].width?.toString().indexOf('%') !== -1) {
//             percentageCol++;
//         }
//     }
//     return (gObj.width === 'auto' || typeof (gObj.width) === 'string' && gObj.width.indexOf('%') !== -1) && gObj.groupSettings &&
//         !gObj.groupSettings.showGroupedColumn && gObj.groupSettings.columns && gObj.groupSettings.columns.length
//         && percentageCol && !undefinedWidthCol;
// }

// /**
//  * @param {IGrid} gObj - Defines the IGrid
//  * @param {Row<Column>[]} rows - Defines the row
//  * @param {HTMLTableRowElement[]} rowElms - Row elements
//  * @param {number} index - Row index
//  * @param {number} startRowIndex - Start Row Index
//  * @returns {void}
//  * @hidden
//  */
// export function resetRowIndex(gObj: IGrid, rows: Row<Column>[], rowElms: HTMLTableRowElement[], index?: number,
//                               startRowIndex?: number): void {
//     let startIndex: number = index ? index : 0;
//     for (let i: number = startRowIndex ? startRowIndex : 0; i < rows.length; i++) {
//         if (rows[parseInt(i.toString(), 10)] && rows[parseInt(i.toString(), 10)].isDataRow) {
//             rows[parseInt(i.toString(), 10)].index = startIndex;
//             rows[parseInt(i.toString(), 10)].isAltRow = gObj.enableAltRow ? startIndex % 2 !== 0 : false;
//             rowElms[parseInt(i.toString(), 10)].setAttribute(literals.ariaRowIndex, (startIndex + 1).toString());
//             if (rows[parseInt(i.toString(), 10)].isAltRow) {
//                 rowElms[parseInt(i.toString(), 10)].classList.add('e-altrow');
//             } else {
//                 rowElms[parseInt(i.toString(), 10)].classList.remove('e-altrow');
//             }
//             for (let j: number = 0; j < rowElms[parseInt(i.toString(), 10)].cells.length; j++) {
//                 rowElms[parseInt(i.toString(), 10)].cells[parseInt(j.toString(), 10)].setAttribute('index', startIndex.toString());
//             }
//             startIndex++;
//         }
//     }
//     if (!rows.length) {
//         gObj.renderModule.emptyRow(true);
//     }
// }

// /**
//  * @param {IGrid} gObj - Defines the IGrid
//  * @returns {void}
//  * @hidden
//  */
// export function resetCachedRowIndex(gObj: IGrid): void {
//     const rowObjects: Row<Column>[] = (gObj.enableInfiniteScrolling && gObj.infiniteScrollSettings && gObj.infiniteScrollSettings.enableCache ?
//         gObj.getRowsObject?.() : gObj.vRows) as Row<Column>[];
//     const rowElements: Element[] = gObj.getRows?.() ?? [];
//     for (let i: number = 0, startIndex: number = 0, k: number = 0; i < rowObjects.length; i++) {
//         const rowObject: Row<Column> = rowObjects[parseInt(i.toString(), 10)];
//         if (rowObject.isDataRow) {
//             rowObject.index = startIndex;
//             rowObject.isAltRow = gObj.enableAltRow ? startIndex % 2 !== 0 : false;
//             const rowElement: HTMLTableRowElement | Element = gObj.getRowElementByUID?.(rowObject.uid) as HTMLTableRowElement;
//             if (!isNullOrUndefined(rowElement)) {
//                 rowElements[parseInt(k.toString(), 10)] = rowElement;
//                 rowElement.setAttribute(literals.ariaRowIndex, (startIndex + 1).toString());
//                 if (rowObject.isAltRow) {
//                     rowElement.classList.add('e-altrow');
//                 } else {
//                     rowElement.classList.remove('e-altrow');
//                 }
//                 for (let j: number = 0; j < (rowElement as HTMLTableRowElement).cells.length; j++) {
//                     (rowElement as HTMLTableRowElement).cells[parseInt(j.toString(), 10)].setAttribute('index', startIndex.toString());
//                 }
//                 k++;
//             }
//             startIndex++;
//         }
//     }
//     if (gObj.enableInfiniteScrolling && gObj.infiniteScrollSettings && gObj.infiniteScrollSettings.enableCache) {
//         gObj.infiniteScrollModule.resetInfiniteCache(rowObjects);
//     }
// }

// /**
//  * @param {IGrid} gObj - Defines the IGrid
//  * @param {RowDropEventArgs} args - Defines the row drop event argument
//  * @param {HTMLTableRowElement[]} tr - Row elements
//  * @param {Row<Column>} dropRObj - dropped row object
//  * @returns {void}
//  * @hidden
//  */
// export function groupReorderRowObject(gObj: IGrid, args: RowDropEventArgs, tr: HTMLTableRowElement[], dropRObj?: Row<Column>): void {
//     const rowObjects: Row<Column>[] = gObj.enableVirtualization ? gObj.vRows : gObj.getRowsObject();
//     const orderChangeRowObjects: Row<Column>[] = [];
//     const dropRowObject: Row<Column> = dropRObj ? dropRObj :
//         gObj.getRowObjectFromUID(args.target.closest('tr').getAttribute('data-uid'));
//     let rowObjectDropIndex: number;
//     for (let i: number = 0; i < args.rows.length; i++) {
//         const orderChangeRowObject: Row<Column> =
//             gObj.getRowObjectFromUID(args.rows[parseInt(i.toString(), 10)].getAttribute('data-uid'));
//         if (dropRowObject === orderChangeRowObject) {
//             rowObjectDropIndex = rowObjects.indexOf(dropRowObject);
//         }
//         orderChangeRowObjects.push(rowObjects.splice(rowObjects.indexOf(orderChangeRowObject), 1)[0]);
//     }
//     if (isNullOrUndefined(rowObjectDropIndex)) {
//         rowObjectDropIndex = rowObjects.indexOf(dropRowObject);
//         if (args.fromIndex > args.dropIndex) {
//             rowObjects.splice(rowObjectDropIndex, 0, ...orderChangeRowObjects);
//         }
//         else {
//             rowObjects.splice(rowObjectDropIndex + 1, 0, ...orderChangeRowObjects);
//         }
//     }
//     else {
//         rowObjects.splice(rowObjectDropIndex, 0, ...orderChangeRowObjects);
//     }
//     if (!gObj.enableVirtualization && !gObj.infiniteScrollSettings.enableCache) {
//         const record: object = {};
//         const currentViewData: Object[] = gObj.getCurrentViewRecords();
//         for (let i: number = 0, len: number = tr.length; i < len; i++) {
//             const index: number = parseInt(tr[parseInt(i.toString(), 10)].getAttribute(literals.ariaRowIndex), 10) - 1;
//             record[parseInt(i.toString(), 10)] = currentViewData[parseInt(index.toString(), 10)];
//         }
//         const rows: Element[] = gObj.getRows();
//         for (let i: number = 0, len: number = tr.length; i < len; i++) {
//             rows[parseInt(i.toString(), 10)] = tr[parseInt(i.toString(), 10)];
//             currentViewData[parseInt(i.toString(), 10)] = record[parseInt(i.toString(), 10)];
//         }
//     }
//     if (gObj.enableInfiniteScrolling && gObj.infiniteScrollSettings.enableCache) {
//         gObj.infiniteScrollModule.resetInfiniteCache(rowObjects);
//     }
// }
// /**
//  * @param {IGrid} gObj - Defines the grid object
//  * @param {Object} changes - Defines the changes
//  * @param {string} type - Defines the type
//  * @param {string} keyField - Defines the keyfield
//  * @returns {void}
//  * @hidden
//  */
// export function compareChanges(gObj: IGrid, changes: Object, type: string, keyField: string): void {
//     const newArray: Object[] = (<{ dataToBeUpdated?: Object }>gObj).dataToBeUpdated[`${type}`].concat(changes[`${type}`]).reduce(
//         (r: Object, o: Object) => {
//             r[o[`${keyField}`]] = r[o[`${keyField}`]] === undefined ? o : Object.assign(r[o[`${keyField}`]], o);
//             return r;
//         },
//         {});
//     (<{ dataToBeUpdated?: Object }>gObj).dataToBeUpdated[`${type}`] = Object.keys(newArray).map((k: string) => newArray[`${k}`]);
// }

// /**
//  * @param {IGrid} gObj - Defines the grid object
//  * @returns {void}
//  * @hidden
//  */
// export function setRowElements(gObj: IGrid): void {
//     if (gObj.enableInfiniteScrolling && (gObj.childGrid || gObj.detailTemplate)) {
//         (<{ rowElements?: Element[] }>(gObj).contentModule).rowElements = [].slice.call((gObj.getContentTable?.() as HTMLTableElement).rows)
//             .filter((row: HTMLElement) => (row.classList.contains('e-row') || row.classList.contains('e-detailrow'))
//             && !row.classList.contains('e-addedrow'));
//         return;
//     }
//     (<{ rowElements?: Element[] }>(gObj).contentModule).rowElements =
//         [].slice.call(gObj.element.querySelectorAll('.e-row:not(.e-addedrow):not(.e-cloneproperties .e-row)'));
// }

/**
 * @param {Element} row - Defines the row
 * @param {number} start - Defines the start index
 * @param {number} end - Defines the end index
 * @returns {void}
 * @hidden
 */
export function sliceElements(row: Element, start: number, end: number): void {
    const cells: HTMLCollection = row.children;
    const len: number = cells.length;
    let k: number = 0;
    for (let i: number = 0; i < len; i++, k++) {
        if (i >= start && i < end) {
            continue;
        }
        row.removeChild(row.children[parseInt(k.toString(), 10)]);
        k--;
    }
}

// /**
//  * @param {IGrid} gObj - Defines the grid
//  * @param {Dialog} dlgObj - Defines the dialog
//  * @returns {void}
//  * @hidden
//  */
// export function resetDialogAppend(gObj: IGrid, dlgObj: Dialog): void {
//     let element: HTMLElement = gObj.createElement('div', { className: 'e-grid-popup', id: gObj.element.id + '_e-popup' });
//     const pos: { left: number; top: number; } = calculatePosition(gObj.element, 'left', 'Top');
//     if (document.getElementById(gObj.element.id + '_e-popup')) {
//         element = document.getElementById(gObj.element.id + '_e-popup');
//     }
//     element.style.top = pos.top + 'px';
//     element.style.left = pos.left + 'px';
//     element.style.zIndex = (dlgObj.zIndex).toString();
//     element.style.width = dlgObj.element.offsetWidth + 'px';
//     element.appendChild(dlgObj.element);
//     const sbPanel: HTMLElement = document.querySelector('.sb-demo-section,.e-grid-dialog-fixed') as HTMLElement;
//     if (sbPanel) {
//         const sbPos: { left: number; top: number; } = calculateRelativeBasedPosition(gObj.element, sbPanel);
//         element.style.top = sbPos.top + 'px';
//         element.style.left = sbPos.left + 'px';
//         sbPanel.insertBefore(element, sbPanel.firstChild);
//     } else {
//         document.body.insertBefore(element, document.body.firstChild);
//     }
// }

/**
 * @param {Column} column - Defines the column
 * @param {string} uid - Defines the uid
 * @returns {boolean} Returns is child column
 * @hidden
 */
export function isChildColumn(column: Column, uid: string): boolean {
    const uids: string[] = [];
    uids.push(column.uid as string);
    pushuid(column, uids);
    if (uids.indexOf(uid) > -1) {
        return true;
    } else {
        return false;
    }
}

/**
 * @param {Column} column - Defines the column
 * @param {string[]} uids - Defines the uid
 * @returns {void}
 * @hidden
 */
export function pushuid(column: Column, uids: string[]): void {
    for (let i: number = 0; column.columns && i < column.columns.length; i++) {
        if ((column.columns[parseInt(i.toString(), 10)] as Column).uid) {
            uids.push((column.columns[parseInt(i.toString(), 10)] as Column).uid as string);
        }
        if ((column.columns[parseInt(i.toString(), 10)] as Column).columns &&
            (column.columns[parseInt(i.toString(), 10)] as Column).columns?.length) {
            pushuid((column.columns[parseInt(i.toString(), 10)] as Column), uids);
        }
    }
}

/**
 * @param {Column} column - Defines the column
 * @returns {string} Returns the direction
 * @hidden
 */
export function frozenDirection(column: Column): string {
    if (column.columns && ((column.columns[0] as Column).freeze || (column.columns[0] as Column).isFrozen)) {
        if ((column.columns[0] as Column).freeze === 'Left' || (column.columns[0] as Column).isFrozen) {
            return 'Left';
        } else if ((column.columns[0] as Column).freeze === 'Right') {
            return 'Right';
        } else if ((column.columns[0] as Column).freeze === 'Fixed') {
            return 'Fixed';
        } else {
            return 'None';
        }
    } else {
        if (column.columns && ((column.columns[0] as Column).columns && (column.columns[0] as Column).columns?.length)) {
            return frozenDirection(column.columns[0] as Column);
        } else {
            return 'None';
        }
    }
}

/**
 * @param {Element} row - Defines the row
 * @returns {void}
 * @hidden
 */
export function addFixedColumnBorder(row: Element): void {
    if (row.querySelector('.e-fixedfreeze')) {
        const cells: HTMLElement[] = [].slice.call(row.querySelectorAll(
            '.e-filterbarcell:not(.e-hide),.e-summarycell:not(.e-hide),.e-headercell:not(.e-hide),.e-rowcell:not(.e-hide)'));
        for (let j: number = 0; j < cells.length; j++) {
            if ((cells[parseInt(j.toString(), 10)] as Element).classList.contains('e-fixedfreeze') && (!(cells[j - 1]) ||
                (cells[j - 1] && !(cells[j - 1] as Element).classList.contains('e-fixedfreeze')))) {
                (cells[parseInt(j.toString(), 10)] as Element).classList.add('e-freezeleftborder');

            }
            if ((cells[parseInt(j.toString(), 10)] as Element).classList.contains('e-fixedfreeze') && (!(cells[j + 1]) ||
                (cells[j + 1] && !(cells[j + 1] as Element).classList.contains('e-fixedfreeze')))) {
                (cells[parseInt(j.toString(), 10)] as Element).classList.add('e-freezerightborder');
            }
        }
    }
}

/**
 * @param {HTMLElement} node - Defines the row
 * @param {number} width - Defines the width
 * @param {boolean} isRtl - Boolean property
 * @param {string} position - Defines the position
 * @returns {void}
 * @hidden
 */
export function applyStickyLeftRightPosition(node: HTMLElement, width: number, isRtl: boolean, position: string): void {
    if (position === 'Left') {
        if (isRtl) {
            (node as HTMLElement).style.right = width + 'px';
        } else {
            (node as HTMLElement).style.left = width + 'px';
        }
    }
    if (position === 'Right') {
        if (isRtl) {
            (node as HTMLElement).style.left = width + 'px';
        } else {
            (node as HTMLElement).style.right = width + 'px';
        }
    }
}

/**
 * @param {IGrid} gObj - Defines the grid
 * @param {Column} column - Defines the column
 * @param {Element} node - Defines the Element
 * @param {number} colSpan - Defines the colSpan value
 * @returns {void}
 * @hidden
 */
export function resetColandRowSpanStickyPosition(gObj: IGrid, column: Column, node: Element, colSpan: number): void {
    const columns: Column[] = gObj.getColumns?.() ?? [];
    const index: number = column.index as number;
    if (column.freeze === 'Left' && (column as { border?: string }).border !== 'Left') {
        let idx: number = index + (colSpan - 1);
        while (columns[parseInt(idx.toString(), 10)].visible === false) {
            idx++;
        }
        if ((columns[parseInt(idx.toString(), 10)] as { border?: string }).border === 'Left') {
            node.classList.add('e-freezeleftborder');
        }
    } else if (column.freeze === 'Right' || column.freeze === 'Fixed') {
        let width: number = 0;
        for (let j: number = index + 1; j < index + colSpan; j++) {
            if (j === columns.length) { break; }
            if (columns[parseInt(j.toString(), 10)].visible) {
                width += parseInt((columns[parseInt(j.toString(), 10)].width as string | number).toString(), 10);
            } else {
                colSpan++;
            }
        }
        if (gObj.enableRtl) {
            (node as HTMLElement).style.left = parseInt((node as HTMLElement).style.left, 10) - width + 'px';
        } else {
            (node as HTMLElement).style.right = parseInt((node as HTMLElement).style.right, 10) - width + 'px';
        }
    }
}

// /**
//  * Retrieves a cell element from a specific row and column index within a grid.
//  *
//  * @param {IGrid} gObj - The grid object containing methods to interact with rows and columns.
//  * @param {number} rowIndex - The index of the row from which the cell is to be retrieved.
//  * @param {number} colIndex - The index of the column of the cell to retrieve.
//  * @returns {Element | null} - The cell element or null if not found.
//  * @hidden
//  */
// export function getCellFromRow(gObj: IGrid, rowIndex: number, colIndex: number): Element | null {
//     const row: HTMLTableRowElement | null = gObj.getRowByIndex?.(rowIndex) as HTMLTableRowElement ?? null;

//     if (row) {
//         for (let i: number = 0; i < row.cells.length; i++) {
//             const cell = row.cells[i];
//             const ariaColIndex = cell.getAttribute('aria-colindex');
//             if (ariaColIndex !== null) {
//                 if (parseInt(ariaColIndex, 10) - 1 === colIndex) {
//                     return cell;
//                 }
//             }
//         }
//     }
//     // Return null if no cell found or if row is null
//     return null;
// }

// /**
//  * Sets the position of sticky columns in a grid based on their freeze state.
//  * Adjusts CSS classes and calculates position offsets for columns frozen to the left, right, or fixed.
//  *
//  * @param {IGrid} gObj - The grid object containing configuration and methods related to the grid.
//  * @param {Column} column - The column object which position needs to be set.
//  * @param {Element} node - The DOM element representing the column.
//  * @returns {void}
//  * @hidden
//  */
// export function addStickyColumnPosition(gObj: IGrid, column: Column, node: Element): void {
//     // Define indentCount once using the getter if it's available.
//     const indentCount = gObj.getIndentCount?.() ?? 0;

//     if (column.freeze === 'Left' || column.isFrozen) {
//         node.classList.add('e-leftfreeze');
//         if ((column as { border?: string }).border === 'Left') {
//             node.classList.add('e-freezeleftborder');
//         }

//         if (column.index === 0) {
//             applyStickyLeftRightPosition(node as HTMLElement, (indentCount * 30), gObj.enableRtl ?? false, 'Left');
//             if (gObj.enableColumnVirtualization) {
//                 (column as { valueX?: number }).valueX = (indentCount * 30);
//             }
//         } else {
//             const cols: Column[] = gObj.getColumns?.() ?? [];
//             let width: number = indentCount * 30;
//             for (let i: number = 0; i < cols.length; i++) {
//                 if (column.uid === cols[i].uid) {
//                     break;
//                 }
//                 if (cols[i].visible) {
//                     width += parseFloat((cols[i].width as string | number).toString());
//                 }
//             }
//             applyStickyLeftRightPosition(node as HTMLElement, width, gObj.enableRtl ?? false, 'Left');
//             if (gObj.enableColumnVirtualization) {
//                 (column as { valueX?: number }).valueX = width;
//             }
//         }
//     } else if (column.freeze === 'Right') {
//         node.classList.add('e-rightfreeze');
//         const cols: Column[] = gObj.getColumns?.() ?? [];
//         if ((column as { border?: string }).border === 'Right') {
//             node.classList.add('e-freezerightborder');
//         }
//         if (cols.length && column.index === cols[cols.length - 1].index) {
//             const width: number = (gObj.getFrozenMode?.() === 'Right' && gObj.isRowDragable?.()) ? 30 : 0;
//             applyStickyLeftRightPosition(node as HTMLElement, width, gObj.enableRtl ?? false, 'Right');
//             if (gObj.enableColumnVirtualization) {
//                 (column as { valueX?: number }).valueX = width;
//             }
//         } else {
//             let width: number = (gObj.getFrozenMode?.() === 'Right' && gObj.isRowDragable?.()) ? 30 : 0;
//             for (let i: number = cols.length - 1; i >= 0; i--) {
//                 if (column.uid === cols[i].uid) {
//                     break;
//                 }
//                 if (cols[i].visible) {
//                     width += parseFloat((cols[i].width as string | number).toString());
//                 }
//             }
//             applyStickyLeftRightPosition(node as HTMLElement, width, gObj.enableRtl ?? false, 'Right');
//             if (gObj.enableColumnVirtualization) {
//                 (column as { valueX?: number }).valueX = width;
//             }
//         }
//     } else if (column.freeze === 'Fixed') {
//         node.classList.add('e-fixedfreeze');
//         const cols: Column[] = gObj.getColumns?.() ?? [];
//         let width: number = 0;

//         if (gObj.getVisibleFrozenLeftCount?.()) {
//             width = indentCount * 30;
//         } else if (gObj.getFrozenMode?.() === 'Right') {
//             width = gObj.groupSettings?.columns?.length ?? 0 * 30;
//         }

//         for (let i: number = 0; i < cols.length; i++) {
//             if (column.uid === cols[i].uid) {
//                 break;
//             }
//             if ((cols[i].freeze === 'Left' || cols[i].isFrozen) || cols[i].freeze === 'Fixed') {
//                 if (cols[i].visible) {
//                     width += parseFloat((cols[i].width as string | number).toString());
//                 }
//             }
//         }

//         applyStickyLeftRightPosition(node as HTMLElement, (width - 1), gObj.enableRtl ?? false, 'Left');
//         width = (gObj.getFrozenMode?.() === 'Right' && gObj.isRowDragable?.()) ? 30 : 0;
//         for (let i: number = cols.length - 1; i >= 0; i--) {
//             if (column.uid === cols[i].uid) {
//                 break;
//             }
//             if (cols[i].freeze === 'Right' || cols[i].freeze === 'Fixed') {
//                 if (cols[i].visible) {
//                     width += parseFloat((cols[i].width as string | number).toString());
//                 }
//             }
//         }

//         applyStickyLeftRightPosition(node as HTMLElement, (width - 1), gObj.enableRtl ?? false, 'Right');
//     } else {
//         node.classList.add('e-unfreeze');
//     }
// }

/**
 * @param {IGrid} gObj - Defines the grid Object
 * @param {Column} col - Defines the column
 * @param {number} rowIndex - Defines the rowindex
 * @returns {Element} Returns the element
 * @hidden
 */
export function getCellsByTableName(gObj: IGrid, col: Column, rowIndex: number): Element[] {
    return [].slice.call(gObj.getDataRows?.()[parseInt(rowIndex.toString(), 10)].getElementsByClassName(literals.rowCell));
}

/**
 * @param {IGrid} gObj - Defines the column
 * @param {Column} col - Defines the index
 * @param {number} rowIndex - Defines the rules
 * @param {number} index - Defines the movable column rules
 * @returns {Element} Returns the Element
 * @hidden
 */
export function getCellByColAndRowIndex(gObj: IGrid, col: Column, rowIndex: number, index: number): Element {
    return getCellsByTableName(gObj, col, rowIndex)[parseInt(index.toString(), 10)];
}

/**
 * Distributes validation rules into specific categories based on column freezing
 * properties for grid column validation. It assigns validation rules to different
 * rule sets such as frozen, movable, or custom rules.
 * 
 * @param {Column} col - The column object containing the field and validation rules.
 * @param {number} index - The index of the column in the grid.
 * @param {Record<string, any>} rules - Object to store non-movable and specific validation rules.
 * @param {Record<string, any>} mRules - Object to store movable column validation rules.
 * @param {Record<string, any>} frRules - Object to store frozen-right column validation rules.
 * @param {number} len - The total number of columns.
 * @param {boolean} [isCustom] - Flag to determine if custom validation is required.
 * @returns {void}
 * @hidden
 */
export function setValidationRuels(
    col: Column,
    index: number,
    rules: Record<string, any>,
    mRules: Record<string, any>,
    frRules: Record<string, any>,
    len: number,
    isCustom: boolean = false
): void {
    if (isCustom) {
        rules[getComplexFieldID(col.field)] = col.validationRules;
    } else {
        if (col.getFreezeTableName() === literals.frozenLeft
            || (!index && col.getFreezeTableName() === literals.frozenRight) || len === 1) {
            rules[getComplexFieldID(col.field)] = col.validationRules;
        } else if (col.getFreezeTableName() === 'movable' || !col.getFreezeTableName()) {
            mRules[getComplexFieldID(col.field)] = col.validationRules;
        } else if (col.getFreezeTableName() === literals.frozenRight) {
            frRules[getComplexFieldID(col.field)] = col.validationRules;
        }
    }
}

/**
 * @param {string} numberFormat - Format
 * @param {string} type - Value type
 * @param {boolean} isExcel - Boolean property
 * @param {string} currencyCode - Specifies the currency code to be used for formatting.
 * @returns {string} returns formated value
 * @hidden
 */
export function getNumberFormat(numberFormat: string, type: string, isExcel: boolean, currencyCode?: string): string {
    let format: string;
    const intl: IInternationalization = Internationalization();
    if (type === 'number') {
        try {
            format = intl.getNumberPattern({ format: numberFormat, currency: currencyCode, useGrouping: true }, true);
        } catch (error) {
            format = numberFormat;
        }
    } else if (type === 'date' || type === 'time' || type === 'datetime') {
        try {
            format = intl.getDatePattern({ skeleton: numberFormat, type: type }, isExcel);
            if (isNullOrUndefined(format)) {
                // eslint-disable-next-line
                throw 'error';
            }
        } catch (error) {
            try {
                format = intl.getDatePattern({ format: numberFormat, type: type }, isExcel);
            } catch (error) {
                format = numberFormat;
            }
        }
    } else {
        format = numberFormat;
    }
    if (type !== 'number') {
        const patternRegex: RegExp = /G|H|c|'| a|yy|y|EEEE|E/g;
        const mtch: Object = { 'G': '', 'H': 'h', 'c': 'd', '\'': '"', ' a': ' AM/PM', 'yy': 'yy', 'y': 'yyyy', 'EEEE': 'dddd', 'E': 'ddd' };
        format = format.replace(patternRegex, (pattern: string): string => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (mtch as { [key: string]: string })[`${pattern}`];
        });
    }
    return format;
}

// /**
//  * @param {IGrid} gObj - Grid instance
//  * @returns {void}
//  * @hidden
//  */
// export function addBiggerDialog(gObj: IGrid): void {
//     if (gObj.enableAdaptiveUI) {
//         const dialogs: HTMLCollectionOf<Element> = document.getElementsByClassName('e-responsive-dialog');
//         for (let i: number = 0; i < dialogs.length; i++) {
//             dialogs[parseInt(i.toString(), 10)].classList.add('e-bigger');
//         }
//     }
// }

/**
 * Navigates through a map-like object using a dot-separated path string and returns the resolved value.
 * 
 * @param {string} value - Dot-separated path string used to traverse the object.
 * @param {Record<string, any>} mapObject - Object to traverse, potentially with nested objects.
 * @returns {any} Value found at the specified path within the object, or undefined if any part of the path is invalid.
 * @hidden
 */
export function performComplexDataOperation(value: string, mapObject: Record<string, any>): any {
    let returnObj: any;
    const length: number = value.split('.').length;
    const splits: string[] = value.split('.');

    let duplicateMap: any = mapObject;
    for (let i: number = 0; i < length; i++) {
        returnObj = duplicateMap[splits[parseInt(i.toString(), 10)]];
        duplicateMap = returnObj;
    }

    return returnObj;
}

/**
 * Adjusts the display value of table cells based on their index and updates the visibility status in the grid row cells.
 * 
 * @param {HTMLElement[]} tr - The table row elements to modify.
 * @param {number} idx - The index of the column to change display settings.
 * @param {string} displayVal - The display property value to be set, e.g., '' or 'none'.
 * @param {Row<Column>[]} rows - The grid rows containing column cells.
 * @param {IGrid} [parent] - Optional grid instance for additional checks like frozen rows.
 * @param {boolean} [isContent] - Optional flag indicating if content renderer checks are needed.
 * @returns {void}
 * @hidden
 */
export function setDisplayValue(
    tr: HTMLElement[],
    idx: number,
    displayVal: string,
    rows: Row<Column>[],
    parent?: IGrid,
    isContent: boolean = false
): void {
    const trs: string[] = Object.keys(tr);
    const actualIndex: number = idx;
    for (let i: number = 0; i < trs.length; i++) {
        let td: HTMLTableCellElement | null = tr[parseInt(trs[i], 10)].querySelectorAll('td.e-rowcell')[idx] as HTMLTableCellElement | null;

        // if (parent && !parent.isFrozenGrid?.() && !parent.isRowDragable()) {
        //     td = (!isNullOrUndefined(td) && (parseInt((td as HTMLTableCellElement).getAttribute('aria-colindex') || '0', 10) - 1 === idx ||
        //         (parentsUntil(td as HTMLTableCellElement, 'e-addedrow') && (td as HTMLTableCellElement).parentElement?.childNodes[idx] === td)))
        //         ? td : tr[parseInt(trs[i], 10)].querySelector(`td[aria-colindex="${idx + 1}"]`);

        //     if (isNullOrUndefined(td)) {
        //         continue;
        //     }
        //     idx = (parent.getContentTable?.().querySelector('.e-detailrowcollapse, .e-detailrowexpand')) ?
        //         ((td as HTMLTableCellElement).cellIndex - 1) : (td as HTMLTableCellElement).cellIndex;
        // }

        if (tr[parseInt(trs[i], 10)].querySelectorAll('td.e-rowcell').length && td) {
            setStyleAttribute(tr[parseInt(trs[i], 10)].querySelectorAll('td.e-rowcell')[idx] as HTMLElement, { 'display': displayVal });
            if (tr[parseInt(trs[i], 10)].querySelectorAll('td.e-rowcell')[idx].classList.contains('e-hide')) {
                removeClass([tr[parseInt(trs[i], 10)].querySelectorAll('td.e-rowcell')[idx]], ['e-hide']);
            }
            // if ((isContent && parent && parent.isRowDragable()) || (parent && parent.isDetail?.())) {
            //     const index: number = idx + 1;
            //     rows[parseInt(trs[i], 10)].cells[index].visible = displayVal === '';
            // } else {
                if (!isNullOrUndefined(rows[parseInt(trs[i], 10)])) {
                    rows[parseInt(trs[i], 10)].cells[idx].visible = displayVal === '';
                    if (!rows[parseInt(trs[i], 10)].cells[idx].visible) {
                        tr[parseInt(trs[i], 10)].querySelectorAll('td.e-rowcell')[idx].classList.add('e-hide');
                    }
                }
            // }
            idx = actualIndex;
        }
    }
}

// // eslint-disable-next-line
// /** @hidden */
// export function addRemoveEventListener(parent: IGrid, evt: { event: string, handler: Function }[], isOn: boolean, module?: Object): void {
//     for (const inst of evt) {
//         if (isOn) {
//             parent.on(inst.event, inst.handler, module);
//         } else {
//             parent.off(inst.event, inst.handler);
//         }
//     }
// }

// // eslint-disable-next-line
// /** @hidden */
// export function createEditElement(parent: IGrid, column: Column, classNames: string, attr: { [key: string]: string }): Element {
//     const complexFieldName: string = getComplexFieldID(column.field);
//     attr = Object.assign(attr, {
//         id: parent.element.id + complexFieldName,
//         name: complexFieldName, 'e-mappinguid': column.uid
//     });
//     return parent.createElement('input', {
//         className: classNames, attrs: attr
//     });
// }

/**
 * Retrieves a column model from the grid object based on the specified unique identifier (uid).
 * 
 * @param gObj - The grid object which contains the column models.
 * @param uid - The unique identifier of the column to be retrieved.
 * @returns The column corresponding to the specified uid, or `undefined` if not found.
 */
export function getColumnModelByUid(gObj: IGrid, uid: string): Column | undefined {
    let column: Column | undefined;

    // Safely access columnModel by checking if it is defined
    const columnModel = (gObj as { columnModel?: Column[] }).columnModel;
    if (columnModel) {
        for (const col of columnModel) {
            if (col.uid === uid) {
                column = col;
                break; // Exit loop once column is found
            }
        }
    }

    return column; // Return the found column, or undefined if it doesn't exist
}

/**
 * Retrieves a column model from the grid object based on the specified field name.
 * 
 * @param gObj - The grid object which is expected to contain the column models.
 * @param field - The field name of the column to be retrieved.
 * @returns The column corresponding to the specified field name, or `undefined` if not found.
 */
export function getColumnModelByFieldName(gObj: IGrid, field: string): Column | undefined {
    let column: Column | undefined;

    // Check if the columnModel does not exist and ensure getColumns is called, if possible
    if (!(gObj as { columnModel?: Column[] }).columnModel) {
        // Optional chaining used to safely call getColumns if it is defined
        (gObj.getColumns?.());
    }

    // Accessing columnModel safely after trying to set it
    const columnModel = (gObj as { columnModel?: Column[] }).columnModel;
    if (columnModel) {
        for (const col of columnModel) {
            if (col.field === field) {
                column = col;
                break; // Exit loop once found
            }
        }
    }

    return column; // Return the found column or undefined if not found
}

// /**
//  * @param {string} id - Defines component id
//  * @param {string[]} evts - Defines events
//  * @param {object} handlers - Defines event handlers
//  * @param {any} instance - Defines class instance
//  * @returns {void}
//  * @hidden
//  */
// // eslint-disable-next-line
// export function registerEventHandlers(id: string, evts: string[], handlers: object, instance: any): void {
//     instance.eventHandlers[`${id}`] = {};
//     for (let i: number = 0; i < evts.length; i++) {
//         instance.eventHandlers[`${id}`][evts[parseInt(i.toString(), 10)]] = handlers[evts[parseInt(i.toString(), 10)]];
//     }
// }

/**
 * @param {any} component - Defines component instance
 * @param {string[]} evts - Defines events
 * @param {any} instance - Defines class instance
 * @returns {void}
 * @hidden
 */
// eslint-disable-next-line
export function removeEventHandlers(component: any, evts: string[], instance: any): void {
    for (let i: number = 0; i < evts.length; i++) {
        if (component.isDestroyed) { break; }
        component.removeEventListener(
            evts[parseInt(i.toString(), 10)],
            instance.eventHandlers[component.element.id][evts[parseInt(i.toString(), 10)]]);
    }
}

// /**
//  * @param {IGrid | IXLFilter} parent - Defines parent instance
//  * @param {string[]} templates - Defines the templates name which are needs to clear
//  * @returns {void}
//  * @hidden
//  */
// export function clearReactVueTemplates(parent: IGrid | IXLFilter, templates: string[]): void {
//     parent.destroyTemplate(templates);
//     if (parent.isReact) {
//         parent.renderTemplates();
//     }
// }

/**
 *
 * @param { HTMLElement[] } removeElem - Defines checkbox wrapper element
 * @returns {void}
 * @hidden
 */
export function infiniteRemoveElements(removeElem: HTMLElement[]): void {
    for (let i: number = 0; i < removeElem.length; i++) {
        remove(removeElem[i as number]);
    }
}

/**
 *
 * @param { HTMLElement[] } appendElem - Defines checkbox wrapper element
 * @param { HTMLElement } ulElement - Defines ul element
 * @returns {void}
 * @hidden
 */
export function infiniteAppendElements(appendElem: HTMLElement[], ulElement: HTMLElement): void {
    for (let i: number = 0; i < appendElem.length; i++) {
        ulElement.insertBefore(appendElem[i as number], ulElement.children[i as number]);
    }
}

/**
 *
 * @param { HTMLElement } element - Defines checkbox wrapper element
 * @param { boolean } isChooser - Defines checkbox filter column chooser
 * @returns { number } list height value
 * @hidden
 */
export function getListHeight(element: Element, isChooser?: boolean): number {
    const listDiv: HTMLElement = isChooser ? createElement('li', { className: 'e-cclist' }) as HTMLLIElement
        : createElement('div', { className: 'e-ftrchk' }) as HTMLDivElement;
    listDiv.style.visibility = 'hidden';
    if (isChooser) {
        (listDiv as HTMLLIElement).style.listStyle = 'none';
    }
    listDiv.innerHTML = isChooser ? '<div class="e-ccheck"><div class="e-checkbox-wrapper"><span class="e-frame e-icons e-check"></span><span class="e-label">A</span></div></div>' :
        '<div class="e-checkbox-wrapper"><span class="e-frame e-icons e-check"></span><span class="e-label e-checkboxfiltertext">A</div></span>';
    element.appendChild(listDiv);
    const rect: ClientRect = listDiv.getBoundingClientRect();
    element.removeChild(listDiv);
    const listHeight: number = Math.round(rect.height);
    return listHeight;
}

/**
 * Get row index from an element by retrieving the 'aria-rowindex' attribute.
 * @param row - The row element
 * @returns The zero-based row index
 */
export function getRowIndexFromElement(row: Element): number {
    // Get the row index attribute and provide a default value if it's null
    const ariaRowIndex = row.getAttribute(literals.ariaRowIndex);
    return parseInt(ariaRowIndex ?? '0', 10) - 1;
}

// /**
//  *
//  * @param { IGrid } grid - Defines grid instance
//  * @returns { IGrid } returns parent grid instance
//  */
// export function getParentIns(grid: IGrid): IGrid {
//     return grid.parentDetails && grid.parentDetails.parentInstObj ?
//         getParentIns(grid.parentDetails.parentInstObj) : grid;
// }

// /**
//  *
//  * @param { string[] } fields - Defines grouped fields
//  * @param { values } values - Defines caption keys
//  * @param { any } instance - Defines dynamic class instance
//  * @returns { Predicate } returns filter predicate
//  */
// // eslint-disable-next-line
// export function generateExpandPredicates(fields: string[], values: string[], instance: any): Predicate {
//     let filterCols: PredicateModel[] = [];
//     for (let i: number = 0; i < fields.length; i++) {
//         const column: Column = instance.parent.getColumnByField(fields[parseInt(i.toString(), 10)]);
//         const value: string = values[parseInt(i.toString(), 10)] === 'null' ? null : values[parseInt(i.toString(), 10)];
//         const pred: {
//             predicate?: string, field?: string, type?: string, uid?: string
//             operator?: string, matchCase?: boolean, ignoreAccent?: boolean
//         } = {
//             field: fields[parseInt(i.toString(), 10)], predicate: 'or', uid: column.uid, operator: 'equal', type: column.type,
//             matchCase: instance.allowCaseSensitive, ignoreAccent: instance.parent.filterSettings.ignoreAccent
//         };
//         if (value === '' || isNullOrUndefined(value)) {
//             filterCols = filterCols.concat(CheckBoxFilterBase.generateNullValuePredicates(pred));
//         } else {
//             filterCols.push(extend({}, { value: value }, pred));
//         }
//     }
//     return CheckBoxFilterBase.getPredicate(filterCols);
// }

/**
 *
 * @param { Predicate } pred - Defines filter predicate
 * @returns { Predicate[] } Returns formed predicate
 */
export function getPredicates(pred: Predicate): Predicate[] {
    const predicateList: Predicate[] = [];
    for (const prop of Object.keys(pred)) {
        predicateList.push(pred[`${prop}`] as Predicate);
    }
    return predicateList;
}

// /**
//  *
//  * @param { number } index - Defines group caption indent
//  * @param { Row<Column>[] } rowsObject - Defines rows object
//  * @returns { { fields: string[], keys: string[] } } Returns grouped keys and values
//  */
// export function getGroupKeysAndFields(index: number, rowsObject: Row<Column>[]): { fields: string[], keys: string[] } {
//     const fields: string[] = [];
//     const keys: string[] = [];
//     for (let i: number = index; i >= 0; i--) {
//         if (rowsObject[parseInt(i.toString(), 10)].isCaptionRow
//             && fields.indexOf((rowsObject[parseInt(i.toString(), 10)].data as GroupedData).field) === -1
//             && (rowsObject[parseInt(i.toString(), 10)].indent < rowsObject[parseInt(index.toString(), 10)].indent || i === index)) {
//             fields.push((rowsObject[parseInt(i.toString(), 10)].data as GroupedData).field);
//             keys.push((rowsObject[parseInt(i.toString(), 10)].data as GroupedData).key);
//             if (rowsObject[parseInt(i.toString(), 10)].indent === 0) {
//                 break;
//             }
//         }
//     }
//     return { fields: fields, keys: keys };
// }

// eslint-disable-next-line
/**
 *
 * @param { number[][] } checkActiveMatrix - Defines matrix to check
 * @param { number[] } checkCellIndex - Defines index to check
 * @param { boolean } next - Defines select next or previous index
 * @returns { number[] } - Returns next active current index
 */
export function findCellIndex(checkActiveMatrix: number[][], checkCellIndex: number[], next: boolean): number[] {
    const activeMatrix: number[][] = checkActiveMatrix;
    let cellIndex: number[] = checkCellIndex;
    let currentCellIndexPass: boolean = false;
    if (next) {
        for (let i: number = cellIndex[0]; i < activeMatrix.length; i++) {
            const rowCell: number[] = activeMatrix[parseInt(i.toString(), 10)];
            for (let j: number = 0; j < rowCell.length; j++) {
                if (currentCellIndexPass && activeMatrix[parseInt(i.toString(), 10)][parseInt(j.toString(), 10)] === 1) {
                    cellIndex = [i, j];
                    return cellIndex;
                }
                if (!currentCellIndexPass && cellIndex.toString() === [i, j].toString()) {
                    currentCellIndexPass = true;
                }
            }
        }
    } else {
        for (let i: number = cellIndex[0]; i >= 0; i--) {
            const rowCell: number[] = activeMatrix[parseInt(i.toString(), 10)];
            for (let j: number = rowCell.length - 1; j >= 0; j--) {
                if (currentCellIndexPass && activeMatrix[parseInt(i.toString(), 10)][parseInt(j.toString(), 10)] === 1) {
                    cellIndex = [i, j];
                    return cellIndex;
                }
                if (!currentCellIndexPass && cellIndex.toString() === [i, j].toString()) {
                    currentCellIndexPass = true;
                }
            }
        }
    }
    return cellIndex;
}

/**
 *
 * @param { string } string - Defines string need to capitalized first letter
 * @returns { string } - Returns capitalized first letter string
 */
export function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// /**
//  *
//  * @param { IGrid } grid - Defines parent instance
//  * @returns { boolean } - Returns is virtual
//  */
// export function checkIsVirtual(grid: IGrid): boolean {
//     return !(isGroupAdaptive(grid) || grid.groupSettings.enableLazyLoading
//     || (!grid.enableVirtualization && grid.enableColumnVirtualization));
// }

/**
 *
 * @param { number[] } blockes - Defines block indexes
 * @returns { number[] } - Returns is visible page
 */
export function getVisiblePage(blockes: number[]): number[] {
    const visiblePage: number[] = [];
    for (let i: number = 0; i < blockes.length; i++) {
        const page: number = Math.ceil(blockes[parseInt(i.toString(), 10)] / 2);
        if (visiblePage.indexOf(page) === -1) {
            visiblePage.push(page);
        }
    }
    return visiblePage;
}

export const getStyleValue = (value: string | number | undefined) =>
    typeof isNaN(Number(value)) ? `${value}px` : value;
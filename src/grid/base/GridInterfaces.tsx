// src/grid/components/GridInterfaces.tsx
import React, { HTMLAttributes, MutableRefObject } from 'react';
import { Column } from '../models/column';
import { Row } from '../models/row';
import { Cell } from '../models/cell';
import { DataManager, DataResult } from '@syncfusion/react-data';
import { ServiceLocator } from '../services/service-locator';
import { CellType } from '../base/enum';
import { DateFormatOptions, IL10n, NumberFormatOptions } from '@syncfusion/react-base';
import { Scroll } from '../actions/useScroll';

export interface ExposeRender {
    publicProps: IGrid;
    privateProps: PrivateRender
}

export interface PrivateRender {
    renderGrid: () => void;
    headerRef: MutableRefObject<IHeaderRenderer>;
    contentRef: MutableRefObject<IContentRender>;
}

/**
 * @hidden
 */
export interface IValueFormatter {
    fromView(value: string, format: Function, target?: string): string | number | Date;
    toView(value: number | Date, format: Function): string | Object;
    setCulture?(cultureName: string): void;
    getFormatFunction?(format: NumberFormatOptions | DateFormatOptions): Function;
    getParserFunction?(format: NumberFormatOptions | DateFormatOptions): Function;
}

/**
 * @hidden
 */
export interface ICellRenderer<T> {
    element?: Element;
    getGui?(): string | Element;
    format?(column: T, value: Object, data: Object): string;
    evaluate?(node: Element, column: Cell<T>, data: Object, attributes?: Object): boolean;
    setStyleAndAttributes?(node: Element, attributes: { [key: string]: Object }): void;
    render(cell: Cell<T>, data: Object, attributes?: { [x: string]: string }, isExpand?: boolean, isEdit?: boolean): Element;
    appendHtml?(node: Element, innerHtml: string | Element): Element;
    refresh?(cell: Cell<T>, node: Element): Element;
}

/**
 * @hidden
 */
export interface ICell<T> {
    colSpan?: number;
    rowSpan?: number;
    cellType?: CellType;
    visible?: boolean;
    isTemplate?: boolean;
    isDataCell?: boolean;
    column?: T;
    rowID?: string;
    index?: number;
    colIndex?: number;
    className?: string;
    // commands?: CommandModel[];
    isForeignKey?: boolean;
    foreignKeyData?: Object;
}
/**
 * @hidden
 */
export interface IRow<T> {
    uid?: string;
    parentGid?: number;
    childGid?: number;
    data?: Object;
    gSummary?: number;
    aggregatesCount?: number;
    tIndex?: number;
    collapseRows?: Object[];
    isSelected?: boolean;
    isFreezeRow?: boolean;
    isReadOnly?: boolean;
    isCaptionRow?: boolean;
    isAltRow?: boolean;
    isDataRow?: boolean;
    isExpand?: boolean;
    rowSpan?: number;
    cells?: Cell<T>[];
    index?: number;
    indent?: number;
    subRowDetails?: Object;
    height?: string;
    cssClass?: string;
    foreignKeyData?: Object;
    parentUid?: string;
    isSelectable?: boolean;
}

export interface IRender {
    render?: () => void;
}

export interface RenderProps {
    parent: IGrid;
    serviceLocator: ServiceLocator;
    onRenderComplete?: () => void;
}

export interface IHeaderRenderer {
    renderPanel: () => HTMLElement | null;
    renderTable: () => HTMLTableElement | null;
    getPanel: () => HTMLElement | null;
    getTable: () => HTMLTableElement | null;
    getColGroup: () => HTMLElement | null;
    setColGroup: (colGroup: HTMLElement) => void;
    getRowObject: () => Row<Column>[];
    refreshUI: () => void;
}

export interface HeaderRenderProps {
    parent: IGrid;
    serviceLocator: ServiceLocator;
    onHeaderRendered?: (rows: Row<Column>[]) => void;
}

export interface IContentRender {
    renderPanel: () => void;
    renderTable: () => void;
    getPanel: () => HTMLElement | null;
    getTable: () => HTMLTableElement | null;
    getColGroup: () => HTMLTableColElement | null;
    setColGroup: (colGroup: HTMLElement) => void;
    getRowObject: () => Row<Column>[];
    getRowElements: () => HTMLTableRowElement[];
    setRowElements: (elements: HTMLTableRowElement[]) => void;
    refreshContentRows: (args: any) => void;
    renderEmpty: () => void;
}

export interface ContentRenderProps {
    parent: IGrid;
    serviceLocator: ServiceLocator;
    onContentRendered?: (rows: Row<Column>[]) => void;
}

export interface RowRenderProps {
    serviceLocator: ServiceLocator;
    cellType?: CellType;
    parent: IGrid;
    row: Row<Column>;
    columns: Column[];
    attributes?: { [x: string]: Object };
    rowTemplate?: string;
    onRowRendered?: (row: HTMLTableRowElement) => void;
}

export interface CellRenderProps {
    parent: IGrid;
    serviceLocator: ServiceLocator;
    cell: Cell<Column>;
    data: Object;
    attributes?: { [x: string]: Object };
    isExpand?: boolean;
    isEdit?: boolean;
    onCellRendered?: (cell: HTMLTableCellElement) => void;
}

export interface HeaderCellProps {
    parent: IGrid;
    serviceLocator: ServiceLocator;
    cell: Cell<Column>;
    onCellRendered?: (cell: HTMLTableCellElement) => void;
}

export interface GridMethods {
    getColumns: () => Column[];
    getHeaderContent: () => HTMLElement;
    getContent: () => HTMLElement;
    getHeaderTable: () => HTMLTableElement;
    getContentTable: () => HTMLTableElement;
    getRowsObject: () => Row<Column>[];
    getDataRows: () => HTMLTableRowElement[];
    getRows: () => HTMLTableRowElement[];
    getRowHeight?(): number;
    // getRowByIndex?(index: number): HTMLTableRowElement;
    getColumnIndexByField?(field: string): number;
    sanitize?(value: string): string;
    // notify: (eventName: string, args?: any) => void;
    // trigger: (eventName: keyof IGridProps, args?: any, successCallback?: Function) => void;
    // Add more required methods as needed
}

/**
 * @hidden
 */
export interface GridPrivateMethods {
    updateColumnModel?(columns: Column[], isRecursion?: boolean): void;
    // Add more required methods as needed
}

export interface GridEvents {
    load?({}): void;
    created?({}): void;
    beforeDataBound?({ }): void;
    headerCellInfo?({}): void;
    queryCellInfo?({}): void;
    rowDataBound?({}): void;
    dataBound?({ }): void;
    actionFailure?({ }): void;
    // Add more required events as needed
}

/**
 * @hidden
 */
export interface GridPrivateEvents {
    autoCol?({}): void;
}

/**
 * @hidden
 */
export interface GridPrivateProps extends GridPrivateMethods, GridPrivateEvents {
    isAutoGen?: boolean;
    columnModel?: Column[];
    defaultLocale?: Object;
}

/**
 * public properties and events for Grid component
 */
export interface GridProps extends GridEvents {
    id?: string;
    columns?: Column[];
    dataSource?: object[] | DataManager | DataResult;
    height?: string | number;
    width?: string | number;
    className?: string;
    enableRtl?: boolean;
    rowHeight?: number;
    clipMode?: string;
    textWrapSettings?: {
        wrapMode?: 'Both' | 'Header' | 'Content' | 'None';
    };
    enableAltRow?: boolean;
    allowTextWrap?: boolean;
    allowResizing?: boolean;
    enableHover?: boolean;
    enableHtmlSanitizer?: boolean;
    // Add more base properties as needed
    /**
     * @hidden
     */
    renderModule?: IRender;
    scrollModule?: Scroll;
    currentViewData?: object[];
    localeObj?: IL10n;
    serviceLocator?: ServiceLocator;
    locale?: string;
    valueFormatterService?: IValueFormatter;
}

/**
 * Interface to define the structure of the Grid component reference instance
 *
 */
export interface IGrid extends GridProps, GridMethods  {
    /**
     * This is grid component element.
     *
     * @private
     * @default null
     */
    element?: HTMLElement | null;
}

export type IGridProps = GridProps & HTMLAttributes<HTMLDivElement>;
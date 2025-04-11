// src/grid/components/GridRender.tsx
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback, useMemo, ForwardRefExoticComponent, Ref, RefAttributes, lazy, Suspense, CSSProperties } from 'react';
import { DataManager, Query, Deferred, ReturnType } from '@syncfusion/react-data';
import { IGridProps, IGrid, IHeaderRenderer, IContentRender, GridPrivateProps, ExposeRender } from '../base/GridInterfaces';
import { HeaderRenderer } from './HeaderRenderer';
import { ContentRenderer } from './ContentRenderer';
import { ServiceLocator, useServiceLocator } from '../services/service-locator';
import * as events from '../base/constant';
import * as literals from '../base/string-literals';
import { Column } from '../models/column';
import { useGridMethods } from '../base/useGridMethods';
import { getStyleValue, prepareColumns } from '../base/util';
import { Browser, formatUnit } from '@syncfusion/react-base';
import { SpinnerType } from '@syncfusion/react-popups';
// import { Spinner } from '@syncfusion/react-popups/src/spinner/spinner';
// Lazy import the Spinner component
const Spinner = lazy(() => import('@syncfusion/react-popups/src/spinner/spinner'));

/**
 * Main Grid component that handles rendering the grid structure
 */
export const GridRender: ForwardRefExoticComponent<Partial<IGridProps & GridPrivateProps> & RefAttributes<ExposeRender>> = forwardRef<ExposeRender, Partial<IGridProps>>((props: Partial<IGridProps & GridPrivateProps>, ref: Ref<ExposeRender>) => {
    const propsRef = useRef<IGridProps & GridPrivateProps>({...props as IGridProps & GridPrivateProps})
    // const [propsState, setPropsState] = useState<IGridProps & GridPrivateProps>(props as IGridProps & GridPrivateProps)
    const gridRef = useRef<HTMLDivElement>(null);
    const isLayoutRendered = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emptyGrid, setEmptyGrid] = useState(false);
    const [counter, setCounter] = useState<number>(0);
    const [classes, setClasses] = useState([
        'e-control',
        'e-grid',
        'e-lib',
        'e-default',
        'e-droppable',
        'e-tooltip',
        'e-keyboard',
        ...(propsRef.current.enableRtl ? ['e-rtl'] : []),
        // ...(propsRef.current.rowRenderingMode === 'Vertical' ? ['e-row-responsive'] : []),
        ...(propsRef.current.enableHover ? ['e-gridhover'] : []),
        ...(/^((?!chrome|android).)*safari/i.test(navigator.userAgent) || Browser.isSafari() ? ['e-mac-safari'] : []),
        ...(Browser.isDevice ? ['e-device'] : []),
        ...(propsRef.current.rowHeight ? ['e-grid-min-height'] : []),
        ...(propsRef.current.className ? propsRef.current.className.split(' ') : [])
    ].join(' '));
    const [styles, setStyles] = useState<CSSProperties>({ width: formatUnit(propsRef.current.width as string | number) });
    const headerRef = useRef<IHeaderRenderer>(null as unknown as IHeaderRenderer);
    const contentRef = useRef<IContentRender>(null as unknown as IContentRender);

    // Memoize the data manager to prevent unnecessary recreations
    const dataManager = useMemo(() => {
        if (propsRef.current.dataSource instanceof DataManager) {
            return propsRef.current.dataSource;
        } else if (Array.isArray(propsRef.current.dataSource)) {
            return new DataManager(propsRef.current.dataSource);
        } else {
            return new DataManager([]);
        }
    }, [propsRef.current.dataSource]);

    // Expose methods through the ref
    useImperativeHandle(ref, () => ({
        privateProps: {
            headerRef,
            contentRef,
            renderGrid
        },
        publicProps: {
            element: gridRef.current,
            ...propsRef.current as IGrid
        }
        // notify: (eventName, args) => {
        //   // Internal event system - for React we'll use allProps callbacks
        //   // This is a simplified implementation for compatibility
        //   if (eventName === events.dataReady) {
        //     propsRef.current.currentViewData = args.result;
        //     contentRef.current?.refreshContentRows({ ...args });
        //   }
        // },
        // trigger: (eventName: keyof IGridallProps, args, successCallback) => {
        //   // Public event system
        //   // In React, we'd use allProps callbacks directly
        //   if (allProps[eventName]) {
        //     const result = allProps[eventName](args);
        //     if (successCallback && !args.cancel) {
        //       successCallback(args);
        //     }
        //     return result;
        //   }
        //   if (successCallback && !args.cancel) {
        //     successCallback(args);
        //   }
        // }
    }), [propsRef.current]);

    /**
     * Initialize grid header, content and footer rendering
     */
    const renderGrid = useCallback(() => {
        // Show loading spinner
        setIsLoading(true);

        // Render panels
        headerRef.current?.renderPanel();
        contentRef.current?.renderPanel();

        if (propsRef.current.columns?.length) {
            isLayoutRendered.current = true;
            headerRef.current?.renderTable();
            contentRef.current?.renderTable();

            if (!propsRef.current.dataSource || (Array.isArray(propsRef.current.dataSource) && propsRef.current.dataSource.length === 0)) {
                renderEmptyRow(false);
            }
            // propsRef.current.scrollModule.setWidth();
            // propsRef.current.scrollModule.setHeight();
            if (propsRef.current.height !== 'auto') {
                propsRef.current.scrollModule?.setPadding();
            }
        }

        // Load data
        refreshDataManager();
    }, [propsRef.current.columns]);

    const refreshDataManager = useCallback((args = {}) => {
        setIsLoading(true);

        // Create a query to get data
        const query = new Query();

        // Execute the query against the data manager
        const promise = dataManager.executeQuery(query);

        promise.then((e: Response | ReturnType) => {
            dataManagerSuccess(e as ReturnType, args);
        }).catch((e: any) => {
            dataManagerFailure(e, args);
        });
    }, [dataManager]);

    const dataManagerSuccess = (e: ReturnType, args = {}) => {
        setIsLoading(false);

        // Trigger beforeDataBound event
        propsRef.current.beforeDataBound && propsRef.current.beforeDataBound(e);
        const len: number = Object.keys(e.result).length;
        if ((!propsRef.current.columns?.length && len || !isLayoutRendered.current)) {// && !isGroupAdaptive(gObj)
            // gObj.removeMaskRow();
            updatesOnInitialRender(e);
        }
        // Set current view data
        propsRef.current.currentViewData = e.result;

        // Notify content renderer to refresh with new data
        if (contentRef.current) {
            contentRef.current.refreshContentRows({
                result: e.result,
                count: e.count,
                ...args
            });
        }
        // Trigger dataBound event when rendering is complete
        propsRef.current.dataBound && propsRef.current.dataBound({});
    };


    const updatesOnInitialRender = (e: ReturnType): void => {
        isLayoutRendered.current = true;
        let isEmptyCol: boolean = false;
        if (propsRef.current.columns && propsRef.current.columns?.length < 1) {
            buildColumns(e.result[0] as { [key: string]: unknown });
            isEmptyCol = true;
        }
        prepareColumns(propsRef.current.columns as Column[], undefined, propsRef.current as IGrid);
        // if (isEmptyCol) {
        //     this.parent.notify(events.refreshSplitFrozenColumn, {});
        // }
        headerRef.current?.renderTable();
        contentRef.current?.renderTable();
        propsRef.current.isAutoGen = true;
        propsRef.current.autoCol && propsRef.current.autoCol?.({});
    };

    const iterateComplexColumns = useCallback((obj: { [key: string]: unknown }, field: string, split: { [key: number]: unknown }): void => {
        const keys: string[] = Object.keys(obj);
        for (let i: number = 0; i < keys.length; i++) {
            const childKeys: string[] = typeof obj[keys[parseInt(i.toString(), 10)]] === 'object'
                && obj[keys[parseInt(i.toString(), 10)]] && !(obj[keys[parseInt(i.toString(), 10)]] instanceof Date) ?
                Object.keys(obj[keys[parseInt(i.toString(), 10)]] as Object) : [];
            if (childKeys.length) {
                iterateComplexColumns(obj[keys[parseInt(i.toString(), 10)]] as { [key: string]: unknown }, field + (keys[parseInt(i.toString(), 10)] + '.'), split);
            } else {
                split[counter] = field + keys[parseInt(i.toString(), 10)];
                setCounter(counter + 1);
            }
        }
    }, []);

    const buildColumns = (record: { [key: string]: unknown }): void => {
        const cols: Column[] = [];
        const complexCols: { [key: string]: unknown } = {};
        iterateComplexColumns(record, '', complexCols);
        const columns: string[] = Object.keys(complexCols).filter((e: string) => complexCols[`${e}`] !== 'BlazId').
            map((field: string) => complexCols[`${field}`]) as string[];
        for (let i: number = 0, len: number = columns.length; i < len; i++) {
            cols[parseInt(i.toString(), 10)] = { 'field': columns[parseInt(i.toString(), 10)] } as Column;
            // if (this.parent.enableColumnVirtualization) {
            //     cols[parseInt(i.toString(), 10)].width = !isNullOrUndefined(cols[parseInt(i.toString(), 10)].width) ?
            //         cols[parseInt(i.toString(), 10)].width : 200;
            // }
        }
        // this.parent.setProperties({ 'columns': cols }, true);
        propsRef.current.columns = cols;
    };

    const dataManagerFailure = useCallback((e: any, args = {}) => {
        setIsLoading(false);

        // Trigger actionFailure event
        propsRef.current.actionFailure && propsRef.current.actionFailure(e);

        propsRef.current.currentViewData = [];
        renderEmptyRow(true);
    }, []);

    const renderEmptyRow = useCallback((isTrigger = false) => {
        // This method would render an empty row when no data is available
        if (contentRef.current) {
            contentRef.current.renderEmpty();
        }

        if (isTrigger) {
            propsRef.current.dataBound && propsRef.current.dataBound({});
        }
    }, []);

    // Render the grid on initial mount
    useEffect(() => {
        renderGrid();
    }, []);

    // useEffect(() => {
    //     allProps.current = { ...allProps.current, ...propsRef.current as IGrid };
    // }, [props]);

    return (
        <div ref={gridRef} id={propsRef.current.id} className={classes} style={styles}>
            <>
                {/* <Spinner className="e-grid-spinner" /> */}
                {/* Wrap the lazy-loaded component with Suspense and provide a fallback */} {/*fallback={<div>Loading...</div>} */}
                {/* <Suspense > */}
                <Spinner
                    isVisible={isLoading}
                    className={propsRef.current.className}
                    target={gridRef?.current as HTMLElement}
                    type={SpinnerType.Material3}
                />
                {/* </Suspense> */}
            </>

            <HeaderRenderer
                ref={headerRef}
                parent={propsRef.current as IGrid}
                // parent={isRefObject(ref) ? ref.current : undefined}
                serviceLocator={propsRef.current.serviceLocator as ServiceLocator}
            />

            <ContentRenderer
                ref={contentRef}
                parent={propsRef.current as IGrid}
                // parent={isRefObject(ref) ? ref.current : undefined}
                serviceLocator={propsRef.current.serviceLocator as ServiceLocator}
            />
        </div>
    );
});

// // Type guard to check if ref is an object with 'current'
// function isRefObject<T>(ref: any): ref is React.RefObject<T> {
//     return ref && typeof ref === 'object' && 'current' in ref;
// }
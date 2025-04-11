import React, { useRef, useEffect, MutableRefObject, useState, useCallback, CSSProperties, useMemo } from 'react';
import { Browser, EventHandler, isNullOrUndefined } from '@syncfusion/react-base';
// import { addClass, removeClass } from '@syncfusion/react-base';
// import { formatUnit, isNullOrUndefined } from '@syncfusion/react-base';
import { IGrid,
    // IAction, NotifyArgs
} from '../base/GridInterfaces';
import { getScrollBarWidth as getUtilScrollBarWidth, getUpdateUsingRaf } from '../base/util';
// import {
//     scroll, contentReady, uiUpdate, onEmpty, headerRefreshed, textWrapRefresh, virtualScrollEdit, infiniteScrollHandler, closeFilterDialog
// } from '../base/constant';
// import { lazyLoadScrollHandler, checkScrollReset, lastRowCellBorderUpdated } from '../base/constant';
// import { ColumnWidthService, useColumnWidthService } from '../services/width-controller';
// // import { Grid } from '../base/grid';
import * as literals from '../base/string-literals';
// import * as events from '../base/constant';

/**
 * @hidden
 */
export interface ScrollCss {
    padding?: 'paddingLeft' | 'paddingRight';
    border?: 'borderLeftWidth' | 'borderRightWidth';
}

export interface Scroll {
    getModuleName(): string;
    // setWidth(uiupdate?: boolean): void;
    // setHeight(): void;
    setPadding(): void;
    // removePadding(rtl?: boolean): void;
    // refresh(): void;
    getCssProperties(rtl?: boolean): void;
    headerContentBorder?: CSSProperties;
    headerPadding?: CSSProperties;
}

/**
 * The `Scroll` module is used to handle scrolling behaviour.
 */
export const useScroll = (parent?: IGrid): Scroll => {
    const [headerPadding, setHeaderPadding] = useState<CSSProperties>({});
    const [headerContentBorder, setHeaderContentBorder] = useState<CSSProperties>({});

    // Properties and methods
    const getModuleName = (): string => {
        return 'scroll';
    };

    // const setWidth = (uiupdate?: boolean): void => {
    //     (parentRef.current.getRootElement?.() as HTMLElement).style.width = formatUnit(parentRef.current.width as string | number);
    //     if (uiupdate) {
    //         widthServiceRef.current.setWidthToColumns();
    //     }
    //     // if ((parentRef.current as Grid).toolbarModule && (parentRef.current as Grid).toolbarModule.toolbar &&
    //     //     (parentRef.current as Grid).toolbarModule.toolbar.element) {
    //     //     const tlbrElement: Element = (parentRef.current as Grid).toolbarModule.toolbar.element;
    //     //     const tlbrLeftElement: Element = tlbrElement.querySelector('.e-toolbar-left') as Element;
    //     //     const tlbrCenterElement: Element = tlbrElement.querySelector('.e-toolbar-center') as Element;
    //     //     const tlbrRightElement: Element = tlbrElement.querySelector('.e-toolbar-right') as Element;
    //     //     const tlbrItems: Element = tlbrElement.querySelector('.e-toolbar-items') as Element;
    //     //     const tlbrLeftWidth: number = tlbrLeftElement ? tlbrLeftElement.clientWidth : 0;
    //     //     const tlbrCenterWidth: number = tlbrCenterElement ? tlbrCenterElement.clientWidth : 0;
    //     //     const tlbrRightWidth: number = tlbrRightElement ? tlbrRightElement.clientWidth : 0;
    //     //     const tlbrItemsWidth: number = tlbrItems ? tlbrItems.clientWidth : 0;
    //     //     const tlbrWidth: number = tlbrElement ? tlbrElement.clientWidth : 0;
    //     //     if (!parentRef.current.enableAdaptiveUI || tlbrLeftWidth > tlbrWidth || tlbrCenterWidth > tlbrWidth || tlbrRightWidth > tlbrWidth ||
    //     //         tlbrItemsWidth > tlbrWidth) {
    //     //         (parentRef.current as Grid).toolbarModule.toolbar.refreshOverflow();
    //     //     }
    //     // }
    // };
    
    // const setHeight = (): void => {
    //     let mHdrHeight: number = 0;
    //     const content: HTMLElement = (parentRef.current.getContent?.().querySelector('.' + literals.content) as HTMLElement);
    //     let height: string | number = parentRef.current.height as string;
    //     if (parentRef.current.enableColumnVirtualization && parentRef.current.isFrozenGrid?.() && parentRef.current.height !== 'auto'
    //         && parentRef.current.height?.toString().indexOf('%') as number < 0) {
    //         height = parseInt(height as string, 10) - getScrollBarWidth();
    //     }
    //     if (!parentRef.current.enableVirtualization && parentRef.current.frozenRows && parentRef.current.height !== 'auto' &&
    //         parentRef.current.height !== '100%') {
    //         const tbody: HTMLElement = (parentRef.current.getHeaderContent?.()
    //             .querySelector(literals.tbody + ':not(.e-masked-tbody)') as HTMLElement);
    //         mHdrHeight = tbody ? tbody.offsetHeight : 0;
    //         if (tbody && mHdrHeight) {
    //             const add: number = tbody.getElementsByClassName(literals.addedRow).length;
    //             const rowHeight: number = add * (parentRef.current.getRowHeight?.() as number);
    //             mHdrHeight -= rowHeight;
    //         } else if (!parentRef.current.isInitialLoad && parentRef.current.loadingIndicator?.indicatorType === 'Shimmer'
    //             && parentRef.current.getHeaderContent?.().querySelector('.e-masked-table')) {
    //             height = parseInt(height as string, 10) - (parentRef.current.frozenRows * (parentRef.current.getRowHeight?.() as number));
    //         }
    //         content.style.height = formatUnit(parseInt(height as string, 10) - mHdrHeight);
    //     } else {
    //         content.style.height = formatUnit(height);
    //     }
    //     ensureOverflow(content);
    //     if (parentRef.current.isFrozenGrid?.()) {
    //         refresh();
    //     }
    // };
    
    const setPadding = useCallback((): void => {
        const scrollWidth: number = getScrollBarWidth() - getThreshold();
        const cssProps: ScrollCss = getCssProperties();
        setHeaderPadding(parent?.enableRtl ? {[cssProps.padding!]: scrollWidth > 0 ? scrollWidth + 'px' : '0px'} : {[cssProps.padding!]: scrollWidth > 0 ? scrollWidth + 'px' : '0px'});
        setHeaderContentBorder(parent?.enableRtl ? {[cssProps.border!]: scrollWidth > 0 ? '1px' : '0px'} : {[cssProps.border!]: scrollWidth > 0 ? '1px' : '0px'});
    }, [parent?.height]);
    
    // const removePadding = (rtl?: boolean): void => {
    //     const cssProps: ScrollCss = getCssProperties(rtl);
    //     const hDiv: HTMLDivElement = (parentRef.current.getHeaderContent?.().querySelector('.' + literals.headerContent) as HTMLDivElement);
    //     (hDiv.style as unknown as {[key: string]: unknown})[cssProps.border as string] = '';
    //     ((hDiv.parentElement as HTMLElement).style as unknown as {[key: string]: unknown})[cssProps.padding as string] = '';
    //     const footerDiv: HTMLDivElement = (parentRef.current.getFooterContent?.() as HTMLDivElement);
    //     if (footerDiv && footerDiv.classList.contains('e-footerpadding')) {
    //         footerDiv.classList.remove('e-footerpadding');
    //     }
    // };
    
    // const refresh = (): void => {
    //     if (parentRef.current.height !== '100%') {
    //         return;
    //     }
    //     const content: HTMLElement = parentRef.current.getContent?.() as HTMLElement;
    //     (parentRef.current.getRootElement?.() as HTMLElement).style.height = '100%';
    //     const height: number = widthServiceRef.current.getSiblingsHeight(content);
    //     content.style.height = 'calc(100% - ' + height + 'px)'; //Set the height to the  '.' + literals.gridContent;
    // };
    
    /**
     * @param {boolean} rtl - specifies the rtl
     * @returns {ScrollCss} returns the ScrollCss
     * @hidden
     */
    const getCssProperties = useCallback((rtl?: boolean): ScrollCss => {
        const css: ScrollCss = {};
        const enableRtl: boolean = (isNullOrUndefined(rtl) ? parent?.enableRtl : rtl) as boolean;
        css.border = enableRtl ? 'borderLeftWidth' : 'borderRightWidth';
        css.padding = enableRtl ? 'paddingLeft' : 'paddingRight';
        return css;
    }, [parent?.enableRtl]);

    const getThreshold = useCallback((): number => {
        /* Some browsers places the scroller outside the content,
         * hence the padding should be adjusted.*/
        const appName: string = Browser.info.name as string;
        if (appName === 'mozilla') {
            return 0.5;
        }
        return 1;
    }, [Browser]);

    /**
     * Function to get the scrollbar width of the browser.
     *
     * @returns {number} return the width
     * @hidden
     */
    const getScrollBarWidth = useCallback((): number => {
        return getUtilScrollBarWidth();
    }, []);

    // // Initialize
    // useEffect(() => {
    //     addEventListener();
    //     return () => {
    //         removeEventListener();
    //     };
    // }, []);

    useEffect(() => {
        console.log('headerContentBorder:', headerContentBorder, 'headerPadding:', headerPadding);
    }, [headerContentBorder, headerPadding])

    // Return public API
    return {
        getModuleName,
        // setWidth,
        // setHeight,
        setPadding,
        // removePadding,
        // refresh,
        getCssProperties,
        headerContentBorder,
        headerPadding
    };
};

// Add static method to Scroll
useScroll.getScrollBarWidth = getUtilScrollBarWidth;
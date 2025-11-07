import { CSSProperties, useCallback, useLayoutEffect, useRef, UIEvent, useMemo, useState, useEffect, RefObject } from 'react';
import { Browser, isNullOrUndefined } from '@syncfusion/react-base';
import { useGridComputedProvider, useGridMutableProvider } from '../contexts';
import { IGrid } from '../types/grid.interfaces';
import { MutableGridSetter, UseScrollResult, ScrollElements, ScrollCss, VirtualRowInfo, VirtualColumnInfo, ContentPanelRef } from '../types/interfaces';
// import { getNormalizedScrollLeft } from '../utils';

/**
 * Custom hook to manage scroll synchronization between header and content panels
 *
 * @private
 * @returns {UseScrollResult} Scroll-related APIs and functions
 */
export const useScroll: <T>(contentPanelRef: ContentPanelRef<T>) => UseScrollResult<T> = <T, >(contentPanelRef: ContentPanelRef<T>): UseScrollResult<T> => {
    const grid: Partial<IGrid<T>> & Partial<MutableGridSetter<T>> = useGridComputedProvider<T>();
    const { height, enableRtl, enableStickyHeader, columns, disableDOMVirtualization, columnBuffer, rowBuffer, rowHeight } = grid;
    const { getParentElement, currentViewData, totalVirtualColumnWidth, setOffsetX, setOffsetY, columnOffsets
        // , setStartColumnIndex
    } = useGridMutableProvider<T>();
    const [scrollStyles, setScrollStyles] = useState<{ headerPadding: CSSProperties; headerContentBorder: CSSProperties; }>({
        headerPadding: {},
        headerContentBorder: {}
    });

    // Use ref to maintain references to DOM elements
    const elementsRef: RefObject<ScrollElements> = useRef<ScrollElements>({
        headerScrollElement: null,
        contentScrollElement: null,
        footerScrollElement: null
    });

    const virtualRowInfo: RefObject<VirtualRowInfo> = useRef<VirtualRowInfo>({
        offsetY: 0,
        startIndex: 0,
        endIndex: currentViewData?.length
    });
    const virtualColumnInfo: RefObject<VirtualColumnInfo> = useRef<VirtualColumnInfo>({
        offsetX: 0,
        startIndex: 0,
        endIndex: columns?.length - 1
    });

    /**
     * Determine CSS properties based on RTL/LTR mode
     *
     * @returns {ScrollCss} CSS properties for scroll customization
     */
    const getCssProperties: ScrollCss = useMemo((): ScrollCss => {
        return {
            border: enableRtl ? 'borderLeftWidth' : 'borderRightWidth',
            padding: enableRtl ? 'paddingLeft' : 'paddingRight'
        };
    }, [enableRtl]);

    /**
     * Get browser-specific threshold for scrollbar calculations
     *
     * @returns {number} Threshold value
     */
    const getThreshold: () => number = useCallback((): number => {
        // Safely access Browser.info with multiple fallbacks
        if (!Browser?.info) { return 1; }
        const browserName: string = Browser.info.name;
        return browserName === 'mozilla' ? 0.5 : 1;
    }, []);

    /**
     * Calculate scrollbar width
     *
     * @returns {number} Width of the scrollbar
     */
    const getScrollBarWidth: () => number = useCallback((): number => {
        const { contentScrollElement } = elementsRef.current;
        if (!contentScrollElement) { return 0; }
        return (contentScrollElement.offsetWidth - contentScrollElement.clientWidth) | 0;
    }, []);

    /**
     * Set padding based on scrollbar width to ensure header and content alignment
     */
    const setPadding: () => void = useCallback((): void => {

        const scrollWidth: number = getScrollBarWidth() - getThreshold();
        const cssProps: ScrollCss = getCssProperties;

        const paddingValue: string = scrollWidth > 0 ? `${scrollWidth}px` : '0px';
        const borderValue: string = scrollWidth > 0 ? '1px' : '0px';

        setScrollStyles({
            headerPadding: { [cssProps.padding]: paddingValue },
            headerContentBorder: { [cssProps.border]: borderValue }
        });
    }, [getScrollBarWidth, getThreshold, getCssProperties]);

    const setSticky: (headerEle: HTMLElement, top?: number, width?: number, left?: number, isAddStickyHeader?: boolean) => void =
        useCallback((headerEle: HTMLElement, top?: number, width?: number, left?: number, isAddStickyHeader?: boolean): void => {
            if (isAddStickyHeader) {
                headerEle.classList.add('sf-sticky');
            } else {
                headerEle.classList.remove('sf-sticky');
            }
            headerEle.style.width = width != null ? width + 'px' : '';
            headerEle.style.top = top != null ? top + 'px' : '';
            headerEle.style.left = left !== null ? left + 'px' : '';
        }, []);

    /**
     * Complete implementation of makeStickyHeader following original component logic exactly
     * This matches the original scroll.ts makeStickyHeader method line by line
     */
    const makeStickyHeader: () => void = useCallback(() => {
        const { contentScrollElement, headerScrollElement } = elementsRef.current;
        if (!getParentElement() || !contentScrollElement) {
            return;
        }

        const gridElement: HTMLElement = getParentElement();
        const contentRect: DOMRect = contentScrollElement.getBoundingClientRect();

        if (!contentRect) {
            return;
        }

        // Handle window scale for proper positioning
        const windowScale: number = window.devicePixelRatio;
        const headerEle: HTMLElement = headerScrollElement?.parentElement;
        const toolbarEle: HTMLElement | null = gridElement.querySelector('.sf-toolbar');

        if (!headerEle) {
            return;
        }

        // Calculate total height including all sticky elements (exact original logic)
        const height: number = headerEle.offsetHeight +
            (toolbarEle ? toolbarEle.offsetHeight : 0);

        const parentTop: number = gridElement.getBoundingClientRect().top;
        let top: number = contentRect.top - (parentTop < 0 ? 0 : parentTop);
        const left: number = contentRect.left;

        // Handle window scale adjustment (from original)
        if (windowScale !== 1) {
            top = Math.ceil(top);
        }

        // Apply sticky positioning when scrolled (exact original logic)
        if (top < height && contentRect.bottom > 0) {
            headerEle.classList.add('sf-sticky');
            let elemTop: number = 0;

            // Handle toolbar sticky positioning (from original)
            if (toolbarEle) {
                setSticky(toolbarEle, elemTop, contentRect.width, left, true);
                elemTop += toolbarEle.getBoundingClientRect().height;
            }

            // Handle main header sticky positioning (from original)
            setSticky(headerEle, elemTop, contentRect.width, left, true);

        } else {
            // Remove sticky positioning when not needed (exact original logic)
            if (headerEle.classList.contains('sf-sticky')) {
                setSticky(headerEle, null, null, null, false);

                if (toolbarEle) {
                    setSticky(toolbarEle, null, null, null, false);
                }
            }
        }
    }, [setSticky, getParentElement]);

    const addEventListener: () => void = useCallback((): void => {
        const scrollableParent: HTMLElement = getScrollbleParent(getParentElement().parentElement);
        if (scrollableParent) {
            window.addEventListener('scroll', makeStickyHeader, { passive: true } as AddEventListenerOptions);
        }
    }, [getParentElement, makeStickyHeader]);

    const removeEventListener: () => void = useCallback((): void => {
        window.removeEventListener('scroll', makeStickyHeader);
    }, [makeStickyHeader]);

    const getScrollbleParent: (node: HTMLElement) => HTMLElement = useCallback((node: HTMLElement): HTMLElement => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parent: HTMLElement = isNullOrUndefined(node.tagName) ? (node as any).scrollingElement : node;
        const overflowY: string = document.defaultView.getComputedStyle(parent, null).overflowY;
        if (parent.scrollHeight > parent.clientHeight && overflowY !== 'visible' ||
            node.tagName === 'HTML' || node.tagName === 'BODY') {
            return node;
        } else {
            return getScrollbleParent(node.parentNode as HTMLElement);
        }
    }, []);

    // Update padding when height or RTL mode changes
    useLayoutEffect(() => {
        if (elementsRef.current.contentScrollElement) {
            setPadding();
        }
    }, [height, enableRtl, setPadding]);

    useEffect(() => {
        if (enableStickyHeader) {
            addEventListener();
        }
        return () => {
            if (enableStickyHeader) {
                removeEventListener();
            }
        };
    }, [enableStickyHeader]);

    /**
     * Set reference to header scroll element
     *
     * @param {HTMLElement | null} element - Header scroll DOM element
     */
    const setHeaderScrollElement: (element: HTMLElement | null) => void = useCallback((element: HTMLElement | null): void => {
        elementsRef.current.headerScrollElement = element;
    }, []);

    /**
     * Set reference to content scroll element
     *
     * @param {HTMLElement | null} element - Content scroll DOM element
     */
    const setContentScrollElement: (element: HTMLElement | null) => void = useCallback((element: HTMLElement | null): void => {
        elementsRef.current.contentScrollElement = element;
    }, []);

    /**
     * Set reference to footer scroll element
     *
     * @param {HTMLElement | null} element - Footer element
     */
    const setFooterScrollElement: (element: HTMLElement | null) => void = useCallback((element: HTMLElement | null): void => {
        elementsRef.current.footerScrollElement = element;
    }, []);

    /**
     * Handle content scroll events and synchronize header scroll position
     * Optimized for immediate synchronization to prevent gridline misalignment
     *
     * @param {UIEvent<HTMLDivElement>} args - Scroll event arguments
     */
    const onContentScroll: (args: UIEvent<HTMLDivElement>) => void = useCallback((args: UIEvent<HTMLDivElement>): void => {
        const { headerScrollElement, footerScrollElement } = elementsRef.current;

        const target: HTMLDivElement = args.target as HTMLDivElement;
        const left: number = target.scrollLeft;
        const top: number = target.scrollTop;
        if (!disableDOMVirtualization) {
            virtualRowInfo.current.offsetY = top;
            virtualColumnInfo.current.offsetX = left;
        }

        // IMMEDIATE synchronization - no requestAnimationFrame delay to prevent gridline misalignment
        if (headerScrollElement) { headerScrollElement.scrollLeft = left; }
        if (footerScrollElement) { footerScrollElement.scrollLeft = left; }

        // Compute start index and offsetX deterministically (same logic), minus console noise
        const averageColumnWidth: number = (totalVirtualColumnWidth / (columns.length === 0 ? 1 : columns.length));
        // const scrollX: number = getNormalizedScrollLeft(target, enableRtl);
        const scrollX: number = Math.abs(target.scrollLeft);
        // const scrollX: number = enableRtl ? (target.scrollWidth - target.clientWidth - target.scrollLeft) : target.scrollLeft;
        const viewPortColumnStartIndex: number = Math.floor(scrollX / (averageColumnWidth === 0 ? 1 : averageColumnWidth));
        const startColumnIndex: number = viewPortColumnStartIndex <= columnBuffer ? 0 : viewPortColumnStartIndex - columnBuffer;
        setOffsetX(enableRtl || grid?.element.classList.contains('sf-rtl') ? -(columnOffsets[startColumnIndex]) : (columnOffsets[startColumnIndex]));
        // setOffsetX(enableRtl || grid?.element.classList.contains('sf-rtl') ? -(startColumnIndex * averageColumnWidth) : (startColumnIndex * averageColumnWidth));
        // setOffsetX(startColumnIndex * averageColumnWidth);
        virtualColumnInfo.current.startIndex = isNaN(startColumnIndex) ? 0 : startColumnIndex;
        const averageRowHeight = (contentPanelRef.totalRenderedRowHeight.current / (contentPanelRef.cachedRowObjects.current.size === 0 ? 1 : contentPanelRef.cachedRowObjects.current.size));
        const viewPortStartIndex = Math.floor(contentPanelRef.contentScrollRef.scrollTop / (averageRowHeight === 0 ? 1 : averageRowHeight));
        const startIndex = viewPortStartIndex <= rowBuffer ? 0 : viewPortStartIndex - rowBuffer;
        // // setOffsetY(startIndex * averageRowHeight);
        // setStartIndex(startIndex);
        virtualRowInfo.current.startIndex = isNaN(startIndex) ? 0 : startIndex;
        setOffsetY(startIndex * averageRowHeight);
    }, [columns, totalVirtualColumnWidth, columnBuffer, rowBuffer, rowHeight, enableRtl, disableDOMVirtualization, contentPanelRef]);

    /**
     * Handle header scroll events and synchronize content scroll position
     * This is especially important for keyboard navigation (tabbing)
     * Optimized for immediate synchronization to prevent gridline misalignment
     *
     * @param {UIEvent<HTMLDivElement>} args - Scroll event arguments
     */
    const onHeaderScroll: (args: UIEvent<HTMLDivElement>) => void = useCallback((args: UIEvent<HTMLDivElement>): void => {
        const { contentScrollElement } = elementsRef.current;

        const target: HTMLDivElement = args.target as HTMLDivElement;
        const left: number = target.scrollLeft;

        // IMMEDIATE synchronization - no requestAnimationFrame delay to prevent gridline misalignment
        contentScrollElement.scrollLeft = left;

        // const averageColumnWidth: number = (totalVirtualColumnWidth / (columns.length === 0 ? 1 : columns.length));
        // const scrollX: number = getNormalizedScrollLeft(target, enableRtl)
        // const viewPortStartIndex: number = Math.floor(scrollX / (averageColumnWidth === 0 ? 1 : averageColumnWidth));
        // const startIndex: number = viewPortStartIndex <= columnBuffer ? 0 : viewPortStartIndex - columnBuffer;
        // virtualColumnInfo.current.startIndex = startIndex;
        // console.log('column header startIndex => ', startIndex);
        // setOffsetX(startIndex * averageColumnWidth);
    }, []);

    /**
     * Handle footer scroll events and synchronize content scroll position
     * This maintains consistency between footer and content scroll positions
     * Optimized for immediate synchronization to prevent gridline misalignment
     *
     * @param {UIEvent<HTMLDivElement>} args - Scroll event arguments
     */
    const onFooterScroll: (args: UIEvent<HTMLDivElement>) => void = useCallback((args: UIEvent<HTMLDivElement>): void => {
        const { contentScrollElement } = elementsRef.current;

        const target: HTMLDivElement = args.target as HTMLDivElement;
        const left: number = target.scrollLeft;

        // IMMEDIATE synchronization - no requestAnimationFrame delay to prevent gridline misalignment
        contentScrollElement.scrollLeft = left;
    }, []);

    // Clean up resources on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            // Clear references to DOM elements
            elementsRef.current = {
                headerScrollElement: null,
                contentScrollElement: null,
                footerScrollElement: null
            };
        };
    }, []);

    // Memoize API objects to prevent unnecessary re-renders
    const publicScrollAPI: Partial<IGrid<T>> = useMemo(() => ({ ...grid }), [grid]);

    const privateScrollAPI: UseScrollResult<T>['privateScrollAPI'] = useMemo(() => ({
        getCssProperties,
        headerContentBorder: scrollStyles.headerContentBorder,
        headerPadding: scrollStyles.headerPadding,
        onContentScroll,
        onHeaderScroll,
        onFooterScroll
    }), [getCssProperties, enableRtl, scrollStyles.headerContentBorder, scrollStyles.headerPadding, onContentScroll, onHeaderScroll, onFooterScroll]);

    const protectedScrollAPI: UseScrollResult<T>['protectedScrollAPI'] = useMemo(() => ({
        setPadding,
        virtualRowInfo: virtualRowInfo.current,
        virtualColumnInfo: virtualColumnInfo.current
    }), [setPadding, virtualRowInfo, virtualColumnInfo]);

    return {
        publicScrollAPI,
        privateScrollAPI,
        protectedScrollAPI,
        setHeaderScrollElement,
        setContentScrollElement,
        setFooterScrollElement
    };
};

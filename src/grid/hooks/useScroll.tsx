import { CSSProperties, useCallback, useLayoutEffect, useRef, UIEvent, useMemo, useState, useEffect, RefObject } from 'react';
import { Browser, isNullOrUndefined } from '@syncfusion/react-base';
import { useGridComputedProvider, useGridMutableProvider } from '../contexts';
import { IGrid } from '../types/grid.interfaces';
import { MutableGridSetter, UseScrollResult, ScrollElements, ScrollCss, VirtualRowInfo, VirtualColumnInfo, ContentPanelRef } from '../types/interfaces';
import { ActionType, PagerArgsInfo, ScrollMode } from '../types';
// import { getNormalizedScrollLeft } from '../utils';

/**
 * Custom hook to manage scroll synchronization between header and content panels
 *
 * @private
 * @returns {UseScrollResult} Scroll-related APIs and functions
 */
export const useScroll: <T>(contentPanelRef: ContentPanelRef<T>) => UseScrollResult<T> = <T, >(contentPanelRef: ContentPanelRef<T>): UseScrollResult<T> => {
    const grid: Partial<IGrid<T>> & Partial<MutableGridSetter<T>> = useGridComputedProvider<T>();
    const { height, enableRtl, enableStickyHeader, columns, rowHeight, virtualizationSettings, pageSettings, setCurrentPage, setGridAction, scrollMode } = grid;
    const { getParentElement, currentViewData, totalVirtualColumnWidth, setOffsetX, totalRecordsCount,
        setOffsetY, columnOffsets } = useGridMutableProvider<T>();
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

    const lastVirtualPageNumber: number = useMemo(() => {
        return Math.ceil(totalRecordsCount/pageSettings.pageSize);
    }, [totalRecordsCount, pageSettings]);

    const virtualRowInfo: RefObject<VirtualRowInfo> = useRef<VirtualRowInfo>({
        offsetY: 0,
        startIndex: 0,
        endIndex: currentViewData?.length,
        virtualModeStartIndex: 0,
        requiredRowsRange: [],
        currentPages: [pageSettings.currentPage],
        previousPages: []
    });
    const virtualColumnInfo: RefObject<VirtualColumnInfo> = useRef<VirtualColumnInfo>({
        offsetX: 0,
        startIndex: 0,
        endIndex: columns?.length - 1
    });
    const ticking = useRef(false);
    const scrollStopTimerRef = useRef<number | null>(null);
    const last = useRef({ left: 0, top: 0, startRow: -1, startCol: -1, offsetX: NaN, offsetY: NaN });

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

    const processPagesSequentially = useCallback((pages: number[], args: PagerArgsInfo) => {
        let index = 0;

        const requestNextPage = () => {
            if (index >= pages.length) return; // Done
            const pageNo = pages[index];
            args.currentPage = pageNo;
            console.log('request pageNo => ', pageNo);
            setCurrentPage(pageNo);
            setGridAction(args);

            // Wait for actionComplete event before continuing
            const onActionComplete = () => {
                grid.element.removeEventListener('virtualScrollSequencialRequest', onActionComplete);
                index++;
                requestAnimationFrame(() => {
                    requestNextPage(); // Trigger next page
                });
            };

            grid.element.addEventListener('virtualScrollSequencialRequest', onActionComplete);
        };

        requestNextPage(); // Start first request
    }, [grid.element]);

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

        // IMMEDIATE synchronization - no requestAnimationFrame delay to prevent gridline misalignment
        if (headerScrollElement) { headerScrollElement.scrollLeft = left; }
        if (footerScrollElement) { footerScrollElement.scrollLeft = left; }

        if (!virtualizationSettings.enableRow && !virtualizationSettings.enableColumn) return;

        // 2) Stash coords; batch work to next frame
        last.current.left = left;
        last.current.top = top;
        if (ticking.current) return;
        ticking.current = true;

        requestAnimationFrame(() => {
            if (virtualizationSettings.enableColumn) {
                // Horizontal window
                // Compute start index and offsetX deterministically (same logic), minus console noise
                const averageColumnWidth: number = (totalVirtualColumnWidth / (columns.length === 0 ? 1 : columns.length));
                const scrollX: number = Math.abs(last.current.left);
                const viewPortColumnStartIndex: number = Math.floor(scrollX / (averageColumnWidth === 0 ? 1 : averageColumnWidth));
                const startColumnIndex: number = viewPortColumnStartIndex <= virtualizationSettings.columnBuffer ? 0 : viewPortColumnStartIndex - virtualizationSettings.columnBuffer;
                // Compute nextOffsetX from your columnOffsets
                const nextOffsetX: number = (enableRtl || grid?.element.classList.contains('sf-rtl'))
                    ? -(columnOffsets[startColumnIndex] ?? 0)
                    : (columnOffsets[startColumnIndex] ?? 0);
                // 3) Update only when values really change
                if (startColumnIndex !== last.current.startCol) {
                    virtualColumnInfo.current.startIndex = isNaN(startColumnIndex) ? 0 : startColumnIndex;
                    last.current.startCol = startColumnIndex;
                    if (nextOffsetX !== last.current.offsetX) {
                        setOffsetX(nextOffsetX);
                        last.current.offsetX = nextOffsetX;
                    }
                }
            }
            if (virtualizationSettings.enableRow) {
                // Vertical window
                const averageRowHeight = (contentPanelRef.totalRenderedRowHeight.current / (contentPanelRef.cachedRowObjects.current.size === 0 ? 1 : contentPanelRef.cachedRowObjects.current.size));
                const viewPortStartIndex = Math.floor(last.current.top / (averageRowHeight === 0 ? 1 : averageRowHeight));
                const startIndex = viewPortStartIndex <= virtualizationSettings.rowBuffer ? 0 : viewPortStartIndex - virtualizationSettings.rowBuffer;
                const nextOffsetY = startIndex * averageRowHeight;
                if (startIndex !== last.current.startRow) {
                    // const diff: number = virtualRowInfo.current.endIndex - virtualRowInfo.current.startIndex;
                    // virtualRowInfo.current.isAppendOrInsert = startIndex > last.current.startRow ? 'append' : 'insert';
                    virtualRowInfo.current.startIndex = isNaN(startIndex) ? 0 : startIndex;
                    last.current.startRow = startIndex;
                    if (nextOffsetY !== last.current.offsetY) {
                        setOffsetY(nextOffsetY);
                        last.current.offsetY = nextOffsetY;

                        /**
                         * Handles virtual scrolling data updates and page state changes.
                         * Combines cache pruning, view data update, and sequential page state updates.
                         */
                        if (scrollMode === ScrollMode.Virtual) {
                            if (scrollStopTimerRef.current) {
                                clearTimeout(scrollStopTimerRef.current);
                            }

                            scrollStopTimerRef.current = window.setTimeout(() => {
                                const [startRow, endRow] = virtualRowInfo.current.requiredRowsRange;
                                if (isNullOrUndefined(startRow) && isNullOrUndefined(endRow)) { return; }
                                const pageSize = pageSettings.pageSize;

                                // Calculate start and end pages based on row range
                                const startPage = Math.floor(((startRow ?? endRow) - (virtualizationSettings.rowBuffer)) / pageSize) + 1;
                                const endPage = Math.floor(((endRow ?? startRow) + (virtualizationSettings.rowBuffer)) / pageSize) + 1;

                                // Prepare pager arguments
                                const args: PagerArgsInfo = {
                                    cancel: false,
                                    currentPage: pageSettings.currentPage,
                                    previousPage: pageSettings.currentPage,
                                    requestType: ActionType.Paging,
                                    type: 'pageChanging'
                                };

                                // Determine pages to load
                                let newPages: number[] = [];
                                if (startPage === endPage) {
                                    // Single page scenario
                                    newPages = [startPage];
                                    args.currentPage = startPage;
                                    // virtualRowInfo.current.isAppendOrInsert = undefined;
                                } else {
                                    // Multiple pages scenario
                                    for (let pageNo = startPage; pageNo <= endPage; pageNo++) {
                                        newPages.push(pageNo);
                                    }
                                    // Direction-aware append/insert
                                    // virtualRowInfo.current.isAppendOrInsert = startPage > pageSettings.currentPage ? 'append' : 'insert';
                                    args.currentPage = endPage; // Last page for reference
                                }

                                const currentPagesString: string = JSON.stringify(virtualRowInfo.current.currentPages);
                                const newPagesString: string = JSON.stringify(newPages);
                                if (currentPagesString === newPagesString) { return; }

                                virtualRowInfo.current.previousPages = [...virtualRowInfo.current.currentPages];

                                // Update currentPages list
                                virtualRowInfo.current.currentPages = newPages;
                                console.log('currentLoadedViewPages => ', virtualRowInfo.current.currentPages);

                                const requestNewPages: number[] = [...newPages.filter((page: number) => !virtualRowInfo.current.previousPages.includes(page))];
                                /**
                                 * Sequentially update currentPage for combined page view.
                                 * Multiple requestAnimationFrame calls are intentional for UX consistency.
                                 */
                                processPagesSequentially(requestNewPages, args);
                                // for (const pageNo of requestNewPages) {
                                //     requestAnimationFrame(() => {
                                //         args.currentPage = pageNo;
                                //         console.log('request pageNo => ', pageNo);
                                //         setCurrentPage(pageNo);
                                //         setGridAction(args);
                                //     });
                                // }
                            }, 150); // Debounce delay
                        }
                    }
                }
            }
            ticking.current = false;
        });
    }, [columns, totalVirtualColumnWidth, rowHeight, enableRtl, virtualizationSettings, contentPanelRef, pageSettings, totalRecordsCount, currentViewData]);

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
        virtualColumnInfo: virtualColumnInfo.current,
        lastVirtualPageNumber,
        // virtualPageChange
    }), [setPadding, virtualRowInfo, virtualColumnInfo, lastVirtualPageNumber]); //, virtualPageChange

    return {
        publicScrollAPI,
        privateScrollAPI,
        protectedScrollAPI,
        setHeaderScrollElement,
        setContentScrollElement,
        setFooterScrollElement
    };
};

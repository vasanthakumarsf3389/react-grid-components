import {
    forwardRef,
    ForwardRefExoticComponent,
    RefAttributes,
    useImperativeHandle,
    useRef,
    useMemo,
    memo,
    CSSProperties,
    RefObject,
    JSX,
    ReactElement,
    useState
} from 'react';
import { ContentTableBase } from './index';
import {
    ContentPanelRef,
    IContentPanelBase,
    ContentTableRef,
    ScrollMode
} from '../types';
import {
    useGridComputedProvider,
    useGridMutableProvider
} from '../contexts';
import { formatUnit } from '@syncfusion/react-base';

// CSS class constants following enterprise naming convention
const CSS_CONTENT_TABLE: string = 'sf-grid-table';
const CSS_VIRTUAL_TABLE: string = 'sf-virtualtable';
const CSS_VIRTUAL_TRACK: string = 'sf-virtualtrack';

/**
 * Default styles for content table to ensure consistent rendering
 *
 * @type {CSSProperties}
 */
const DEFAULT_TABLE_STYLE: CSSProperties = {
    borderCollapse: 'separate',
    borderSpacing: '0.25px'
};

const ABSOLUTE_FILL: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
};

/**
 * ContentPanelBase component renders the scrollable grid content area
 *
 * @component
 * @private
 * @param {Partial<IContentPanelBase>} props - Component properties
 * @param {object} props.panelAttributes - Attributes to apply to the content panel container
 * @param {object} props.scrollContentAttributes - Attributes to apply to the scrollable content container
 * @param {RefObject<ContentPanelRef>} ref - Forwarded ref to expose internal elements and methods
 * @returns {JSX.Element} The rendered grid content wrapper
 */
const ContentPanelBase: <T>(props: Partial<IContentPanelBase> & RefAttributes<ContentPanelRef<T>>) => ReactElement =
    memo(forwardRef<ContentPanelRef, Partial<IContentPanelBase>>(
        <T, >(props: Partial<IContentPanelBase>, ref: RefObject<ContentPanelRef<T>>) => {
            const { panelAttributes, scrollContentAttributes } = props;
            const { id, height, virtualizationSettings, scrollMode } = useGridComputedProvider<T>();
            const { currentViewData, offsetY, offsetX, totalVirtualColumnWidth, dataModule, totalRecordsCount } = useGridMutableProvider<T>();
            const [columnClientWidth, setColumnClientWidth] = useState<number>(0);

            // Refs for DOM elements and child components
            const contentPanelRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
            const contentScrollRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
            const contentTableRef: RefObject<ContentTableRef<T>> = useRef<ContentTableRef<T>>(null);

            const virtualHeight: number = useMemo(() => {
                const totalRows = (scrollMode === ScrollMode.Virtual ? totalRecordsCount : currentViewData?.length) || 0; // && dataModule.isRemote()
                const averageRowHeight: number = (contentTableRef.current?.totalRenderedRowHeight.current / contentTableRef.current?.cachedRowObjects.current.size);
                const totalH: number = totalRows * (isNaN(averageRowHeight) ? 1 : averageRowHeight);
                return totalH;
            }, [currentViewData, contentTableRef.current?.totalRenderedRowHeight.current, contentTableRef.current?.cachedRowObjects.current.size, scrollMode, dataModule, totalRecordsCount]);

            /**
             * Expose internal elements and methods through the forwarded ref
             * Only define properties specific to ContentPanel and forward ContentTable properties
             */
            useImperativeHandle(ref, () => ({
                // ContentPanel specific properties
                contentPanelRef: contentPanelRef.current,
                contentScrollRef: contentScrollRef.current,

                // Forward all properties from ContentTable
                ...(contentTableRef.current as ContentTableRef<T>)
            }), [contentPanelRef.current, contentScrollRef.current, contentTableRef.current]);

            /**
             * Memoized content table component to prevent unnecessary re-renders
             */
            const contentTable: JSX.Element = useMemo(() => (
                <ContentTableBase<T>
                    ref={(ref: ContentTableRef<T>) => {
                        contentTableRef.current = ref;
                        setColumnClientWidth(ref?.columnClientWidth);
                    }}
                    className={CSS_CONTENT_TABLE}
                    role="presentation"
                    id={`${id}_content_table`}
                    style={DEFAULT_TABLE_STYLE}
                />
            ), [id]);

            const virtualWrapperStyle: CSSProperties = useMemo(() => ({
                ...ABSOLUTE_FILL,
                maxHeight: formatUnit(height),
                transform: `translate3d(${offsetX || 0}px, ${offsetY || 0}px, 0)`,
                width: columnClientWidth
            }), [height, offsetY, offsetX, contentScrollRef.current?.clientWidth, columnClientWidth]);

            const virtualTrackStyle: CSSProperties = useMemo(() => ({
                position: 'relative',
                height: virtualHeight || formatUnit(height),
                width: totalVirtualColumnWidth || undefined
            }), [virtualHeight, totalVirtualColumnWidth, height, columnClientWidth]);

            return (
                <div
                    {...panelAttributes}
                    ref={contentPanelRef}
                >
                    <div
                        ref={contentScrollRef}
                        {...scrollContentAttributes}
                        // style={{ ...scrollContentAttributes?.style }}
                    >
                        { !virtualizationSettings.enableRow && !virtualizationSettings.enableColumn ? (
                            contentTable
                        ) : (
                            <>
                                <div className={CSS_VIRTUAL_TRACK} style={virtualTrackStyle} />
                                <div className={CSS_VIRTUAL_TABLE} style={virtualWrapperStyle}>
                                    {contentTable}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        }
    ), (prevProps: Partial<IContentPanelBase>, nextProps: Partial<IContentPanelBase>) => {
        // Custom comparison function for memo to prevent unnecessary re-renders
        // Only re-render if styles have changed
        const prevStyle: CSSProperties = prevProps.scrollContentAttributes?.style;
        const nextStyle: CSSProperties = nextProps.scrollContentAttributes?.style;
        const isBusyEqual: boolean = prevProps.scrollContentAttributes?.['aria-busy'] === nextProps.scrollContentAttributes?.['aria-busy'];
        prevProps.panelAttributes.className = nextProps.panelAttributes.className;

        // Deep comparison of style objects
        const stylesEqual: boolean = JSON.stringify(prevStyle) === JSON.stringify(nextStyle);

        return stylesEqual && isBusyEqual;
    }) as <T>(props: Partial<IContentPanelBase> & RefAttributes<ContentPanelRef<T>>) => ReactElement;

/**
 * Set display name for debugging purposes
 */
(ContentPanelBase as ForwardRefExoticComponent<Partial<IContentPanelBase> & RefAttributes<ContentPanelRef>>).displayName = 'ContentPanelBase';

/**
 * Export the ContentPanelBase component for use in other components
 *
 * @private
 */
export { ContentPanelBase };

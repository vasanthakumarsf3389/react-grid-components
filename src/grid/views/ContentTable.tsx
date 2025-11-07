import {
    forwardRef,
    ForwardRefExoticComponent,
    RefAttributes,
    useImperativeHandle,
    useRef,
    useMemo,
    memo,
    JSX,
    RefObject,
    ReactElement,
    useState
} from 'react';
import { ContentRowsBase } from './index';
import {
    ContentTableRef,
    IContentTableBase,
    ContentRowsRef
} from '../types/interfaces';
import {
    useGridComputedProvider,
    useGridMutableProvider
} from '../contexts';
import { parseUnit } from '../utils';

/**
 * ContentTableBase component renders the table structure for grid content
 *
 * @component
 * @private
 * @param {Partial<IContentTableBase>} props - Component properties
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} [props.role] - ARIA role attribute
 * @param {string} [props.id] - ID attribute for the table
 * @param {Object} [props.style] - Inline styles for the table
 * @param {RefObject<ContentTableRef>} ref - Forwarded ref to expose internal elements and methods
 * @returns {JSX.Element} The rendered content table component
 */
const ContentTableBase: <T>(props: Partial<IContentTableBase> & RefAttributes<ContentTableRef<T>>) => ReactElement =
    memo(forwardRef<ContentTableRef, Partial<IContentTableBase>>(
        <T, >(props: Partial<IContentTableBase>, ref: RefObject<ContentTableRef<T>>) => {
            // Access grid context providers
            const { colElements: ColElements, offsetX } = useGridMutableProvider<T>();
            const { id
                , disableDOMVirtualization
                , scrollModule,
                // virtualColGroupElements
            } = useGridComputedProvider<T>();

            // Refs for DOM elements and child components
            const contentTableRef: RefObject<HTMLTableElement | null>  = useRef<HTMLTableElement>(null);
            const rowSectionRef: RefObject<ContentRowsRef<T> | null> = useRef<ContentRowsRef<T>>(null);
            const [forceRerender, setForceRerender] = useState({});
            const totalWidth = useRef(0);
            /**
             * Memoized colgroup element to prevent unnecessary re-renders
             * Contains column definitions for the table
             */
            const colGroupContent: JSX.Element = useMemo(() => {
                console.log('content colGroupContent => ', scrollModule?.virtualColumnInfo.startIndex, scrollModule?.virtualColumnInfo.endIndex);

                let visibleCols: JSX.Element[] = [];

                if (ColElements.length) {
                    if (disableDOMVirtualization) {
                        visibleCols = ColElements;
                    } else {
                        const startIndex: number = scrollModule?.virtualColumnInfo?.startIndex ?? 0;
                        const endIndex: number = scrollModule?.virtualColumnInfo?.endIndex ?? ColElements.length;
                        totalWidth.current = 0;
                        for (let i = startIndex; i < endIndex; i++) {
                            const col = ColElements[i];
                            visibleCols.push(col);

                            // Optional: If you ever need cumulative width, you can calculate here
                            const styleWidth: number = col?.props?.style?.width;
                            totalWidth.current += parseUnit(styleWidth);
                        }
                    }
                }

                return (
                    <colgroup
                        key={`content-${id}-colgroup`}
                        id={`content-${id}-colgroup`}
                    >
                        {visibleCols.length > 0 ? visibleCols : null}
                    </colgroup>
                );
            }, [
                ColElements,
                id,
                offsetX,
                disableDOMVirtualization,
                scrollModule?.virtualColumnInfo?.startIndex,
                scrollModule?.virtualColumnInfo?.endIndex,
                forceRerender, totalWidth.current
            ]);
            // const colGroupContent: JSX.Element = useMemo<JSX.Element>(() => {
            //     console.log('content colGroupContent => ', scrollModule?.virtualColumnInfo.startIndex, scrollModule?.virtualColumnInfo.endIndex);
            //     return (
            //     <colgroup
            //         key={`content-${id}-colgroup`}
            //         id={`content-${id}-colgroup`}
            //     >
            //         {ColElements.length ? (disableDOMVirtualization ? ColElements : ColElements.slice(scrollModule?.virtualColumnInfo.startIndex, scrollModule?.virtualColumnInfo.endIndex)) : null}
            //     </colgroup>
            // )}, [ColElements, id, offsetX, virtualColGroupElements, scrollModule?.virtualColumnInfo.startIndex, scrollModule?.virtualColumnInfo.endIndex, forceRerender]);

            /**
             * Expose internal elements and methods through the forwarded ref
             * Only define properties specific to ContentTable and forward ContentRows properties
             */
            useImperativeHandle(ref, () => ({
                // ContentTable specific properties
                contentTableRef: contentTableRef.current,
                getContentTable: () => contentTableRef.current,
                columnClientWidth: totalWidth.current,
                // Forward all properties from ContentRows
                ...(rowSectionRef.current)
            }), [contentTableRef.current, rowSectionRef.current, totalWidth.current]);

            /**
             * Memoized content rows component to prevent unnecessary re-renders
             */
            const contentRows: JSX.Element = useMemo(() => (
                <ContentRowsBase<T>
                    ref={(ref: ContentRowsRef<T>) => {
                        rowSectionRef.current = ref;
                        setForceRerender({});
                    }}
                    role="rowgroup"
                />
            ), []);

            return (
                <table
                    ref={contentTableRef}
                    {...props}
                >
                    {colGroupContent}
                    {contentRows}
                </table>
            );
        }
    )) as <T>(props: Partial<IContentTableBase> & RefAttributes<ContentTableRef<T>>) => ReactElement;

/**
 * Set display name for debugging purposes
 */
(ContentTableBase as ForwardRefExoticComponent<Partial<IContentTableBase> & RefAttributes<ContentTableRef>>).displayName = 'ContentTableBase';

/**
 * Export the ContentTableBase component for use in other components
 *
 * @private
 */
export { ContentTableBase };

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
    useState
} from 'react';
import { HeaderRowsBase } from './index';
import {
    HeaderRowsRef,
    HeaderTableRef,
    IHeaderTableBase
} from '../types';
import {
    useGridComputedProvider,
    useGridMutableProvider
} from '../contexts';
import { parseUnit } from '../utils';

/**
 * HeaderTableBase component renders the table structure for grid headers
 *
 * @component
 * @private
 * @param {Partial<IHeaderTableBase>} props - Component properties
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} [props.role] - ARIA role attribute
 * @param {Object} [props.style] - Inline styles for the table
 * @param {RefObject<HeaderTableRef>} ref - Forwarded ref to expose internal elements and methods
 * @returns {JSX.Element} The rendered header table component
 */
const HeaderTableBase: ForwardRefExoticComponent<Partial<IHeaderTableBase> & RefAttributes<HeaderTableRef>> =
    memo(forwardRef<HeaderTableRef, Partial<IHeaderTableBase>>(
        (props: Partial<IHeaderTableBase>, ref: RefObject<HeaderTableRef>) => {
            // Access grid context providers
            const { colElements: ColElements, offsetX
                // , virtualColGroupElements
            } = useGridMutableProvider();
            const { id, scrollModule
                , disableDOMVirtualization
            } = useGridComputedProvider();

            // Refs for DOM elements and child components
            const headerTableRef: RefObject<HTMLTableElement> = useRef<HTMLTableElement>(null);
            const rowSectionRef: RefObject<HeaderRowsRef> = useRef<HeaderRowsRef>(null);
            const [forceRerender, setForceRerender] = useState({});
            const totalWidth = useRef(0);

            /**
             * Memoized colgroup element to prevent unnecessary re-renders
             * Contains column definitions for the table
             */
            const colGroupContent: JSX.Element = useMemo(() => {
                // console.log('header colGroupContent => ', scrollModule?.virtualColumnInfo.startIndex, scrollModule?.virtualColumnInfo.endIndex);

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
            //     console.log('header colGroupContent => ', scrollModule?.virtualColumnInfo.startIndex, scrollModule?.virtualColumnInfo.endIndex);
            //     return (
            //     <colgroup
            //         key={`${id}-colgroup`}
            //         id={`${id}-colgroup`}
            //     >
            //         {/* {virtualColGroupElements?.length ? virtualColGroupElements : null} */}
            //         {ColElements.length ? (disableDOMVirtualization ? ColElements : ColElements.slice(scrollModule?.virtualColumnInfo.startIndex, scrollModule?.virtualColumnInfo.endIndex)) : null}
            //     </colgroup>
            // )}, [ColElements, id, offsetX, virtualColGroupElements, scrollModule?.virtualColumnInfo.startIndex, scrollModule?.virtualColumnInfo.endIndex, forceRerender]);

            /**
             * Expose internal elements and methods through the forwarded ref
             */
            useImperativeHandle(ref, () => ({
                headerTableRef: headerTableRef.current,
                getHeaderTable: () => headerTableRef.current,
                columnClientWidth: totalWidth.current,
                ...(rowSectionRef.current)
            }), [headerTableRef.current, rowSectionRef.current, totalWidth.current]);

            /**
             * Memoized header rows component to prevent unnecessary re-renders
             */
            const headerRows: JSX.Element = useMemo(() => (
                <HeaderRowsBase
                    ref={(ref: HeaderRowsRef) => {
                        rowSectionRef.current = ref;
                        setForceRerender({});
                    }}
                    role="rowgroup"
                />
            ), []);

            return (
                <table
                    ref={headerTableRef}
                    {...props}
                >
                    {colGroupContent}
                    {headerRows}
                </table>
            );
        }
    ));

/**
 * Set display name for debugging purposes
 */
HeaderTableBase.displayName = 'HeaderTableBase';

/**
 * Export the HeaderTableBase component for use in other components
 *
 * @private
 */
export { HeaderTableBase };

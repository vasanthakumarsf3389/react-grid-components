import {
    forwardRef,
    useImperativeHandle,
    useRef,
    RefAttributes,
    ForwardRefExoticComponent,
    ReactElement,
    useMemo,
    useCallback,
    memo,
    isValidElement,
    Children,
    JSX,
    ReactNode,
    RefObject,
    useEffect,
    SetStateAction,
    Dispatch,
    ComponentType,
    useState
} from 'react';
import {
    ContentRowsRef,
    ICell,
    IContentRowsBase,
    IRow,
    RowRef,
    CellTypes, RenderType,
    ScrollMode
    // ActionType,
    // PagerArgsInfo
} from '../types';
import { ColumnProps, ColumnTemplateProps, IColumnBase } from '../types/column.interfaces';
import { EditFormTemplate, InlineEditFormRef } from '../types/edit.interfaces';
import { useGridComputedProvider, useGridMutableProvider } from '../contexts';
import { ColumnBase, RowBase } from '../components';
import { IL10n, isNullOrUndefined } from '@syncfusion/react-base';
import { getUid
    // , parseUnit
    // , parseUnit
} from '../utils';
import { InlineEditForm } from './index';
import { ColumnsChildren, ValueType } from '../types/interfaces';
const CSS_EMPTY_ROW: string = 'sf-empty-row';
const CSS_DATA_ROW: string = 'sf-grid-content-row';
const CSS_ALT_ROW: string = 'sf-alt-row';

/**
 * RenderEmptyRow component displays when no data is available
 *
 * @component
 * @private
 * @returns {JSX.Element} The rendered empty row component
 */
function RenderEmptyRow<T>(): JSX.Element {
    const { serviceLocator, emptyRecordTemplate } = useGridComputedProvider<T>();
    const localization: IL10n = serviceLocator?.getService<IL10n>('localization');
    const { columnsDirective } = useGridMutableProvider();

    /**
     * Calculate the number of columns to span the empty message
     */
    const columnsLength: number = useMemo(() => {
        const children: ReactNode = (columnsDirective.props as ColumnsChildren<T>).children;
        return Children.count(children);
    }, [columnsDirective]);

    const rowRef: RefObject<RowRef<T>> = useRef<RowRef<T>>(null);

    /**
     * Render the empty row template based on configuration
     */
    const renderEmptyTemplate: ComponentType<void> | ReactElement | string = useMemo(() => {
        if (isNullOrUndefined(emptyRecordTemplate)) {
            return <>{localization?.getConstant('noRecordsMessage')}</>;
        } else if (typeof emptyRecordTemplate === 'string' || isValidElement(emptyRecordTemplate)) {
            return emptyRecordTemplate;
        } else {
            return emptyRecordTemplate;
        }
    }, [emptyRecordTemplate, localization]);

    return (
        <>
            {useMemo(() => (
                <RowBase<T>
                    ref={rowRef}
                    key="empty-row"
                    row={{ rowIndex: 0, uid: 'empty-row-uid' }}
                    rowType={RenderType.Content}
                    role="row"
                    className={CSS_EMPTY_ROW}
                >
                    <ColumnBase<T>
                        key="empty-cell"
                        index={0}
                        uid='empty-cell-uid'
                        customAttributes={{
                            style: { left: '0px' },
                            colSpan: columnsLength,
                            tabIndex: 0 // Make the empty cell focusable
                        }}
                        template={renderEmptyTemplate as ComponentType<ColumnTemplateProps<T>> | ReactElement | string}
                    />
                </RowBase>
            ), [columnsLength, renderEmptyTemplate])}
        </>
    );
}

/**
 * Set display name for debugging purposes
 */
RenderEmptyRow.displayName = 'RenderEmptyRow';
/**
 * ContentRowsBase component renders the data rows within the table body section
 *
 * @component
 * @private
 * @param {Partial<IContentRowsBase>} props - Component properties
 * @param {RefObject<ContentRowsRef>} ref - Forwarded ref to expose internal elements and methods
 * @returns {JSX.Element} The rendered tbody element with data rows
 */
const ContentRowsBase: <T>(props: Partial<IContentRowsBase> & RefAttributes<ContentRowsRef<T>>) => ReactElement =
    memo(forwardRef<ContentRowsRef, Partial<IContentRowsBase>>(
        <T, >(_props: Partial<IContentRowsBase>, ref: RefObject<ContentRowsRef<T>>) => {
            const { columnsDirective, currentViewData, virtualCachedViewData, editModule, uiColumns, offsetY } = useGridMutableProvider<T>();
            const { rowHeight, enableAltRow, columns, rowTemplate, getRowHeight, scrollModule, virtualizationSettings, scrollMode, pageSettings,
                sortSettings, filterSettings, searchSettings
             } = useGridComputedProvider<T>();

            // Refs for DOM elements and child components
            const contentSectionRef: RefObject<HTMLTableSectionElement> = useRef<HTMLTableSectionElement>(null);
            const rowsObjectRef: RefObject<IRow<ColumnProps<T>>[]> = useRef<IRow<ColumnProps<T>>[]>([]);
            const rowElementRefs: RefObject<HTMLTableRowElement[] | HTMLCollectionOf<HTMLTableRowElement>> =
                useRef<HTMLTableRowElement[] | HTMLCollectionOf<HTMLTableRowElement>>([]);
            const addInlineFormRef: RefObject<InlineEditFormRef<T>> = useRef<InlineEditFormRef<T>>(null);
            const editInlineFormRef: RefObject<InlineEditFormRef<T>> = useRef<InlineEditFormRef<T>>(null);
            const cachedRowObjects: RefObject<Map<number | string, IRow<ColumnProps<T>>>> = useRef<(Map<number | string, IRow<ColumnProps<T>>>)>(new Map());
            const totalRenderedRowHeight: RefObject<number> = useRef<number>(0);
            const [_requireMoreVirtualRowsForceRefresh, setRequireMoreVirtualRowsForceRefresh] = useState<Object>({})

            /**
             * Returns the collection of content row elements
             *
             * @returns {HTMLCollectionOf<HTMLTableRowElement> | undefined} Collection of row elements
             */
            const getRows: () => HTMLCollectionOf<HTMLTableRowElement> | undefined = useCallback(() => {
                return rowElementRefs.current as HTMLCollectionOf<HTMLTableRowElement>;
            }, [contentSectionRef.current?.children]);

            /**
             * Returns the row options objects with DOM element references
             *
             * @returns {IRow<ColumnProps>[]} Array of row options objects with element references
             */
            const getRowsObject: () => IRow<ColumnProps<T>>[] = useCallback(() => rowsObjectRef.current, [rowsObjectRef.current]);

            /**
             * Gets a row by index.
             *
             * @param  {number} index - Specifies the row index.
             * @returns {HTMLTableRowElement} returns the element
             */
            const getRowByIndex: (index: number) => HTMLTableRowElement = useCallback((index: number) =>  {
                return !isNullOrUndefined(index) ? getRows()[parseInt(index.toString(), 10)] : undefined;
            }, []);

            /**
             * @param {string} uid - Defines the uid
             * @returns {IRow<ColumnProps>} Returns the row object
             * @private
             */
            const getRowObjectFromUID: (uid: string) => IRow<ColumnProps<T>> = useCallback((uid: string) => {
                const rows: IRow<ColumnProps<T>>[] = getRowsObject() as IRow<ColumnProps<T>>[];
                if (rows) {
                    for (const row of rows) {
                        if (row.uid === uid) {
                            return row;
                        }
                    }
                }
                return null;
            }, []);

            /**
             * Expose internal elements and methods through the forwarded ref
             * Only define properties specific to ContentRows
             */
            useImperativeHandle(ref, () => ({
                contentSectionRef: contentSectionRef.current,
                getRows,
                getRowsObject,
                getRowByIndex,
                getRowObjectFromUID,
                getCurrentViewRecords: () => currentViewData,
                addInlineRowFormRef: addInlineFormRef,
                editInlineRowFormRef: editInlineFormRef,
                cachedRowObjects,
                totalRenderedRowHeight,
                setRequireMoreVirtualRowsForceRefresh
            }), [getRows, getRowsObject, getRowByIndex, getRowObjectFromUID, cachedRowObjects,
                currentViewData, addInlineFormRef.current, editInlineFormRef.current, totalRenderedRowHeight, setRequireMoreVirtualRowsForceRefresh]);

            /**
             * Memoized empty row component to display when no data is available
             */
            const emptyRowComponent: JSX.Element | null = useMemo(() => {
                if (!columnsDirective || !currentViewData || currentViewData.length === 0) {
                    return <RenderEmptyRow<T> />;
                }
                return null;
            }, [columnsDirective, currentViewData]);

            /**
             * Callback to store row element references directly in the row object
             *
             * @param {number} index - Row index
             * @param {HTMLTableRowElement} element - Row DOM element
             */
            const storeRowRef: (index: number, element: HTMLTableRowElement, cellRef: ICell<ColumnProps<T>>[],
                setRowObject: Dispatch<SetStateAction<IRow<ColumnProps<T>>>>) => void =
                useCallback((index: number, element: HTMLTableRowElement, cellRef: ICell<ColumnProps<T>>[],
                             setRowObject: Dispatch<SetStateAction<IRow<ColumnProps<T>>>>) => {
                    // Directly update the element reference in the row object
                    rowsObjectRef.current[index as number].element = element;
                    rowElementRefs.current[index as number] = element;
                    rowsObjectRef.current[index as number].cells = cellRef;
                    rowsObjectRef.current[index as number].setRowObject = setRowObject;
                    rowsObjectRef.current[index as number].height = Math.ceil(element.getBoundingClientRect().height);
                    cachedRowObjects.current.set(rowsObjectRef.current[index as number].uid, {...cachedRowObjects.current.get(rowsObjectRef.current[index as number].uid), height: rowsObjectRef.current[index as number].height});
                    if (!cachedRowObjects.current.has(rowsObjectRef.current[index as number]?.uid)) {
                        totalRenderedRowHeight.current += rowsObjectRef.current[index as number].height;
                    }
                    else if (cachedRowObjects.current.get(rowsObjectRef.current[index as number]?.uid).height !== rowsObjectRef.current[index as number]?.height) {
                        totalRenderedRowHeight.current = (totalRenderedRowHeight.current - cachedRowObjects.current.get(rowsObjectRef.current[index as number]?.uid).height) + rowsObjectRef.current[index as number]?.height;
                    }
                }, []);


            const inlineAddForm: JSX.Element = useMemo(() => {
                const options: IRow<ColumnProps<T>> = {
                    uid: getUid('grid-add-row'),
                    data: editModule?.originalData,
                    rowIndex: editModule?.editSettings?.newRowPosition === 'Top' ? 0 : currentViewData?.length, // Critical: Use original data index for proper tracking
                    isDataRow: false
                };
                // Enhanced check for showAddNewRow functionality
                // This ensures add form is properly visible in all scenarios
                const showAddForm: boolean = editModule?.editSettings?.allowAdd &&
                    (editModule?.editSettings?.showAddNewRow ||
                    (!options.data && editModule?.isEdit));

                return showAddForm ? (
                    <InlineEditForm<T>
                        ref={addInlineFormRef}
                        key={`add-edit-${options.uid}`}
                        stableKey={`add-edit-${options.uid}-${editModule?.editRowIndex}`}
                        isAddOperation={true}
                        columns={uiColumns ?? columns as ColumnProps<T>[]}
                        editData={editModule?.editData}
                        validationErrors={editModule?.validationErrors || {}}
                        editRowIndex={options.rowIndex}
                        rowUid={options.uid}
                        // Properly handle disabled state for showAddNewRow inputs
                        // This ensures inputs are disabled during data row editing and re-enabled after
                        disabled={editModule?.isShowAddNewRowDisabled}
                        onFieldChange={(field: string, value: ValueType | null) => {
                            if (editModule?.updateEditData) {
                                editModule?.updateEditData?.(field, value);
                            }
                        }}
                        onSave={() => editModule?.saveDataChanges()}
                        onCancel={editModule?.cancelDataChanges}
                        template={editModule?.editSettings?.template as React.ComponentType<EditFormTemplate<T>>}
                    />
                ) : <></>;
            }, [
                columnsDirective, currentViewData?.length, rowHeight,
                editModule?.isEdit,
                editModule?.editRowIndex,
                editModule?.isShowAddNewRowActive,
                editModule?.isShowAddNewRowDisabled,
                editModule?.showAddNewRowData,
                editModule?.editSettings?.newRowPosition,
                editModule?.editSettings?.template
            ]);

            const generateCell: () => IRow<ColumnProps<T>>[] = useCallback((): IRow<ColumnProps<T>>[] => {
                const cells: ICell<IColumnBase<T>>[] = [];
                const childrenArray: ReactElement<IColumnBase<T>>[] = columns as ReactElement<IColumnBase<T>>[];
                for (let index: number = 0; index < childrenArray.length; index++) {
                    const child: ColumnProps<T> = childrenArray[index as number] as ColumnProps<T>;
                    const option: ICell<IColumnBase<T>> = {
                        visible: child.visible !== false,
                        isDataCell: !isNullOrUndefined(child.field),
                        isTemplate: !isNullOrUndefined(child.template),
                        rowID: child.uid,
                        column: child,
                        cellType: CellTypes.Data,
                        colSpan: 1
                    };
                    cells.push(option);
                }
                return cells;
            }, [columns]);

            useMemo(() => {
                totalRenderedRowHeight.current = 0;
                rowsObjectRef.current = [];
                cachedRowObjects.current.clear();
            }, [filterSettings?.columns, filterSettings?.columns.length, sortSettings?.columns, sortSettings?.columns.length,  searchSettings?.value]);

            useMemo(() => {
                if (scrollMode === ScrollMode.Virtual) {
                    if (virtualizationSettings.enableCache) {return;}

                    // Remove all not in view pages cached rowObjects
                    const previousPages = scrollModule?.virtualRowInfo?.previousPages ?? [];
                    const currentPages = scrollModule?.virtualRowInfo?.currentPages ?? [];

                    // Find removed pages
                    const removedPages = previousPages.filter(page => !currentPages.includes(page));

                    if (removedPages.length > 0) {
                        const pageSize = pageSettings.pageSize;

                        // Collect all keys to remove in one pass
                        const keysToRemove = new Set<string>();
                        for (const page of removedPages) {
                            const startIndex = (page - 1) * pageSize;
                            const endIndex = startIndex + pageSize;
                            for (let i = startIndex; i < endIndex; i++) {
                                keysToRemove.add(`grid-row-${i}`);
                            }
                        }

                        // Clear cachedRowObjects in one pass
                        keysToRemove.forEach(key => cachedRowObjects.current.delete(key));

                        // Filter rowsObjectRef in one pass
                        rowsObjectRef.current = rowsObjectRef.current.filter(row => !keysToRemove.has(row.key));

                        // Adjust totalRenderedRowHeight only if needed
                        totalRenderedRowHeight.current = Array.from(cachedRowObjects.current.values())
                            .reduce((sum, row) => sum + (row.height ?? 0), 0);
                    }
                } else {
                    // Non-virtual or single-page mode: full reset
                    totalRenderedRowHeight.current = 0;
                    rowsObjectRef.current = [];
                    cachedRowObjects.current.clear();
                }
            }, [currentViewData, pageSettings, getRowHeight, virtualizationSettings]);

            const processRowData: (dataRowIndex: number, ariaRowIndex: number, data: T, rows: JSX.Element[], rowOptions: IRow<ColumnProps<T>>[],
                indent?: number, currentDataRowIndex?: number,
                parentUid?: string) => void = (dataRowIndex: number, ariaRowIndex: number, data: T, rows: JSX.Element[], rowOptions: IRow<ColumnProps<T>>[],
                                               indent?: number, currentDataRowIndex?: number, parentUid?: string) =>  {

                const row: T = data;
                const options: IRow<ColumnProps<T>> = {};
                options.uid = `${'grid-row-' + dataRowIndex}`
                const isVisible: boolean = Array.from(rowsObjectRef.current).some(
                    (r: IRow<ColumnProps<T>>) => r.uid === options.uid && r.data
                );
                // options.key = getUid('grid-row');
                options.key = isVisible ? cachedRowObjects.current.get(options.uid).key : getUid('grid-row');
                options.parentUid = parentUid;
                options.data = row;
                options.rowIndex = currentDataRowIndex ? currentDataRowIndex : dataRowIndex;
                options.isDataRow = true;
                options.isCaptionRow = false;
                options.indent = indent;
                options.isAltRow = enableAltRow ? dataRowIndex % 2 !== 0 : false;

                if (rowTemplate) {
                    options.cells = generateCell();
                }

                options.height = !isVisible && getRowHeight ? getRowHeight(options) : (cachedRowObjects.current.get(options.uid)?.height || rowHeight);
                // Store the options object for getRowsObject
                rowOptions.push({ ...options });

                // Create the row element with a callback ref to store the element reference
                rows.push(
                    <RowBase<T>
                        ref={(element: RowRef<T>) => {
                            if (element?.rowRef?.current) {
                                storeRowRef(ariaRowIndex, element.rowRef.current, element.getCells(), element.setRowObject);
                            } else if (element?.editInlineRowFormRef?.current) {
                                rowsObjectRef.current[ariaRowIndex as number].editInlineRowFormRef = element?.editInlineRowFormRef;
                                editInlineFormRef.current = rowsObjectRef.current[ariaRowIndex as number].editInlineRowFormRef.current; // final single row ref for edit form.
                            }
                        }}
                        key={options.key}
                        row={{ ...options }}
                        rowType={RenderType.Content}
                        className={CSS_DATA_ROW + (options.isAltRow ? (' ' + CSS_ALT_ROW) : '')}
                        role="row"
                        aria-rowindex={ariaRowIndex + 1}
                        data-uid={options.uid}
                        style={{ height: `${options.height || rowHeight}px` }}
                        isAlreadyRenderedVirtualRow={isVisible}
                    >
                        {(columnsDirective.props as ColumnsChildren<T>).children}
                    </RowBase>
                );
            };

            /**
             * Memoized data rows to prevent unnecessary re-renders
             */
            const dataRows: JSX.Element[] = useMemo(() => {
                if ((!columnsDirective || !currentViewData || currentViewData.length === 0) && (scrollMode === ScrollMode.Auto || !contentSectionRef.current?.closest('.sf-grid-content'))) {
                    rowsObjectRef.current = [];
                    return [];
                }
                rowElementRefs.current = [];

                const rows: JSX.Element[] = [];
                const rowOptions: IRow<ColumnProps<T>>[] = [];

                const contentHeight: number = contentSectionRef.current?.closest('.sf-grid-content')?.clientHeight;
                const from: number = offsetY ? scrollModule?.virtualRowInfo?.startIndex : offsetY;
                const to: number = scrollModule?.virtualRowInfo?.endIndex ? scrollModule?.virtualRowInfo?.endIndex : Math.ceil(contentHeight / rowHeight);
                scrollModule.virtualRowInfo.requiredRowsRange = [];
                for (let dataRowIndex: number = from, ariaRowIndex = 0, buffer = 0, renderedRowHeight = 0; dataRowIndex < to && buffer <= (from !== 0 && dataRowIndex !== (to - 1) ? virtualizationSettings.rowBuffer * 2 : virtualizationSettings.rowBuffer); dataRowIndex++, ariaRowIndex++) {
                    processRowData(dataRowIndex, ariaRowIndex, (scrollMode === ScrollMode.Virtual ? virtualCachedViewData.get(dataRowIndex) : currentViewData[parseInt(dataRowIndex.toString(), 10)]), rows, rowOptions);
                    renderedRowHeight += rowOptions[ariaRowIndex]?.height;
                    if (!cachedRowObjects.current.has(rowOptions[ariaRowIndex]?.uid)) {
                        totalRenderedRowHeight.current += rowOptions[ariaRowIndex]?.height;
                    } else if (cachedRowObjects.current.get(rowOptions[ariaRowIndex]?.uid).height !== rowOptions[ariaRowIndex]?.height) {
                        totalRenderedRowHeight.current = (totalRenderedRowHeight.current - cachedRowObjects.current.get(rowOptions[ariaRowIndex]?.uid).height) + rowOptions[ariaRowIndex]?.height;
                    }
                    cachedRowObjects.current.set(rowOptions[ariaRowIndex].uid, { ...rowOptions[ariaRowIndex] });
                    if (renderedRowHeight > contentHeight) {
                        buffer++;
                    }
                    if (scrollMode === ScrollMode.Virtual && !rowOptions[ariaRowIndex]?.data) {
                        if (scrollModule.virtualRowInfo.requiredRowsRange.length) {
                            scrollModule.virtualRowInfo.requiredRowsRange[1] = dataRowIndex;
                        } else {
                            scrollModule.virtualRowInfo.requiredRowsRange.push(dataRowIndex);
                        }
                    }
                }

                rowsObjectRef.current = rowOptions;
                return rows;
            }, [columnsDirective, currentViewData, storeRowRef, rowHeight, enableAltRow, offsetY, getRowHeight, _requireMoreVirtualRowsForceRefresh]);

            useEffect(() => {
                return () => {
                    rowsObjectRef.current = [];
                    rowElementRefs.current = [];
                    cachedRowObjects.current.clear(); // Clears all entries
                };
            }, []);

            return (
                <tbody
                    ref={contentSectionRef}
                    {..._props}
                >
                    {editModule?.editSettings?.allowAdd && editModule?.editSettings?.newRowPosition === 'Top' && inlineAddForm}
                    {dataRows.length > 0 ? dataRows : emptyRowComponent}
                    {editModule?.editSettings?.allowAdd && editModule?.editSettings?.newRowPosition === 'Bottom' && inlineAddForm}
                </tbody>
            );
        }
    )) as (props: Partial<IContentRowsBase> & RefAttributes<ContentRowsRef>) => ReactElement;

/**
 * Set display name for debugging purposes
 */
(ContentRowsBase as ForwardRefExoticComponent<Partial<IContentRowsBase> & RefAttributes<ContentRowsRef>>).displayName = 'ContentRowsBase';

/**
 * Export the ContentRowsBase component for use in other components
 *
 * @private
 */
export { ContentRowsBase };

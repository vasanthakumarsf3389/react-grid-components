import { useEffect, useRef, useState, useCallback, RefObject, useMemo } from 'react';
// import { Provider } from '@syncfusion/react-base';
import { DataManager, DataResult, DataUtil, Predicate, Query } from '@syncfusion/react-data';
import { Button } from '@syncfusion/react-buttons';
// import { L10n, loadCldr, setCulture } from '@syncfusion/react-base';
import './sample.css';
import { AggregateColumnProps, ClipMode, DataRequestEvent, DataChangeRequestEvent, ColumnEditParams, EditType, getObject, Grid, GridLine, GridRef, RowInfo, TextAlign, ToolbarItems, WrapMode, ColumnTemplateProps, ValueAccessorProps, RowClassProps, ValueType, CellClassProps, CellType, RowType, FilterBarType, AggregateData, CustomAggregateData, PageEvent, FilterEvent, SortEvent, FormRenderEvent, SaveEvent, DeleteEvent, SelectionMode, RowAddEvent, RowEditEvent, SearchSettings, ScrollMode, VirtualizationSettings } from '../src/index';
import { AggregateColumn, AggregateRow, Aggregates, Column, EditTemplateProps } from '../src/index';
import { Columns } from '../src/index';
import { CustomBindingData, DynamicDataItem } from './data';
import { DropDownList } from '@syncfusion/react-dropdowns';
import { TextBox, TextBoxChangeEvent } from '@syncfusion/react-inputs';
import { DateFormatOptions, L10n, loadCldr, NumberFormatOptions, Provider, setCurrencyCode } from '@syncfusion/react-base';
import * as enLocalization from '@syncfusion/react-locale/src/es.json';
import * as deLocalization from '@syncfusion/react-locale/src/de.json';
import * as frLocalization from '@syncfusion/react-locale/src/fr.json';
import * as arLocalization from '@syncfusion/react-locale/src/ar.json';
import * as zhLocalization from '@syncfusion/react-locale/src/zh.json';
import * as enAllData from '@syncfusion/react-cldr-data/main/en/all.json';
import * as deAllData from '@syncfusion/react-cldr-data/main/de/all.json';
import * as frAllData from '@syncfusion/react-cldr-data/main/fr-CH/all.json';
import * as arAllData from '@syncfusion/react-cldr-data/main/ar/all.json';
import * as zhAllData from '@syncfusion/react-cldr-data/main/zh/all.json';
import * as numberingSystemData from '@syncfusion/react-cldr-data/supplemental/numberingSystems.json';
import * as currencyData from '@syncfusion/react-cldr-data/supplemental/currencyData.json';
L10n.load({
    ...enLocalization, ...deLocalization, ...frLocalization, ...arLocalization, ...zhLocalization
});
export interface GridBaseTestProps {
  locale?: string,
  dataSource: DynamicDataItem[] | DataManager | DataResult;
  scrollMode?: ScrollMode;
  virtualizationSettings?: VirtualizationSettings;
  enableHover: boolean;
  allowSearching?: boolean;
  disableDOMVirtualization?: boolean;
  enableRtl: boolean;
  gridLines: GridLine | string;
  height: string | number;
  width?: string | number;
  allowPaging: boolean;
  allowSorting: boolean;
  allowFiltering: boolean;
  allowKeyboard?: boolean;
  enableToggle?: boolean;
  Selectiontype: string | SelectionMode;
  toolbar?: ToolbarItems[];
  isPrimaryKey?: boolean;
  displayAsCheckbox?: boolean;
  allowEdit?: boolean;
  defaultFreightValue?: number;
  editMode?: 'Normal';
  editOnDoubleClick?: boolean;
  allowAdd?: boolean;
  allowDelete?: boolean;
  confirmOnDelete?: boolean;
  newRowPosition?: 'Top' | 'Bottom';
  showAddNewRow?: boolean;
  isSingleClickEdit?: boolean;
  disableHtmlEncode?: boolean;
  enableStickyHeader?: boolean;
  enableHtmlSanitizer?: boolean;
  allowTextWrap: boolean;
  wrapMode: WrapMode | string;
  rowHeight?: number;
  showOrderID: boolean;
  orderIDWidth: string;
  orderIDTextAlign: TextAlign | string;
  useOrderIDTemplate: boolean;
  enableAriaLabel?: boolean;
  useOrderIDValueAccessor: boolean;
  useOrderIDHeaderValueAccessor: boolean;
  activeEditType?: EditType,
  orderDateEditType?: EditType,
  shipCountryEditType?: EditType,
  _freightEditType?: EditType,
  showOrderDate: boolean;
  orderDateWidth: string;
  orderDateFormat: string;
  ellipsisClipMode?: ClipMode;
  orderDateEllipsisClipMode?: ClipMode | string;
  showFreight: boolean;
  freightWidth: string;
  freightFormat: string | NumberFormatOptions | DateFormatOptions;
  showShipCountry: boolean;
  distinctShipCountryDataSource?: DynamicDataItem[] | DataManager | DataResult;
  cascadingData?: DynamicDataItem[] | DataManager | DataResult;
  useShipCountryTemplate?: boolean;
  shipCountryWidth?: string;
  showShipName: boolean;
  shipNameWidth: string;
  showPerformanceMetrics: boolean;
  initialShowSpinner: boolean;
  showAggregates?: boolean;
  showSalary?: boolean;
  showCost?: boolean;
  customBindingAggregates?: boolean;
}

export const GridBaseTest: React.FC<GridBaseTestProps> = ({
  locale,
  dataSource,
  scrollMode,
  virtualizationSettings,
  enableHover,
  allowSearching,
  disableDOMVirtualization,
  enableRtl,
  gridLines,
  height,
  width,
  allowPaging,
  allowSorting,
  allowFiltering,
  allowKeyboard = true,
  enableToggle = false,
  Selectiontype,
  toolbar = [],
  isPrimaryKey,
  displayAsCheckbox = true,
  defaultFreightValue,
  allowEdit = false,
  editMode = 'Normal',
  editOnDoubleClick = true,
  allowAdd = false,
  allowDelete = false,
  confirmOnDelete,
  newRowPosition = 'Top',
  showAddNewRow = false,
  isSingleClickEdit = false,
  disableHtmlEncode,
  enableStickyHeader,
  enableHtmlSanitizer,
  allowTextWrap,
  wrapMode,
  rowHeight,
  showOrderID,
  orderIDWidth,
  orderIDTextAlign,
  useOrderIDTemplate,
  enableAriaLabel,
  useOrderIDValueAccessor,
  useOrderIDHeaderValueAccessor,
  activeEditType,
  orderDateEditType,
  shipCountryEditType,
  _freightEditType,
  showOrderDate,
  orderDateWidth,
  orderDateFormat,
  ellipsisClipMode,
  orderDateEllipsisClipMode,
  showFreight,
  freightWidth,
  freightFormat,
  showShipCountry,
  distinctShipCountryDataSource = dataSource instanceof Array ? [...dataSource as DynamicDataItem[]] : dataSource,
  cascadingData = dataSource instanceof Array ? [...dataSource as DynamicDataItem[]] : dataSource,
  useShipCountryTemplate = false,
  shipCountryWidth,
  showShipName,
  shipNameWidth,
  showPerformanceMetrics,
  initialShowSpinner = false,
  showAggregates = false,
  showSalary = false,
  showCost = false,
  customBindingAggregates = false
}) => {
    const gridRef = useRef<GridRef<DynamicDataItem>>(null);
  const [showSpinner, setShowSpinner] = useState(initialShowSpinner);
  const [data, setData] = useState(dataSource);
  const [flag, setFlag] = useState(false);
  useMemo(() => {
    switch (locale) {
      case 'de':
          setCurrencyCode('EUR');
          loadCldr(deAllData, numberingSystemData, currencyData);
          break;
      case 'fr':
          setCurrencyCode('AZN');
          loadCldr(frAllData, numberingSystemData, currencyData);
          break;
      case 'zh':
          setCurrencyCode('CNY');
          loadCldr(zhAllData, numberingSystemData, currencyData);
          break;
      case 'ar':
          setCurrencyCode('AED');
          loadCldr(arAllData, numberingSystemData, currencyData);
          break;
      default:
          setCurrencyCode('USD');
          loadCldr(enAllData, numberingSystemData, currencyData);
          break;
    }
  }, [locale]);
    const stTime = useRef(0);
    const edTime = useRef(0);
    const diff = useRef(0);

    const toggleVisibility = () => {
        if (showSpinner) {
            gridRef.current?.hideSpinner?.();
        } else {
            gridRef.current?.showSpinner?.();
        }
        setShowSpinner(!showSpinner);
    };

    useEffect(() => {
    console.log('Grid DOM Ready => ', gridRef.current);
    }, [gridRef.current?.currentViewData]);

  const orderIDTemplate = useCallback((args: ColumnTemplateProps<DynamicDataItem>) => {
    return <div>{args.data[args.column.field]}-template</div>;
  }, []);

  const shipCountryTemplate = useCallback((args: ColumnTemplateProps<DynamicDataItem>) => {
    return (<DropDownList
              defaultValue={args.data[args.column.field]}
              dataSource={distinctShipCountryDataSource as any}
              fields={{ text: args.column.field, value: args.column.field }}
            />)
  }, []);

  const orderIDHeaderTemplate = useCallback(() => { //args: { field: string, headerText: string }
    return <div>Order ID-template</div>;
  }, []);

  const orderIDValueAccessor = useCallback((props: ValueAccessorProps<DynamicDataItem>) => {
    const {field, data: data} = props;
    return data[field] + '-1';
  }, []);


  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      gridRef.current.search(event.currentTarget.value);
    }
  }, []);

  const orderIDHeaderValueAccessor = useCallback(() => 'Order ID-1', []);
  if (showPerformanceMetrics) {
    stTime.current = performance.now();
  }

  const footerSum = useCallback((props: AggregateData<DynamicDataItem>) => {
    return (<span>Sum: {props.Sum}</span>);
  }, []);
  const footerSumCustom = useCallback((props: AggregateData<DynamicDataItem>) => {
    return (<span>{props.Sum}-{props.Custom}</span>);
  }, []);
  const footerMax = useCallback((props: AggregateData<DynamicDataItem>) => {
    return (<span>Max: {props.Max}</span>);
  }, []);
  const footerMin = useCallback((props: AggregateData<DynamicDataItem>) => {
    return (<span>Min: {props.Min}</span>);
  }, []);
  const footerAverage = useCallback((props: AggregateData<DynamicDataItem>) => {
    return (<span>Average: {props.Average}</span>);
  }, []);
  const footerCount = useCallback((props: AggregateData<DynamicDataItem>) => {
    return (<span>Count: {props.Count}</span>);
  }, []);
  const customAggregateFn = useCallback((datas: CustomAggregateData<DynamicDataItem>, _column: AggregateColumnProps): Object => {
    return datas.result.length;
  }, []);
  const footerCustom = useCallback((props: AggregateData<DynamicDataItem>) => {
    return (<span style={{color: 'red', fontWeight: 900}}>Custom: {props.Custom}</span>);
  }, []);

  const onActioncomplete = (args?: PageEvent | FilterEvent | SortEvent | FormRenderEvent<DynamicDataItem> | SaveEvent<DynamicDataItem> | DeleteEvent<DynamicDataItem> | RowAddEvent | RowEditEvent) => {
    // args.cancel = true;
    console.log('Native React Grid actionComplete triggered => ', args);
  };

  const onActionBegin = (args?: RowAddEvent | RowEditEvent | DeleteEvent<DynamicDataItem> | PageEvent | PageEvent | FilterEvent | SortEvent | FormRenderEvent<DynamicDataItem> | SaveEvent<DynamicDataItem>) => {
      console.log('Native React Grid actionBegin triggered => ', args);
      if (showPerformanceMetrics) {
        stTime.current = performance.now();
      }
  }

  const shipNameOnChange: RefObject<Function | null> = useRef<Function | null>(null)
  const shipCountryEditTemplate = useCallback((args: EditTemplateProps<DynamicDataItem>) => {
    return (<DropDownList
      dataSource={new DataManager(DataUtil.distinct(data as Object[], 'ShipCountry', false))}
      fields={{ value: 'ShipCountry' }}
      defaultValue={args.defaultValue}
      onChange={async(args1) => {
        // console.log(args.data.Complex.ShipName);
        args.onChange(args1.value);
        const originalData: DataResult = await new DataManager(cascadingData as Object[]).executeQuery(new Query().where('ShipCountry', 'equal', args1.value as string)) as DataResult;
        shipNameOnChange.current?.(originalData.result?.[0]?.['Complex']?.['ShipName']);
        // shipNameOnChange.current?.(originalData.result?.[0]?.['ShipName']);
      }}
    />)
  }, []);
  const shipCountryParamsOnChange = useCallback(async(args) => {
    if (gridRef.current?.editInlineRowFormRef?.current?.formRef?.current) {
      gridRef.current?.editInlineRowFormRef.current?.editCellRefs.current?.ShipCountry.setValue(args.value);
    } else {
      gridRef.current?.addInlineRowFormRef.current?.editCellRefs.current?.ShipCountry.setValue(args.value);
    }
    const originalData: DataResult = await new DataManager(cascadingData as Object[]).executeQuery(new Query().where('ShipCountry', 'equal', args.value as string)) as DataResult;
    shipNameOnChange.current?.(originalData.result?.[0]?.['Complex']?.['ShipName']);
    // shipNameOnChange.current?.(originalData.result?.[0]?.['ShipName']);
  }, []);
  const [shipCountryEdit, _setShipCountryEdit] = useState<ColumnEditParams>({params: {
    onChange: shipCountryParamsOnChange
  }, type: shipCountryEditType});

  const shipNameEditTemplate = useCallback((args: EditTemplateProps<DynamicDataItem>) => {
    shipNameOnChange.current = args.onChange;
    return (<DropDownList
      disabled={true}
      // dataSource={new DataManager(DataUtil.distinct(cascadingData as Object[], 'Complex.ShipName', false))}
      // fields={{ value: 'Complex.ShipName' }}
      dataSource={new DataManager(DataUtil.distinct(cascadingData as Object[], 'ShipName', false))}
      fields={{ value: 'ShipName' }}
      defaultValue={args.defaultValue}
      onChange={(args1) => {
        shipNameOnChange.current?.(args1.value);
      }}
    />)
  }, [cascadingData]);

  const shipCityEditTemplate = useCallback((props: EditTemplateProps<DynamicDataItem>) => {
    return (<TextBox
      value={getObject(props.column.field, props.data) as string}
      // className='sf-input'
      onChange={(args: TextBoxChangeEvent) => {
        // debugger
        props.onChange(args.value);
      }}
    />)
  }, []);

  const gridFilterSettings = useMemo(() => {
    return {enabled: allowFiltering};
  }, [allowFiltering]);

  const gridSortSettings = useMemo(() => {
    return {enabled: allowSorting};
  }, [allowSorting]);
  const gridSearchSettings = useMemo(() => ({enabled: allowSearching}), [allowSearching])

  const gridPageSettings = useMemo(() => {
    return {enabled: allowPaging};
  }, [allowPaging]);

  const rowClass = useCallback((props: RowClassProps<DynamicDataItem>) => {
    console.log('rowClass => ', props);
    if (props.rowIndex === 2 && props.rowType === RowType.Content) {
      return 'rowClass2';
    } else if (props.rowIndex === 0 && props.rowType === RowType.Aggregate) {
      return 'aggregateRowClass0';
    }
    return '';
  }, []);
  const cellClass = useCallback((props: CellClassProps<DynamicDataItem>) => {
    if (props.cellType === CellType.Content) {
      console.log('dataCellClass => ', props);
      if (props.rowIndex === 3 && props.column.field === 'OrderDate') {
        return 'cellClass3';
      }
    } else if (props.cellType === CellType.Header) {
      console.log('headerCellClass => ', props);
      if (props.rowIndex === 0 && props.column.field === 'Freight') {
        return 'headerCellClass0';
      }
    } else if (props.cellType === CellType.Aggregate) {
      console.log('aggregateCellClass => ', props);
      if (props.rowIndex === 1 && props.column.field === 'Freight') {
        return 'aggregateCellClass1';
      }
    }
    return '';
  }, []);
  const sortComparer = (referenceValue: ValueType, comparerValue: ValueType, _refObj: DynamicDataItem, _: DynamicDataItem, sortDirection: string): number => {
    // Handle number comparison
    if (typeof referenceValue === 'number' && typeof comparerValue === 'number' && sortDirection === 'Ascending') {
        return referenceValue - comparerValue;
    }
    if (typeof referenceValue === 'number' && typeof comparerValue === 'number' && sortDirection === 'Descending') {
      return comparerValue - referenceValue;
    }

    // Handle Date comparison
    if (referenceValue instanceof Date && comparerValue instanceof Date) {
      const referenceTime = referenceValue.getTime();
      const comparerTime = comparerValue.getTime();
      if (!isNaN(referenceTime) && !isNaN(comparerTime) && sortDirection === 'Ascending') {
          return referenceTime - comparerTime;
      }
      if (!isNaN(referenceTime) && !isNaN(comparerTime) && sortDirection === 'Descending') {
          return comparerTime - referenceTime;
      }
    }

    // Handle string or boolean comparison (or fallback for invalid dates)
    const intlCollator = new Intl.Collator(undefined, { sensitivity: 'variant', usage: 'sort' });
    return intlCollator.compare(String(referenceValue), String(comparerValue));
  };
  const uidRef = useRef(1);
  return (
    // style={{ marginTop: '80px' }}
    <div style={{height: '97vh'}}>
      <div style={{ marginBottom: '10px' }}>
        <Button onClick={() => setFlag(true)} className='e-primary' style={{ marginRight: '10px' }}>
          Render Grid
        </Button>
        <Button onClick={() => setFlag(false)} className='e-primary' style={{ marginRight: '10px' }}>
          Destroy Grid
        </Button>
        <Button onClick={toggleVisibility} className='e-primary' style={{ marginRight: '10px' }}>
          {showSpinner ? 'Hide Spinner' : 'Show Spinner'}
        </Button>
        {isPrimaryKey && <><Button onClick={() => {
          // Test setRowData method by updating the first 3 rows with modified data
          if (gridRef.current?.currentViewData && gridRef.current.currentViewData.length > 0) {
            const newData = [...gridRef.current.currentViewData];
              newData[0] = {
                ...newData[0],
                ShipCountry: `Updated Country ${Math.random() < 0.5 ? 'A' : 'B'}`,
                Freight: Math.round(Math.random() * 1000) / 100,
                ShipName: `Updated Ship ${Math.random() < 0.5 ? 'A' : 'B'}`,
                IsActive: Math.random() > 0.5
              };
            gridRef.current.setRowData(newData[0].OrderID, newData[0]);
            console.log('setRowData method called with updated data, if we perform data actions updated data will remove');
          }
        }} className='e-primary' style={{ marginRight: '10px' }}>
          Test setRowData
        </Button><Button onClick={() => {
          // Test setRowData method by updating the first 3 rows with modified data
          if (gridRef.current?.currentViewData && gridRef.current.currentViewData.length > 0) {
            const newData = [...gridRef.current.currentViewData];
              newData[0] = {
                ...newData[0],
                ShipCountry: `Updated Country ${Math.random() < 0.5 ? 'A' : 'B'}`,
                Freight: Math.round(Math.random() * 1000) / 100,
                ShipName: `Updated Ship ${Math.random() < 0.5 ? 'A' : 'B'}`,
                IsActive: Math.random() > 0.5
              };
            gridRef.current.setCellValue(newData[0].OrderID, 'Freight', newData[0].Freight);
            console.log('setCellValue method called with updated data, if we perform data actions updated data will remove');
          }
        }} className='e-primary' style={{ marginRight: '10px' }}>
          Test setCellValue
        </Button><Button onClick={() => {
          // Test setRowData method by updating the first 3 rows with modified data
          if (gridRef.current?.currentViewData && gridRef.current.currentViewData.length > 0) {
            const newData = [...gridRef.current.currentViewData];
              newData[0] = {
                ...newData[0],
                ShipCountry: `Updated Country ${Math.random() < 0.5 ? 'A' : 'B'}`,
                Freight: Math.round(Math.random() * 1000) / 100,
                ShipName: `Updated Ship ${Math.random() < 0.5 ? 'A' : 'B'}`,
                IsActive: Math.random() > 0.5
              };
            gridRef.current.setRowData(newData[0].OrderID, newData[0], true);
            console.log('setRowData method called with updated data, if we perform data actions updated data will not remove');
          }
        }} className='e-primary' style={{ marginRight: '10px' }}>
          Test setRowData with Data Update
        </Button><Button onClick={() => {
          // Test setRowData method by updating the first 3 rows with modified data
          if (gridRef.current?.currentViewData && gridRef.current.currentViewData.length > 0) {
            const newData = [...gridRef.current.currentViewData];
              newData[0] = {
                ...newData[0],
                ShipCountry: `Updated Country ${Math.random() < 0.5 ? 'A' : 'B'}`,
                Freight: Math.round(Math.random() * 1000) / 100,
                ShipName: `Updated Ship ${Math.random() < 0.5 ? 'A' : 'B'}`,
                IsActive: Math.random() > 0.5
              };
            gridRef.current.setCellValue(newData[0].OrderID, 'Freight', newData[0].Freight, true);
            console.log('setCellValue method called with updated data, if we perform data actions updated data will not remove');
          }
        }} className='e-primary' style={{ marginRight: '10px' }}>
          Test setCellValue with Data Update
        </Button></>}
        {allowEdit && (<><Button onClick={() => gridRef.current?.editRecord()} className='e-primary' style={{ marginRight: '10px' }}>
          Start Edit
        </Button><Button onClick={() => {
          const newData = [...gridRef.current.currentViewData];
              newData[1] = {
                ...newData[1],
                ShipCountry: `Updated Country ${Math.random() < 0.5 ? 'A' : 'B'}`,
                Freight: Math.round(Math.random() * 1000) / 100,
                ShipName: `Updated Ship ${Math.random() < 0.5 ? 'A' : 'B'}`,
                IsActive: Math.random() > 0.5
              };
          gridRef.current?.updateRecord(1, newData[1]);
        }} className='e-primary' style={{ marginRight: '10px' }}>Test updateRecord</Button></>)}
        {allowAdd && (<><Button onClick={() => gridRef.current?.addRecord()} className='e-primary' style={{ marginRight: '10px' }}>
          Add Record
        </Button><Button onClick={() => {
          const gridLocalData = (gridRef.current?.dataSource as DataManager)?.dataSource?.json as DynamicDataItem[];
          const lastData = {...gridLocalData?.[gridLocalData.length - 1]}; // for local data
          const newData = {
            ...lastData,
            OrderID: lastData['OrderID'] + 1,
            IsActive: Math.random() > 0.5,
            Freight: Math.round(Math.random() * 1000) / 100,
            Salary: Math.round(Math.random() * 1000) / 100,
            Cost: Math.round(Math.random() * 1000) / 100,
            OrderDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
          };
          gridRef.current?.addRecord(newData, 1);
        }} className='e-primary' style={{ marginRight: '10px' }}>Test addRecord</Button></>)}
        {allowDelete && (<Button onClick={() => gridRef.current?.deleteRecord()} className='e-primary' style={{ marginRight: '10px' }}>
          Delete Record
        </Button>)}
        {gridRef.current?.isEdit && <Button onClick={() => gridRef.current?.cancelDataChanges()} className='e-primary' style={{ marginRight: '10px' }}>
          Cancel Edit
        </Button>}
        <Button onClick={() => gridRef.current?.selectRowByRange(2, 4)} className='e-primary' style={{ marginRight: '10px' }}>
          Select Row Range
        </Button>
        <Button onClick={() => gridRef.current?.selectRow(2, true)} className='e-primary' style={{ marginRight: '10px' }}>
          Select Row with Toggle
        </Button>
        <Button onClick={() => console.log('GridRef => ', gridRef.current)} className='e-primary'>
          Get GridRef
        </Button>
      </div>

    <br />
   <div>Search: <input onKeyDown={handleKeyDown} type='search' /></div>
      {flag && (
        <div>
          <h2>Native React Grid Component</h2>
          {showPerformanceMetrics && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>Performance Metrics</h4>
              <p id="performanceTime" style={{ margin: 0 }}></p>
            </div>
          )}

          <Provider locale={locale} dir={enableRtl ? 'rtl' : 'ltr'} currencyCode='USD'>
            <Grid<DynamicDataItem>
              ref={gridRef}
              // locale={locale}
              className='custom-grid-class'
              dataSource={data}
              allowKeyboard={allowKeyboard}
              // disableDOMVirtualization={disableDOMVirtualization}
              // rowClass={rowClass}
              // dataSource={editableData}
              toolbar={toolbar}
              scrollMode={scrollMode}
              // emptyRecordTemplate={() => <>Hi React!</>}
              // dataSource={data}
              // enableRtl={enableRtl}
              enableHover={enableHover}
              gridLines={gridLines}
              pageSettings={gridPageSettings}
              sortSettings={gridSortSettings}
              filterSettings={gridFilterSettings}
              selectionSettings={{mode: Selectiontype, enableToggle: enableToggle}}
              searchSettings={gridSearchSettings}
              textWrapSettings={{wrapMode: wrapMode, enabled: allowTextWrap}}
              clipMode={ellipsisClipMode}
              rowHeight={rowHeight}
              enableHtmlSanitizer={enableHtmlSanitizer}
              enableStickyHeader={enableStickyHeader}
              onDataChangeCancel={(args) => console.log(args)}
              height={height}
              width={width}
              editSettings={{
                allowEdit,
                allowAdd,
                allowDelete,
                mode: editMode,
                editOnDoubleClick,
                showAddNewRow,
                newRowPosition,
                confirmOnDelete,
                // template: (props) => {
                //   return <table>
                //     <colgroup><col style={{width: `${props.columns.filter((column) => column.field === 'name')[0].width}`}}/></colgroup>
                //     <tbody role='rowgroup'>
                //         <tr role='row' style={{ height: `${rowHeight}px` }} >
                //             <FormField name={props.columns.filter((column) => column.field === 'name')[0]}>
                //                 <input value={props.data.name} onChange={(e) => {
                //                     props.setInternalData({...editedData});
                //                     props.formState?.onChange?.('name', { value: value as FormValueType });
                //                     props.onFieldChange('name', e.target.value);
                //                 }} />
                //             </FormField>
                //         </tr>
                //     </tbody>
                //     <button onClick={() => props.onSave()}>Save</button>
                //     <button onClick={props.onCancel}>Cancel</button>
                //   </table>
                // }
              }}
              onError={(args) => console.log('actionFailure => ', args)}
              onGridRenderStart={() => {
                console.log('load triggered!');
                if (showPerformanceMetrics) {
                  stTime.current = performance.now();
                }
              }}
              // onGridInit={() => {
              //   console.log('created triggered!');
              // }}
              // onHeaderCellRender={() => {
              //   console.log('headerCellInfo triggered!');
              // }}
              // onCellRender={(args: CellRenderEvent) => {
              //   console.log('queryCellInfo triggered!', args);
              // }}
              // onRowRender={() => {
              //   console.log('rowDataBound triggered!');
              // }}
              onPageChangeStart={onActionBegin}
              onFilterStart={onActionBegin}
              onSortStart={onActionBegin}
              onRowAddStart={(args) => {
                args.data.OrderID = uidRef.current;
                uidRef.current += 1;
                console.log('onRowAddStart triggered:', args);
              }}
              onDataChangeStart={onActionBegin}
              onRefreshStart={onActionBegin}
              
              onPageChange={onActioncomplete}
              onFilter={onActioncomplete}
              onSort={onActioncomplete}
              onFormRender={onActioncomplete}
              onDataChangeComplete={(args) => {
                console.log('onDataChangeComplete triggered:', args);
              }}
              onRefresh={onActioncomplete}
              
              onDataRequest={(args: DataRequestEvent) => {
                const dataManager = new DataManager(CustomBindingData);
                const query = new Query();
                if (args.where) {
                  let wherePredicate: Predicate;
                  const where = args.where[0].predicates;
                  for (let i = 0; i < where.length; i++) {
                    if (wherePredicate) {
                      wherePredicate = wherePredicate.and(new Predicate(where[i].field, where[i].operator,
                        where[i].value, where[i].ignoreCase, where[i].ignoreAccent, where[i].matchCase))
                    } else {
                      wherePredicate = new Predicate(where[i].field, where[i].operator,
                        where[i].value, where[i].ignoreCase, where[i].ignoreAccent, where[i].matchCase);
                    }
                  }
                  query.where(wherePredicate);
                }
                if (args.search) {
                  const { fields, value } = args.search[0];
                  query.search(value, fields);
                }
                if (args.sort) {
                  args.sort.forEach(sort => {
                    query.sortBy(sort.field, sort.direction);
                  });
                }
                if (args.aggregates.length) {
                  for (let i = 0; i < args.aggregates.length; i++) {
                    const agg = args.aggregates[i];
                    query.aggregate(agg['type'], agg['field'])                    
                  }
                }
                if (args.take && args.skip) {
                  const pageSkip = args.skip / args.take + 1;
                  const pageTake = args.take;
                  query.page(pageSkip, pageTake);
                }
                else if (args.skip === 0 && args.take) {
                  query.page(1, args.take);
                }
                if (args.requiresCounts) {
                  query.requiresCount();
                }
                dataManager.executeQuery(query).then((e) => {
                  setData(e as DataResult);
                })
              }}
              onDataChangeRequest={(args: DataChangeRequestEvent) => {
                setTimeout(() => {
                  if (args.action === 'add') {
                    CustomBindingData.unshift(args.data as any);
                  }
                  if (args.action === 'edit') {
                    for (var j = 0; j < CustomBindingData.length; j++) {
                      if ((CustomBindingData[j] as any).OrderID == args.data['OrderID']) {
                        CustomBindingData[j] = args.data as any;
                        break;
                      }
                    }
                  }
                  if (args.action == 'delete') {
                    for (var i = 0; i < (args.data as Object[]).length; i++) {
                      for (var j = 0; j < CustomBindingData.length; j++) {
                        if ((CustomBindingData[j] as any).OrderID == args.data[i]['OrderID']) {
                          CustomBindingData.splice(j, 1);
                          break;
                        }
                      }
                    }
                  }
                  args.saveDataChanges();
                }, 0);
              }}
              // onDataLoad={() => {
              //   console.log('dataBound triggered! gridRef => ', gridRef.current);
              //   if (showPerformanceMetrics) {
              //     edTime.current = performance.now();
              //     diff.current = parseInt((edTime.current - stTime.current).toFixed(0));
              //     const perfElement = document.getElementById('performanceTime');
              //     if (perfElement) {
              //       perfElement.innerHTML = `Time Taken for Initial Load: <b>${diff.current}ms</b>`;
              //     }
              //     stTime.current = 0;
              //     edTime.current = 0;
              //     diff.current = 0;
              //   }
              // }}
              // onRowSelecting={(args) => {
              //   console.log('RowSelecting row', args);
              // }}
              onRowSelect={(args) => {
                console.log('RowSelected row', args);
              }}
              onRowDeselect={(args) => {
                console.log('RowDeSelected row', args);
              }}
              // onRowDeselecting={(args) => {
              //   console.log('RowDeSelecting row', args);
              // }}
              onRowEditStart={(args) => {
                console.log('BeginEdit triggered:', args);
              }}
              onToolbarItemClick={(args) => {
                console.log('ToolbarClick triggered:', args);
              }}
              // columns={basicColumns}
              onMouseUp={(event) => {
                const target = event.target as HTMLElement;
                const rowInfo: RowInfo = gridRef.current?.getRowInfo(target);
                if (isSingleClickEdit && rowInfo.cell && !rowInfo.cell.closest('form') &&
                  target.closest('.sf-grid') === gridRef.current?.element) {
                  requestAnimationFrame(() => {
                    if (!gridRef.current?.getSelectedRowIndexes?.()?.length) {
                      gridRef.current?.selectRow(rowInfo.rowIndex);
                    }
                    gridRef.current?.editRecord();
                  });
                }
              }}
            >
              {/* <GridFilter /> */}
              <Columns>
                  <Column
                    field="OrderID"
                    headerText="Order ID"
                    validationRules={{ required: true }}
                    isPrimaryKey={isPrimaryKey}
                    width={orderIDWidth}
                    type='number'
                    textAlign={orderIDTextAlign}
                    filter={{ filterBarType: FilterBarType.NumericTextBox}}
                    visible={showOrderID}
                    templateSettings={{ariaLabel: enableAriaLabel ? 'enableAriaLabel ' + enableAriaLabel.toString() : ''}}
                    template={useOrderIDTemplate ? orderIDTemplate : undefined}
                    // template={() => <></>}
                    headerTemplate={useOrderIDTemplate ? orderIDHeaderTemplate : undefined}
                    // headerTemplate={(props) => {return(
                    //             <div data-testid="custom-header-template">
                    //                 <span>Header: {props.column.headerText}</span>
                    //             </div>
                    //         )}}
                    valueAccessor={useOrderIDValueAccessor ? orderIDValueAccessor : undefined}
                    // valueAccessor={(args) => args.data.}
                    headerValueAccessor={useOrderIDHeaderValueAccessor ? orderIDHeaderValueAccessor : undefined}
                  />
                  <Column
                    field="OrderDate"
                    headerText="Order Date"
                    validationRules={{ required: true }}
                    width={orderDateWidth}
                    filter={{ filterBarType: FilterBarType.DatePicker}}
                    type='datetime'
                    edit={{type: orderDateEditType}}
                    format={orderDateFormat}
                    textAlign="Right"
                    visible={showOrderDate}
                    clipMode={orderDateEllipsisClipMode}
                    // cellClass={cellClass}
                    // cellClass={}
                  />
                  <Column
                    field="Freight"
                    headerText="Freight"
                    filter={{ filterBarType: FilterBarType.NumericTextBox}}
                    defaultValue={defaultFreightValue}
                    validationRules={{required: true, min: 1, max: 1000}}
                    width={freightWidth}
                    format={freightFormat}
                    textAlign="Right"
                    // cellClass={cellClass}
                    visible={showFreight}
                    sortComparer={sortComparer}
                    // edit={{ type: _freightEditType}}
                    edit={{
                      type: EditType.NumericTextBox,
                      params: {
                        decimals: 0,
                        validateOnType: true,
                        format: 'N',
                        clearButton: true,
                        spinButton: false
                      }
                    }}
                  />
                  <Column
                    field="CustomerID"
                    headerText="Customer ID"
                    edit={{params: {clearButton: true}}}
                    validationRules={{required: true}}
                  />
                  <Column
                    field="Salary"
                    headerText="Salary"
                    validationRules={{ required: true }}
                    format={{format: 'C2'}}
                    visible={showSalary}
                    edit={{
                      type: EditType.NumericTextBox
                    }}
                  />
                  <Column
                    field="Cost"
                    headerText="Cost"
                    format={{format: 'C2'}}
                    visible={showCost}
                  />
                  
                  <Column
                    field="ShipCountry"
                    headerText="<b>Ship Country</b>"
                    width={shipCountryWidth}
                    template={useShipCountryTemplate ? shipCountryTemplate : undefined}
                    textAlign="Right"
                    type='string'
                    edit={shipCountryEdit}
                    validationRules={{required: true}}
                    // editTemplate={shipCountryEditTemplate}
                    visible={showShipCountry}
                    disableHtmlEncode={disableHtmlEncode}
                  />
                  <Column
                    field="IsActive"
                    headerText="IsActive"
                    textAlign="Center"
                    type='boolean'
                    edit={{type: activeEditType}}
                    displayAsCheckBox={displayAsCheckbox}
                  />
                  <Column
                    field="Complex.ShipCity"
                    headerText="ShipCity"
                    width={'150'}
                    editTemplate={shipCityEditTemplate}
                    // editTemplate={}
                  />
                  <Column
                    // field="Complex.ShipName"
                    field='ShipName'
                    headerText="Ship Name"
                    width={shipNameWidth}
                    textAlign="Right"
                    type='string'
                    visible={showShipName}
                    edit={{type: shipCountryEditType}}
                    allowEdit={false}
                    editTemplate={shipNameEditTemplate}
                  />
              </Columns>
              {showAggregates && <Aggregates>
                <AggregateRow>
                  <AggregateColumn field='Freight' type={['Sum', 'Custom']} customAggregate={customAggregateFn} footerTemplate={footerSumCustom} format={{format: 'C2'}}/>
                  <AggregateColumn field='Salary' type='Max' footerTemplate={footerMax} format={{format: 'C2'}}/>
                  <AggregateColumn field='Cost' type='Min' footerTemplate={footerMin} format={{format: 'C2'}}/>
                  <AggregateColumn field='ShipCountry' type='Count' footerTemplate={footerCount}/>
                </AggregateRow>
                <AggregateRow>
                  <AggregateColumn field='Freight' type='Average' footerTemplate={footerAverage} format={{format: 'C2'}} cellClass={cellClass}/>
                  <AggregateColumn field='Salary' type='Count' format='C2' />
                  <AggregateColumn field='Cost' type='Sum' footerTemplate={footerSum} format={{format: 'C2'}}/>
                  <AggregateColumn field='ShipCountry' type='Custom' customAggregate={customAggregateFn} footerTemplate={footerCustom}/>
                </AggregateRow>
              </Aggregates>}
              {customBindingAggregates && <Aggregates>
                <AggregateRow>
                  <AggregateColumn field='Freight' type='Sum' format={{ format: 'C2' }} footerTemplate={footerSum} />
                </AggregateRow>
                <AggregateRow>
                  <AggregateColumn field='ShipCountry' type='Count'
                  footerTemplate={footerCount}
                  // footerTemplate={}
                />
                </AggregateRow>
              </Aggregates>}
            </Grid>
          </Provider>
        </div>
      )}
      <>
        <button>dummy focus navigate</button>
      </>

      <div style={{ marginTop: '10px' }}>
        <p>Current Settings:</p>
        <ul>
          <li>Spinner: {showSpinner ? 'Visible' : 'Hidden'}</li>
          <li>RTL: {enableRtl ? 'Enabled' : 'Disabled'}</li>
          <li>Hover Effect: {enableHover ? 'Enabled' : 'Disabled'}</li>
          <li>Grid Lines: {gridLines}</li>
          <li>Paging: {allowPaging ? 'Allowed' : 'Not Allowed'}</li>
          <li>allowSorting: {allowSorting ? 'Allowed' : 'Not Allowed'}</li>
           <li>Filter : {allowFiltering ? 'Allowed' : 'Not Allowed'}</li>
          <li>Order ID Column: {showOrderID ? 'Visible' : 'Hidden'}</li>
          {showOrderID && (
            <ul>
              <li>Template: {useOrderIDTemplate ? 'Enabled' : 'Disabled'}</li>
              <li>Value Accessor: {useOrderIDValueAccessor ? 'Enabled' : 'Disabled'}</li>
              <li>Header Value Accessor: {useOrderIDHeaderValueAccessor ? 'Enabled' : 'Disabled'}</li>
            </ul>
          )}
        </ul>
      </div>
    </div>
  );
};
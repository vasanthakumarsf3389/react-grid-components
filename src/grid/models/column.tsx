/* eslint-disable */
import { useState, useEffect, useRef, ReactElement } from 'react';
import { isNullOrUndefined, merge, extend } from '@syncfusion/react-base';
import { templateCompiler,
  // getForeignData,
  getUid,
  // getObject
} from '../base/util';
import { DataUtil, Query, DataManager, DataResult } from '@syncfusion/react-data';
import { ValueFormatter } from '../services/value-formatter';
// import { DropDownListModel } from '@syncfusion/react-dropdowns';
import { 
  // ICellFormatter,
  // ValueAccessor, HeaderValueAccessor, 
  // IFilterUI,
  // IFilter,
  // CommandModel,
  IGrid,
  // IEditCell 
} from '../base/GridInterfaces';
import { DateFormatOptions, NumberFormatOptions } from '@syncfusion/react-base';
import { 
  // SortComparer,
  TextAlign, ClipMode, EditType, 
  freezeDirection, freezeTable,
  // TemplateProps 
} from '../base/enum';
import { HeaderValueAccessor, ValueAccessor } from '../base/type';

export interface ColumnModel {
  field?: string;
  uid?: string;
  index?: number;
  headerText?: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  textAlign?: TextAlign;
  clipMode?: ClipMode;
  headerTextAlign?: TextAlign;
  disableHtmlEncode?: boolean;
  type?: string | null;
  format?: string | NumberFormatOptions | DateFormatOptions;
  visible?: boolean;
  template?: string | Function;
  headerTemplate?: string | Function;
  isFrozen?: boolean;
  allowSorting?: boolean;
  allowResizing?: boolean;
  allowFiltering?: boolean;
  allowGrouping?: boolean;
  allowReordering?: boolean;
  showColumnMenu?: boolean;
  enableGroupByFormat?: boolean;
  allowEditing?: boolean;
  customAttributes?: { [x: string]: Object };
  displayAsCheckBox?: boolean;
  dataSource?: Object[] | DataManager | DataResult;
  // formatter?: { new(): ICellFormatter } | ICellFormatter | Function;
  valueAccessor?: ValueAccessor | string;
  headerValueAccessor?: HeaderValueAccessor | string;
  // filterBarTemplate?: IFilterUI;
  // filter?: IFilter;
  columns?: Column[] | string[] | ColumnModel[];
  toolTip?: string;
  isPrimaryKey?: boolean;
  hideAtMedia?: string;
  showInColumnChooser?: boolean;
  editType?: EditType | string;
  validationRules?: Object;
  defaultValue?: string | number | Date | boolean | null;
  // edit?: IEditCell;
  isIdentity?: boolean;
  foreignKeyValue?: string;
  foreignKeyField?: string;
  commandsTemplate?: string | Function;
  // commands?: CommandModel[];
  columnData?: Object[];
  editTemplate?: string | Function;
  filterTemplate?: string | Function;
  lockColumn?: boolean;
  allowSearching?: boolean;
  autoFit?: boolean;
  freeze?: freezeDirection;
  // templateOptions?: TemplateProps;
  // sortComparer?: SortComparer | string;
  parent?: IGrid;
}

export interface Column extends ColumnModel {
  formatFn?: Function;
  parserFn?: Function;
  templateFn?: Function;
  fltrTemplateFn?: Function;
  headerTemplateFn?: Function;
  editTemplateFn?: Function;
  filterTemplateFn?: Function;
  sortDirection?: string;
  freezeTable?: freezeTable;
  isSelected?: boolean;
  
  getFormatter: () => Function | undefined;
  setFormatter: (value: Function) => void;
  getParser: () => Function | undefined;
  setParser: (value: Function) => void;
  getColumnTemplate: () => Function | undefined;
  getHeaderTemplate: () => Function | undefined;
  getFilterItemTemplate: () => Function | undefined;
  getDomSetter: () => string;
  getEditTemplate: () => Function | undefined;
  getFilterTemplate: () => Function | undefined;
  getSortDirection: () => string | undefined;
  setSortDirection: (direction: string) => void;
  getFreezeTableName: () => freezeTable | undefined;
  setProperties: (column: Column) => void;
  isForeignColumn: () => boolean;
  toJSON: () => Column;
}

export function Column(options: ColumnModel, parentGrid?: IGrid): Column {
  // State variables for all the properties
  const [field, setField] = useState<string>(options.field || '');
  const [uid, setUid] = useState<string>(options.uid || getUid('grid-column'));
  const [index, setIndex] = useState<number | null>(options.index || null);
  const [headerText, setHeaderText] = useState<string | null>(options.headerText || null);
  const [width, setWidth] = useState<string | number>(options.width || '');
  const [minWidth, setMinWidth] = useState<string | number>(options.minWidth || '');
  const [maxWidth, setMaxWidth] = useState<string | number>(options.maxWidth || '');
  const [textAlign, setTextAlign] = useState<TextAlign | undefined>(options.textAlign);
  const [clipMode, setClipMode] = useState<ClipMode | undefined>(options.clipMode);
  const [headerTextAlign, setHeaderTextAlign] = useState<TextAlign | undefined>(options.headerTextAlign);
  const [disableHtmlEncode, setDisableHtmlEncode] = useState<boolean>(options.disableHtmlEncode !== false);
  const [type, setType] = useState<string | undefined | null>(
    options.type === 'none' ? null : 
    (typeof options.type === 'string' ? options.type.toLowerCase() : options.type)
  );
  const [format, setFormat] = useState(options.format);
  const [visible, setVisible] = useState<boolean>(options.visible !== false);
  const [template, setTemplate] = useState(options.template);
  const [headerTemplate, setHeaderTemplate] = useState(options.headerTemplate);
  const [isFrozen, setIsFrozen] = useState<boolean>(options.isFrozen || false);
  const [allowSorting, setAllowSorting] = useState<boolean>(options.allowSorting !== false);
  const [allowResizing, setAllowResizing] = useState<boolean>(options.allowResizing !== false);
  const [allowFiltering, setAllowFiltering] = useState<boolean>(options.allowFiltering !== false);
  const [allowGrouping, setAllowGrouping] = useState<boolean>(options.allowGrouping !== false);
  const [allowReordering, setAllowReordering] = useState<boolean>(options.allowReordering !== false);
  const [showColumnMenu, setShowColumnMenu] = useState<boolean>(options.showColumnMenu !== false);
  const [enableGroupByFormat, setEnableGroupByFormat] = useState<boolean>(options.enableGroupByFormat || false);
  const [allowEditing, setAllowEditing] = useState<boolean>(options.allowEditing !== false);
  const [customAttributes, setCustomAttributes] = useState(options.customAttributes);
  const [displayAsCheckBox, setDisplayAsCheckBox] = useState<boolean>(options.displayAsCheckBox || false);
  const [dataSource, setDataSource] = useState(options.dataSource);
  // const [formatter, setFormatterProp] = useState(options.formatter);
  const [valueAccessor, setValueAccessor] = useState<string | ValueAccessor | undefined>(options.valueAccessor);
  const [headerValueAccessor, setHeaderValueAccessor] = useState<string | HeaderValueAccessor | undefined>(options.headerValueAccessor);
  // const [filterBarTemplate, setFilterBarTemplate] = useState(options.filterBarTemplate);
  // const [filter, setFilter] = useState<IFilter>(options.filter || {});
  const [columns, setColumns] = useState(options.columns);
  const [toolTip, setToolTip] = useState(options.toolTip);
  const [isPrimaryKey, setIsPrimaryKey] = useState<boolean>(options.isPrimaryKey || false);
  const [hideAtMedia, setHideAtMedia] = useState(options.hideAtMedia);
  const [showInColumnChooser, setShowInColumnChooser] = useState<boolean>(options.showInColumnChooser !== false);
  const [editType, setEditType] = useState<string | EditType | undefined>(
    options.editType ? options.editType.toString().toLowerCase() : options.editType
  );
  const [validationRules, setValidationRules] = useState(options.validationRules);
  const [defaultValue, setDefaultValue] = useState(options.defaultValue);
  // const [edit, setEdit] = useState<IEditCell>(options.edit || {});
  const [isIdentity, setIsIdentity] = useState<boolean>(options.isIdentity || false);
  const [foreignKeyValue, setForeignKeyValue] = useState(options.foreignKeyValue);
  const [foreignKeyField, setForeignKeyField] = useState(options.foreignKeyField);
  const [commandsTemplate, setCommandsTemplate] = useState(options.commandsTemplate);
  // const [commands, setCommands] = useState(options.commands);
  const [columnData, setColumnData] = useState<Object[]>(options.columnData || []);
  const [editTemplate, setEditTemplate] = useState(options.editTemplate);
  const [filterTemplate, setFilterTemplate] = useState(options.filterTemplate);
  const [lockColumn, setLockColumn] = useState<boolean>(options.lockColumn || false);
  const [allowSearching, setAllowSearching] = useState<boolean>(options.allowSearching !== false);
  const [autoFit, setAutoFit] = useState<boolean>(options.autoFit || false);
  const [freeze, setFreeze] = useState<freezeDirection | undefined>(options.freeze);
  // const [templateOptions, setTemplateOptions] = useState<TemplateProps>(options.templateOptions || { enableAriaLabel: true });
  // const [sortComparer, setSortComparer] = useState<SortComparer | string | undefined>(options.sortComparer);

  // Internal state variables
  const [formatFn, setFormatFn] = useState<Function | undefined>(undefined);
  const [parserFn, setParserFn] = useState<Function | undefined>(undefined);
  const [templateFn, setTemplateFn] = useState<Function | undefined>(undefined);
  const [fltrTemplateFn, setFltrTemplateFn] = useState<Function | undefined>(undefined);
  const [headerTemplateFn, setHeaderTemplateFn] = useState<Function | undefined>(undefined);
  const [editTemplateFn, setEditTemplateFn] = useState<Function | undefined>(undefined);
  const [filterTemplateFn, setFilterTemplateFn] = useState<Function | undefined>(undefined);
  const [sortDirection, setSortDirectionState] = useState<string>('Descending');
  const [freezeTableName, setFreezeTableName] = useState<freezeTable | undefined>(undefined);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  
  // Parent reference
  const parentRef = useRef<IGrid | undefined>(parentGrid);

  // Methods
  const getFormatter = () => formatFn;
  const setFormatter = (value: Function) => setFormatFn(value);
  const getParser = () => parserFn;
  const setParser = (value: Function) => setParserFn(value);
  const getColumnTemplate = () => templateFn;
  const getHeaderTemplate = () => headerTemplateFn;
  const getFilterItemTemplate = () => fltrTemplateFn;
  const getDomSetter = () => disableHtmlEncode ? 'textContent' : 'innerHTML';
  const getEditTemplate = () => editTemplateFn;
  const getFilterTemplate = () => filterTemplateFn;
  const getSortDirection = () => sortDirection;
  const setSortDirection = (direction: string) => setSortDirectionState(direction);
  const getFreezeTableName = () => freezeTableName;
  
  const isForeignColumn = () => {
    return !!(dataSource && foreignKeyValue);
  };
  
  const setProperties = (column: Column) => {
    // Handle Angular two-way binding
    const keys: string[] = Object.keys(column);
    
    for (let i: number = 0; i < keys.length; i++) {
      if (keys[parseInt(i.toString(), 10)] === 'columns') {
        const cols: Column[] = column[keys[parseInt(i.toString(), 10)] as keyof Column] as Column[];
        
        if (columns) {
          for (let j: number = 0; j < cols.length; j++) {
            const targetColumn = (columns as Column[]).find((col: Column) => {
              return col.field === cols[parseInt(j.toString(), 10)].field;
            });
            
            if (targetColumn && targetColumn.setProperties) {
              targetColumn.setProperties(cols[parseInt(j.toString(), 10)]);
            }
          }
        }
      } else {
        // Update the state for the property
        const propName = keys[parseInt(i.toString(), 10)];
        const propValue = column[propName as keyof Column];
        
        // Use the appropriate setState function
        switch (propName) {
          case 'field': setField(propValue as string); break;
          case 'uid': setUid(propValue as string); break;
          case 'index': setIndex(propValue as number | null); break;
          case 'headerText': setHeaderText(propValue as string | null); break;
          case 'width': setWidth(propValue as string | number); break;
          case 'minWidth': setMinWidth(propValue as string | number); break;
          case 'maxWidth': setMaxWidth(propValue as string | number); break;
          case 'textAlign': setTextAlign(propValue as TextAlign); break;
          case 'clipMode': setClipMode(propValue as ClipMode); break;
          case 'headerTextAlign': setHeaderTextAlign(propValue as TextAlign); break;
          case 'disableHtmlEncode': setDisableHtmlEncode(propValue as boolean); break;
          case 'type': setType(propValue as string | undefined); break;
          // case 'format': setFormat(propValue); break;
          case 'visible': setVisible(propValue as boolean); break;
          // case 'template': 
          //   setTemplate(propValue);
          //   // Refresh the template function for React
          //   if (parentRef.current && (parentRef.current as any).isReact) {
          //     setTemplateFn(templateCompiler(propValue as string | Function));
          //     (parentRef.current as any).refreshReactColumnTemplateByUid(uid, true);
          //   }
          //   break;
          // case 'headerTemplate': 
          //   setHeaderTemplate(propValue);
          //   // Refresh the header template function for React
          //   if (parentRef.current && (parentRef.current as any).isReact) {
          //     setHeaderTemplateFn(templateCompiler(propValue as string | Function));
          //     (parentRef.current as any).refreshReactHeaderTemplateByUid(uid);
          //   }
          //   break;
          case 'isFrozen': setIsFrozen(propValue as boolean); break;
          case 'allowSorting': setAllowSorting(propValue as boolean); break;
          case 'allowResizing': setAllowResizing(propValue as boolean); break;
          case 'allowFiltering': setAllowFiltering(propValue as boolean); break;
          case 'allowGrouping': setAllowGrouping(propValue as boolean); break;
          case 'allowReordering': setAllowReordering(propValue as boolean); break;
          case 'showColumnMenu': setShowColumnMenu(propValue as boolean); break;
          case 'enableGroupByFormat': setEnableGroupByFormat(propValue as boolean); break;
          case 'allowEditing': setAllowEditing(propValue as boolean); break;
          // case 'customAttributes': setCustomAttributes(propValue); break;
          case 'displayAsCheckBox': setDisplayAsCheckBox(propValue as boolean); break;
          // case 'dataSource': setDataSource(propValue); break;
          // case 'formatter': setFormatterProp(propValue); break;
          case 'valueAccessor': setValueAccessor(propValue as string | ValueAccessor); break;
          case 'headerValueAccessor': setHeaderValueAccessor(propValue as string | HeaderValueAccessor); break;
          // case 'filterBarTemplate': setFilterBarTemplate(propValue); break;
          // case 'filter': setFilter(propValue as IFilter); break;
          // case 'toolTip': setToolTip(propValue); break;
          case 'isPrimaryKey': setIsPrimaryKey(propValue as boolean); break;
          case 'hideAtMedia': setHideAtMedia(propValue as string); break;
          case 'showInColumnChooser': setShowInColumnChooser(propValue as boolean); break;
          case 'editType': 
            setEditType(typeof propValue === 'string' ? (propValue as string).toLowerCase() : propValue as EditType); 
            break;
          // case 'validationRules': setValidationRules(propValue); break;
          // case 'defaultValue': setDefaultValue(propValue); break;
          // case 'edit': setEdit(propValue as IEditCell); break;
          case 'isIdentity': setIsIdentity(propValue as boolean); break;
          case 'foreignKeyValue': setForeignKeyValue(propValue as string); break;
          case 'foreignKeyField': setForeignKeyField(propValue as string); break;
          // case 'commandsTemplate': 
          //   setCommandsTemplate(propValue);
          //   // React template handling
          //   if (parentRef.current && (parentRef.current as any).isReact) {
          //     setTemplateFn(templateCompiler(propValue as string | Function));
          //   }
          //   break;
          // case 'commands': setCommands(propValue as CommandModel[]); break;
          case 'columnData': setColumnData(propValue as Object[]); break;
          // case 'editTemplate': 
          //   setEditTemplate(propValue);
          //   // React template handling
          //   if (parentRef.current && (parentRef.current as any).isReact) {
          //     setEditTemplateFn(templateCompiler(propValue as string | Function));
          //   }
          //   break;
          // case 'filterTemplate': 
          //   setFilterTemplate(propValue);
          //   // React template handling
          //   if (parentRef.current && (parentRef.current as any).isReact) {
          //     setFilterTemplateFn(templateCompiler(propValue as string | Function));
          //   }
          //   break;
          case 'lockColumn': setLockColumn(propValue as boolean); break;
          case 'allowSearching': setAllowSearching(propValue as boolean); break;
          case 'autoFit': setAutoFit(propValue as boolean); break;
          case 'freeze': setFreeze(propValue as freezeDirection); break;
          // case 'templateOptions': setTemplateOptions(propValue as TemplateProps); break;
          // case 'sortComparer': setSortComparer(propValue as SortComparer | string); break;
        }
      }
    }
  };
  
  const toJSON = () => {
    const col: Partial<Column | { [key: string]: unknown }> = {};
    const skip: string[] = ['filter', 'dataSource', 'headerText', 'template', 'headerTemplate', 'edit',
      'editTemplate', 'filterTemplate', 'commandsTemplate', 'parent'];
    
    // Get all properties from this object
    const keys: string[] = Object.keys({
      field, uid, index, headerText, width, minWidth, maxWidth, textAlign, clipMode,
      headerTextAlign, disableHtmlEncode, type, format, visible, template, headerTemplate,
      isFrozen, allowSorting, allowResizing, allowFiltering, allowGrouping, allowReordering,
      showColumnMenu, enableGroupByFormat, allowEditing, customAttributes, displayAsCheckBox,
      dataSource,
      // formatter,
      valueAccessor,
      headerValueAccessor,
      // filterBarTemplate,
      // filter,
      columns, toolTip, isPrimaryKey, hideAtMedia, showInColumnChooser, editType, validationRules,
      defaultValue,
      // edit,
      isIdentity, foreignKeyValue, foreignKeyField, commandsTemplate,
      // commands,
      columnData, editTemplate, filterTemplate, lockColumn, allowSearching, autoFit,
      freeze,
      // templateOptions, sortComparer,
      formatFn, parserFn, templateFn, fltrTemplateFn,
      headerTemplateFn, editTemplateFn, filterTemplateFn, sortDirection, freezeTableName, isSelected
    });

    for (let key of keys) {
      if (key === 'columns' && columns) {
        col[key] = Array.isArray(columns) 
          ? columns.map((column: any) => column.toJSON ? column.toJSON() : column) 
          : columns;
      } else if (!skip.includes(key)) {
        const value = eval(key); // Get the value by variable name
        if (value !== null && value !== undefined) {
          col[key as keyof Column] = value;
        }
      }
    }
    
    return col as Column;
  };

  // Initialization effect
  useEffect(() => {
    // Process templates
    // if (template || commandsTemplate) {
    //   setTemplateFn(templateCompiler(template || commandsTemplate));
    // }
    
    if (headerTemplate) {
      setHeaderTemplateFn(templateCompiler(headerTemplate));
    }
    
    // if (filter && filter.itemTemplate) {
    //   setFltrTemplateFn(templateCompiler(filter.itemTemplate));
    // }
    
    if (editTemplate) {
      setEditTemplateFn(templateCompiler(editTemplate));
    }
    
    if (filterTemplate) {
      setFilterTemplateFn(templateCompiler(filterTemplate));
    }
    
    // Process format
    if (format && ((format as DateFormatOptions).skeleton || 
        ((format as DateFormatOptions).format && 
         typeof (format as DateFormatOptions).format === 'string'))) {
      const valueFormatter = ValueFormatter();
      setFormatter(valueFormatter.getFormatFunction?.(extend({}, format as DateFormatOptions)) as Function);
      setParser(valueFormatter.getParserFunction?.(format as DateFormatOptions) as Function);
    }
    
    // Handle foreign keys
    if (isForeignColumn() && 
        (isNullOrUndefined(editType) || editType === 'dropdownedit' || editType === 'defaultedit')) {
      setEditType('dropdownedit');
      
      // if (edit.params && (edit.params as DropDownListModel).dataSource) {
      //   const params = { ...edit.params, ddEditedData: true };
      //   setEdit({ ...edit, params });
      // } else {
      //   setEdit({
      //     ...edit,
      //     params: extend({
      //       dataSource: dataSource as DataManager,
      //       query: new Query(),
      //       fields: { value: foreignKeyField || field, text: foreignKeyValue }
      //     }, edit.params || {})
      //   });
      // }
    }
    
    // // Handle sort comparer
    // if (sortComparer) {
    //   const origSortComparer = sortComparer;
    //   const newSortComparer = (x: number | string, y: number | string, xObj?: Object, yObj?: Object) => {
    //     let comparerFn = origSortComparer;
    //     if (typeof comparerFn === 'string') {
    //       comparerFn = getObject(comparerFn, window);
    //     }
        
    //     if (sortDirection === 'Descending') {
    //       const z: number | string = x;
    //       x = y;
    //       y = z;
    //       const obj: Object = xObj!;
    //       xObj = yObj;
    //       yObj = obj;
    //     }
        
    //     return (comparerFn as Function)(x, y, xObj, yObj);
    //   };
      
    //   setSortComparer(newSortComparer as SortComparer);
    // }
    
    // // Handle foreign column sortComparer
    // if (!sortComparer && isForeignColumn()) {
    //   const newSortComparer = (x: number | string, y: number | string) => {
    //     x = getObject(foreignKeyValue!, getForeignData({ foreignKeyValue, dataSource } as Column, {}, x as string)[0]);
    //     y = getObject(foreignKeyValue!, getForeignData({ foreignKeyValue, dataSource } as Column, {}, y as string)[0]);
    //     return sortDirection === 'Descending' ? DataUtil.fnDescending(x, y) : DataUtil.fnAscending(x, y);
    //   };
      
    //   setSortComparer(newSortComparer as SortComparer);
    // }
    
    // Set default values for field-dependent properties
    if (!field) {
      setAllowFiltering(false);
      setAllowGrouping(false);
      setAllowSorting(false);
      
      if (columns) {
        const hasAllowResizing = Array.isArray(columns) && 
          columns.some((col: any) => col.allowResizing !== false);
        
        if (hasAllowResizing) {
          setAllowResizing(true);
        }
      }
    }
    
    // // Set alignment for command columns
    // if (commands && !textAlign) {
    //   setTextAlign('Right' as TextAlign);
    // }
  }, []);

  // Return the column object with all properties and methods
  return {
    // Properties
    field,
    uid,
    // index,
    // headerText,
    width,
    minWidth,
    maxWidth,
    textAlign,
    clipMode,
    headerTextAlign,
    disableHtmlEncode,
    type,
    format,
    visible,
    template,
    headerTemplate,
    isFrozen,
    allowSorting,
    allowResizing,
    allowFiltering,
    allowGrouping,
    allowReordering,
    showColumnMenu,
    enableGroupByFormat,
    allowEditing,
    customAttributes,
    displayAsCheckBox,
    dataSource,
    // formatter,
    valueAccessor,
    headerValueAccessor,
    // filterBarTemplate,
    // filter,
    columns,
    toolTip,
    isPrimaryKey,
    hideAtMedia,
    showInColumnChooser,
    editType,
    validationRules,
    defaultValue,
    // edit,
    isIdentity,
    foreignKeyValue,
    foreignKeyField,
    commandsTemplate,
    // commands,
    columnData,
    editTemplate,
    filterTemplate,
    lockColumn,
    allowSearching,
    autoFit,
    freeze,
    // templateOptions,
    // sortComparer,
    
    // Internal state
    formatFn,
    parserFn,
    templateFn,
    fltrTemplateFn,
    headerTemplateFn,
    editTemplateFn,
    filterTemplateFn,
    sortDirection,
    freezeTable: freezeTableName,
    parent: parentRef.current,
    isSelected,
    
    // Methods
    getFormatter,
    setFormatter,
    getParser,
    setParser,
    getColumnTemplate,
    getHeaderTemplate,
    getFilterItemTemplate,
    getDomSetter,
    getEditTemplate,
    getFilterTemplate,
    getSortDirection,
    setSortDirection,
    getFreezeTableName,
    isForeignColumn,
    setProperties,
    toJSON
  };
}

interface ColumnsDirectiveProps {
  children: ReactElement<typeof ColumnDirective>[]; // Enforce only ColumnDirective children
}

export const ColumnsDirective: React.FC<ColumnsDirectiveProps> = ({ children }) => {
  return <>{children}</>;
};

interface ColumnDirectiveProps extends ColumnModel { }

export const ColumnDirective: React.FC<ColumnDirectiveProps> = (props: ColumnDirectiveProps) => {
  return null;
};
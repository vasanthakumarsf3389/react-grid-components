import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Grid, Column, Columns, ColumnProps, CellRenderEvent, HeaderCellRenderEvent, GridRef, RowSelectEvent, ColumnTemplateProps, GridLine, DataRequestEvent, FilterSettings, SortSettings, PageSettings, RowSelectingEvent, RowRenderEvent, AggregateColumn, AggregateRow, Aggregates, PageEvent, ValueType, EditSettings, SortEvent, FilterEvent, SearchEvent, AggregateColumnProps, SearchSettings, TextAlign, ClipMode, FilterBarType, ActionType, RowInfo, EditType, AggregateType, CellType, ScrollMode } from '../src/index';
import { ChangeEventArgs, DropDownList } from '@syncfusion/react-dropdowns';
// import { DataManager, DataUtil } from '@syncfusion/react-data';
import { complexData, customerData, DressList, empData, employeeData, employeeeData, employeeInformation, employeeRecord, generateDynamicData, getTradeData, gridData, hotelBookingData, initialFoodOrderDetails, libraryData, nullData, orderData, orderDetails, productData, restaurantData, salesDetails, studentData, supplierContractData, support, tasksData } from './data';
import { Button, Checkbox, CheckboxChangeEvent, Color, IButton, Variant } from '@syncfusion/react-buttons';
import { Form, FormField, FormState, FormValueType, INumericTextBox, NumericTextBox, TextBox, TextBoxChangeEvent, ValidationRules } from '@syncfusion/react-inputs';
import { ChangeEvent, DatePicker } from '@syncfusion/react-calendars';
import { Toolbar, ToolbarItem } from '@syncfusion/react-navigations';
import { EmitType, Fetch, L10n, loadCldr,
  Provider,
  // setCulture,
  // Provider,
  setCurrencyCode } from '@syncfusion/react-base';

export interface Book {
    Title: string;
    Author: string;
    BookID: number;
    ProductName: number;
    Genre: string;
    Rating?: number;
    PublishedYear: number;
    CatalogEntryDate: Date | string;
}

export interface ProductData {
  ProductId: number;
  Product: string;
  Revenue: number;
  StockStatus: string;
  Rating: number;
  Location: string;
}

export interface MenuItem {
  ItemID: string | number;
  ItemName: string;
  Price: number;
  Category: string;
  SpiceLevel: string;
  IsAvailable: boolean;
  Description: string;
}

export interface SalesRecord {
  ProductId: string | number;
  Product: string;
  UnitPrice: number;
  Discount: number;
  UnitsSold: number;
  Revenue: number;
  NetTotal: number;
  StockStatus: string;
  StockLevel: number;
  Rating: number;
  PaymentMethod: string;
  Date: Date | string;
  Feedback: string;
  Image: string;
  InvoiceId:string;
}

export interface Employee {
  Image: string;
  EmployeeID: string;
  FirstName: string;
  MailID: string;
  DateOfJoining: Date | string;
  Designation: string;
  EmployeeAvailability: string;
  AssetKit: string;
  AssetKitDistribution: Date | string;
  Location: string;
  PhoneNumber: string | number;
}

export interface Task {
  TaskID: string | number;
  TaskName: string;
  DueDate: Date | string;
  Priority: string;
  Status: number;
  AssignedTo: string;
  EstimatedHours: number;
}

export interface Contract {
  ContractID: string | number;
  SupplierName: string;
  Status: string;
  StartDate: Date | string;
  EndDate: Date | string;
}

export interface EmployeeTask {
  EmployeeID: string | number;
  Name: string;
  Task: number;
  Department: string;
  Status: string;
}

export interface Product {
  CategoryName: string;
  ProductName: string;
  QuantityPerUnit: string;
  UnitsInStock: number;
  Discontinued: boolean;
}

export interface Tasks {
    TaskID: number;
    TaskName: string;
    Progress: number;
    AssignedTo: string;
    Deadline: Date;
}

export interface EmployeeData {
  EmployeeID: string | number;
  Title: string;
  FirstName: string;
  LastName: string;
  Country: string;
}

export interface HotelBooking {
  BookingID: string | number;
  GuestName: string;
  CheckInDate: Date | string;
  CheckOutDate: Date | string;
  RoomType: string;
  PaymentStatus: string;
}

export interface Manufacturing {
  Stage: string;
  OutputUnits: number | string;
  UnitCost: number | string;
  TotalCost: number;
  Status: string;
  OperatorID: string | number;
}

export interface OrderDetail {
  ShipCountry?: string;
  [key: string]: unknown;
}

export interface Orders {
  OrderID: number;
  CustomerID: string;
  OrderDate: Date;
  Freight: number;
  ShippedDate: Date;
  ShipCountry: string;
}

export interface OrdersODataResponse {
    value: Orders[];
}

export interface GridData {
  result: Array<object>;
  count: number;
}

export interface FilterColumn {
  field: string;
  matchCase: boolean;
  operator: string;
  predicate: string;
  value: string;
}

export interface DataState {
  skip: number;
  take: number;
  sort?: Array<{ name: string; direction: string }>;
  filtered?: Array<{ columns: FilterColumn[] }>;
}

export interface CustomDataStateRequestEvent extends DataRequestEvent {
  filtered?: Array<{ columns: FilterColumn[] }>;
  sort?: Array<{ name?: string; direction: string }>;
}

export interface RestaurantOrder {
  OrderNumber: string;
  ChefId: string;
  ChefName: string;
  Status: string;
  FoodName: string;
  CustomerName: string;
  Notified: string;
  OrderTime: Date,
  EstimatedTime: Date
}

export interface ProductDataTemplate {
  Sales: {
    "Jan-Feb": number;
    "Mar-Apr": number;
    "May-Jun": number;
    "Jul-Aug": number;
    "Sep-Oct": number;
    "Nov-Dec": number;
  };
  Product: string;
  Category: string;
  Year: number;
  Online: number;
  Retail: number;
  ProfitLoss: number;
  UnitsSold: number;
  Revenue: number;
  Image: string; 
}

export interface Trade {
  id: number;
  ticker: string;
  CountryCode: string;
  change: number;
  change_percent: number;
  Net: number;
  Rating: string;
  NetIncome: number;
  Sector: string;
  EmployeeCount: number;
  Revenue: number;
}
export interface HorizontalScrollDropdownTestProps {
  recordCount?: number;
}
interface Order {
  CustomerID?: string;
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  Email?: string;
  AccountNumber?: string;
  CreditCardNumber?: string;
  ExpireDate?: string;
  CardStatus?: string;
}
export interface SupportTicket {
    ticket_id: string;
    title: string;
    parent_id: string | null;
    is_root: boolean;
    category: string;
    priority: string;
    status: string;
    assigned_to: string;
    client: string;
    created_at: string;
    due_at: string;
    estimated_hours: number;
}
export type TradeRow = {
    id: string | number;
    ticker: string;
    change_percent: number;
    change: number;
    price: number;
    high: number;
    low: number;
    Rating: string;
};
export interface CustomerDetails {
    name: string;
    initial: string;
    email: string;
    colorTheme: string;
}
export interface Assignee {
    name: string;
    avatar: string;
}
export interface GridDataItem {
    id: number;
    leadId: string;
    details: CustomerDetails;
    status: string;
    interest: string;
    date: Date;
    assignee: Assignee;
    source: string;
    revenue: number;
}

export interface GadgetsPurchaseData {
    id: number;
    EmployeeID: number;
    transactionId: string;
    customerDetails: {
        name: string;
        initial: string;
        email: string;
        colorTheme: string;
    };
    date: Date;
    product: {
        name: string;
        image: string;
    };
    quantity: number;
    amount: number;
    paymentMethod: string;
    status: string;
}

export interface IempData {
    Department: string;
    Email: string;
    EmployeeID: string;
    JoinDate: Date | string;
    LastPromotionDate: Date | string;
    Location: string;
    ManagerID: string;
    Name: string;
    PerformanceRating: number;
    Phone: string;
    Role: string;
    Salary: number;
    Status: string;
    Task: number;
}
interface FoodOrderItem {
  OrderNumber: number;
  CustomerName: string;
  FoodName: string;
  Price: number;
  Status: string;
}
export interface Employees {
  EmployeeID: number;
  Name: {
    FirstName: string;
    LastName: string;
  };
  City: string;
}

export type CustomSummaryType = (data: object[] | object, column: AggregateColumnProps) => number;

export const HorizontalScrollDropdownTest: React.FC<HorizontalScrollDropdownTestProps> = ({
  recordCount = 1000
}) => {
  // Generate data for testing
  const data = useMemo(() => generateDynamicData(recordCount), [recordCount]);

  // // Create data sources for dropdowns from the data
  // const customerIdOptions = useMemo(() => DataUtil.distinct(data, 'CustomerID', true), [data]);
  // const shipCountryOptions = useMemo(() => DataUtil.distinct(data, 'ShipCountry', true), [data]);
  // const shipCityOptions = useMemo(() => DataUtil.distinct(data, 'ShipCity', true), [data]);
  // const shipNameOptions = useMemo(() => DataUtil.distinct(data, 'ShipName', true), [data]);
  // const shipRegionOptions = useMemo(() => DataUtil.distinct(data, 'ShipRegion', true).filter(region => region), [data]);
  
  // Create predefined options for various fields
  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const categoryOptions = ['Electronics', 'Clothing', 'Food', 'Books', 'Home & Garden'];
  const supplierOptions = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E'];
  const paymentMethodOptions = ['Credit Card', 'Cash', 'Bank Transfer', 'PayPal', 'Check'];
  const shippingMethodOptions = ['Standard', 'Express', 'Overnight', 'Ground', 'Air'];
  const warehouseOptions = ['Warehouse 1', 'Warehouse 2', 'Warehouse 3', 'Warehouse 4', 'Warehouse 5'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];

  // // Template functions for dropdown columns
  // const createDropdownTemplate = useCallback((field: string, dataSource: any[], valueField?: string, textField?: string) => {
  //   return (props: any) => (
  //     <DropDownList
  //       dataSource={dataSource}
  //       fields={{ value: valueField || field, text: textField || field }}
  //       value={props[field] || props.data?.[field]}
  //       placeholder={`Select ${field}`}
  //       width="100%"
  //       popupHeight="200px"
  //       onChange={(e: any) => {
  //         console.log(`${field} changed:`, e.value);
  //       }}
  //     />
  //   );
  // }, []);

  // // Template functions for each column
  // const customerIdTemplate = useMemo(() => createDropdownTemplate('CustomerID', customerIdOptions), [customerIdOptions, createDropdownTemplate]);
  // const shipCountryTemplate = useMemo(() => createDropdownTemplate('ShipCountry', shipCountryOptions), [shipCountryOptions, createDropdownTemplate]);
  // const shipCityTemplate = useMemo(() => createDropdownTemplate('ShipCity', shipCityOptions), [shipCityOptions, createDropdownTemplate]);
  // const shipNameTemplate = useMemo(() => createDropdownTemplate('ShipName', shipNameOptions), [shipNameOptions, createDropdownTemplate]);
  // const shipRegionTemplate = useMemo(() => createDropdownTemplate('ShipRegion', shipRegionOptions), [shipRegionOptions, createDropdownTemplate]);
  // const statusTemplate = useMemo(() => createDropdownTemplate('Status', statusOptions.map(s => ({ Status: s }))), [createDropdownTemplate]);
  // const priorityTemplate = useMemo(() => createDropdownTemplate('Priority', priorityOptions.map(p => ({ Priority: p }))), [createDropdownTemplate]);
  // const categoryTemplate = useMemo(() => createDropdownTemplate('Category', categoryOptions.map(c => ({ Category: c }))), [createDropdownTemplate]);
  // const supplierTemplate = useMemo(() => createDropdownTemplate('Supplier', supplierOptions.map(s => ({ Supplier: s }))), [createDropdownTemplate]);
  // const paymentMethodTemplate = useMemo(() => createDropdownTemplate('PaymentMethod', paymentMethodOptions.map(p => ({ PaymentMethod: p }))), [createDropdownTemplate]);
  // const shippingMethodTemplate = useMemo(() => createDropdownTemplate('ShippingMethod', shippingMethodOptions.map(s => ({ ShippingMethod: s }))), [createDropdownTemplate]);
  // const warehouseTemplate = useMemo(() => createDropdownTemplate('Warehouse', warehouseOptions.map(w => ({ Warehouse: w }))), [createDropdownTemplate]);
  // const currencyTemplate = useMemo(() => createDropdownTemplate('Currency', currencyOptions.map(c => ({ Currency: c }))), [createDropdownTemplate]);

  // Enhance data with additional fields for testing
  const enhancedData = useMemo(() => 
    data.map((item, index) => ({
      ...item,
      Status: statusOptions[index % statusOptions.length],
      Priority: priorityOptions[index % priorityOptions.length],
      Category: categoryOptions[index % categoryOptions.length],
      Supplier: supplierOptions[index % supplierOptions.length],
      PaymentMethod: paymentMethodOptions[index % paymentMethodOptions.length],
      ShippingMethod: shippingMethodOptions[index % shippingMethodOptions.length],
      Warehouse: warehouseOptions[index % warehouseOptions.length],
      Currency: currencyOptions[index % currencyOptions.length],
      Quantity: Math.floor(Math.random() * 100) + 1,
      UnitPrice: (Math.random() * 1000).toFixed(2),
      Discount: (Math.random() * 0.3).toFixed(2),
      Tax: (Math.random() * 0.2).toFixed(2),
      Department: `Department ${String.fromCharCode(65 + (index % 5))}`
    })), [data]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Grid Horizontal Scroll Testing with 20 Dropdown Template Columns</h2>
      <p>This sample demonstrates horizontal scrolling with 20 columns, all using dropdown list templates.</p>
      
        <Grid
          dataSource={enhancedData}
          sortSettings={{enabled: true}}
          filterSettings={{enabled: true}}
          // pageSettings={{ enabled: true, pageSize: 50 }}
          height={300}
          gridLines='Both'
          width="400px"
        >
          <Columns>
            {/* Column 1: Order ID */}
            <Column 
              field='OrderID' 
              headerText='Order ID' 
              width='120' 
              textAlign='Right'
              isPrimaryKey={true}
            />
            
            {/* Column 2: Customer ID Dropdown */}
            <Column 
              field='CustomerID' 
              headerText='Customer ID' 
              width='150'
              // template={customerIdTemplate}
            />
            
            {/* Column 3: Ship Country Dropdown */}
            <Column 
              field='ShipCountry' 
              headerText='Ship Country' 
              width='140'
              // template={shipCountryTemplate}
            />
            
            {/* Column 4: Ship City Dropdown */}
            <Column 
              field='ShipCity' 
              headerText='Ship City' 
              width='140'
              // template={shipCityTemplate}
            />
            
            {/* Column 5: Ship Name Dropdown */}
            <Column 
              field='ShipName' 
              headerText='Ship Name' 
              width='200'
              // template={shipNameTemplate}
            />
            
            {/* Column 6: Ship Region Dropdown */}
            <Column 
              field='ShipRegion' 
              headerText='Ship Region' 
              width='140'
              // template={shipRegionTemplate}
            />
            
            {/* Column 7: Status Dropdown */}
            <Column 
              field='Status' 
              headerText='Status' 
              width='130'
              // template={statusTemplate}
            />
            
            {/* Column 8: Priority Dropdown */}
            <Column 
              field='Priority' 
              headerText='Priority' 
              width='120'
              // template={priorityTemplate}
            />
            
            {/* Column 9: Category Dropdown */}
            <Column 
              field='Category' 
              headerText='Category' 
              width='140'
              // template={categoryTemplate}
            />
            
            {/* Column 10: Supplier Dropdown */}
            <Column 
              field='Supplier' 
              headerText='Supplier' 
              width='130'
              // template={supplierTemplate}
            />
            
            {/* Column 11: Payment Method Dropdown */}
            <Column 
              field='PaymentMethod' 
              headerText='Payment Method' 
              width='150'
              // template={paymentMethodTemplate}
            />
            
            {/* Column 12: Shipping Method Dropdown */}
            <Column 
              field='ShippingMethod' 
              headerText='Shipping Method' 
              width='150'
              // template={shippingMethodTemplate}
            />
            
            {/* Column 13: Warehouse Dropdown */}
            <Column 
              field='Warehouse' 
              headerText='Warehouse' 
              width='130'
              // template={warehouseTemplate}
            />
            
            {/* Column 14: Currency Dropdown */}
            <Column 
              field='Currency' 
              headerText='Currency' 
              width='120'
              // template={currencyTemplate}
            />
            
            {/* Column 15: Department Dropdown */}
            <Column 
              field='Department' 
              headerText='Department' 
              width='140'
              // template={(props: any) => (
              //   <DropDownList
              //     dataSource={new DataManager([
              //       { Department: 'Department A' },
              //       { Department: 'Department B' },
              //       { Department: 'Department C' },
              //       { Department: 'Department D' },
              //       { Department: 'Department E' }
              //     ])}
              //     fields={{ value: 'Department', text: 'Department' }}
              //     value={props.Department}
              //     placeholder="Select Department"
              //     width="100%"
              //   />
              // )}
            />
            
            {/* Column 16: Quantity */}
            <Column 
              field='Quantity' 
              headerText='Quantity' 
              width='120'
              textAlign='Right'
            />
            
            {/* Column 17: Unit Price */}
            <Column 
              field='UnitPrice' 
              headerText='Unit Price' 
              width='120'
              textAlign='Right'
              format='C2'
              type='number'
            />
            
            {/* Column 18: Discount */}
            <Column 
              field='Discount' 
              headerText='Discount %' 
              width='120'
              textAlign='Right'
              format='P2'
              type='number'
            />
            
            {/* Column 19: Tax */}
            <Column 
              field='Tax' 
              headerText='Tax %' 
              width='120'
              textAlign='Right'
              format='P2'
              type='number'
            />
            
            {/* Column 20: Freight (existing field) */}
            <Column 
              field='Freight' 
              headerText='Freight' 
              width='120'
              textAlign='Right'
              format='C2'
              type='number'
            />
          </Columns>
        </Grid>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h4>Testing Information:</h4>
        <ul>
          <li><strong>Total Columns:</strong> 20 columns (14 with dropdown templates + 6 regular columns)</li>
          <li><strong>Dropdown Templates:</strong> Customer ID, Ship Country, Ship City, Ship Name, Ship Region, Status, Priority, Category, Supplier, Payment Method, Shipping Method, Warehouse, Currency, Department</li>
          <li><strong>Record Count:</strong> {recordCount} records</li>
          <li><strong>Features:</strong> Paging, Sorting, Filtering enabled</li>
          <li><strong>Horizontal Scroll:</strong> Grid width exceeds container for testing horizontal scroll behavior</li>
        </ul>
      </div>
    </div>
  );
};

export const StateColumnTest: React.FC = () => {
  const gridRef = useRef(null);
  const initialColumns: ColumnProps[] = [
        { field: 'EmployeeID', headerText: 'Employee ID', width: '120', textAlign: 'Right' },
        { field: 'Name', headerText: 'Name', width: '130' },
        { field: 'Role', headerText: 'Role', width: '150' },
        { field: 'Department', headerText: 'Department', width: '150' },
    ];

    const [columns, setColumns] = useState(initialColumns);

    const addSalaryColumn = () => {
        if (!columns.find(col => col.field === 'Salary')) {
            setColumns([...columns, { field: 'Salary', headerText: 'Salary', width: '130', format:'C' }]);
        }
    };

    const removeSalaryColumn = () => {
        setColumns(columns.filter(col => col.field !== 'Salary'));
    };

    const onCellRender = (args?: CellRenderEvent) => {
        if (args?.column?.field === 'Salary') {
            args?.cell?.classList.add('sf-salary-highlight');
        }
    };

    const onHeaderCellRender = (args?: HeaderCellRenderEvent) => {
        if (args?.cell?.column?.field === 'Salary') {
            args?.node?.classList.add('sf-salary-header');
        }
    };

    // const [filterSettings, _setFilterSettings] = useState<FilterSettings>({enabled: true});
    // const [sortSettings, _setSortSettings] = useState<SortSettings>({enabled: true});

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <Button onClick={addSalaryColumn} style={{ marginRight: '10px' }}>Add Salary Column</Button>
                <Button onClick={removeSalaryColumn} style={{ marginRight: '10px' }}>Remove Salary Column</Button>
                <Button onClick={() => console.log('GridRef => ', gridRef.current)} className='e-primary'>
                  Get GridRef
                </Button>
            </div>
            <Grid ref={gridRef} dataSource={employeeeData} onCellRender={onCellRender} onHeaderCellRender={onHeaderCellRender} className='column-state' 
                filterSettings={{enabled: true}} sortSettings={{enabled: true}} pageSettings={{enabled: true, pageSize:8}}>
                <Columns>
                    {columns.map((col, index) => (
                        <Column key={index} {...col} />
                    ))}
                </Columns>
            </Grid>
        </div>
    );
};

export const ExternalCRUD: React.FC = () => {
  const gridRef = useRef<GridRef<typeof libraryData[0]>>(null);    
  const pageSettings = { enabled: true, pageSize: 8 };
  const editSettings = { allowEdit: true, allowAdd: true, allowDelete: true,};
  const itemIDRules = { required: true, number: true };
  const itemNameRules = { required: true }; 
  const ratingRules = { required: true, min: 1, max: 5 };
  
  const addRecord = () => gridRef?.current?.addRecord?.({ BookID: Math.floor(Math.random() * 500), Title: 'Satire', CatalogEntryDate: new Date(), Rating: 4.7, Author: '', Genre: '', PublishedYear: 0 });
  const editRecord = () => gridRef?.current?.editRecord?.();
  const deleteRecord = () => gridRef?.current?.deleteRecord?.();
  const saveRecord = () => gridRef?.current?.saveDataChanges?.();
  const cancelEdit = () => gridRef?.current?.cancelDataChanges?.();

  return (
    <div>
       <div style={{ marginBottom: '10px' }}>        
        <Button style={{ marginRight: '5px' }} onClick={addRecord}>Add</Button>
        <Button style={{ marginRight: '5px' }} onClick={editRecord}>Edit</Button>
        <Button style={{ marginRight: '5px' }} onClick={deleteRecord}>Delete</Button>
        <Button style={{ marginRight: '5px' }} onClick={saveRecord}>Save</Button>
        <Button style={{ marginRight: '5px' }} onClick={cancelEdit}>Cancel</Button>
        <Button onClick={() => console.log('GridRef => ', gridRef.current?.focusModule.getFocusedCell())} className='e-primary'>
          Get GridRef
        </Button>
      </div>
      <Grid id="grid" ref={gridRef} dataSource={libraryData} editSettings={editSettings} filterSettings={{enabled: true}} sortSettings={{enabled: true}} pageSettings={pageSettings}
      toolbar={[
        {text: 'Add', id: 'grid_Add', onClick: addRecord },
        {text: 'Edit', id: 'grid_Edit', onClick: editRecord },
        {text: 'Delete', id: 'grid_Delete', onClick: deleteRecord },
        {text: 'Save', id: 'grid_Update', onClick: saveRecord },
        {text: 'Cancel', id: 'grid_Cancel', onClick: cancelEdit }
      ]}
      >
        <Columns>
          <Column field='BookID' headerText='Book ID' width='100' textAlign='Right' isPrimaryKey={true} validationRules={itemIDRules}/>
          <Column field='Title' headerText='Title' width='120' validationRules={itemNameRules}/>
          <Column field='CatalogEntryDate' headerText='Entry Date' type="date" format="yMd" textAlign="Right" edit={{type:'datepickeredit'}} width='120' />
          <Column field='Rating' headerText='Rating' validationRules={ratingRules} width='120' />
        </Columns>
      </Grid>
    </div>
  );
};

export const DeleteConfirmDialogCustomization: React.FC = () => {
  const gridRef = useRef<GridRef<unknown>>(null);    
    // State to manage sort, filter, edit and toolbar settings.    
    const [filterSettings] = useState<FilterSettings>({enabled: true});
    const [sortSettings] = useState<SortSettings>({enabled: true});
    const [editSettings] = useState<EditSettings>({ allowEdit: true, allowAdd: true, allowDelete: true, confirmOnDelete:true });
    const [toolbarSettings] = useState<string[]>(['Add', 'Edit', 'Delete', 'Update', 'Cancel']);
    const employeeIDRules = { required: true };
    const nameRules = { required: true }; 

    return (
      <div>
        <Grid id="grid" ref={gridRef} dataSource={employeeRecord} editSettings={editSettings} toolbar={toolbarSettings} filterSettings={filterSettings} sortSettings={sortSettings} height={300}>
          <Columns>
            <Column field='EmployeeCode' headerText='Employee ID' width='80' textAlign='Right' isPrimaryKey={true} validationRules={employeeIDRules} />
            <Column field='Name' headerText='Name' width='60' validationRules={nameRules}/>
            <Column field='Team' headerText='Team'  width='100' clipMode='EllipsisWithTooltip' />
            <Column field='Designation' headerText='Designation' width='120' clipMode='EllipsisWithTooltip' />
            <Column field='TeamLead' headerText='Reporter' width='80' />
          </Columns>
        </Grid>
      </div>
    );
};

export const BasicColumnValidation: React.FC = () => {
  const editSettings = { allowEdit: true, allowAdd: true, allowDelete: true };
 const toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];
 const orderIDRules = { required: true, number: true };
 const customerIDRules = { required: true, minLength: 5 };
 const freightRules = { required: true, min: 10, max: 500 };
 
 return (
   <Grid dataSource={orderData} editSettings={editSettings} toolbar={toolbarOptions} filterSettings={{enabled: true}} pageSettings={{enabled: true,pageSize: 7}}>
     <Columns>
       <Column field='OrderID' headerText='Order ID' width='100' textAlign='Right' isPrimaryKey={true} validationRules={orderIDRules} />
       <Column field='CustomerID' headerText='Customer ID' width='120' validationRules={customerIDRules} />
       <Column field='Freight' headerText='Freight' width='120' format='C2' edit={{type: 'numericedit'}} textAlign='Right' validationRules={freightRules} />
       <Column field='ShipCountry' headerText='Ship Country' width='150' edit={{type: 'dropdownedit'}} />
     </Columns>
   </Grid>
 );
};
export const FormCustomToolbarEdit: React.FC = () => {
  const gridRef = useRef<GridRef<typeof customerData[0]>>(null);
  const [formState, setFormState] = useState<FormState>();
  const [selectedProduct, setSelectedProduct] = useState<Order>({});
  const [formKey, setFormKey] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'Add' | 'Edit' | null>(null);
  const rowIndexRef = useRef<number | undefined>(null);
  const editSettings = { allowEdit: true, allowAdd: true, allowDelete: true };
  const toolbarOptions = [{id:'Add', text:'Add new customer'}, {id:'Edit', text:'View or modify existing customer'}, {id:'Delete', text:'Remove existing customer'}]; 
  const validationRules: ValidationRules = {
    FirstName: {
      required: [true, 'First Name is required'],
      minLength: [3, 'First Name must be at least 3 characters']
    },
    LastName: {
      required: [true, 'Last Name is required'],
      minLength: [2, 'Last Name must be at least 2 characters']
    },     
    Phone: {
      required: [true, 'Phone Number is required'],
      regex: [/^\+?[0-9\- ]{10,15}$/, 'Phone number must be 10 to 15 digits long and follow international format (e.g., +1-555-123-4567)']
    },
    Email: {
      required: [true, 'Email is required'],
      email: [true, 'Enter a valid email'],
      customValidator: (value) => {
        const email = String(value);
        if (!email.endsWith('@example.com') && !email.endsWith('@example.in') && !email.endsWith('@example.co.uk')) {
          return 'Email must end with @example.com or @example.in or @example.co.uk';
        }
        return '';
      }
    },
    AccountNumber: {
      required: [true, 'Account Number is required'],
      regex: [/^(US[0-9A-Z]{10}|GB[0-9A-Z]{20}|IN[0-9A-Z]{14})$/, 'Enter a valid account number for US (12), GB (22), or IN (16)']
    },
    CreditCardNumber: {
      required: [true, 'Card Number is required'],
      regex: [/^[0-9 ]{19}$/, 'Card Number must be 16 digits with spaces (e.g., 4111 1111 1111 1111)']
    },
    ExpireDate: {
      required: [true, 'Expiry Date is required'],      
      customValidator: (value: FormValueType): string | null => {
        if (!(value instanceof Date)) {
          return 'Invalid date format';
        }
        const now = new Date();
        if (value < now) {
          return 'Expiry date cannot be in the past.';
        }
        return null;
      }  
    }
  };  
  
  const handleSubmit = (data: Record<string, FormValueType>) => {
    const index = rowIndexRef.current;
    if (formMode === 'Add') {
      const lastId = customerData.reduce((max, item) => {
        const id = parseInt((item as Order).CustomerID?.replace(/\D/g, '') || '0');
        return Math.max(max, id);
      }, 0);
      data.CustomerID = `CUST${String(lastId + 1).padStart(3, '0')}`;
      data.CardStatus = 'Active';
      gridRef?.current?.addRecord?.(data as typeof customerData[0]);
    } else if (formMode === 'Edit' && index !== null) {
      gridRef?.current?.updateRecord?.(index as number, data as typeof customerData[0]);
    }
    setShowForm(false);
    setFormMode(null);
  };

  const rowSelected = (args?: RowSelectEvent) => {
    rowIndexRef.current = args?.selectedRowIndex;
    setSelectedProduct(args?.data as Order);
    setFormKey(prev => prev + 1);
  };

  const toolbarClickHandler = (args?: any) => {
    if (args.item.id === 'Add') {
      setSelectedProduct({});
      setFormKey(prev => prev + 1);
      setFormMode('Add');
      setShowForm(true);
    } 
    else if (args.item.id === 'Edit') {
      if (rowIndexRef.current !== null) {
        setFormKey(prev => prev + 1);
        setFormMode('Edit');
        setShowForm(true);
      }
      else{
        alert('Please select a row to edit.');
        setShowForm(false);
        setFormMode(null);
      }
    } 
    else if (args.item.id === 'Delete') {
      if (rowIndexRef.current !== null) {
        gridRef?.current?.deleteRecord?.('CustomerID');
      }
      else{
        alert('Please select a row to delete.');
      }
    }
    else {      
      setShowForm(false);
      setFormMode(null);
    }
  };

  const acountNumberTemplate = useCallback((props?: ColumnTemplateProps): string | React.ReactElement => {
    return (
      <div>
        <span className="card-number">{'xxxx xxxx xxxx ' + (props?.data as Order).AccountNumber?.slice(-4)}</span>
      </div>
    );
  }, []);

  const cardTemplate = useCallback((props?: ColumnTemplateProps): string | React.ReactElement => {
    return (
      <div>
        <span className="card-number">{'xxxx xxxx xxxx ' + (props?.data as Order).CreditCardNumber?.slice(-4)}</span>
      </div>
    );
  }, []);
  
  const fields: (keyof Order)[] = [
    'CustomerID', 'FirstName', 'LastName', 'Phone', 'Email', 'AccountNumber', 'CreditCardNumber', 'ExpireDate', 'CardStatus',
  ];


  return (
    <div className="row" style={{ display: 'inline', gap: '50px'}}> 
      {/* Grid Section */}
      <div style={{ flex: '1' }}>
        <Grid ref={gridRef} dataSource={customerData} editSettings={editSettings} toolbar={toolbarOptions} selectionSettings={{ type: 'Single' }}
          pageSettings={{enabled: true, pageSize: 8}} filterSettings={{enabled: true}} sortSettings={{enabled: true}} onRowSelect={rowSelected} onToolbarItemClick={toolbarClickHandler} onCellRender={() => console.log('queryCellInfo')}>
          <Columns>
            <Column field='CustomerID' headerText='Customer ID' width='120' filter={{ filterBarType: 'numericfilter'}} textAlign='Right' isPrimaryKey={true} />
            <Column field='FirstName' headerText='First Name' filter={{ filterBarType: 'stringfilter'}} width='130'/>
            <Column field='LastName' headerText='Last Name' filter={{ filterBarType: 'stringfilter'}} width='130'/>
            <Column field='Email' headerText='Email' width='220' />
            <Column field='Phone' headerText='Phone Number' type="number" width='150' textAlign='Right'/>
            <Column field='AccountNumber' headerText='Account Number' template={acountNumberTemplate} width='140' textAlign='Right'/>
            <Column field='CreditCardNumber' headerText='Credit Card' template={cardTemplate} width='140' textAlign='Right'/>
            <Column field='ExpireDate' headerText='Expire Date' width='150' type='date' format='MM/yyyy' edit={{type: 'datepicker'}} filter={{ filterBarType: 'datepickerfilter'}} textAlign='Right'/>
            <Column field='CardStatus' headerText='Card Status' filter={{ filterBarType:'stringfilter'}} width='150'/>
          </Columns>
        </Grid>
      </div>      
      {/* Form Section */}
      {showForm && (
        <div className="component-section form-container" style={{  alignItems: 'center', flex: '0 0 35%', marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
          <Form
            key={formKey}
            rules={validationRules}
            initialValues={selectedProduct as Record<string, FormValueType>}
            onSubmit={handleSubmit}
            validateOnChange={true}
            onFormStateChange={setFormState}
          >
            {fields.map((field: string) => {
              const isDisabled =
                field === 'CustomerID' || field === 'CardStatus' ||
                (formMode === 'Edit' && ['CustomerID', 'AccountNumber', 'CreditCardNumber', 'ExpireDate', 'CardStatus'].includes(field));
                return (
                  <FormField key={field} name={field}>
                    <div className="form-row" style={{ marginBottom: '15px' }}>
                      <label>{field.replace(/([A-Z])/g, ' $1')}</label>
                      {field === 'ExpireDate' ?(
                        <DatePicker
                            format="MM/yyyy"
                            value={formState?.values[field] as any}
                            onChange={(e) =>
                              formState?.onChange(field, { value: (e as ChangeEvent).value as Date })
                            }
                            onBlur={(e) => {
                              if (e.currentTarget.contains(e.target)) {
                                formState?.onBlur(field);
                              }
                            }}
                            disabled={isDisabled}
                          />
                      ) : (
                        <TextBox
                          name={field}
                          disabled={isDisabled}
                          value={(formState?.values[field] || '') as string}
                          onChange={(args: TextBoxChangeEvent) =>
                            formState?.onChange(field, { value: args.value || '' })
                          }
                          onBlur={() => formState?.onBlur(field)}
                          className={formState?.errors[field] ? 'error-text' : ''}
                        />
                      )}
                      {formState?.errors[field] && (
                        <div className="error-text" style={{ color: 'red' }}>{formState.errors[field]}</div>
                      )}
                    </div>
                  </FormField>
                );
            })}
             <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
              <Button type="reset" className="form-button" color={Color.Error} onClick={() => { gridRef?.current?.cancelDataChanges?.(); setShowForm(false) }} >Cancel</Button>
              <Button type="submit" className="form-button" disabled={!formState?.allowSubmit} > Save </Button>
            </div>
          </Form>
      </div>)}
    </div>    
  );
};

export const RestrictDecimal: React.FC = () => {
   // State to manage sort, filter, page, edit and toolbar settings.    
    const [filterSettings] = useState<FilterSettings>({enabled: true});
    const [sortSettings] = useState<SortSettings>({enabled: true});
    const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8, pageCount: 4 });
    const [editSettings] = useState<EditSettings>({ allowEdit: true, allowAdd: true, allowDelete: true });
    const [toolbarSettings] = useState<string[]>(['Add', 'Edit', 'Delete', 'Update', 'Cancel']);
    const itemIDRules = { required: true };
    const categoryRules = { required: true };
    const priceRules = { required: true, min: 1, max: 1000 };
    const editParams = {
        type:"numericedit",
        params: {
            decimals: 0,
            validateOnType: true,
            format: 'N',
            clearButton: true
        }
    };
    
    return (
        <div>
            <Grid dataSource={restaurantData} editSettings={editSettings} toolbar={toolbarSettings} filterSettings={filterSettings} pageSettings={pageSettings} sortSettings={sortSettings}>
                <Columns>
                    <Column field='ItemID' headerText='ID' width='100' validationRules={itemIDRules} isPrimaryKey={true} ></Column>
                    <Column field='Category' headerText='Category' width='100' edit={{ type:"dropdownedit" }}  validationRules={categoryRules}></Column>
                    <Column field='CuisineType' headerText='Cuisine' width='90' edit={{ type:"dropdownedit" }} validationRules={categoryRules}></Column>
                    <Column field='Description' headerText='Description' width='120' clipMode='EllipsisWithTooltip'></Column>
                    <Column field='SpiceLevel' headerText='Spice Level' width='90' edit={{type:"dropdownedit"}} textAlign='Right' />
                    <Column field='Price' headerText='Price' width='125' textAlign='Right' filter={{filterBarType:"numericfilter"}} edit={editParams} validationRules={priceRules} />
                </Columns>
            </Grid>
        </div>
    );
};
export const CustomAutoGeneratedColumns: React.FC = () => {
  const gridRef = useRef<GridRef<unknown>>(null);
    // State to manage sort settings.    
    const [sortSettings] = useState<SortSettings>({enabled: true});
    
    // State to store customized column definitions.
    const [use, setState] = useState<ColumnProps[] | undefined>(undefined);

    // Flag to ensure column customization runs only once.
    const isInitial = useRef(true);

    // Handle initial data load and customize column properties.
    const onDataLoad = () => {
        if (gridRef.current && isInitial.current) {
            const columns = gridRef.current.getColumns(); 
            if (columns) {
                for (const col of columns) {
                    if (col.field === "BookID") {
                        col.headerText = "Book ID";
                        col.textAlign = "Right";
                        col.width = "100px";
                    }
                    if (col.field === "Title") {
                        col.width = "170px";
                    }
                    if (col.field === "Author") {
                        col.width = "170px";
                    }
                    if (col.field === "Genre") {
                        col.width = "80px";
                    }
                    if (col.field === "CatalogEntryDate") {
                        col.type = 'date';
                        col.format = 'yMd';
                        col.textAlign = "Right";
                        col.headerText = "Catalog Entry Date";
                        col.width = "150px";
                    }
                    if (col.field === 'PublishedYear') {
                        col.headerText = "Published Year";
                        col.width = "100px";
                        col.textAlign = "Right";
                    }
                    if (col.field === 'Rating') {
                        col.textAlign = "Right";
                        col.width = "100px";
                    }
                    if (col.field === 'Language') {
                        col.width = "100px";
                    }
                    if (col.field === 'Status') {
                        col.width = "100px";
                    }
                    if (col.field === 'Condition') {
                        col.width = "100px";
                    }
                    if (col.field === 'Location') {
                        col.width = "100px";
                    }
                }
            }
            isInitial.current = false;
            setState(columns || []);
        }
    };

    return (
        <div>
            {useMemo(
                // Memoize the Grid component to avoid unnecessary re-renders.
                () => (
                    <Grid dataSource={libraryData} ref={gridRef} onDataLoad={onDataLoad} columns={use as ColumnProps[]} 
                        sortSettings={sortSettings} height={350} />
                ),
                [use]
            )}
        </div>
    );
};
export const GridLines: React.FC = () => {
  const [lines, setLines] = useState<GridLine | string>('Default');

    /**
     * Sets grid line style to 'Default'
     */
    const DefaultLines = useCallback(() => {
        setLines('Default');
    }, []);

    /**
     * Sets grid line style to 'None'
     */
    const NoneLines = useCallback(() => {
        setLines('None');
    }, []);

    /**
     * Sets grid line style to 'Both'
     */
    const BothLines = useCallback(() => {
        setLines('Both');
    }, []);

    /**
     * Sets grid line style to 'Horizontal'
     */
    const HorizontalLines = useCallback(() => {
        setLines('Horizontal');
    }, []);

    /**
     * Sets grid line style to 'Vertical'
     */
    const VerticalLines = useCallback(() => {
        setLines('Vertical');
    }, []);

    return (
        <div>
            <div className='sf-statustext'><p>Select Grid Line:</p></div>
            <Toolbar id="toolbar">
                <ToolbarItem>
                    <Button onClick={DefaultLines}>Default</Button>
                </ToolbarItem>
                <ToolbarItem>
                    <Button onClick={NoneLines}>None</Button>
                </ToolbarItem>
                <ToolbarItem>
                    <Button onClick={BothLines}>Both</Button>
                </ToolbarItem>
                <ToolbarItem>
                    <Button onClick={HorizontalLines}>Horizontal</Button>
                </ToolbarItem>
                <ToolbarItem>
                    <Button onClick={VerticalLines}>Vertical</Button>
                </ToolbarItem>
            </Toolbar>

            {
                useMemo(() => (
                    /**
                     * Memoized Grid component to prevent unnecessary re-renders
                     * @returns Syncfusion Grid with dynamic grid line style
                     */
                    <Grid dataSource={employeeData} sortSettings={{enabled: true}} gridLines={lines}>
                        <Columns>
                            <Column field='EmployeeID' headerText='Employee ID' width='100' textAlign='Right' />
                            <Column field='FirstName' headerText='First Name' width='100' />
                            <Column field='Title' headerText='Title' width='180' />
                            <Column field='Address' headerText='Address' width='150' />
                            <Column field='City' headerText='City' width='100' />
                            <Column field='HireDate' headerText='Hire Date' width='100' format={{ skeleton: 'yMd', type: 'date' }} textAlign='Right' />
                        </Columns>
                    </Grid>
                ), [lines])
            }
        </div>
    );
};

export const TemplateSwicthing: React.FC = () => {
  // state to manage sort settings
  const [sortSettings, _setSortSettings] = useState<SortSettings>({enabled: true});

  // State to toggle between progress bar and percentage text
  const [useProgressBar, setUseProgressBar] = useState(true);

  /**
   * Template to render progress either as a bar or percentage text.
   * @param props - Cell template arguments from the grid.
   * @returns A React element showing progress.
   */
  const progressTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
    console.log('sort direction', _setSortSettings);
    if (useProgressBar) {
      return (
        <div className="sf-progress-container">
          <div style={{ width: `${(props?.data as Tasks).Progress}%`, background: '#27ae60', height: '15px' }} />
        </div>
      );
    }
    return <span>{(props?.data as Tasks).Progress}%</span>;
  }, [useProgressBar]);

  return useMemo(() => (
    /**
     * Memoized Grid component to prevent unnecessary re-renders.
     */
    <div>
      <Button onClick={() => setUseProgressBar(!useProgressBar)} style={{ marginBottom: '15px' }}>
        Toggle Template
      </Button>
      <Grid dataSource={tasksData} className='dynamic-template' sortSettings={sortSettings} height={320}>
        <Columns>
          <Column field="TaskID" headerText="ID" width="80" textAlign="Right" />
          <Column field="TaskName" headerText="Task Name" width="180" />
          <Column field="Progress" headerText="Progress" width="220" template={progressTemplate} />
          <Column field="AssignedTo" headerText="Assigned" width="130" />
          <Column field="Deadline" headerText="Deadline" width="100" type="date" format="yMd" textAlign="Right" />
        </Columns>
      </Grid>
    </div>
  ), [progressTemplate, useProgressBar]);
};

export const VisibleStateChange: React.FC = () => {
  const [visibility, setVisibility] = useState(false);

  /**
   * Toggles the visibility of the Price column based on checkbox value.
   * @param args - Checkbox change event arguments.
   */
  const toggleColumn = (args: CheckboxChangeEvent) => {
    setVisibility(args.value);
  };

  /**
   * Applies custom styling to Price cells.
   * @param args - Cell render event arguments.
   */
  const onCellRender = (args?: CellRenderEvent) => {
    if (args?.column?.field === 'UnitPrice') {
      args?.cell?.classList.add('sf-price-highlight');
    }
  };

  /**
   * Applies custom styling to Price header cell.
   * @param args - Header cell render event arguments.
   */
  const onHeaderCellRender = (args?: HeaderCellRenderEvent) => {
    if (args?.cell?.column?.field === 'UnitPrice') {
      args?.node?.classList.add('sf-price-header');
    }
  };
  const [filterSettings, _setFilterSettings] = useState<FilterSettings>({enabled: true});
  const [sortSettings, _setSortSettings] = useState<SortSettings>({enabled: true});
  const [pageSettings, _setPageSettings] = useState<PageSettings>({ enabled: true, pageSize: 10 });

  return useMemo(() => (
    /**
     * Memoized Grid component to prevent unnecessary re-renders.
     */
    <div>
      <Checkbox onChange={toggleColumn} label='Show Price' className='show-hide-chekcbox' />
      <Grid dataSource={productData} className='show-hide-grid' onCellRender={onCellRender} onHeaderCellRender={onHeaderCellRender} 
          filterSettings={filterSettings} sortSettings={sortSettings} pageSettings={pageSettings}>
        <Columns>
          <Column field="ProductID" headerText="Product ID" width="120" textAlign='Right' />
          <Column field="ProductName" headerText="Name" width="150" />
          <Column field="QuantityPerUnit" headerText="Quantity Per Unit" width="130" textAlign='Right' clipMode='EllipsisWithTooltip' />
          <Column field="UnitsInStock" headerText="Units In Stock" width="130" textAlign='Right' />
          <Column field="UnitPrice" headerText="Price" width="130" format="C2" visible={visibility} textAlign='Right' cellClass={'rowClass2'}/>
        </Columns>
      </Grid>
    </div>
  ), [visibility]);
};
export const EditBasic: React.FC = () => {
   const editSettings= { allowEdit: true, allowAdd: true, allowDelete: true };
    const toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];
    const orderIDRules = { required: true, number: true };
    const customerIDRules = { required: true };
    const freightRules = { required: true, min: 1, max: 1000 };
    return (
        <div>
            <Grid dataSource={orderData} editSettings={editSettings} toolbar={toolbarOptions} filterSettings={{enabled: true}} pageSettings={{ enabled: true,pageSize: 8 }}>
                <Columns>
                    <Column field='OrderID' headerText='Order ID' width='120' textAlign="Right" isPrimaryKey={true} validationRules={orderIDRules}></Column>
                    <Column field='CustomerID' headerText='Customer ID' width='150' validationRules={customerIDRules}></Column>
                    <Column field='OrderDate' headerText='Order Date' width='130' type='date' edit={{ type:'datepickeredit'}} format='yMd' textAlign='Right' />
                    <Column field='Freight' headerText='Freight' width='120' format='C2' textAlign='Right' validationRules={freightRules} />
                    <Column field='ShipCountry' headerText='Ship Country' width='150'></Column>
                </Columns>
            </Grid>
        </div>
    );
};

export const LimitSelection: React.FC = () => {
  const [message, setMessage] = useState<string>('User can select only any 3 items.');
    const [messageType, setMessageType] = useState<'info' | 'success' | 'warning'>('info');
  const gridRef = useRef<GridRef<unknown>>(null);

    const handleOnRowSelecting: EmitType<RowSelectingEvent> = (args?: RowSelectingEvent) => {
        const selectedCount: number = (args && args.selectedRowIndexes?.length)  ?  args.selectedRowIndexes?.length : 1;
        if (args&& selectedCount >= 4) {
           args.cancel = true;
            setMessage('Cannot select more than 3 rows');
            setMessageType('warning');
        } else {
            setMessage(`Selected ${selectedCount} item${selectedCount !== 1 ? 's' : ''}`);
            setMessageType('info');
        }
    };
    const handleOnRowDeselecting : EmitType<RowSelectEvent> = () => {
        setMessage(`Selected ${gridRef.current?.getSelectedRowIndexes().length} item${gridRef.current?.getSelectedRowIndexes().length !== 1 ? 's' : ''}`);
            setMessageType('info');
    }

    const handlePlaceOrder = () => {
        const grid = gridRef.current;
        const selectedRecords = grid?.getSelectedRecords?.();
        
        if (grid && selectedRecords && selectedRecords.length > 0) {
            setMessage('Order placed successfully!');
            setMessageType('success');
            setTimeout(() => {
                const currentGrid = gridRef.current;
                if (currentGrid && currentGrid.clearSelection) {
                    currentGrid.clearSelection();
                }
            }, 1000);
            setTimeout(() => {
                setMessage('User can select only any 3 items.');
                setMessageType('info');
            }, 1000);
        } else {
            setMessage('Please select at least one item to place an order.');
            setMessageType('warning');
            setTimeout(() => {
                setMessage('User can select only any 3 items.');
                setMessageType('info');
            }, 1000);
        }
    };

    const memoizedGrid = useMemo(() => (
        <div style={{float:'left'}}>
        <Grid
            ref={gridRef}
            dataSource={DressList.slice(15)}
            textWrapSettings={{ enabled: true, wrapMode: 'Both' }}
            filterSettings={{ enabled: true }}
            sortSettings={{ enabled: true }}
            height={350}
            selectionSettings={{ enabled: true, mode: 'Multiple', type: 'Row' }}
            onRowSelecting={handleOnRowSelecting}
            onRowSelect={handleOnRowDeselecting}
            onRowDeselect={handleOnRowDeselecting}
        >
            <Columns>
                <Column field="Name" headerText="Product" width={100} />
                <Column field="Brand" headerText="Brand" width={90} />
                <Column field="Category" headerText="Category" width={110} />
                <Column field="Color" headerText="Available Color" width={100} />
                <Column field="Size" headerText="Size" width={50} />
                <Column field="Description" headerText="Description" width={150} />
                <Column field="Price" filter={{filterBarType:"numericfilter"}} headerText="Price" width={70} textAlign="Right" format='C2' />
            </Columns>
        </Grid>
        </div>
    ), []);

    return (
        <div style={{ padding: '10px' }}>
            <div
                style={{
                    background: messageType === 'success' ? '#D4F4DD' : messageType === 'warning' ? '#FFE8E6' : '#E8E6FF',
                    color: messageType === 'success' ? '#2E7D32' : messageType === 'warning' ? '#D32F2F' : '#5E35B1',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                    fontSize: '16px',
                    fontWeight: '500',
                    animation: 'fadeIn 0.3s ease-in',
                    transition: 'all 0.3s',
                }}
            >
                {messageType === 'success' && <span style={{ marginRight: '8px' }}>✅</span>}
                {messageType === 'warning' && <span style={{ marginRight: '8px' }}>⚠️</span>}
                {messageType === 'info' && <span style={{ marginRight: '8px' }}>ℹ️</span>}
                {message}
            </div>
            <Button variant={Variant.Outlined} onClick={handlePlaceOrder} style={{margin:'10px', float:'right'}} >
                Place Order
            </Button>
            {memoizedGrid}
        </div>
    );
};
export const CustomSort: React.FC = () => {
  // state to manage sort, filter and page settings    
    const [filterSettings] = useState<FilterSettings>({enabled: true});
    const [sortSettings] = useState<SortSettings>({enabled: true});
    /**
     * Custom sort comparer for the Task column.
     * @param referenceValue - First value to compare.
     * @param comparerValue - Second value to compare.
     * @returns Sorting order indicator.
    **/
    const sortComparer = (referenceValue: ValueType, comparerValue: ValueType, _refObj: Object, _: Object, sortDirection: string): number => {
        if (referenceValue < comparerValue && sortDirection === 'Ascending') {
            return -1;
        }
        if (referenceValue > comparerValue && sortDirection === 'Ascending') {
            return 1;
        }
        if (referenceValue < comparerValue && sortDirection === 'Descending') {
          return 1;
        }
        if (referenceValue > comparerValue && sortDirection === 'Descending') {
            return -1;
        }
        return 0;
    };
    return (
        <div>
            <Grid dataSource={empData} sortSettings={sortSettings} filterSettings={filterSettings} height={330}>
                <Columns>
                    <Column field="EmployeeID" headerText="ID" width="90" textAlign='Right' />
                    <Column field="Name" headerText="Name" width="120" />
                    <Column field="Task" headerText="Task" width="70" textAlign="Right" sortComparer={sortComparer} type='number' filter={{filterBarType:"numericfilter"}}/>
                    <Column field="Department" headerText="Department" width="110" />
                    <Column field="JoinDate" headerText="Join Date" width="90" textAlign='Right' format="yMd" type="date" filter={{filterBarType:"datepickerfilter"}} />
                    <Column field="Location" headerText="Location" width="110" />
                </Columns>
            </Grid>
        </div>
    );
}
export const NullValueSortingHandle: React.FC = () => {
  // state to manage sort, filter and page settings    
    const [filterSettings] = useState<FilterSettings>({enabled: true});
    const [sortSettings] = useState<SortSettings>({enabled: true});
    

    /**
     * Custom sort comparer to handle null values and sort direction.
     * @param referenceValue - The reference value to compare.
     * @param comparerValue - The value to compare against.
     * @returns Sorting result based on direction and value types.
     */
    const sortComparer = (referenceValue: ValueType, comparerValue: ValueType, _refObj: Object, _: Object, sortDirection: string) => {
        const sortAsc = sortDirection === 'Ascending';
        if (referenceValue === null && comparerValue === null) return 0;
        if (referenceValue === null) return sortAsc ? 1 : -1;
        if (comparerValue === null) return sortAsc ? -1 : 1;
        if (typeof referenceValue === 'number' && typeof comparerValue === 'number') {
            return sortAsc ? referenceValue - comparerValue : comparerValue - referenceValue;
        }
        const refStr = referenceValue.toString();
        const compStr = comparerValue.toString();
        return sortAsc ? refStr.localeCompare(compStr) : compStr.localeCompare(refStr);
    };

    return (
        <div>
            <Grid dataSource={nullData} sortSettings={sortSettings} filterSettings={filterSettings} height={350} >
                <Columns>
                    <Column field='OrderID' headerText='Order ID' width='90' textAlign="Right" />
                    <Column field='CustomerID' headerText='Customer ID' width='80' />
                    <Column field='Freight' headerText='Freight' width='60' type='number' filter={{filterBarType:"numericfilter"}} textAlign="Right" format='C2' />
                    <Column field='OrderDate' headerText='Order Date' format='yMd' textAlign="Right" type="date" filter={{filterBarType:"datepickerfilter"}} sortComparer={sortComparer} width='110' />
                    <Column field='ShipCountry' headerText='Ship Country' width='100' />
                </Columns>
            </Grid>
        </div>
    );
};
export const ConditionalTemplate: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<SupportTicket | null>(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
    const gridRef = useRef<GridRef<SupportTicket>>(null);

    /** 
     * Memoized grid configuration to prevent unnecessary re-renders
     */
    const gridConfig = useMemo(() => ({
        dataSource: support,
        selectionSettings: { enabled: true, mode: 'Single' as const },
        sortSettings: { enabled: true },
        pageSettings: { enabled: true, pageSize: 12 },
        editSettings: { allowDelete: true },
        enableHover: false,
        className: 'sf-conditional-querycell',
        gridLines: 'Both' as GridLine,
        height: '400px'
    }), []);

    /** 
     * Memoized button states for optimal re-rendering
     */
    const buttonStates = useMemo(() => ({
        markResolvedDisabled: !selectedRecord || selectedRecord.status === 'Resolved',
        escalateDisabled: !selectedRecord || selectedRecord.status === 'Escalated',
        deleteDisabled: !selectedRecord || selectedRecord.status !== 'Resolved'
    }), [selectedRecord]);

    /** 
     * Handle grid row selection with proper state management
     */
    const handleRowSelection = useCallback((args?: RowSelectEvent) => {
        if (args?.data) {
            const record = args.data as SupportTicket;
            setSelectedRecord(record);
            setSelectedRowIndex(args.selectedRowIndex ?? -1);
            
            // Force button state update by triggering a micro-render
            setTimeout(() => {
                setSelectedRecord(prev => prev ? { ...prev } : null);
            }, 0);
        } else {
            setSelectedRecord(null);
            setSelectedRowIndex(-1);
        }
    }, []);

    /**
     * Mark selected ticket as resolved with proper state synchronization
     */
    const markAsResolved = useCallback(() => {
        if (selectedRecord && gridRef.current && selectedRowIndex >= 0) {
            // Update grid using setCellValue for performance
            gridRef.current.setCellValue(selectedRecord.ticket_id, 'status', 'Resolved', true);
            
            // Update selected record state immediately for button state management
            setSelectedRecord(prev => prev ? { ...prev, status: 'Resolved' } : null);
        }
    }, [selectedRecord, selectedRowIndex]);

    /**
     * Escalate selected ticket with proper state synchronization
     */
    const escalateTicket = useCallback(() => {
        if (selectedRecord && gridRef.current && selectedRowIndex >= 0) {
            // Update grid using setCellValue for performance
            gridRef.current.setCellValue(selectedRecord.ticket_id, 'status', 'Escalated', true);
            gridRef.current.setCellValue(selectedRecord.ticket_id, 'priority', 'Critical', true);
            
            // Update selected record state immediately for button state management
            setSelectedRecord(prev => prev ? { 
                ...prev, 
                status: 'Escalated', 
                priority: 'Critical' 
            } : null);
        }
    }, [selectedRecord, selectedRowIndex]);

    /**
     * Delete resolved tickets with proper cleanup
     */
    const deleteResolvedTickets = useCallback(() => {
        if (selectedRecord?.status === 'Resolved' && gridRef.current && selectedRowIndex >= 0) {
            // Delete record from grid
            gridRef.current.deleteRecord();
            
            // Clear selection state
            setSelectedRecord(null);
            setSelectedRowIndex(-1);
        }
    }, [selectedRecord, selectedRowIndex]);

    /** 
     * Renders the Priority column template with conditional styling and SVG icons
     * @param props - The cell template arguments provided by the grid
     * @returns A React element displaying the priority with appropriate styling
     */
    const PriorityTemplate = useCallback((props?: ColumnTemplateProps<SupportTicket>): React.ReactElement => {
        const priority = props?.data?.priority || 'Low';
        let className: string;
        let SvgIcon: React.FC;

        switch (priority) {
            case 'Medium':
                className = 'priority-medium';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                );
                break;
            case 'High':
                className = 'priority-high';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                );
                break;
            case 'Critical':
                className = 'priority-critical';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                );
                break;
            default:
                className = 'priority-low';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                );
                break;
        }

        return (
            <div className={`priority-badge ${className}`}>
                <SvgIcon />
                <span>{priority}</span>
            </div>
        );
    }, []);

    /** 
     * Renders the Status column template with conditional styling and SVG icons
     * @param props - The cell template arguments provided by the grid
     * @returns A React element displaying the status with appropriate styling
     */
    const StatusTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const status = (props?.data as SupportTicket)?.status || 'Open';
        let className: string;
        let SvgIcon: React.FC;

        switch (status) {
            case 'Open':
                className = 'status-open';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                    </svg>
                );
                break;
            case 'In Progress':
                className = 'status-in-progress';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                );
                break;
            case 'Resolved':
                className = 'status-resolved';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                );
                break;
            case 'Closed':
                className = 'status-closed';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                );
                break;
            case 'Escalated':
                className = 'status-escalated';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                );
                break;
            default:
                className = 'status-open';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                );
                break;
        }

        return (
            <div className={`status-badge ${className}`}>
                <SvgIcon />
                <span>{status}</span>
            </div>
        );
    }, []);

    /** 
     * Renders the Category column template with conditional styling and SVG icons
     * @param props - The cell template arguments provided by the grid
     * @returns A React element displaying the category with appropriate styling
     */
    const CategoryTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const category = (props?.data as SupportTicket)?.category || 'Technical';
        let className: string;
        let SvgIcon: React.FC;

        switch (category) {
            case 'Technical':
                className = 'category-technical';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                    </svg>
                );
                break;
            case 'Software':
                className = 'category-software';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                    </svg>
                );
                break;
            case 'Hardware':
                className = 'category-hardware';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20,18c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6v10c0,1.1,0.9,2,2,2H0v2h24v-2H20z M4,6h16v10H4V6z"/>
                    </svg>
                );
                break;
            case 'Network':
                className = 'category-network';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                );
                break;
            case 'Security':
                className = 'category-security';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16.2V16H7.8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
                    </svg>
                );
                break;
            default:
                className = 'category-general';
                SvgIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                );
                break;
        }

        return (
            <div className={`category-badge ${className}`}>
                <SvgIcon />
                <span>{category}</span>
            </div>
        );
    }, []);

    /** 
     * Memoized toolbar component for performance
     */
    const actionToolbar = useMemo(() => (
        <div className="action-buttons-toolbar" style={{marginBottom: '15px'}}>
            <Button
                disabled={buttonStates.markResolvedDisabled}
                onClick={markAsResolved}
            >
                Mark as Resolved
            </Button>
            <Button
                disabled={buttonStates.escalateDisabled}
                onClick={escalateTicket}
                style={{marginLeft: '10px'}}
            >
                Escalate Ticket
            </Button>
            <Button
                disabled={buttonStates.deleteDisabled}
                onClick={deleteResolvedTickets}
                style={{marginLeft: '10px'}}
            >
                Delete Resolved Ticket
            </Button>
        </div>
    ), [buttonStates, markAsResolved, escalateTicket, deleteResolvedTickets]);

    /** 
     * Memoized column definitions to prevent recreation
     */
    const gridColumns = useMemo(() => (
        <Columns>
            <Column field="ticket_id" headerText="Ticket ID" width="100" textAlign="Right" isPrimaryKey={true} />
            <Column field="title" headerText="Title" width="250" clipMode="EllipsisWithTooltip" />
            <Column field="category" headerText="Category" width="130" textAlign="Center" template={CategoryTemplate} />
            <Column field="priority" headerText="Priority" width="120" textAlign="Center" template={PriorityTemplate} />
            <Column field="status" headerText="Status" width="120" textAlign="Center" template={StatusTemplate} />
            <Column field="assigned_to" headerText="Assigned To" width="150" />
            <Column field="client" headerText="Customer" width="140" />
            <Column field="created_at" headerText="Created Date" width="130" type="date" format="MM/dd/yyyy" />
            <Column field="due_at" headerText="Due Date" width="130" type="date" format="MM/dd/yyyy" />
        </Columns>
    ), [CategoryTemplate, PriorityTemplate, StatusTemplate]);

    return (
        <div className="ticket-management-container">
            {actionToolbar}
            
            <Grid 
                {...gridConfig}
                onRowSelect={handleRowSelection}
                // onRowDeselect={handleRowDeSelection}
                ref={gridRef}
            >
                {gridColumns}
            </Grid>
        </div>
    );
};

import * as enLocalization from '@syncfusion/react-locale/src/es.json';
import * as deLocalization from '@syncfusion/react-locale/src/de.json';
import * as frLocalization from '@syncfusion/react-locale/src/fr.json';
import * as arLocalization from '@syncfusion/react-locale/src/ar.json';
import * as zhLocalization from '@syncfusion/react-locale/src/zh.json';
// import * as cagregorian from '@syncfusion/react-cldr-data/main/ar/ca-gregorian.json';
// import * as currencies from '@syncfusion/react-cldr-data/main/ar/currencies.json';
// import * as numbers from '@syncfusion/react-cldr-data/main/ar/numbers.json';
// import * as timeZoneNames from '@syncfusion/react-cldr-data/main/ar/timeZoneNames.json';
// import * as numberingSystems from '@syncfusion/react-cldr-data/main/ar/numberingSystems.json';
// import * as Decagregorian from '@syncfusion/react-cldr-data/main/de/ca-gregorian.json';
// import * as Decurrencies from '@syncfusion/react-cldr-data/main/de/currencies.json';
// import * as Denumbers from '@syncfusion/react-cldr-data/main/de/numbers.json';
// import * as DetimeZoneNames from '@syncfusion/react-cldr-data/main/de/timeZoneNames.json';
// import * as Frcagregorian from '@syncfusion/react-cldr-data/main/fr/ca-gregorian.json';
// import * as Frcurrencies from '@syncfusion/react-cldr-data/main/fr/currencies.json';
// import * as Frnumbers from '@syncfusion/react-cldr-data/main/fr/numbers.json';
// import * as FrtimeZoneNames from '@syncfusion/react-cldr-data/main/fr/timeZoneNames.json';
// import * as Zhcagregorian from '@syncfusion/react-cldr-data/main/zh/ca-gregorian.json';
// import * as Zhcurrencies from '@syncfusion/react-cldr-data/main/zh/currencies.json';
// import * as Zhnumbers from '@syncfusion/react-cldr-data/main/zh/numbers.json';
// import * as ZhtimeZoneNames from '@syncfusion/react-cldr-data/main/zh/timeZoneNames.json';

import * as enAllData from '@syncfusion/react-cldr-data/main/en/all.json';
import * as deAllData from '@syncfusion/react-cldr-data/main/de/all.json';
import * as frAllData from '@syncfusion/react-cldr-data/main/fr-CH/all.json';
import * as arAllData from '@syncfusion/react-cldr-data/main/ar/all.json';
import * as zhAllData from '@syncfusion/react-cldr-data/main/zh/all.json';
import * as numberingSystemData from '@syncfusion/react-cldr-data/supplemental/numberingSystems.json';
import * as currencyData from '@syncfusion/react-cldr-data/supplemental/currencyData.json';
import { DataManager, ODataV4Adaptor, Query, UrlAdaptor } from '@syncfusion/react-data';
import * as React from 'react';


export const CultureSort: React.FC = () => {
  // Load all cultures
  L10n.load({
      ...enLocalization, ...deLocalization, ...frLocalization, ...arLocalization, ...zhLocalization
  });
  // setCulture('ar');
  // setCurrencyCode('QAR');
  setCurrencyCode('AED');
  loadCldr(arAllData, numberingSystemData, currencyData);
  const formatOption = { type: 'date', format: 'yyyy-MMM-dd' };
    // Initialize state for sort, and pagination settings.    
    const [sortSettings] = useState<SortSettings>({enabled: true});
    const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8, pageCount: 4  });

    // Custom sort props.comparerValue for handling numbers, dates, and strings.    
    const sortComparer = (referenceValue: ValueType, comparerValue: ValueType, _refObj?: object, _?: object, sortDirection?: string): number => {
        // Handle number comparison.
        if (typeof referenceValue === 'number' && typeof comparerValue === 'number' && sortDirection === 'Ascending') {
            return referenceValue - comparerValue;
        }
        if (typeof referenceValue === 'number' && typeof comparerValue === 'number' && sortDirection === 'Descending') {
          return comparerValue - referenceValue;
        }

        // Handle date comparison.
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

        // Handle string or boolean comparison or fallback for invalid dates.
        const intlCollator = new Intl.Collator(undefined, { sensitivity: 'variant', usage: 'sort' });
        return intlCollator.compare(String(referenceValue), String(comparerValue));
    };
    // Render grid with order data and configured settings.
    return (
        <div>
          {/* <Provider locale='ar'> */}
            <Grid locale='ar' dataSource={[
    {
        OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5, OrderDate: new Date(8364186e5),
        ShipName: 'Vins et alcools Chevalier', ShipCity: 'Reims', ShipAddress: '59 rue de l Abbaye',
        ShipRegion: 'CJ', ShipPostalCode: '51100', ShipCountry: 'France', Freight: 32.38, Verified: !0
    },
    {
        OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6, OrderDate: new Date(836505e6),
        ShipName: 'Toms Spezialitäten', ShipCity: 'Münster', ShipAddress: 'Luisenstr. 48',
        ShipRegion: 'CJ', ShipPostalCode: '44087', ShipCountry: 'Germany', Freight: 11.61, Verified: !1
    },
    {
        OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4, OrderDate: new Date(8367642e5),
        ShipName: 'Hanari Carnes', ShipCity: 'Rio de Janeiro', ShipAddress: 'Rua do Paço, 67',
        ShipRegion: 'RJ', ShipPostalCode: '05454-876', ShipCountry: 'Brazil', Freight: 65.83, Verified: !0
    },
    {
        OrderID: 10251, CustomerID: 'VICTE', EmployeeID: 3, OrderDate: new Date(8367642e5),
        ShipName: 'Victuailles en stock', ShipCity: 'Lyon', ShipAddress: '2, rue du Commerce',
        ShipRegion: 'CJ', ShipPostalCode: '69004', ShipCountry: 'France', Freight: 41.34, Verified: !0
    },
    {
        OrderID: 10252, CustomerID: 'SUPRD', EmployeeID: 4, OrderDate: new Date(8368506e5),
        ShipName: 'Suprêmes délices', ShipCity: 'Charleroi', ShipAddress: 'Boulevard Tirou, 255',
        ShipRegion: 'CJ', ShipPostalCode: 'B-6000', ShipCountry: 'Belgium', Freight: 51.3, Verified: !0
    },
    {
        OrderID: 10253, CustomerID: 'HANAR', EmployeeID: 3, OrderDate: new Date(836937e6),
        ShipName: 'Hanari Carnes', ShipCity: 'Rio de Janeiro', ShipAddress: 'Rua do Paço, 67',
        ShipRegion: 'RJ', ShipPostalCode: '05454-876', ShipCountry: 'Brazil', Freight: 58.17, Verified: !0
    },
    {
        OrderID: 10254, CustomerID: 'CHOPS', EmployeeID: 5, OrderDate: new Date(8370234e5),
        ShipName: 'Chop-suey Chinese', ShipCity: 'Bern', ShipAddress: 'Hauptstr. 31',
        ShipRegion: 'CJ', ShipPostalCode: '3012', ShipCountry: 'Switzerland', Freight: 22.98, Verified: !1
    },
    {
        OrderID: 10255, CustomerID: 'RICSU', EmployeeID: 9, OrderDate: new Date(8371098e5),
        ShipName: 'Richter Supermarkt', ShipCity: 'Genève', ShipAddress: 'Starenweg 5',
        ShipRegion: 'CJ', ShipPostalCode: '1204', ShipCountry: 'Switzerland', Freight: 148.33, Verified: !0
    },
    {
        OrderID: 10256, CustomerID: 'WELLI', EmployeeID: 3, OrderDate: new Date(837369e6),
        ShipName: 'Wellington Importadora', ShipCity: 'Resende', ShipAddress: 'Rua do Mercado, 12',
        ShipRegion: 'SP', ShipPostalCode: '08737-363', ShipCountry: 'Brazil', Freight: 13.97, Verified: !1
    },
    {
        OrderID: 10257, CustomerID: 'HILAA', EmployeeID: 4, OrderDate: new Date(8374554e5),
        ShipName: 'HILARION-Abastos', ShipCity: 'San Cristóbal', ShipAddress: 'Carrera 22 con Ave. Carlos Soublette #8-35',
        ShipRegion: 'Táchira', ShipPostalCode: '5022', ShipCountry: 'Venezuela', Freight: 81.91, Verified: !0
    },
    {
        OrderID: 10258, CustomerID: 'ERNSH', EmployeeID: 1, OrderDate: new Date(8375418e5),
        ShipName: 'Ernst Handel', ShipCity: 'Graz', ShipAddress: 'Kirchgasse 6',
        ShipRegion: 'CJ', ShipPostalCode: '8010', ShipCountry: 'Austria', Freight: 140.51, Verified: !0
    },
    {
        OrderID: 10259, CustomerID: 'CENTC', EmployeeID: 4, OrderDate: new Date(8376282e5),
        ShipName: 'Centro comercial Moctezuma', ShipCity: 'México D.F.', ShipAddress: 'Sierras de Granada 9993',
        ShipRegion: 'CJ', ShipPostalCode: '05022', ShipCountry: 'Mexico', Freight: 3.25, Verified: !1
    },
    {
        OrderID: 10260, CustomerID: 'OTTIK', EmployeeID: 4, OrderDate: new Date(8377146e5),
        ShipName: 'Ottilies Käseladen', ShipCity: 'Köln', ShipAddress: 'Mehrheimerstr. 369',
        ShipRegion: 'CJ', ShipPostalCode: '50739', ShipCountry: 'Germany', Freight: 55.09, Verified: !0
    },
    {
        OrderID: 10261, CustomerID: 'QUEDE', EmployeeID: 4, OrderDate: new Date(8377146e5),
        ShipName: 'Que Delícia', ShipCity: 'Rio de Janeiro', ShipAddress: 'Rua da Panificadora, 12',
        ShipRegion: 'RJ', ShipPostalCode: '02389-673', ShipCountry: 'Brazil', Freight: 3.05, Verified: !1
    },
    {
        OrderID: 10262, CustomerID: 'RATTC', EmployeeID: 8, OrderDate: new Date(8379738e5),
        ShipName: 'Rattlesnake Canyon Grocery', ShipCity: 'Albuquerque', ShipAddress: '2817 Milton Dr.',
        ShipRegion: 'NM', ShipPostalCode: '87110', ShipCountry: 'USA', Freight: 48.29, Verified: !0
    }]} sortSettings={sortSettings} pageSettings={pageSettings}>
                <Columns>
                    <Column field='OrderID' headerText='Order ID' width='70' textAlign="Right" sortComparer={sortComparer} />
                    <Column field='CustomerName' headerText='Customer Name' width='100' sortComparer={sortComparer} />
                    <Column field='OrderDate' headerText='Order Date' width='100' textAlign="Right" format={formatOption} sortComparer={sortComparer} />
                    <Column field='ShipAddress' headerText='Ship Address' width='100' />
                    <Column field='ShipCountry' headerText='Ship Country' width='100' />
                    <Column field='Freight' headerText='Freight Charges' width='100' textAlign="Right" format='C2' sortComparer={sortComparer} />
                </Columns>
            </Grid>
          {/* </Provider> */}
        </div>
    )
}
export const DifferentLocaleTwoGrid: React.FC = () => {
  // Load all cultures
  L10n.load({
      ...enLocalization, ...deLocalization, ...frLocalization, ...arLocalization, ...zhLocalization
  });
   // Manage locale and RTL state for both grids.
    const [locale, setLocale] = useState('en');
    const [localeSecond, setLocaleSecond] = useState('fr');
    const [enableRtl, setEnableRtl] = useState(false);
    const [enableRtlSecond, setEnableRtlSecond] = useState(false);
    // Configure grid editing and toolbar options.
    const editSettings = { allowEdit: true, allowAdd: true, allowDelete: true };
    const toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];
    const cultureOptions: { [key: string]: unknown }[] = [
        { text: 'English', value: 'en' },
        { text: 'German - Germany*', value: 'de' },
        { text: 'French - Azerbaijan*', value: 'fr' },
        { text: 'Arabic*', value: 'ar' },
        { text: 'Chinese - China*', value: 'zh' },
    ];
    const dropdownFields = { text: 'text', value: 'value' };
    // Handle culture change for first grid with currency/RTL updates.
    const changeCulture = useCallback((args?: ChangeEventArgs) => {
        setLocale(args?.value as string);
        if (args?.value === "ar") {
            setEnableRtl(true);
        } else {
            setEnableRtl(false);
        }

        switch (args?.value) {
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
    }, [])
    // Handle culture change for second grid with currency/RTL updates.
    const changeCultureSecond = useCallback((args?: ChangeEventArgs) => {
        setLocaleSecond(args?.value as string);
        if (args?.value === "ar") {
            setEnableRtlSecond(true);
        } else {
            setEnableRtlSecond(false);
        }

        switch (args?.value) {
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
    }, [])
    // Render dual grids with localization dropdowns.
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Centered Header */}
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }} >
                Change Language for Grid Localization Properties
            </h3>
            {/* Grids Container */}
            <div style={{ display: 'flex', gap: '30px' }}>
                {/* First Grid Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width:'80%' }}>
                    {/* Dropdown Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                        <label style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '16px' }}>
                            Shipped Detail Data Grid
                        </label>
                        {useMemo(() => (
                            <DropDownList
                                width={200}
                                dataSource={cultureOptions as { [key: string]: object }[]}
                                value={'English'}
                                placeholder='Select language'
                                fields={dropdownFields}
                                onChange={changeCulture}
                            />
                        ), [])}
                    </div>
                    
                    {/* First Grid */}
                    <Provider locale={locale}>
                        <Grid 
                            dataSource={orderDetails}
                            width={500} 
                            enableRtl={enableRtl}
                            editSettings={editSettings} 
                            toolbar={toolbarOptions} 
                            pageSettings={{ enabled: true, pageSize: 5, pageCount: 1 }}
                        >
                            <Columns>
                                <Column field='OrderID' headerText='Order ID' textAlign="Right" isPrimaryKey={true} ></Column>
                                <Column field='CustomerID' headerText='Customer ID'></Column>
                                <Column field='OrderDate' headerText='Order Date' edit={{ type: 'datepickeredit' }} format='yMd' textAlign='Right' />
                                <Column field='Freight' headerText='Freight Charges' format='C2' textAlign='Right' edit={{ type: 'numericedit' }}/>
                            </Columns>
                        </Grid>
                    </Provider>
                </div>
                {/* Second Grid Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingRight: '20px' }}>
                    {/* Dropdown Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                        <label style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '16px' }}>
                            Product Data Grid
                        </label>
                        {useMemo(() => (
                            <DropDownList
                                width={200}
                                dataSource={cultureOptions as { [key: string]: object }[]}
                                value={'French'}
                                placeholder='Select language'
                                fields={dropdownFields}
                                onChange={changeCultureSecond}
                            />
                        ), [])}
                    </div>
                    
                    {/* Second Grid */}
                    <Provider locale={localeSecond}>
                        <Grid 
                            dataSource={salesDetails} 
                            width={500}
                            enableRtl={enableRtlSecond} 
                            editSettings={editSettings} 
                            toolbar={toolbarOptions} 
                            pageSettings={{ enabled: true, pageSize: 5, pageCount: 1 }}
                        >
                            <Columns>
                                <Column field='ProductId' headerText='Product ID' textAlign='Right' isPrimaryKey={true} validationRules={{required: true, number: true}}/>
                                <Column field='Product' headerText='Product' validationRules={{required: true}}/>
                                <Column field='StockLevel' headerText='Stock Level' edit={{ type: 'numericedit' }} textAlign='Right' />
                                <Column field='UnitPrice' headerText='Unit Price' format="C2" edit={{ type: 'numericedit' }} textAlign='Right' />
                            </Columns>
                        </Grid>
                    </Provider>
                </div>
            </div>
        </div>
    );
}
export const LiveData: React.FC = () => {
  const gridRef = useRef<GridRef<unknown>>(null);
    const updateButtonRef = useRef<IButton | null>(null);
    const clearButtonRef = useRef<IButton | null>(null);
    const feedDelayInputRef = useRef<INumericTextBox | null>(null);
    const [timerID, setTimerID] = useState<ReturnType<typeof setInterval> | undefined>(undefined);
    const [isUpdating, setIsUpdating] = useState(false);
    const initial = useRef<boolean>(true);

    // type DataPoint = { x: number; y: number };
    // const [chartData, setChartData] = useState<{ [key: number]: DataPoint[] }>(() => {
    //     return (getTradeData as Trade[]).reduce((acc: { [key: number]: DataPoint[] }, row: Trade) => {
    //         const initialChange = row.change;
    //         const initialPoints = Array.from({ length: 8 }, (_, index) => ({
    //             x: index + 1,
    //             y: initialChange + Math.floor(Math.random() * 100),
    //         }));
    //         acc[row.id] = initialPoints;
    //         return acc;
    //     }, {} as { [key: number]: DataPoint[] });
    // });

    const onDataLoad = () => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && feedDelayInputRef.current?.element?.parentElement?.classList.contains('sf-input-focus')) {
                feedDelayInputRef.current.value = parseInt(feedDelayInputRef.current.element.value);
                updateButtonRef.current?.element?.click();
            }
        };
        if (gridRef.current && initial.current) {
            document.getElementById('update1')?.click();
            initial.current = false;
            feedDelayInputRef.current?.element?.addEventListener('keypress', handleKeyPress);
        }
        return () => {
            feedDelayInputRef.current?.element?.removeEventListener?.('keypress', handleKeyPress);
        };
    };

    /** 
     * Renders the Change column template, displaying the change value with conditional styling.
     * @param props - The cell template arguments provided by the grid.
     * @returns A React element displaying the formatted change value.
     */
    const ChangeTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const change = (props?.data as Trade)?.change ?? 0;
        const className = change < 0 ? 'below-0' : 'above-0';
        return (
            <div className={className}>
                <span className="rowcell-left">{change.toFixed(2)}</span>
            </div>
        );
    }, []);

    /** 
     * Renders the Change Percent column template, displaying the percentage change with conditional styling.
     * @param props - The cell template arguments provided by the grid.
     * @returns A React element displaying the formatted change percentage.
     */
    const ChangePercentTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const changePercent = (props?.data as Trade)?.change_percent ?? 0;
        const className = changePercent < 0 ? 'below-0' : 'above-0';
        return (
            <div className={className}>
                <span className="rowcell-left">{changePercent.toFixed(2)}%</span>
            </div>
        );
    }, []);

    /** 
     * Renders the Rating column template, displaying a rating with an SVG icon based on the change percentage.
     * @param props - The cell template arguments provided by the grid.
     * @returns A React element with an SVG icon and rating text.
     */
    const RatingTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const change = (props?.data as Trade)?.change_percent ?? 0;
        let text: string;
        let textClass: string;
        let SvgComponent: React.FC;

        switch (true) {
            case change === 0:
                text = 'Neutral';
                textClass = 'neutral';
                SvgComponent = () => (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" fill="none" />
                        <path d="M5 12H19" stroke="#888888" strokeWidth="3" strokeLinecap="square" strokeLinejoin="round" />
                    </svg>
                );
                break;
            case change < -1:
                text = 'Strongly Sell';
                textClass = 'below-0';
                SvgComponent = () => (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" fill="white" />
                        <path d="M5.5 12.5L11.5 18.5L17.5 12.5" stroke="#FF3740" strokeWidth="2" strokeLinecap="square" />
                        <path d="M5.5 5.5L11.5 11.5L17.5 5.5" stroke="#FF3740" strokeWidth="2" strokeLinecap="square" />
                    </svg>
                );
                break;
            case change < 0:
                text = 'Sell';
                textClass = 'below-0';
                SvgComponent = () => (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5 7.08578L12 14.0858L19 7.08578L20.4142 8.5L12 16.9142L3.58578 8.5L5 7.08578Z"
                            fill="#FF3740"
                        />
                    </svg>
                );
                break;
            case change > 1:
                text = 'Strongly Buy';
                textClass = 'above-0';
                SvgComponent = () => (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" fill="none" />
                        <path d="M17.5 11.5L11.5 5.5L5.5 11.5" stroke="#00A653" strokeWidth="2" strokeLinecap="square" />
                        <path d="M17.5 18.5L11.5 12.5L5.5 18.5" stroke="#00A653" strokeWidth="2" strokeLinecap="square" />
                    </svg>
                );
                break;
            default:
                text = 'Buy';
                textClass = 'above-0';
                SvgComponent = () => (
                    <svg width="10" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 8L8 2L14 8" stroke="#00A653" strokeWidth="2" strokeLinecap="square" />
                    </svg>
                );
                break;
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className={`sf-icons ${textClass} ic side-space`}>
                    <SvgComponent />
                </span>
                <span className={textClass}>{text}</span>
            </div>
        );
    }, []);

    const updateCellValues = () => {
        const fullData = (gridRef.current?.currentViewData ?? []) as TradeRow[];
        const rowsToUpdate = Math.floor(Math.random() * (70 - 50 + 1)) + 50; // Random between 50 and 70
        if (fullData.length === 0) return;

        // Randomly select unique indices from full dataset
        const indices = Array.from({ length: fullData.length }, (_, i) => i);
        const randomIndices = [];
        for (let i = 0; i < rowsToUpdate; i++) {
            const randomIndex = Math.floor(Math.random() * indices.length);
            randomIndices.push(indices.splice(randomIndex, 1)[0]);
        }

        // const updatedChartData = { ...chartData };

        for(var index: number = 0; index < randomIndices.length; index++) {
        // randomIndices.forEach((index) => {
            const row = fullData[randomIndices[index]];
            if (!row) return;

            const oldValue = row.price;
            const maxChangePercent = 2.0;
            const changeFactor = (Math.random() * 2 - 1) * maxChangePercent / 100;
            const newChange = parseFloat((oldValue * changeFactor).toFixed(2));
            // const newPrice = parseFloat((oldValue + newChange).toFixed(2));
            const changePercent = parseFloat(((newChange / oldValue) * 100).toFixed(2));
            const ratingValue = newChange < 0 ? 'Sell' : 'Buy';

            // gridRef.current?.setCellValue?.(row.id, 'change', newChange, true);
            // gridRef.current?.setCellValue?.(row.id, 'change_percent', changePercent, true);
            // gridRef.current?.setCellValue?.(row.id, 'Rating', ratingValue, true);
            gridRef.current?.setRowData?.(row.id, {...row, change: newChange, change_percent: changePercent, Rating: ratingValue}, true);

            // const currentPoints = updatedChartData[row.id] || [];
            // const newPoint = {
            //     x: currentPoints.length + 1,
            //     y: newChange + Math.floor(Math.random() * 100),
            // };
            // updatedChartData[row.id] = [...currentPoints.slice(-7), newPoint];
        };

        // setChartData(updatedChartData);
    };

    const updateClick = () => {
        if (timerID) {
            clearInterval(timerID);
            setTimerID(undefined);
        }  
        const inputValue = feedDelayInputRef.current?.element?.value || '';
        const feedDelay = inputValue ? Number(inputValue.replace(/,/g, '')) : 0;
        setIsUpdating(true);
        const newTimerID = setInterval(updateCellValues, feedDelay);
        setTimerID(newTimerID);
    };

    const clearClick = () => {
        if (timerID) {
            setIsUpdating(false);
            clearInterval(timerID);
            setTimerID(undefined);
        }
    };

    useEffect(() => {
        return () => {
            if (timerID) clearInterval(timerID);
        };
    }, [timerID]);

    /** 
     * Renders the Ticker column template, displaying a stock image and ticker name.
     * @param props - The cell template arguments provided by the grid.
     * @returns A React element with an image and ticker text.
     */
    const stockTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const tradeData = props?.data as Trade;
        const ticker = tradeData.ticker ?? '';
        const initial = ticker.substring(0, 2);
        const colors = ['Red', 'Green', 'Blue', 'Orange', 'Purple'];
        const colorTheme = colors[tradeData.id % colors.length];
        const colorStyles: { [key: string]: { backgroundColor: string; color: string } } = {
            Red: { backgroundColor: '#fee2e2', color: '#b91c1c' },
            Green: { backgroundColor: '#dcfce7', color: '#166534' },
            Blue: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
            Orange: { backgroundColor: '#ffedd5', color: '#9a3412' },
            Purple: { backgroundColor: '#f3e8ff', color: '#581c87' },
        };
        const avatarStyle: React.CSSProperties = colorStyles[colorTheme];
        return (
            <div className="ticker-cell">
                <div className="rounded-logo" style={avatarStyle}>
                    {initial}
                </div>
                <span className="ticker-name">{ticker}</span>
            </div>
        );
    }, []);

    // const chartTemplate = (props?: ColumnTemplateProps): React.ReactElement => {
    //     const rowId = (props?.data as Trade).id;
    //     return (
    //         <Chart id={`spline-${rowId}`} height="40px">
    //             <ChartArea border={{ width: 0 }} />
    //             <ChartPrimaryXAxis visible={false}>
    //                 <ChartMajorGridLines width={0} />
    //             </ChartPrimaryXAxis>
    //             <ChartPrimaryYAxis interval={5} lineStyle={{ width: 0 }} visible={false}>
    //                 <ChartMajorTickLines width={0} />
    //             </ChartPrimaryYAxis>
    //             <ChartSeriesCollection>
    //                 <ChartSeries dataSource={chartData[rowId] || []} xName="x" yName="y" width={2} type="Line">
    //                     <ChartMarker visible={true} height={2} width={2} />
    //                 </ChartSeries>
    //             </ChartSeriesCollection>
    //             <ChartTooltip enable={true} />
    //         </Chart>
    //     );
    // };

    return (
        <div className="control-pane">
            <div className="control-section">
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'inline-block', fontSize: '14px', padding: '0 7px 0 5px', fontWeight: 700 }}>
                        Feed Delay(ms):
                    </label>
                    {useMemo(() =><>
                    <NumericTextBox
                        format="N0"
                        defaultValue={300}
                        min={10}
                        max={5000}
                        width="150px"
                        style={{ marginLeft: '7px' }}
                        ref={feedDelayInputRef}
                        aria-label="Feed delay"
                        disabled={isUpdating}
                    />
                    <Button
                        id="update1"
                        ref={updateButtonRef}
                        onClick={updateClick}
                        style={{ marginLeft: '10px' }}
                        disabled={isUpdating}
                    >
                        Start Data Update
                    </Button>
                    <Button
                        id="clear"
                        ref={clearButtonRef}
                        onClick={clearClick}
                        style={{ marginLeft: '10px' }}
                        disabled={!isUpdating}
                    >
                        Stop Data Update
                    </Button></>, [isUpdating])}
                </div>
                {useMemo(
                    /** 
                     * Memoized Grid component to prevent unnecessary re-renders.
                     * @returns The Syncfusion Grid component with configured columns and templates.
                     */
                    () => (
                        <Grid
                            id="livestream"
                            ref={gridRef}
                            dataSource={getTradeData}
                            enableHover={false}
                            rowHeight={40}
                            height={400}
                            onDataLoad={onDataLoad}
                            selectionSettings={{ enabled: false}}
                            allowKeyboard={false}
                            gridLines='Both'
                        >
                            <Columns>
                                <Column field="id" headerText="ID" isPrimaryKey={true} visible={false} />
                                <Column field="ticker" headerText="Ticker" width="100" template={stockTemplate} textAlign="Left" />
                                {/* <Column field="country" headerText="Chart" template={chartTemplate} /> */}
                                <Column field="change_percent" headerText="Change %" width="100" textAlign="Right" template={ChangePercentTemplate} />
                                <Column field="change" headerText="Change" width="100" format="C2" textAlign="Right" template={ChangeTemplate} />
                                <Column field="price" headerText="Price" width="100" format="C2" type="number" textAlign="Right" />
                                <Column field="high" headerText="High" format="C2" type="number" textAlign="Right" width="130" />
                                <Column field="low" headerText="Low" format="C2" type="number" textAlign="Right" width="130" />
                                <Column field="Rating" headerText="Tech Rating" textAlign="Left" width="150" template={RatingTemplate} />
                            </Columns>
                        </Grid>
                    ),
                    []
                )}
            </div>
        </div>
    );
}
export const Paging: React.FC = () => {
  const gridRef = useRef<GridRef<unknown>>(null);
    // state to manage sort, filter and page settings    
    const [sortSettings] = useState<SortSettings>({ enabled: true});
    const [filterSettings] = useState<FilterSettings>({enabled: true});    
    const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8 });
    const [pageStartOutput, setPageStartOutput] = useState<string[]>([]);
    const [pageCompleteOutput, setPageCompleteOutput] = useState<string[]>([]); 
    /**
     * Memoized handler for header cell rendering.
     */
    const onPageChangeStart = useCallback((args?: PageEvent) => {
        setPageStartOutput( prev => [...prev, "onPageChangeStart event called\n"]); 
        if (args?.requestType === ActionType.Paging) {
            if (args.previousPage === 2) {
                args.cancel = true;
                setPageStartOutput( prev => [...prev,`onPageChangeStart: navigation canceled from page ${args.previousPage}.\n`]);
            }
        } 
    }, []); // No dependencies

    /**
     * Memoized handler for cell rendering.
     */
    const onPageChange = useCallback(() => {
        setPageCompleteOutput( prev => [...prev, "onPageChange event called\n"]);
    }, []); // No dependencies
 
    /**
     * Memoized handler for clearing the console.
     */
    const clearConsole = useCallback(() => {
        setPageStartOutput([]);
        setPageCompleteOutput([]);
    }, []);
 
    // Memoize the Grid to prevent re-renders
    const gridComponent = useMemo(() => (
        <Grid ref={gridRef} dataSource={hotelBookingData} onPageChangeStart={onPageChangeStart} onPageChange={onPageChange} pageSettings={pageSettings} filterSettings={filterSettings} sortSettings={sortSettings} >
            <Columns>
                <Column field="BookingID" headerText="Booking ID" width={90} />
                <Column field="GuestName" headerText="Name" width={100} />
                <Column field="CheckInDate" headerText="Check In" width={100} type='date' format="yMd" textAlign="Right" filter={{filterBarType:"datepickerfilter"}} />
                <Column field="RoomType" headerText="Room Type" width={100} />
                <Column field="PaymentStatus" headerText="Payment Status" width={120} />
            </Columns>
        </Grid>
    ), [onPageChangeStart, onPageChange]); // Depend only on event handlers
 
    return (
        <div>            
            {gridComponent}
            <div
                style={{
                    marginTop: '20px',
                    borderRadius: '12px',
                    background: '#FFFFFF',
                    color: '#1C1B1F',
                    border: '1px solid #CAC4D0',
                    fontFamily: 'Roboto, sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderBottom: '1px solid #CAC4D0',
                    }}
                >
                    <span style={{ fontWeight: 500, fontSize: '16px', color: '#1C1B1F' }}> 
                        Console
                    </span>
                    <Button onClick={clearConsole} className="e-flat e-small">Clear</Button>
                </div>
                <div
                    style={{
                        height: '130px',
                        overflow: 'auto',
                        minHeight: '100px',
                        maxHeight: '500px',
                    }}
                >
                    <pre
                        style={{
                            padding: '12px 16px',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            color: '#49454F',
                            fontSize: '14px',
                            fontFamily: 'monospace'
                        }}
                    >
                        {pageStartOutput.join('')}{pageCompleteOutput.join('')}
                    </pre>
                </div>
            </div>
        </div>
    );
}
export const SelectionDatePickerFilter: React.FC = () => {
  return (
        <div >
            <Grid dataSource={supplierContractData.slice(0,24)}  
                filterSettings={{enabled: true}} sortSettings={{enabled: true}} pageSettings={{enabled: true, pageSize: 8 }}>
                <Columns>
                    <Column field="ContractID" headerText="Contract ID" width={100} textAlign='Right'/>
                    <Column field="SupplierName" headerText="Supplier Name" width={90} />
                    <Column field="ContractType" headerText="Contract Type" width={100} />
                    <Column field="Amount" format='C2' headerText="Amount" width={80} textAlign='Right' />
                    <Column field="Country" headerText="Country" width={100} />
                    <Column field="StartDate" headerText="Recived Date" filter={{filterBarType:"datepickerfilter"}} width={100} format="yMd" textAlign="Right" /> 
                </Columns>
            </Grid>
        </div>
    );
}
export const RemoteDataSample: React.FC = () => {
  const data = new DataManager({
        url: 'https://services.odata.org/V4/Northwind/Northwind.svc/Orders',
        adaptor: new ODataV4Adaptor()
    });

    return (
        <div>
            <Grid dataSource={data} sortSettings={{enabled: true}} filterSettings={{enabled: true}} pageSettings={{enabled: true, pageSize: 8}}>
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width={120} textAlign="Right" />
                    <Column field="CustomerID" headerText="Customer ID" width={110} />
                    <Column field="OrderDate" headerText="Order Date" width={110} textAlign="Right" type="date" format="yMd" />
                    <Column field="Freight" headerText="Freight" width={120} textAlign="Right" format="C2" />
                    <Column field="ShippedDate" headerText="Shipped Date" width={130} textAlign="Right" type="date" format="yMd" />
                    <Column field="ShipCountry" headerText="Ship Country" width={130} />
                </Columns>
            </Grid>
        </div>
    );
}
export const RowEvent: React.FC = () => {
  const gridRef = useRef<GridRef<unknown>>(null);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);

  /**
   * Applies styling to Status cells and logs row rendering to custom console.
   * @param args - Row render event arguments.
   */
  const onRowRender = (args?: RowRenderEvent) => {
    if (args?.data && args.row) {
      const status = (args.data as Contract).Status;
      if (status === 'Pending') {
        args.row.classList.add('sf-pending-status');
      } else if (status === 'Cancelled') {
        args.row.classList.add('sf-cancel-status');
      } else if (status === 'Expired') {
        args.row.classList.add('sf-expired-status');
      }
      setConsoleMessages((prev) => [
        ...prev,
        `onRowRender event called`,
      ]);
    }
  };

  /**
   * Clears the console output and resets row count.
   */
  const clearConsole = () => {
    setConsoleMessages([]);
  };

  const refresh = () => {
    gridRef.current?.refresh();
  };

  // Memoize the grid to prevent unnecessary re-renders
  const gridComponent = useMemo(
    () => (
      <Grid
        dataSource={supplierContractData.slice(0, 7)}
        onRowRender={onRowRender}
        enableHover={false}
        selectionSettings={{ enabled: false }}
        className="rowdata-bound-style"
      >
        <Columns>
          <Column field="ContractID" headerText="Contract ID" width={90} textAlign="Right" />
          <Column field="SupplierName" headerText="Supplier Name" width={100} />
          <Column field="MailID" headerText="Mail" width={150} textAlign="Center" />
          <Column
            field="CustomerPhoneNumber"
            headerText="Phone"
            width={110}
            textAlign="Right"
            filter={{ operator: 'contains' }}
          />
          <Column field="Country" width={90} />
          <Column field="Status" width={90} />
        </Columns>
      </Grid>
    ),
    [] // Empty dependencies since dataSource and onRowRender are stable
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
          <Button onClick={refresh}>Refresh</Button>
      </div>
      {gridComponent}
      <div
          style={{
              marginTop: '20px',
              borderRadius: '12px',
              background: '#FFFFFF',
              color: '#1C1B1F',
              border: '1px solid #CAC4D0',
              fontFamily: 'Roboto, sans-serif',
          }}
      >
          <div
              style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderBottom: '1px solid #CAC4D0',
              }}
          >
              <span style={{ fontWeight: 500, fontSize: '16px', color: '#1C1B1F' }}> 
                  Console
              </span>
              <Button onClick={clearConsole} className="e-flat e-small">Clear</Button>
          </div>
          <div
              style={{
                  height: '130px',
                  overflow: 'auto',
                  minHeight: '100px',
                  maxHeight: '500px',
              }}
          >
              <pre
                  style={{
                      padding: '12px 16px',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      color: '#49454F',
                      fontSize: '14px',
                      fontFamily: 'monospace'
                  }}
              >
                  {consoleMessages.join('\n')}
              </pre>
          </div>
      </div>
  </div>
  );
}
export const BasicFiltering: React.FC = () => {
  return (
        <div>
            <Grid dataSource={tasksData} sortSettings={{enabled: true}} filterSettings={{enabled: true}} pageSettings={{ enabled: true, pageSize: 8 }} >
                <Columns>
                    <Column field="TaskID" headerText="ID" width="80" textAlign='Right' />
                    <Column field="TaskName" headerText="Task Name" width="180" />
                    <Column field="Progress" headerText="Progress" width="220" />
                    <Column field="AssignedTo" headerText="Assigned" width="130" />
                    <Column field="Deadline" headerText="Deadline" width="100" type='date' format="yMd" textAlign='Right' />
                </Columns>
            </Grid>
        </div>
    );
}
export const BasicAggregate: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerSum = (props: any) => {
    return (<span>Sum: {props.Sum}</span>);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerAverage = (props: any) => {
    return (<span>Average: {props.Average}</span>);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerMax = (props: any) => {
    return (<span>Max: {props.Max}</span>)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerMin = (props: any) => {
    return (<span>Min: {props.Min}</span>)
  }
  return (
    <div>
     <Grid dataSource={studentData} filterSettings={{enabled: true}} sortSettings={{enabled: true}} pageSettings={{ enabled: true,pageSize: 8 }} >
      <Columns>
        <Column field="RollNo" headerText="Roll No" width="130" textAlign='Right' />
        <Column field="Mark1" headerText="Mark 1" width="130" textAlign="Right"/>
        <Column field="Mark2" headerText="Mark 2" width="120" textAlign="Right" filter={{filterBarType: 'numericfilter'}}/>
        <Column field="Mark3" headerText="Mark 3" width="130" textAlign="Right"/>
        <Column field="Average" headerText="Average" width="120" textAlign="Right"/>
        <Column field="Fees" headerText="Fees" width="120" textAlign="Right"/>
      </Columns>
      <Aggregates>
        <AggregateRow>
          <AggregateColumn field='Mark1' type='Max' footerTemplate={footerMax} format='N0' />
          <AggregateColumn field='Mark2' type='Min' footerTemplate={footerMin} format='N0' />
          <AggregateColumn field='Mark3' type='Min' footerTemplate={footerMin} format='N0' />
          <AggregateColumn field='Average' type='Average' footerTemplate={footerAverage} format='N0' />
          <AggregateColumn field='Fees' type='Sum' footerTemplate={footerSum} format='N0' />
        </AggregateRow>          
      </Aggregates>
    </Grid>
   </div>
 );
}
export const CustomData: React.FC = () => {
  React.useEffect(() => {
		renderComplete();
	}, []);
  const [data, setData] = React.useState<GridData>({ result: [], count: 0 });
  const [sortSettings, _setSortSettings] = useState<SortSettings>({enabled: true});
  const [filterSettings, _setFilterSettings] = useState<FilterSettings>({enabled: true});
  const [pageSettings, _setPageSettings] = useState<PageSettings>({ enabled: true,pageCount: 4, pageSize: 10 });
	const BASE_URL = 'https://services.odata.org/V4/Northwind/Northwind.svc/Orders';

	function renderComplete() {
		const state: DataState = {
			skip: 0,
			take: 10,
			// sort: [{ name: 'CustomerID', direction: 'ascending' }],
			// filtered: [{ columns: [{ field: 'ShipCity', matchCase: false, operator: 'startswith', predicate: 'and', value: 'Graz' }] }],
		};
		onDataRequest(state);
	}

	const onDataRequest = (state: DataRequestEvent | undefined) => {
    if (state) {
      const dataState: DataState = {
        skip: state.skip ?? 0,
        take: state.take ?? 10,
        sort: state.sort
          ?.filter((sort): sort is { name: string; direction: string } => !!sort.field)
          .map((sort) => ({ name: sort.name!, direction: sort.direction })),
        filtered: (state as CustomDataStateRequestEvent).filtered,
      };
      execute(dataState).then((gridData: GridData) => {
        setData(gridData);
      });
    }
  };

	function execute(state: DataState): Promise<GridData> {
		return getData(state);
	}

	// Function to build page query
	function buildPageQuery(state: DataState): string {
		return `$skip=${state.skip}&$top=${state.take}`;
	}

	// Function to build sort query
	function buildSortQuery(state: DataState): string {
		if (state.sort?.length) {
			return (
				`&$orderby=` + state.sort
					.map((obj) => (obj.direction === 'descending' ? `${obj.name} desc` : obj.name))
					.reverse()
					.join(',')
			);
		}
		return '';
	}

	// Function to build filter query
	function buildFilterQuery(state: DataState): string {
		if (state.filtered?.length) {
			return (
				`&$filter=` + state.filtered.map((filter) => filter.columns
					.map((col) => {
						const value = typeof col.value === 'string' ? `'${col.value}'` : col.value;
						if (col.operator === 'startswith') {
							return `startswith(tolower(${col.field}), ${value.toLowerCase()})`;
						} else if (col.operator === 'equal') {
							return `${col.field} eq ${value}`;
						} else if (col.operator === 'contains') {
							return `contains(tolower(${col.field}), ${value.toLowerCase()})`;
						}
						return '';
					})
					.join(' and ')
				)
				.join(' and ')
			);
		}
		return '';
	}

	function getData(state: DataState): Promise<GridData> {
		const pageQuery = buildPageQuery(state);
		const sortQuery = buildSortQuery(state);
		const filterQuery = buildFilterQuery(state);

		const url = `${BASE_URL}?${pageQuery}${sortQuery}${filterQuery}&$count=true`;
		const fetchApi = Fetch(url, 'GET', 'application/json');

		if (fetchApi && typeof fetchApi.send === 'function') {
			return fetchApi.send().then(async (response: Response) => {
			const value = response as unknown as { value: Array<object>; '@odata.count': string };
			return {
				result: value.value,
				count: parseInt(value['@odata.count'], 10),
			};
			}).catch((error: Error) => {
			console.log(error);
			throw error;
			});
		} else {
			return Promise.resolve({ result: [], count: 0 });
		}
	}

	return (
		<div>
			<Grid dataSource={data} sortSettings={sortSettings} filterSettings={filterSettings} pageSettings={pageSettings}
				 onDataRequest={onDataRequest} height={350} >
				<Columns>
					<Column field="OrderID" headerText="Order ID" width={120} textAlign="Right" />
					<Column field="CustomerID" headerText="Customer ID" width={120} />
					<Column field="Freight" headerText="Freight" width={80} textAlign="Right" format="C2" />
					<Column field="ShipName" headerText="Ship Name" width={130} />
					<Column field="ShipCity" headerText="Ship City" width={100} />
					<Column field="ShipCountry" headerText="Ship Country" width={100} />
				</Columns>
			</Grid>
		</div>
	);
}
export const DisableEditColumnDynamically: React.FC = () => {
  // const gridRef = useRef<GridRef<unknown>>(null);
  //   const [allowEditingColumn, setAllowEditingColumn] = useState<Record<string, boolean>>({
  //     ProductName: true,
  //     UnitsInStock: true,
  //     QuantityPerUnit: true,
  //     UnitPrice: true,
  //     TotalCost: true
  //   });
  //   // State to manage sort, filter, page, edit and toolbar settings.    
  //   const [filterSettings] = useState<FilterSettings>({enabled: true});
  //   const [sortSettings] = useState<SortSettings>({enabled: true});
  //   const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8, pageCount: 4 });
  //   const [editSettings] = useState<EditSettings>({ allowEdit: true, allowAdd: true, allowDelete: true }); //, showAddNewRow: true
  //   const [toolbarSettings] = useState<string[]>(['Add', 'Edit', 'Delete', 'Update', 'Cancel']);
  //   const productIDRules = { required: true, number: true };
  //   const productNameRules = { required: true };
  //   const stockRules = { required: true, min: 0, max: 130 };
  //   const alignmentData: { [key: string]: unknown }[]  = [
  //       { text: 'Product ID', value: 'ProductID' },
  //       { text: 'Product Name', value: 'ProductName' },
  //       { text: 'Units In Stock', value: 'UnitsInStock' },
  //       { text: 'Quantity Per Unit', value: 'QuantityPerUnit' },
  //       { text: 'Unit Price', value: 'UnitPrice' },
  //       { text: 'Total Cost', value: 'TotalCost' },
  //   ];
  //   const dropdownFields = { text: 'text', value: 'value' };

  //   /**
  //    * Handles dropdown change to disable editing for selected column.
  //    * @param args - Change event arguments from DropDownList.
  //    */
  //   const changeAlignment = (args?: ChangeEventArgs) => {
  //     const fieldName: string = args?.value as string;
  //       setAllowEditingColumn({
  //         ProductName: true,
  //         UnitsInStock: true,
  //         QuantityPerUnit: true,
  //         UnitPrice: true,
  //         TotalCost: true,
  //         [fieldName]: false
  //       });
  //   };

  //   return (
  //       /**
  //        * Memoized Grid component with editing, sorting, filtering, and paging.
  //        */
  //       <div>
  //           <div style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', width: '70%' }}>
  //               <label style={{  width: '100%' }}>
  //                   <b>Select column to disable editing:</b>
  //               </label>
  //               {useMemo(() => <DropDownList width={70} dataSource={alignmentData as { [key: string]: object }[]} fields={dropdownFields} onChange={changeAlignment} />, [])}
  //           </div>
  //           <Grid ref={gridRef} dataSource={productData} editSettings={editSettings} toolbar={toolbarSettings} filterSettings={filterSettings} sortSettings={sortSettings} pageSettings={pageSettings}>
  //               <Columns>
  //                   <Column field='ProductID' headerText='Product ID' width='80' textAlign='Right' isPrimaryKey={true}  filter={useMemo(() => ({filterBarType:"numericfilter"}), [])} validationRules={productIDRules}/>
  //                   <Column field='ProductName' headerText='Product Name' width='100' edit={useMemo(() => ({type:EditType.DropDownList}), [])} validationRules={productNameRules} clipMode='EllipsisWithTooltip' allowEdit={allowEditingColumn.ProductName}/>
  //                   <Column field='UnitsInStock' headerText='Stock Unit' width='100' edit={useMemo(() => ({type:EditType.NumericTextBox}), [])} validationRules={stockRules}  textAlign='Right' filter={useMemo(() => ({filterBarType:FilterBarType.NumericTextBox}), [])} allowEdit={allowEditingColumn.UnitsInStock}/>
  //                   <Column field='QuantityPerUnit' headerText='Quantity Per Unit' width='90' allowEdit={allowEditingColumn.QuantityPerUnit}/>
  //                   <Column field='UnitPrice' headerText='Unit Price' format="C2" width='100' textAlign='Right' edit= {useMemo(() => ({type:EditType.NumericTextBox}), [])} filter={useMemo(() => ({filterBarType:FilterBarType.NumericTextBox}), [])} allowEdit={allowEditingColumn.UnitPrice}/>
  //                   <Column field='TotalCost' headerText='Total Cost' format="C2" width='100' textAlign='Right' edit= {useMemo(() => ({type:EditType.NumericTextBox}), [])} filter={useMemo(() => ({filterBarType:FilterBarType.NumericTextBox}), [])} allowEdit={allowEditingColumn.TotalCost}/>
  //               </Columns>
  //           </Grid>
  //       </div>
  //   );

  const gridRef = useRef<GridRef>(null);
    const [allowEditingColumn, setAllowEditingColumn] = useState<Record<string, boolean>>({
      ProductName: true,
      QuantityPerUnit: true,
      UnitsSold: true,
      UnitPrice: true,
      TotalCost: true
    });
    // State to manage sort, filter, page, edit and toolbar settings.    
    const [filterSettings] = useState<FilterSettings>({enabled: true});
    const [sortSettings] = useState<SortSettings>({enabled: true});
    const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8, pageCount: 4 });
    const [editSettings] = useState<EditSettings>({ allowEdit: true, allowAdd: true, allowDelete: true }); //, showAddNewRow: true
    const [toolbarSettings] = useState<string[]>(['Add', 'Edit', 'Delete', 'Update', 'Cancel']);
    const productIDRules = { required: true, number: true };
    const productNameRules = { required: true };
    const stockRules = { required: true, min: 0, max: 130 };
    const alignmentData: { [key: string]: unknown }[]  = [
        { text: 'Product ID', value: 'ProductID' },
        { text: 'Product Name', value: 'ProductName' },
        { text: 'Quantity Per Unit', value: 'QuantityPerUnit' },
        { text: 'Units Sold', value: 'UnitsSold' },
        { text: 'Unit Price', value: 'UnitPrice' },
        { text: 'Total Cost', value: 'TotalCost' },
    ];
    const dropdownFields = { text: 'text', value: 'value' };

    // Handles dropdown change to disable editing for selected column.
    const changeAlignment = (args?: ChangeEventArgs) => {
      const fieldName: string = args?.value as string;
        setAllowEditingColumn({
          ProductName: true,
          QuantityPerUnit: true,
          UnitsSold: true,
          UnitPrice: true,
          TotalCost: true,
          [fieldName]: false
        });
    };

    return (
        // Memoized Grid component with editing, sorting, filtering, and paging.
        <>
            {/* <PropertyPane>
                <PropertyColumn>
                    <PropertyRow> */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '400px' }}>
                            <label htmlFor="culture-select" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Select column to disable editing:
                            </label>
                            {useMemo(() => <DropDownList width={70} dataSource={alignmentData as { [key: string]: object }[]} defaultValue={alignmentData[0].value as string} fields={dropdownFields} onChange={changeAlignment} />, [])}
                        </div>
                    {/* </PropertyRow>
                </PropertyColumn>
            </PropertyPane> */}
            <Grid ref={gridRef} dataSource={productData} editSettings={editSettings} toolbar={toolbarSettings} filterSettings={filterSettings} sortSettings={sortSettings} pageSettings={pageSettings}>
                <Columns>
                    <Column field='ProductID' headerText='Product ID' width='80' textAlign={TextAlign.Right} isPrimaryKey={true} filter={useMemo(() => ({filterBarType:FilterBarType.NumericTextBox}), [])} validationRules={productIDRules}/>
                    <Column field='ProductName' headerText='Product Name' width='100' edit={useMemo(() => ({type:EditType.DropDownList}), [])} validationRules={productNameRules} clipMode={ClipMode.EllipsisWithTooltip} allowEdit={allowEditingColumn.ProductName}/>
                    <Column field='QuantityPerUnit' headerText='Quantity Per Unit' width='100' allowEdit={allowEditingColumn.QuantityPerUnit}/>
                    <Column field='UnitsSold' headerText='Units Sold' width='100' edit={useMemo(() => ({type:EditType.NumericTextBox}), [])} validationRules={stockRules} textAlign={TextAlign.Right} filter={useMemo(() => ({filterBarType:FilterBarType.NumericTextBox}), [])} allowEdit={allowEditingColumn.UnitsSold}/>
                    <Column field='UnitPrice' headerText='Unit Price' format="C2" width='110' textAlign={TextAlign.Right} edit= {useMemo(() => ({type:EditType.NumericTextBox}), [])} filter={useMemo(() => ({filterBarType:FilterBarType.NumericTextBox}), [])} allowEdit={allowEditingColumn.UnitPrice}/>
                    <Column field='TotalCost' headerText='Total Cost' format="C2" width='110' textAlign={TextAlign.Right} edit= {useMemo(() => ({type:EditType.NumericTextBox}), [])} filter={useMemo(() => ({filterBarType:FilterBarType.NumericTextBox}), [])} allowEdit={allowEditingColumn.TotalCost}/>
                </Columns>
            </Grid>
        </>
    );
}
export const GettingStartEvents: React.FC = () => {
   const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

    /**
     * Memoized handler for cell rendering.
     */
    const handleOnReady = useCallback(() => {
        setConsoleOutput(prev => [...prev, `"onGridRenderComplete" event triggered.\n`]);
    }, []);

    const handleOnRenderStart = useCallback(() => {
        setConsoleOutput(prev => [...prev, `"onGridRenderStart" event triggered.\n`]);
    }, []);

    const handleOnDataLoaded = useCallback(() => {
        setConsoleOutput(prev => [...prev, `"onDataLoad" event triggered.\n`]);
    }, []);

    const handleOnError = useCallback((args?: Error) => {
        setConsoleOutput(prev => [...prev, `"onError" event triggered: ${JSON.stringify(args)}.\n`]);
    }, []);

    const handleonPageChange = useCallback((prop:PageEvent) => {
        const pageType = `{currentPage: "${prop.currentPage}", previousPage: "${prop.previousPage}",  requestType: "${prop.requestType}"}` ;
        setConsoleOutput(prev => [...prev, `"onPageChange" event triggered.`,
        `"Page action details": *${pageType}.*`]);
    }, []);

    const handleonSort = useCallback((props: SortEvent) => {
        if (props.requestType === ActionType.Sorting) {
            const sortInfo = `{requestType: "${props.requestType}", field: "${props.field}", direction: "${props.direction}"}`;
            setConsoleOutput(prev => [...prev, `"onSort" event triggered.`, `"Sort action details": *${sortInfo}.*`]);
        } else if (props.requestType === ActionType.ClearSorting) {
            const sortInfo = `{requestType: "${props.requestType}"}`;
            setConsoleOutput(prev => [...prev, `"onSort" event triggered.`, `"Sort action details": *${sortInfo}.*`]);
        }
    }, []);
    
    const handleonFilter = useCallback((props:FilterEvent) => {
        if (props.requestType === ActionType.Filtering) {
            const filterInfo = `{requestType: "${props.requestType}", field: "${props.currentFilterColumn?.field}", value: "${props.currentFilterPredicate?.value}"}`;
            setConsoleOutput(prev => [...prev, `"onFilter" event triggered.`, `"Filter action details": *${filterInfo}.*`]);
        } else if (props.requestType === ActionType.ClearFiltering) {
            const filterInfo = `{requestType: "${props.requestType}", field: "${props.currentFilterColumn?.field}"}`;
            setConsoleOutput(prev => [...prev, `"onFilter" event triggered.`, `"Filter action details": *${filterInfo}.*`]);
        }
    }, []);

    const handleonSearch = useCallback((props:SearchEvent) => {
        const searchInfo = props.value ? `{requestType: "${props.requestType}", value: "${props.value}"}` : `{requestType: "${props.requestType}"}`;
        setConsoleOutput(prev => [...prev, `"onSearch" event triggered.`, `"Search action details": *${searchInfo}*.`]);
    }, []);

    const handleonRowSelect = useCallback((prop:RowSelectEvent) => {
        // const rowSelectType = prop.selectedRowIndexes?.length ? `{rowIndexes: ${prop.selectedRowIndexes}}`: `{rowIndex: ${prop.selectedRowIndex}}` 
        setConsoleOutput(prev => [...prev, `"onRowSelect" event triggered.`, `"RowSelect action details": *${JSON.stringify({
          selectedRowIndexes: prop.selectedRowIndexes,
          selectedCurrentRowIndexes: prop.selectedCurrentRowIndexes,
          selectedRowIndex: prop.selectedRowIndex,
          data: prop.data
        })}.*`]);
    }, []);

    const handleonRowDeselect = useCallback((prop:RowSelectEvent) => {
        // const rowDeSelectType = prop.selectedRowIndexes?.length ? `{rowIndexes: ${prop.selectedRowIndexes}}`: `{rowIndex: ${prop.selectedRowIndex}}` 
        setConsoleOutput(prev => [...prev, `"onRowDeselect" event triggered.`, `"RowDeselect action details": *${JSON.stringify({
          selectedRowIndexes: prop.selectedRowIndexes,
          deSelectedCurrentRowIndexes: prop.deSelectedCurrentRowIndexes,
          deSelectedRowIndex: prop.deSelectedRowIndex,
          data: prop.data
        })}.*`]);
    }, []);

    /**
     * Memoized handler for clearing the console.
     */
    const clearConsole = useCallback(() => {
        setConsoleOutput([]);
    }, []);
    
    // Memoize the Grid to prevent re-renders
    const gridComponent = useMemo(() => (
      //  pageSettings={{ enabled: true, currentPage: 2 }}
        <Grid dataSource={employeeInformation} sortSettings={{enabled: true, columns: [{field: 'Name', direction: 'Ascending'}]}} filterSettings={{enabled: true}}
            searchSettings={{ enabled: true }} toolbar={['Search']} onGridRenderComplete={handleOnReady} onGridRenderStart={handleOnRenderStart} onError={handleOnError}
            onSort={handleonSort} onSearch={handleonSearch} onRowDeselect={handleonRowDeselect} onRowSelect={handleonRowSelect}
            onFilter={handleonFilter} onDataLoad={handleOnDataLoaded} onPageChange={handleonPageChange} selectionSettings={{mode: 'Single'}}
         >
            <Columns>
                <Column field="EmployeeID" headerText="Employee ID" />
                <Column field="Name" headerText="Name" />
                <Column field="Designation" headerText="Designation" />
                <Column field="EmployeeStatus" headerText="Employee Status" />
                <Column field="Department" headerText="Department" />
            </Columns>
        </Grid>
    ), [handleOnReady,  handleonSort,handleonSearch,handleonRowDeselect, handleOnRenderStart, handleOnError,
        handleOnDataLoaded, handleonSort, handleonSearch, handleonFilter ]);

    return (
        <div>
            {gridComponent}
            <div className="console-container">
                <div className="console-header">
                    <span className="console-title">
                        Console
                    </span>
                    <Button onClick={clearConsole}>Clear</Button>
                </div>
                <div className="console-content">
                    <pre>
                        {consoleOutput.length === 0
                            ? 'Interact with the grid by performing paging, sorting or filtering to view event notifications.'
                            : consoleOutput.map((line, index) => {
                                if (line.includes("*")) {
                                    const parts = line.split('*');
                                    return (
                                        <div key={index}>
                                            {parts[0]}
                                            <i>{parts[1]}</i>
                                        </div>
                                    );
                                }
                                return <div key={index}>{line}</div>;
                            })}
                    </pre>
                </div>
            </div>
        </div>
    );
    // const orderIDRules = { required: true, number: true };
    // const customerIDRules = { required: true };
    // const freightRules = { required: true, min: 1, max: 1000 };
    // const gridRef = useRef<GridRef<unknown>>(null);
    
    // // Memoize the Grid to prevent re-renders
    // const gridComponent = useMemo(() => (
    //     <Grid dataSource={orderData.slice(0, 8)} width={570} rowHeight={46} editSettings={{allowEdit: true}}
    //      >
    //         <Columns>
    //             <Column field='OrderID' headerText='Order ID' width='100' textAlign="Right" isPrimaryKey={true} validationRules={orderIDRules} clipMode='EllipsisWithTooltip'></Column>
    //             <Column field='CustomerID' headerText='Customer Name' width='107' edit={{ type:"stringedit"}} validationRules={customerIDRules}></Column>
    //             <Column field='OrderDate' headerText='Order Date' width='133' edit={{ type:"datepickeredit"}} filter={{filterBarType:"datepickerfilter"}} format='yMd' textAlign='Right' />
    //             <Column field='Freight' headerText='Freight' width='130' format='C2' textAlign='Right' edit={{ type:"numericedit"}} filter={{filterBarType:"numericfilter"}} validationRules={freightRules} />
    //             {/* <Column field="Verified" headerText="Verified" edit={{ type:"booleanedit"}} width="90" displayAsCheckBox={true}/> */}
    //         </Columns>
    //     </Grid>
    // ), []);

    // return (
    //     <div style={{display: 'flex'}}>
    //       <div style={{marginLeft: '10px'}}></div>
    //         {gridComponent}
    //         {/* <button onClick={() => gridRef.current?.search('HANAR')}>Search</button>
    //         <Grid
    //             ref={gridRef}
    //             dataSource={[
    //                 { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
    //                 { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
    //                 { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'France' },
    //                 { OrderID: 10251, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
    //                 { OrderID: 10252, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'France' }
    //             ]}
    //             height={400}
    //             width={800}
    //             sortSettings={{enabled: true, columns: [{field: 'CustomerID', direction: 'Ascending'}]}}
    //             pageSettings={{enabled: true, currentPage: 2, pageSize: 3}}
    //             filterSettings={{enabled: true}}
    //             searchSettings={{enabled: true}}
    //             onSearch={() => console.log('search')}
    //         >
    //             <Columns>
    //                 <Column field="OrderID" headerText="Order ID" width="120"/>
    //                 <Column field="CustomerID" headerText="Customer ID" width="150" />
    //                 <Column field="ShipCountry" headerText="ShipCountry" width="100" />
    //             </Columns>
    //         </Grid> */}
    //     </div>
    // );
}
export const Overview: React.FC = () => {
   /**
     * SVG icon for checkmark used in status badges.
     */
    const CheckIcon = () => (
        <svg className="status-badge-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );

    /**
     * SVG icon for arrow up used in interest level badges.
     */
    const ArrowUpIcon = () => (
        <svg className="interest-badge-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
    );

    /**
     * SVG icon for arrow down used in interest level badges.
     */
    const ArrowDownIcon = () => (
        <svg className="interest-badge-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    );

    /**
     * Get avatar CSS class based on color theme.
     */
    const getAvatarClass = (colorTheme: string): string => {
        switch (colorTheme) {
            case 'Red': return 'customer-avatar avatar-red';
            case 'Blue': return 'customer-avatar avatar-blue';
            case 'Green': return 'customer-avatar avatar-green';
            case 'Orange': return 'customer-avatar avatar-orange';
            case 'Purple': return 'customer-avatar avatar-purple';
            default: return 'customer-avatar avatar-blue';
        }
    };

    /**
     * Get status badge CSS class based on status.
     */
    const getStatusClass = (status: string): string => {
        switch (status?.toLowerCase()) {
            case 'qualified': return 'status-badge qualified';
            case 'new': return 'status-badge new';
            case 'contacted': return 'status-badge contacted';
            case 'lead': return 'status-badge lead';
            default: return 'status-badge';
        }
    };

    /**
     * Get interest badge CSS class based on interest level.
     */
    const getInterestClass = (interest: string): string => {
        switch (interest?.toLowerCase()) {
            case 'high': return 'interest-badge high';
            case 'medium': return 'interest-badge medium';
            case 'low': return 'interest-badge low';
            default: return 'interest-badge';
        }
    };

    /**
     * Template to render Lead ID as a clickable link.
     */
    const leadIdTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const data = props?.data as GridDataItem;
        return <a className="lead-id-link" href="#">{data?.leadId}</a>;
    }, []);

    /**
     * Template to render customer details with avatar and information.
     */
    const customerDetailsTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const data = props?.data as GridDataItem;
        return (
            <div className="customer-details">
                <div className={getAvatarClass(data?.details?.colorTheme || '')}>
                    {data?.details?.initial}
                </div>
                <div className="customer-info">
                    <p className="customer-name">{data?.details?.name}</p>
                    <p className="customer-email">{data?.details?.email}</p>
                </div>
            </div>
        );
    }, []);

    /**
     * Template to render lead status with badge.
     */
    const statusTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const data = props?.data as GridDataItem;
        return (
            <span className={getStatusClass(data?.status || '')}>
                <CheckIcon />
                {data?.status}
            </span>
        );
    }, []);

    /**
     * Template to render interest level with appropriate badge and icon.
     */
    const interestTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const data = props?.data as GridDataItem;
        const interest = data?.interest;
        return (
            <span className={getInterestClass(interest || '')}>
                {interest === "High" && <ArrowUpIcon />}
                {interest === "Medium" && <ArrowUpIcon />}
                {interest === "Low" && <ArrowDownIcon />}
                {interest}
            </span>
        );
    }, []);

    /**
     * Template to render assignee with avatar and name.
     */
    const assigneeTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const data = props?.data as GridDataItem;
        const assignee = data?.assignee;
        return (
            <div className="assignee-details">
                <img className="assignee-avatar" 
                     src={`/images/grid/avatar/${assignee?.avatar}`} 
                     alt={assignee?.name} />
                <div className="assignee-name">{assignee?.name}</div>
            </div>
        );
    }, []);

    /**
     * Template to render formatted date for next contact.
     */
    const dateTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const data = props?.data as GridDataItem;
        const formattedDate = data?.date ? new Date(data.date).toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
        }) : '';
        return <span className="next-contact-date">{formattedDate}</span>;
    }, []);

    /**
     * Template to render lead source.
     */
    const sourceTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const data = props?.data as GridDataItem;
        return <span className="lead-source">{data?.source}</span>;
    }, []);

    /**
     * Template to render formatted revenue amount.
     */
    const revenueTemplate = useCallback((props?: ColumnTemplateProps): React.ReactElement => {
        const data = props?.data as GridDataItem;
        const formattedRevenue = data?.revenue ? `$${data.revenue.toLocaleString()}` : '';
        return <span className="revenue-amount">{formattedRevenue}</span>;
    }, []);

    return useMemo(() => (
        <div className="overview-sample">
            <Grid dataSource={gridData} width="100%">
                <Columns>
                    <Column field="leadId" headerText="Lead ID" textAlign="Center" width="80" template={leadIdTemplate} />
                    <Column field="customerDetails" headerText="Name" textAlign="Left" width="260" template={customerDetailsTemplate} />
                    <Column field="status" headerText="Lead Status" width="130" template={statusTemplate} />
                    <Column field="interest" headerText="Interest Level" width="140" template={interestTemplate} />
                    <Column field="date" headerText="Next Contact" width="110" textAlign="Right" template={dateTemplate} />
                    <Column field="assignee" headerText="Assigned To" width="160" template={assigneeTemplate} />
                    <Column field="source" headerText="Lead Source" width="130" template={sourceTemplate} />
                    <Column field="revenue" headerText="Expected Revenue ($)" width="170" textAlign="Right" template={revenueTemplate} />
                </Columns>
            </Grid>
        </div>
    ), [leadIdTemplate, customerDetailsTemplate, statusTemplate, interestTemplate, assigneeTemplate, dateTemplate, sourceTemplate, revenueTemplate]);
}
export const CustomAggregate: React.FC = () => {
  // Initialize state for filter and sort settings.    
  const [filterSettings] = useState<FilterSettings>({ enabled: true });
  const [sortSettings] = useState<SortSettings>({ enabled: true });

  // Custom aggregate function to count the number of Margherita Pizza orders.
  const customAggregateFn: CustomSummaryType = (data) => {
    const dataArray = Array.isArray(data) ? data as FoodOrderItem[] : (data as { result: FoodOrderItem[] }).result || [];
    const count = dataArray.filter((item: FoodOrderItem) => item.FoodName === 'Margherita Pizza').length;
    return count;
  };

  // Custom aggregate function to sum the Price for Margherita Pizza orders.
  const pizzaPriceSumAggregateFn: CustomSummaryType = (data) => {
    const dataArray = Array.isArray(data) ? data as FoodOrderItem[] : (data as { result: FoodOrderItem[] }).result || [];
    const sum = dataArray
      .filter((item: FoodOrderItem) => item.FoodName === 'Margherita Pizza')
      .reduce((total: number, item: FoodOrderItem) => total + (item.Price || 0), 0);
    return sum;
  };

  // Footer templates for displaying the results.
  const pizzaCountFooter = (props: object | undefined): React.ReactElement => {
    const typedProps = props as { Custom: number | string };
    return (<span>Pizza Count: {typedProps.Custom}</span>);
  };

  // Footer template for Pizza Revenue.
  const pizzaPriceFooter = (props: object | undefined): React.ReactElement => {
    const typedProps = props as { Custom: number | string };
    return (<span>Pizza Revenue: ${typedProps.Custom}</span>);
  };
  // Render grid with food order data, settings, and aggregates.
  return (
    <div>
      <Grid dataSource={initialFoodOrderDetails} filterSettings={filterSettings} sortSettings={sortSettings} height={300}>
        <Columns>
          <Column field="OrderNumber" headerText="ID" width="100" textAlign="Right" />
          <Column field="CustomerName" headerText="Customer Name" width="150" />
          <Column field="FoodName" headerText="Food Name" width="150" clipMode='EllipsisWithTooltip' />
          <Column field="Price" headerText="Price" width="180" textAlign="Right" format="C2"  filter={{ filterBarType: "numericfilter" }} />
          <Column field="CuisineType" headerText="Cuisine Type" width="130" />
          <Column field="Status" headerText="Status" width="100" />
        </Columns>
        <Aggregates>
          <AggregateRow>
            <AggregateColumn field="FoodName" type="Custom" customAggregate={customAggregateFn} footerTemplate={pizzaCountFooter} />
            <AggregateColumn field="Price" type="Custom" customAggregate={pizzaPriceSumAggregateFn} footerTemplate={pizzaPriceFooter} />
          </AggregateRow>          
        </Aggregates>
      </Grid>
    </div>
  );
}
export const ExternalButtonSearch: React.FC = () => {
  // Initialize grid reference for accessing grid methods.
    const gridRef = useRef<GridRef<unknown>>(null);
    // Initialize state for filter, sort, and search settings.   
    const [filterSettings] = useState<FilterSettings>({enabled: true});
    const [sortSettings] = useState<SortSettings>({enabled: true});
    const [searchSettings] = useState<SearchSettings>({ enabled: true });
    // Initialize state for TextBox input
    const [searchText, setSearchText] = useState<string>('');
    const isSearchActive = searchText.length > 0;
    // Trigger search in grid using textbox input.
    const clickHandler = () => {
        if (gridRef.current) {
            gridRef.current.search(searchText);
        }
    };
    // Clear the search in the grid.
    const clearSearch = () => {
        if (gridRef.current) {
            gridRef.current.search("");
        }
        setSearchText(''); // Clear the text box input.
    };
    // Handle TextBox input changes
    const handleInputChange = (args: TextBoxChangeEvent) => {
        setSearchText(args.value as string);
    };
    // Render search input, buttons, and grid component.
    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <TextBox id="searchtext" value={searchText} width={200} placeholder='Enter search text' className='searchtext-style' onChange={handleInputChange}/>
                <Button onClick={clickHandler} style={{ marginBottom: '10px' }} disabled={!isSearchActive}>Find Employee</Button>
                <Button onClick={clearSearch} style={{ marginBottom: '10px', marginLeft:'10px' }} disabled={!isSearchActive}>Clear Search</Button>
            </div>
            {
                useMemo(() => (
                    <Grid ref={gridRef} dataSource={employeeInformation} searchSettings={searchSettings} filterSettings={filterSettings} sortSettings={sortSettings} height={300} >
                        <Columns>
                            <Column field="EmployeeID" headerText="Employee ID" width="100" textAlign="Right" isPrimaryKey={true}/>
                            <Column field="Name" headerText="Employee Name" width="120"/>
                            <Column field="Designation" headerText="Designation" width="100"/>
                            <Column field="Department" headerText="Department" width="120"/>
                            <Column field="Email" headerText="Email" width="180"/>
                            <Column field="Location" headerText="Location" width="90"/>
                        </Columns>
                    </Grid>
                ), [])
            }
        </div>
    );
}
export const DiacriticsFiltering: React.FC = () => {
  // State to enable sorting in the grid.
    const [sortSettings] = useState<SortSettings>({ enabled: true }); 
    
    // State to enable filtering with accent-insensitive search and predefined filter.
    const [filterSettings] = useState<FilterSettings>({
        enabled: true,
        ignoreAccent: true,
        columns: [{ field: 'CustomerName', operator: 'contains', value: ['José'] }] //, ignoreAccent: true
    });

    return (
        <div>
            <Grid dataSource={orderDetails} filterSettings={filterSettings} sortSettings={sortSettings} >
                <Columns>
                    <Column field='OrderID' headerText='Order ID' textAlign="Right" filter={{filterBarType: "numericfilter"}}></Column>
                    <Column field='CustomerName' headerText='Customer Name' width={150}></Column>
                    <Column field='OrderDate' headerText='Order Date' format='yMd' textAlign='Right' filter={{filterBarType: "datepickerfilter"}} />
                    <Column field='Freight' headerText='Freight' format='C2' textAlign='Right' filter={{filterBarType: "numericfilter"}} />
                    <Column field='ShipCountry' headerText='Ship Country'></Column>
                    <Column field='ShipCity' headerText='Ship City'></Column>
                    <Column field='ShipAddress' headerText='Ship Address' width={140}></Column>
                </Columns>
            </Grid>
        </div>
    );
}
export const SearchOperator: React.FC = () => {
    // Initialize state for filter, sort, search, toolbar, and pagination settings.
    const [filterSettings] = useState<FilterSettings>({enabled: true});
    const [sortSettings] = useState<SortSettings>({enabled: true});
    const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8, pageCount: 4 });
    const [toolbarSettings] = useState<string[]>(['Search']);
    const [searchSettings, setSearchOptions] = useState<SearchSettings>({ enabled: true, operator: 'contains' });
    // Dropdown options for search operators.
    const dropDownData:{ [key: string]: unknown }[]= [
        { text: 'Contains', value: 'contains' },
        { text: 'Starts With', value: 'startswith' },
        { text: 'Ends With', value: 'endswith' },
        { text: 'Equal', value: 'equal' },
        { text: 'Not Equal', value: 'notequal' },
        { text: 'Like', value: 'like' },
        { text: 'Wildcard', value: 'wildcard' }
        
    ];
    const dropdownFields = { text: 'text', value: 'value' };

 // Updates the search operator used in the grid's search settings.
    const changeAlignment = (props?: ChangeEventArgs) => {        
        // Placeholder for updating search operator.
        setSearchOptions((prev: SearchSettings) => ({
            ...prev,
            operator: props?.value as string
        }));
    };
    // Memoize grid component to optimize rendering.
    return (
        <div>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', width: '260px' }}>
                <label htmlFor="culture-select" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Search operators:
                </label>
                <DropDownList width={90} dataSource={dropDownData as { [key: string]: object }[]} defaultValue={searchSettings.operator} fields={dropdownFields} onChange={changeAlignment} />
            </div>
            {
                useMemo(() => (
                    <Grid dataSource={productData}  searchSettings={searchSettings} toolbar={toolbarSettings} filterSettings={filterSettings} sortSettings={sortSettings} pageSettings={pageSettings}>
                        <Columns>
                            <Column field="ProductID" headerText="ID" width="90" textAlign={TextAlign.Right} filter={{filterBarType:FilterBarType.NumericTextBox}} />
                            <Column field="ProductName" headerText="Name" width="130" clipMode={ClipMode.EllipsisWithTooltip}/>
                            <Column field="QuantityPerUnit" headerText="Quantity Per Unit" clipMode={ClipMode.EllipsisWithTooltip} width="120" />
                            <Column field="UnitsSold" headerText="Units Sold" width="90" textAlign={TextAlign.Right} filter={{filterBarType:FilterBarType.NumericTextBox}} />
                            <Column field="UnitPrice" headerText="Price Per Unit" width="110" format="C2" textAlign={TextAlign.Right} filter={{filterBarType:FilterBarType.NumericTextBox}} />
                            <Column field="TotalCost" headerText="Total Cost" width="100" format="C2" textAlign={TextAlign.Right} filter={{filterBarType:FilterBarType.NumericTextBox}} />
                        </Columns>
                    </Grid>
                ), [searchSettings])
            }
        </div>
    );
}
export const ComplexDataEditing: React.FC = () => {
    // State to manage sort, filter, page, edit and toolbar settings.    
  const [filterSettings] = useState<FilterSettings>({enabled: true});
  const [sortSettings] = useState<SortSettings>({enabled: true});
  const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8, pageCount: 4 });
  const [editSettings] = useState<EditSettings>({ allowEdit: true, allowAdd: true, allowDelete: true });
  const [toolbarSettings] = useState<string[]>(['Add', 'Edit', 'Delete', 'Update', 'Cancel']);
  const employeeIDRules = { required: true, number: true };
  const stringValidation = { required: true };

//   // Edit template for First Name field.
//   const firstNameTemplate = useCallback((props: EditTemplateProps) => {
//   const data = props.data as Employees;
//   return (
//     <input
//       name='Name__FirstName'
//       defaultValue={data.Name?.FirstName}
//       className='sf-input'
//       onChange={(e) => {
//         // data.Name.FirstName = e.target.value;
//         props.onChange(e.target.value);
//       }}
//     />
//   );
// }, []);

//   // Edit template for Last Name field.
//   const lastNameTemplate = useCallback((props: EditTemplateProps) => {
//     const data = props.data as Employees;
//     return (
//       <input
//         name='Name__LastName'
//         defaultValue={data.Name?.LastName}
//         className='sf-input'
//         onChange={(e) => {
//         //   data.Name.LastName = e.target.value;
//         props.onChange(e.target.value);
//         }}
//       />
//     );
//   }, []);


  return useMemo(() => (
    // Memoized Grid component with custom edit templates for nested name fields.
    <div>
      <Grid id="grid" dataSource={complexData} editSettings={editSettings} toolbar={toolbarSettings} filterSettings={filterSettings} sortSettings={sortSettings} pageSettings={pageSettings}>
        <Columns>
          <Column field='EmployeeID' headerText='Employee ID' width='110' textAlign='Right' isPrimaryKey={true} filter={{filterBarType:"numericfilter"}} validationRules={employeeIDRules} />
          <Column field='Name.FirstName' headerText='First Name' width='100' /> {/** editTemplate={firstNameTemplate} */}
          <Column field='Name.LastName' headerText='Last Name' width='100' /> {/** editTemplate={lastNameTemplate} */}
          <Column field='Title' headerText='Designation' edit={{type:"dropdownedit"}} validationRules={stringValidation} width='170' clipMode='EllipsisWithTooltip' />
          <Column field='HireDate' headerText='HireDate' width="120" edit={{ type:'datepickeredit'}}   type='date' filter={{filterBarType:"datepickerfilter"}} format="yMd" textAlign='Right' />
          <Column field='City' headerText='City' validationRules={stringValidation} width='90'  />
        </Columns>
      </Grid>
    </div>
  ), []);
}
export const AggregateEditing: React.FC = () => {
    // Initialize state for filter, sort, pagination, edit, and toolbar settings.    
  const [filterSettings] = useState<FilterSettings>({enabled: true});
  const [sortSettings] = useState<SortSettings>({enabled: true});
  const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8, pageCount: 4 });
  const [editSettings]= useState<EditSettings>({ allowEdit: true, allowAdd: true, allowDelete: true });
  const [toolbarSettings] = useState<string[]>(['Add', 'Edit', 'Delete', 'Update', 'Cancel']);  
  // Render footer template for minimum Freight value.
  const footerMin = (props?: object): React.ReactElement => {
    const typedProps = props as { Min?: number | string };
    return (<span>Min: {typedProps.Min}</span>);
  };
  // Render footer template for maximum Freight value.
  const footerMax = (props?: object): React.ReactElement => {
    const typedProps = props as { Max?: number | string };
    return (<span>Max: {typedProps.Max}</span>);
  };  
  // Render grid with order data, settings, and aggregate rows.
  return (
    <div>
     <Grid dataSource={orderDetails} filterSettings={filterSettings} sortSettings={sortSettings} pageSettings={pageSettings} editSettings={editSettings} toolbar={toolbarSettings}>
      <Columns>
        <Column field="OrderID" headerText="ID" width="90px" filter={{filterBarType:"numericfilter"}} textAlign="Right" isPrimaryKey={true}/>
        <Column field="CustomerName" headerText="Customer Name" width="120px" />
        <Column field="OrderDate" headerText="Order Date" textAlign="Right" edit={{type:"datepickeredit"}} format="yMd" filter={{filterBarType:"datepickerfilter"}} width="100px" />
        <Column field="ShipName" headerText="Ship Name" clipMode='EllipsisWithTooltip' width="140px" />
        <Column field="ShipCountry" headerText="Ship Country" edit={{type:"dropdownedit"}} width="100px" />
        <Column field="Freight" headerText="Freight Charges" edit={{type:"numericedit"}} textAlign="Right" format="C2" filter={{filterBarType:"numericfilter"}} width="110px" />
      </Columns>
      <Aggregates>
        <AggregateRow>
          <AggregateColumn field='Freight' type='Max' footerTemplate={footerMax} format='C2' />
        </AggregateRow>
        <AggregateRow>
          <AggregateColumn field='Freight' type='Min' footerTemplate={footerMin} format='C2' />
        </AggregateRow>                   
      </Aggregates>
    </Grid>
   </div>
 );
}
export const BooleanColumnSingleClickEdit: React.FC = () => {
  const gridRef = useRef(null);    
  // State to manage  page, edit and toolbar settings.    
  const [pageSettings] = useState<PageSettings>({ enabled: true, pageSize: 8, pageCount: 4 });
  const [editSettings] = useState<EditSettings>({ allowEdit: true, allowAdd: true, allowDelete: true });
  const [toolbarSettings] = useState<string[]>(['Add', 'Edit', 'Delete', 'Update', 'Cancel']);
  const itemIDRules = { required: true };
  const stringValidation = { required: true }; 
  const priceRules = { required: true, min: 1, max: 100 };
  const change = useCallback((props: ColumnTemplateProps<typeof restaurantData[0]>, e: CheckboxChangeEvent) => {
    // const target = e.event.target;
    // const rowInfo = gridRef.current?.getRowInfo?.(target);
    const viewRecords = gridRef?.current?.getCurrentViewRecords?.();
    // const viewRecords = gridRef?.current?.getRowsObject?.().map?.((e) => e.data);
    const rowIndex = viewRecords?.findIndex((record) => record.ItemID  === props?.data.ItemID);
    const updatedData = { ...props?.data, IsAvailable: e.value };

    // const updatedData = { ...rowInfo?.data, IsAvailable: e.value };
    // const rowIndex = rowInfo?.rowIndex;
    // // console.log(updatedData);
    // // const rowIndex = gridRef.current?.pageSettings?.enabled ? ((gridRef.current.pageSettings.currentPage - 1) * gridRef.current.pageSettings.pageSize) + rowInfo.rowIndex : rowInfo.rowIndex;
    gridRef.current?.updateRecord(rowIndex, updatedData);
  }, [gridRef.current?.pageSettings, gridRef?.current?.getCurrentViewRecords, gridRef?.current?.currentViewData])
  // Custom cell template for the IsAvailable column using Checkbox.
  const checkBoxTemplate = useCallback((props?: ColumnTemplateProps<typeof restaurantData[0]>): string | React.ReactElement => (
    <Checkbox
      checked={(props?.data as MenuItem).IsAvailable}
      onChange={change.bind(null, props)}
    />
  ), [gridRef.current?.pageSettings, gridRef?.current?.getCurrentViewRecords, gridRef?.current?.currentViewData]);

  return (
    // Memoized Grid component with checkbox cell template for item availability.
    <div>
      <Grid id="grid" onDataChangeComplete={(args) => console.log(args)} ref={(e) => {
        gridRef.current = e;
      }} dataSource={restaurantData} editSettings={editSettings} toolbar={toolbarSettings} pageSettings={pageSettings}>
        <Columns>
          <Column field='ItemID' headerText='Item ID' width='100' isPrimaryKey={true} validationRules={itemIDRules} />
          <Column field='ItemName' headerText='Item Name' width='120' validationRules={stringValidation} />
          <Column field='RecommendedPairing' headerText='Complement' edit={{type:"dropdownedit"}} width='110' validationRules={stringValidation} />
          <Column field='Price' headerText='Price' format="C2" validationRules={priceRules} edit={{type:'numericedit'}} textAlign='Right' filter={{filterBarType:"numericfilter"}} width='120' />
          <Column field='CuisineType' headerText='Cuisine' width='120' edit={{type:"dropdownedit"}}/>
          <Column field='IsAvailable' headerText='Availability' template={checkBoxTemplate} width='120' edit={{ type:'booleanedit' }} />
        </Columns>
      </Grid>
    </div>
  )
}
export const RowTemplate: React.FC = () => {
  // Custom row template to display employee image and details.
  const gridTemplate = (props: typeof employeeData[0]) => {
    const src = `https://npmci-react.syncfusion.com/images/grid/${props['EmployeeID']}.png`;
    return (
      <tr className="templateRow">
        <td className="photo">
          <img src={src} alt={props['EmployeeID'].toString()} />
        </td>
        <td className="details">
          <table className="CardTable" cellPadding={3} cellSpacing={2}>
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="CardHeader">First Name</td>
                <td>:</td>
                <td>{props.FirstName}</td>
              </tr>
              <tr>
                <td className="CardHeader">Last Name</td>
                <td>:</td>
                <td>{props.LastName}</td>
              </tr>
              <tr>
                <td className="CardHeader">Title</td>
                <td>:</td>
                <td>{props.Title}</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    );
  };

  return useMemo(() => (
    // Memoized Grid component with rowTemplate for custom layout.
    <div>
      <Grid dataSource={employeeData} rowTemplate={gridTemplate} height={400} className='row-template'>
        <Columns>
          <Column headerText='Employee Image' width='180' textAlign={TextAlign.Center} field='EmployeeID' />
          <Column headerText='Employee Details' width='300' textAlign={TextAlign.Left} field='FirstName' />
        </Columns>
      </Grid>
    </div>
  ), []);
}
export const TestSample: React.FC = () => {
  // const NUM_ROWS = 100;
  const NUM_COLS = 100;
  const gridRef = useRef<GridRef>(null);
  // State for uniform row heights
  const [uniformRows, _setUniformRows] = useState(true);
  // const [useRowWise, setUseRowWise] = useState(false);

  // 🆕 State for uniform column widths
  const [uniformCols, _setUniformCols] = useState(true);
  const [enableDynamicRowHeight, setEnableDynamicRowHeight] = useState(false);
  const [enableRtl, setEnableRtl] = useState(false);
  const [NUM_ROWS, setNUM_ROWS] = useState(100000);
  const [isRender, setIsRender] = useState(false);

  // // Row Height Configuration
  // const nonUniformRowHeight = (rowData: any, _idx: number) => {
  //   console.log('getRowHeight');
  //   return rowData.rowHeight;
  // };
  // const rowHeight = uniformRows ? 40 : nonUniformRowHeight;

  // Column Configurations
  const makeColumns = (): ColumnProps[] => {
    // const totalCols = NUM_COLS; // Adjust based on your layout
    // const basePercentage = 10; // Example base percentage

    return Array.from({ length: NUM_COLS }).map((_, i) => ({
      field: `col${i}`,
      headerText: `Col ${i + 1}`,
      width: uniformCols ? 120 : 80 + (i % 4) * 30, // 🆕 Non-uniform widths
      // width: uniformCols
      //       ? `100%`
      //       : `${Math.min(basePercentage + (i % totalCols) * 5, 100)}%`, // Prevent exceeding 100% // Adjust the multiplier as needed
      cellClass: NUM_ROWS === 100 ? (args) => {
        if (args.cellType === CellType.Content) {
          console.log('dataCellClass =>', args);
        }
        // else if (args.cellType === CellType.Header) {
        //   console.log('headerCellClass =>', args);
        // }
      } : undefined
    } as unknown as ColumnProps))};
  const makeAggregates = (): AggregateColumnProps[] =>
    Array.from({ length: NUM_COLS }).map((_, i) => ({
      field: `col${i}`,
      type: AggregateType.Count,
      width: uniformCols ? 120 : 80 + (i % 4) * 30, // 🆕 Non-uniform widths
      // cellClass: (args) => {
      //   if (args.cellType === CellType.Aggregate) {
      //     console.log('aggregateCellClass =>', args);
      //   }
      // }
    } as unknown as AggregateColumnProps));

  const differentHeights = [40, 80, 120, 200];
  // Sample data generator
  const makeData = useCallback(
    (n: number, cols: ColumnProps[]) =>
      Array.from({ length: n }).map((_, r) => {
        const obj: Record<string, string | number> = {};
        cols.forEach((c) => {
          obj[c.field] = `${c.headerText}-R${r + 1}`;
        });
        if (!uniformRows || enableDynamicRowHeight) {
          // obj.rowHeight = 30 + (r % 5) * 10;
          obj.rowHeight = differentHeights[r % 4];
        }
        return obj;
      }),
    [uniformRows, enableDynamicRowHeight]
  );


  // Recompute columns/data based on state
  const columns = useMemo(() => makeColumns(), [uniformCols, NUM_ROWS]);
  const aggregates = useMemo(() => makeAggregates(), [uniformCols]);
  const data = useMemo(() => makeData(NUM_ROWS, columns), [NUM_ROWS]);
  // console.log('columns', columns);
  // const gridRef = useRef<GridRef<DynamicDataItem>>(null);
  // const [data, _setData] = useState(generateDynamicData(100));
  const [editSettings] = useState<EditSettings>({ allowEdit: true, allowAdd: true, allowDelete: true, mode: 'Normal' });
  const [toolbarOptions] = useState<string[]>(['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search']);
  const [selectionSettings] = useState<any>({ mode: 'Single' });
  const searchSettings = useMemo(() => ({ enabled: true }), []);
  const sortSettings = useMemo(() => ({ enabled: true }), []);
  const filterSettings = useMemo(() => ({ enabled: true }), []);
  const pageSettings = useMemo(() => ({ enabled: true, pageSize: 100000 }), []);
  const aggregateColumns = useMemo(() => [{ columns: aggregates }], [aggregates]);
  // const gridProps: Partial<GridProps> = useMemo(() => ({
  //   rowHeight: 48,
  //   getRowHeight: (args: RowInfo<typeof data[0]>) => {
  //     return enableDynamicRowHeight ? 30 + (args.rowIndex % 5) * 10 : 51;
  //     // return args.data['col1'] === 'Col 2-R2' ? 60 : 51;
  //   }
  // }), [enableDynamicRowHeight]);
  return (
    // <div style={{ height: '100%' }}>
    <div style={{ height: '96vh' }}>
      <button onClick={() => setIsRender(!isRender)}>{isRender ? 'Destroy' : 'Render'} Data Grid</button>
      <label htmlFor="rowCount">Select Row Count:</label>
      <select defaultValue={'1L'} id="rowCount" onChange={(event) => {
        const value = event.target.value;
        setNUM_ROWS(value === '1L' ? 100000 : (value === '10K' ? 10000 : 1000));
      }}>
        <option value="1K">1K</option>
        <option value="10K">10K</option>
        <option value="1L">1L</option>
      </select>
      <button onClick={() => {
        setEnableRtl(!enableRtl);
      }}>RTL {enableRtl ? 'Enabled' : 'Disabled'}</button>
      <button onClick={() => {
        _setUniformCols(!uniformCols);
      }}>Dynamic Column Width {!uniformCols ? 'Enabled' : 'Disabled'}</button>
      <button onClick={() => {
        setEnableDynamicRowHeight(!enableDynamicRowHeight);
        // requestAnimationFrame(() => {
        //   gridRef.current.refresh();
        // })
      }}>Dynamic Row Height {enableDynamicRowHeight ? 'Enabled' : 'Disabled'}</button>
      <button onClick={() => {
        console.log(gridRef.current.getRowsObject());
      }}>getRowsObject</button>
      {isRender &&
        <Provider
          // dir={'rtl'}
          dir={enableRtl ? 'rtl' : 'ltr'}
        >
          <Grid
            enableRtl={enableRtl}
            // enableRtl={true}
            ref={gridRef}
            gridLines='Both'
            dataSource={data}
            // rowBuffer={1}
            // columnBuffer={1}
            rowClass={NUM_ROWS === 100 ? (args) => { console.log('rowClass => ', args); return '' } : undefined}
            columns={columns}
            sortSettings={sortSettings}
            filterSettings={filterSettings}
            searchSettings={searchSettings}
            pageSettings={pageSettings}
            toolbar={toolbarOptions}
            aggregates={aggregateColumns}
            // height={600}
            height={'100%'}
            width={'100%'}
            enableStickyHeader={true}
            // {...gridProps}
            // rowHeight={48}
            getRowHeight={enableDynamicRowHeight ? (args: RowInfo<typeof data[0]>) => {
              console.log('getRowHeight => ', args)
              return differentHeights[args.rowIndex % 4];
              // return args.data['rowHeight'] as number;
              // return 30 + (args.rowIndex % 5) * 10;
              // return args.data['col1'] === 'Col 2-R2' ? 60 : 51;
            } : null}
            // getRowHeight={(args: RowInfo<typeof data[0]>) => {
            //   console.log('getRowHeight', 30 + (args.rowIndex % 5) * 10)
            //   // return args.data['rowHeight'] as number;
            //   return 30 + (args.rowIndex % 5) * 10;
            //   // return args.data['col1'] === 'Col 2-R2' ? 60 : 51;
            // }}
            editSettings={editSettings}
            selectionSettings={selectionSettings}
          // aggregates={[{columns:[{field: 'OrderID', type: 'Sum'}]}]}
          // rowClass={(args) => {
          //   console.log('rowClass => ', args);
          //   return '';
          // }}
          >
            {/* <Columns>
          <Column
            field="OrderID"
            headerText="Order ID"
            isPrimaryKey={true}
          />
          <Column
            field="CustomerID"
            headerText="Customer ID"
          />
        </Columns> */}
          </Grid>
        </Provider>
      }
    </div>
  );
}

export const VirtualScrollingSample: React.FC = () => {
  const gridRef = useRef<GridRef>(null);
  const [isRender, setIsRender] = useState(false);
  const [enableRtl, setEnableRtl] = useState(false);
  const [dataCount, setDataCount] = useState(100000);
  const hostUrl: string = 'https://ej2services.syncfusion.com/react/hotfix/';
  const data: DataManager = useMemo(() => new DataManager({ url: hostUrl + 'api/UrlDataSource', adaptor: new UrlAdaptor  }), []);
  const query = useMemo(() => new Query().addParams('dataCount', '' + dataCount), [dataCount]);
  return (
    <div>
      <button onClick={() => setIsRender(!isRender)}>{isRender ? 'Destroy' : 'Render'} Data Grid</button>
      <label htmlFor="rowCount">Select Row Count:</label>
      <select defaultValue={'1L'} id="rowCount" onChange={(event) => {
        const value = event.target.value;
        setDataCount(value === '1L' ? 100000 : (value === '10K' ? 10000 : 1000));
      }}>
        <option value="1K">1K</option>
        <option value="10K">10K</option>
        <option value="1L">1L</option>
      </select>
      <button onClick={() => {
        setEnableRtl(!enableRtl);
      }}>RTL {enableRtl ? 'Enabled' : 'Disabled'}</button>
      {isRender &&
        <Provider
          // dir={'rtl'}
          dir={enableRtl ? 'rtl' : 'ltr'}
        >
          <Grid id="overviewgrid"
            ref={gridRef}
            dataSource={data}
            // loadingIndcator={{ indicatorType: 'Shimmer' }}
            query={query}
            enableHover={false}
            scrollMode={ScrollMode.Virtual}
            pageSettings={{ enabled: true }}
            // rowHeight={38}
            height='96vh'
          // ref={(g) => { gridInstance = g }}
          // actionComplete={onComplete.bind(this)}
          // load={onLoad.bind(this)}
          // dataBound={onDataBound.bind(this)}
          // filterSettings={gridFilter}
          // allowFiltering={true}
          // allowSorting={true}
          // allowSelection={true}
          // selectionSettings={select}
          >
            <Columns>
              {/* <Column type='checkbox' width='60'></Column> */}
              <Column field='EmployeeID' visible={false} headerText='Employee ID' isPrimaryKey={true} width='130'></Column>
              <Column field='Employees' headerText='Employee Name' width='230' clipMode='EllipsisWithTooltip' />
              <Column field='Designation' headerText='Designation' width='170' clipMode='EllipsisWithTooltip' />
              <Column field='Mail' headerText='Mail' width='230'></Column>
              <Column field='Location' headerText='Location' width='140'></Column>
              <Column field='Status' headerText='Status' width='130'></Column>
              <Column field='Trustworthiness' headerText='Trustworthiness' width='160'></Column>
              <Column field='Rating' headerText='Rating' width='220' />
              <Column field='Software' headerText='Software Proficiency' width='180' format='C2' />
              <Column field='CurrentSalary' headerText='Current Salary' width='160' format='C2'></Column>
              <Column field='Address' headerText='Address' width='240' clipMode="EllipsisWithTooltip" ></Column>
            </Columns>
          </Grid>
        </Provider>}
    </div>
  );
}
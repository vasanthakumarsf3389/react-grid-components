import {
  Chart, ChartPrimaryXAxis, ChartPrimaryYAxis, ChartSeries, ChartSeriesCollection,
  ChartArea, ChartAxisLabelStyle, ChartMajorTickLines, ChartMajorGridLines, ChartAxisTitleStyle, ChartTooltip, ChartLegend,
  ChartMarker
} from '@syncfusion/react-charts';
import { Grid, Columns, Column, ColumnTemplateProps, DataStateRequestEvent } from '../src/index';
import './App.css';
export const sales: object[] = [
  {
    Product: "Brown Rice",
    Year: 2006,
    Online: 1020,
    Retail: 1310,
    Revenue: 2330,
    Category: "Grains",
    Image: "BrownRice",
    ProfitLoss: 1165,
    UnitsSold: 580,
    Sales: {
      "Jan-Feb": 450, // High start
      "Mar-Apr": 350, // Drop
      "May-Jun": 400, // Rise
      "Jul-Aug": 300, // Low
      "Sep-Oct": 450, // Peak
      "Nov-Dec": 375  // Moderate
    }
    // Pattern: High, Low, Mid, Low, High, Mid
    // Sum: 450 + 350 + 400 + 300 + 450 + 375 = 2330
  },
  {
    Product: "Baby Spinach",
    Year: 2007,
    Online: 1050,
    Retail: 1300,
    Revenue: 2350,
    Category: "Vegetable",
    Image: "Spinach",
    ProfitLoss: 1175,
    UnitsSold: 780,
    Sales: {
      "Jan-Feb": 300, // Low start
      "Mar-Apr": 500, // Sharp rise
      "May-Jun": 350, // Drop
      "Jul-Aug": 450, // Rise
      "Sep-Oct": 300, // Low
      "Nov-Dec": 445  // Adjust to sum
    }
    // Pattern: Low, High, Low, Mid, Low, Mid
    // Sum: 300 + 500 + 350 + 450 + 300 + 445 = 2350
  },
  {
    Product: "Spaghetti Pasta",
    Year: 2008,
    Online: 1060,
    Retail: 1330,
    Revenue: 2390,
    Category: "Grains",
    Image: "SpaghettiPasta",
    ProfitLoss: -250,
    UnitsSold: 600,
    Sales: {
      "Jan-Feb": 400, // Mid start
      "Mar-Apr": 450, // Slight rise
      "May-Jun": 500, // Peak
      "Jul-Aug": 350, // Drop
      "Sep-Oct": 420, // Rise
      "Nov-Dec": 270  // Low
    }
    // Pattern: Mid, Mid-High, High, Low, Mid, Low
    // Sum: 400 + 450 + 500 + 350 + 420 + 270 = 2390
  },
  {
    Product: "Chicken Thighs",
    Year: 2019,
    Online: 1910,
    Retail: 2330,
    Revenue: 4240,
    Category: "Poultry",
    Image: "Chicken",
    ProfitLoss: -150,
    UnitsSold: 420,
    Sales: {
      "Jan-Feb": 600, // Low start
      "Mar-Apr": 800, // Peak
      "May-Jun": 650, // Drop
      "Jul-Aug": 750, // Rise
      "Sep-Oct": 600, // Low
      "Nov-Dec": 840  // High to adjust
    }
    // Pattern: Low, High, Low-Mid, Mid, Low, High
    // Sum: 600 + 800 + 650 + 750 + 600 + 840 = 4240
  },
  {
    Product: "Turkey Breast",
    Year: 2020,
    Online: 1960,
    Retail: 2470,
    Revenue: 4430,
    Category: "Poultry",
    Image: "TurkeyBreast",
    ProfitLoss: 1100,
    UnitsSold: 440,
    Sales: {
      "Jan-Feb": 800, // High start
      "Mar-Apr": 600, // Drop
      "May-Jun": 850, // Peak
      "Jul-Aug": 650, // Drop
      "Sep-Oct": 750, // Mid
      "Nov-Dec": 775  // Adjust
    }
    // Pattern: High, Low, High, Low-Mid, Mid, Mid
    // Sum: 800 + 600 + 850 + 650 + 750 + 775 = 4430
  },
  {
    Product: "Whole Milk",
    Year: 2021,
    Online: 1730,
    Retail: 2580,
    Revenue: 4310,
    Category: "Dairy",
    Image: "MilkBottle",
    ProfitLoss: 1075,
    UnitsSold: 860,
    Sales: {
      "Jan-Feb": 740,
      "Mar-Apr": 670,
      "May-Jun": 750,
      "Jul-Aug": 660,
      "Sep-Oct": 760,
      "Nov-Dec": 730
    }
  },
  {
    Product: "Pork Chops",
    Year: 2022,
    Online: 1910,
    Retail: 2360,
    Revenue: 4270,
    Category: "Pork",
    Image: "Pork",
    ProfitLoss: -200,
    UnitsSold: 430,
    Sales: {
      "Jan-Feb": 735,
      "Mar-Apr": 665,
      "May-Jun": 745,
      "Jul-Aug": 655,
      "Sep-Oct": 755,
      "Nov-Dec": 715
    }
  },
  {
    Product: "Cheddar Cheese",
    Year: 2023,
    Online: 1820,
    Retail: 2470,
    Revenue: 4290,
    Category: "Cheese",
    Image: "Cheese",
    ProfitLoss: 1000,
    UnitsSold: 860,
    Sales: {
      "Jan-Feb": 740,
      "Mar-Apr": 670,
      "May-Jun": 750,
      "Jul-Aug": 660,
      "Sep-Oct": 760,
      "Nov-Dec": 710
    }
  },
  {
    Product: "Salmon Fillet",
    Year: 2024,
    Online: 2240,
    Retail: 2640,
    Revenue: 4880,
    Category: "Fish",
    Image: "Salmon",
    ProfitLoss: 1220,
    UnitsSold: 490,
    Sales: {
      "Jan-Feb": 840,
      "Mar-Apr": 760,
      "May-Jun": 850,
      "Jul-Aug": 750,
      "Sep-Oct": 860,
      "Nov-Dec": 820
    }
  },
  {
    Product: "Ground Beef",
    Year: 2025,
    Online: 2270,
    Retail: 2830,
    Revenue: 5100,
    Category: "Beef",
    Image: "Beef",
    ProfitLoss: 1275,
    UnitsSold: 510,
    Sales: {
      "Jan-Feb": 875,
      "Mar-Apr": 795,
      "May-Jun": 885,
      "Jul-Aug": 785,
      "Sep-Oct": 895,
      "Nov-Dec": 865
    }
  }
];
export interface Book {
    Title: string;
    Author: string;
    BookID: number;
    ProductName: number;
    Genre: string;
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

export interface Order {
  OrderID: number;
  CustomerID: string;
  OrderDate: Date;
  Freight: number;
  ShippedDate: Date;
  ShipCountry: string;
}

export interface OrdersODataResponse {
    value: Order[];
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

export interface CustomDataStateRequestEvent extends DataStateRequestEvent {
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


export default function HeavyTemplate() {
  const chartTemplate = (props?: ColumnTemplateProps): React.ReactElement => {

  const Sales = (props?.data as ProductDataTemplate).Sales;

  const averageData = [
    { x: 'Jan-Feb', y: Sales['Jan-Feb'] },
    { x: 'Mar-Apr', y: Sales['Mar-Apr'] },
    { x: 'May-Jun', y: Sales['May-Jun'] },
    { x: 'Jul-Aug', y: Sales['Jul-Aug'] },
    { x: 'Sep-Oct', y: Sales['Sep-Oct'] },
    { x: 'Nov-Dec', y: Sales['Nov-Dec'] }
  ];

    return (
        <Chart id={`spline-${(props?.data as ProductDataTemplate).Product}`} height='90px'>
            <ChartArea border={{ width: 0 }} />
            <ChartTooltip enable={true} shared={true} header='<b>${point.x}<b>' format='${series.name} : <b>${point.y}</b>' />
            <ChartPrimaryXAxis valueType="Category" interval={1} visible={false}>
                <ChartMajorGridLines width={0}/>
                <ChartAxisLabelStyle labelIntersectAction={"Rotate90"}/>
            </ChartPrimaryXAxis>
            <ChartPrimaryYAxis lineStyle={{ width: 0 }} minimum={0} maximum={1000} visible={false}>
                <ChartMajorTickLines width={0}/>
                <ChartAxisLabelStyle labelFormat='${value}'/>
                <ChartAxisTitleStyle title="Sales ($)"/>
            </ChartPrimaryYAxis>
            <ChartSeriesCollection>
                <ChartSeries dataSource={averageData} xName="x" yName="y" width={2} type="Line">
                    <ChartMarker visible={true} width={8} height={8} isFilled={true}/>
                </ChartSeries>
            </ChartSeriesCollection>
            <ChartLegend visible={false}></ChartLegend>
        </Chart>
    );
  };

  const imageTemplate = (props?: ColumnTemplateProps): string | React.ReactElement => {
      return (<div className='e-product-info'>
          <img src={`https://happy-desert-0709e4a0f-preview.eastus2.6.azurestaticapps.net/images/grid/product/${(props?.data as ProductDataTemplate).Image}.png`} alt={(props?.data as ProductDataTemplate).Product} />
          <span>{(props?.data as ProductDataTemplate).Product}</span>
      </div>);
  }

  return (
    <div>
      <Grid dataSource={sales} sortSettings={{enabled:true}} filterSettings={{enabled: true}} className='component-integrate' 
        height='400' textWrapSettings={{wrapMode: "Header", enabled: true}}>
       <Columns>
        <Column field="Product" headerText="Products" width={200} template={imageTemplate} />
        <Column field="Category" headerText="Categories" width={110}  />
        <Column field="Year" headerText="Year" textAlign="Right" width={120} />
        <Column field="Online" headerText="Sales Trends by Bi-Monthly Periods (Jan-Dec)" textAlign="Center" allowFilter={false} width={250} template={chartTemplate}/>
        <Column field="Retail" headerText="Retail" format="C2" type='number' textAlign="Right" width={160} />
        <Column field="ProfitLoss" headerText="Profit/Loss" format="C2"  type='number' textAlign="Right" width={150} />
        <Column field="UnitsSold" headerText="Units Sold" textAlign="Right" width={160} />
        <Column field="Revenue" headerText="Revenue" format="C2"  type='number'  textAlign="Right" width={160} />
       </Columns>
      </Grid>
    </div>
  );
}
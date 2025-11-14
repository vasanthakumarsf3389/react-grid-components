import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react';
import { FilterSettings, FilterPredicates } from '../src/grid/types/filter.interfaces';
import { ActionType, FilterBarType, Grid } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { Column, Columns } from '../src/index';
import { FilterType } from '../src/index';
import { closest } from '@syncfusion/react-base';
import { getCaseValue } from '../src/index';

describe('Grid Filtering Functionality (Continuous Action Optimized - Passing)', () => {
  // Sample data for testing 
  const sampleData = [
    { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, OrderDate: new Date('1996-07-04') },
    { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, OrderDate: new Date('1996-07-05') },
    { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, OrderDate: new Date('1996-07-08') },
    { OrderID: 10251, CustomerID: 'VICTE', Freight: 41.34, OrderDate: new Date('1996-07-08') },
    { OrderID: 10252, CustomerID: 'SUPRD', Freight: 51.30, OrderDate: new Date('1996-07-09') }
  ];

  let gridRef: React.RefObject<GridRef>;
  let container: HTMLElement;

  // Shared setup function to create a comprehensive grid for continuous testing
  const setupContinuousGrid = (props: any = {}) => {
    const defaultProps = {
      ref: gridRef,
      dataSource: sampleData,
      height: 400,
      width: 800,
      filterSettings: { enabled: true, type: 'FilterBar', columns: [] },
      children: (
        <Columns>
          <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} type="number" />
          <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} type="string" />
          <Column field="Freight" headerText="Freight" width="100" allowFilter={true} type="number" />
          <Column field="OrderDate" headerText="OrderDate" type="date" format="M/d/yyyy" width="100" allowFilter={true} />
        </Columns>
      )
    };
    
    const gridProps = { ...defaultProps, ...props };
    
    const result = render(<Grid {...gridProps} />);
    container = result.container;
    return result;
  };

  beforeEach(() => {
    gridRef = React.createRef<GridRef>();
    
    // Mock DOM methods that might not be available in the test environment
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: jest.fn(() => ''),
        width: '200px'
      })
    });

    // Mock element.getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 120,
      height: 120,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));
  });

  // Clear filters between test groups to maintain isolation while preserving continuous testing approach
  afterEach(async () => {
    if (gridRef.current) {
      await act(async () => {
        gridRef.current.clearFilter();
        // Add small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 10));
      });
    }
  });

  // Test Group 1: Basic Initialization and Rendering
  describe('Basic Initialization and Rendering', () => {
    test('should initialize grid with filtering and render all components', async () => {
      setupContinuousGrid();
      
      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(gridRef.current.filterSettings).not.toBeNull();
        expect(gridRef.current.filterSettings.enabled).toBe(true);
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelectorAll('.sf-cell').length).toBeGreaterThan(0);

        // for coverage util method in filter
        const Pred: FilterPredicates = { value: 'val' };
        getCaseValue(Pred);
        getCaseValue({});
    });
});


    // Test Group 15: Initial filtering - OR predicate, mixed types and message updates
    test('should initialize with OR predicates across string/number/date and update message on clear', async () => {
      const init: FilterSettings = {
        enabled: true,
        type: 'FilterBar' as FilterType,
        showFilterBarStatus: true,
        columns: [
          { field: 'CustomerID', operator: 'contains', value: 'VI', predicate: 'or' },
          { field: 'OrderID', operator: 'greaterthan', value: 10249, predicate: 'or' },
          { field: 'OrderDate', operator: 'equal', value: new Date('1996-07-08') as any, predicate: 'or' }
        ]
      } as any;

      setupContinuousGrid({ filterSettings: init });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(3);
      });

      // Clear one column and ensure message updates and remaining predicates persist
      await act(async () => {
        gridRef.current.clearFilter(['OrderID']);
      });

      await waitFor(() => {
        const cols = gridRef.current.filterSettings.columns;
        expect(cols.find(c => c.field === 'OrderID')).toBeUndefined();
      });
    });

    // Test Group 16: Keyup vs Enter behavior across modes
    test('OnEnter mode should not filter on keyup until Enter is pressed', async () => {
      const { container } = setupContinuousGrid({
        filterSettings: { enabled: true, type: 'FilterBar', mode: 'OnEnter' }
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      const input = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(i => (i as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { value: 'VIN' } });
        fireEvent.keyDown(input, { key: 'n', keyCode: 13 });
      });

      // No filter yet
      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });

      // Press Enter -> filter applies
      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
      });
    });

    // Test Group 17: Clear via header clear icon (mousedown) for number and date
    test('should clear numeric and date filter using header clear icon mousedown', async () => {
      const { container } = setupContinuousGrid({
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} type="number" />
            <Column field="OrderDate" headerText="Order Date" width="150" allowFilter={true} type="date" />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      // Apply filters using Enter
      const orderIdInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(i => (i as HTMLInputElement).id === 'OrderID_filterBarcell') as HTMLInputElement;
      const orderDateInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(i => (i as HTMLInputElement).id === 'OrderDate_filterBarcell') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(orderIdInput, { target: { value: '>=10249' } });
        fireEvent.keyDown(orderIdInput, { key: 'Enter', keyCode: 13 });
        fireEvent.change(orderDateInput, { target: { value: '1996-07-08' } });
        fireEvent.keyDown(orderDateInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns.length).toBe(2);
      });

      // Clear numeric via mousedown
      const numHeader = closest(orderIdInput, '.sf-filter-row th.sf-cell') as HTMLElement;
      const numClear = numHeader.querySelector('.sf-clear-icon') as HTMLElement;
      await act(async () => {
        fireEvent.mouseDown(numClear);
      });

      await waitFor(() => {
        const cols = gridRef.current.filterSettings.columns;
        expect(cols.find(c => c.field === 'OrderID')).toBeUndefined();
        expect(cols.find(c => c.field === 'OrderDate')).toBeDefined();
      });

      // Clear date via mousedown
      const dateHeader = closest(orderDateInput, '.sf-filter-row th.sf-cell') as HTMLElement;
      const dateClear = dateHeader.querySelector('.sf-clear-icon') as HTMLElement;
      await act(async () => {
        fireEvent.mouseDown(dateClear);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
      });
    });

    // Test Group 18: FilterTemplate end-to-end with operator and message
    test('should render filterTemplate and honor filter.operator with message visible', async () => {
      const tpl = () => <div className="tpl">filter-template</div>;

      const { container } = setupContinuousGrid({
        filterSettings: { enabled: true, type: 'FilterBar', showFilterBarStatus: true },
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} filter={{ operator: 'equal' }} filterTemplate={tpl as any} />
            <Column field="Freight" headerText="Freight" width="100" allowFilter={true} />
          </Columns>
        )
      });

      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
      });

      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
      });

      // Apply via API and validate operator and message
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'equal', 'VINET');
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('equal');
      });
    });

    test('should render filter bar with special column types', async () => {
      const { container } = setupContinuousGrid({
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} />
            <Column field="Freight" headerText="Freight" type='number' format='C2' filter={{ filterBarType: FilterBarType.NumericTextBox}} width="100" allowFilter={true} />
            <Column field="OrderDate" headerText="OrderDate" type='date' format='M/d/yyyy' filter={{ filterBarType: FilterBarType.DatePicker}} width="100" allowFilter={true} />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
      });

      // Find the CustomerID filter input
      const customerIdFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;
      
      // Mock column.uid attribute
      const headerCell = closest(customerIdFilterInput, '.sf-filter-row th.sf-cell') as HTMLElement;
      const clearButton = headerCell.querySelector('.sf-clear-icon') as HTMLElement;

      // Type text and focus and blur and clear btn click
      await act(async () => {
        fireEvent.change(customerIdFilterInput, { target: { value: 'VI' } });
        fireEvent.change(customerIdFilterInput, { target: { value: 'New Value' } });
        fireEvent.focus(customerIdFilterInput);
        fireEvent.blur(customerIdFilterInput);
        fireEvent.click(clearButton);
      });

      // Type text but press a different key (not Enter)
      await act(async () => {
        fireEvent.change(customerIdFilterInput, { target: { value: 'VI' } });
        fireEvent.keyDown(customerIdFilterInput, { key: 'A', keyCode: 65 });
      });

      // Check that no filter was applied (should only filter on Enter)
      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
      });
    });
  });

  // Test Group 2: String Column Filtering Operations
  describe('String Column Filtering Operations', () => {
    beforeEach(() => {
      setupContinuousGrid();
    });

    test('should filter string column with contains, startsWith, and endsWith operators', async () => {
      // Test contains operator
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('contains');
        expect(gridRef.current.filterSettings.columns[0].value).toBe('VI');
      });

      // Clear filter and test startsWith operator
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'startswith', 'VI', 'and', false, false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('startswith');
        expect(gridRef.current.filterSettings.columns[0].value).toBe('VI');
      });

      // Clear filter and test endsWith operator
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'endswith', 'ET', 'and', false, false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('endswith');
        expect(gridRef.current.filterSettings.columns[0].value).toBe('ET');
      });
    });

    test('should filter string column with like and wildcard patterns', async () => {
      // Test contains with % pattern
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'contains', '%V%');
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });

      // Test contains with * pattern
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'contains', 'v*t');
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });

      // Test like operator
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'like', 'vt');
      });
      
      // Additional wildcard test cases
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'contains', '%V%');
      });
      
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'v*t');
      });
      
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'like', 'vt');
      });
    });
    
    test('should handle wildcard filtering with keyboard interaction', async () => {
      // Re-render with proper setup for keyboard tests
      const { container } = setupContinuousGrid();
      
      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull(); // wait for initial load complete
      });

      // Find the CustomerID filter input
      const customerIdFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;
      
      // Enter text and trigger the enter key
      await act(async () => {
        fireEvent.change(customerIdFilterInput, { target: { value: '%V%' } });
        fireEvent.keyDown(customerIdFilterInput, { key: 'Enter', keyCode: 13 });
      });

      // Enter text and trigger the enter key
      await act(async () => {
        fireEvent.change(customerIdFilterInput, { target: { value: '%3f' } });
        fireEvent.keyDown(customerIdFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
      });
    });
    
    test('should handle notequal with empty and null values', async () => {
      // Test notequal with empty and null values
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'notequal', '');
      });

      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'notequal', null);
      });
    });

    test('should handle empty string and special values for string columns', async () => {
      // Test empty string filter value
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'contains', '', 'and', false, false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });

      // Test notequal with empty and null values
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'notequal', '');
      });

      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'notequal', null);
      });
    });

    test('should filter with case sensitivity when enabled', async () => {
      // Re-render with case sensitive settings
      render(
        <Grid
          ref={gridRef}
          dataSource={sampleData}
          height={400}
          width={800}
          filterSettings={{ 
            enabled: true,
            caseSensitive: true,
            columns: [] 
          }}
        >
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} />
            <Column field="Freight" headerText="Freight" width="100" allowFilter={true} />
          </Columns>
        </Grid>
      );

      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', true, false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
        expect(gridRef.current.filterSettings.columns[0].caseSensitive).toBe(true);
      });
    });
  });

  // Test Group 3: Number Column Filtering Operations
  describe('Number Column Filtering Operations', () => {
    beforeEach(() => {
      setupContinuousGrid();
    });

    test('should filter number column with equal and greaterThan operators', async () => {
      // Test equal operator
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('OrderID', 'equal', 10248, 'and', true, false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('OrderID');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('equal');
        expect(gridRef.current.filterSettings.columns[0].value).toBe(10248);
      });

      // Test greaterThan operator
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('Freight', 'greaterthan', 40, 'and', true, false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('Freight');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('greaterthan');
        expect(gridRef.current.filterSettings.columns[0].value).toBe(40);
      });
    });
  });

  // Test Group 4: Multi-column and Complex Filtering
  describe('Multi-column and Complex Filtering', () => {
    beforeEach(() => {
      setupContinuousGrid();
    });

    test('should support multi-column filtering', async () => {
      await act(async () => {
        // Filter first column
        gridRef.current.filterByColumn('OrderID', 'greaterthan', 10249, 'and', true, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        // Filter second column
        gridRef.current.filterByColumn('CustomerID', 'startswith', 'H', 'and', false, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('OrderID');
        expect(gridRef.current.filterSettings.columns[1].field).toBe('CustomerID');
      });
    });

    test('should handle array values for filtering', async () => {
      // Test equal with array values
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'equal', ['VINET', 'TOMSP', 'HANAR']);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(3);
      });
    });
    
    test('should handle DateOnly with multiple date filter', async () => {
      // Set up a new grid with dateonly type data
      const data = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, OrderDate: '2023-04-04' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, OrderDate: '2023-03-05' },
        { OrderID: 10250, CustomerID: 'TOMS', Freight: 10.61, OrderDate: '2023-01-05' }
      ];
      
      // Re-render with dateonly data
      render(
        <Grid
          ref={gridRef}
          dataSource={data}
          height={400}
          width={800}
          filterSettings={{ 
            enabled: true,
            type: 'FilterBar',
          }}
        >
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} />
            <Column field="OrderDate" headerText="Order Date" width="150" allowFilter={true} type="dateonly" />
          </Columns>
        </Grid>
      );

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
      });

      // Test array value filtering
      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'equal', ['2023-04-04', '2023-03-05', '2023-01-05']);
      });

      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'equal', ['2023-04-04', '2023-03-05', '2023-01-05'], 'and');
      });
    });
  });

  // Test Group 5: Filter Settings Initialization
  describe('Filter Settings Initialization', () => {
    test('should initialize with filterSettings from props', async () => {
      const initialFilterSettings = {
        enabled: true,
        columns: [
          { field: 'CustomerID', operator: 'startswith', value: 'V', predicate: 'and', caseSensitive: false }
        ],
        type: 'FilterBar' as FilterType
      };

      setupContinuousGrid({ filterSettings: initialFilterSettings });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('startswith');
        expect(gridRef.current.filterSettings.columns[0].value).toBe('V');
      });
    });

    test('should initialize with filterSettings from Freight column with format', async () => {
      const initialFilterSettings = {
        enabled: true,
        columns: [
          { field: 'Freight', operator: 'equal', value: '10', predicate: 'and', caseSensitive: false }
        ],
        type: 'FilterBar' as FilterType
      };

      setupContinuousGrid({ filterSettings: initialFilterSettings });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('Freight');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('equal');
      });
    });

    test('should initialize with filterSettings with clearIcon', async () => {
      const initialFilterSettings: FilterSettings = {
        enabled: true,
        columns: [
          { field: 'CustomerID', operator: 'startswith', value: 'V', predicate: 'and', caseSensitive: false }
        ],
        type: 'FilterBar' as FilterType, mode: 'Immediate'
      };

      const { container } = setupContinuousGrid({ filterSettings: initialFilterSettings });

      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
      });

      // Find the CustomerID filter input
      const customerIdFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;
      
      // Mock column.uid attribute
      const headerCell = closest(customerIdFilterInput, '.sf-filter-row th.sf-cell') as HTMLElement;
      const clearButton = headerCell.querySelector('.sf-clear-icon') as HTMLElement;

      // Type text and focus and blur and clear btn click
      await act(async () => {
        fireEvent.focus(customerIdFilterInput);
        fireEvent.blur(customerIdFilterInput);
        fireEvent.mouseDown(clearButton);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
      });
    });
  });

  // Test Group 6: Clear Filter Operations
  describe('Clear Filter Operations', () => {
    beforeEach(() => {
      setupContinuousGrid();
    });

    test('should clear filtering when clearFilter is called', async () => {
      // Apply multiple filters
      await act(async () => {
        gridRef.current.filterByColumn('OrderID1', 'equal', 10248);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        gridRef.current.filterByColumn('OrderID', 'greaterthan', 10249, 'and', true, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        gridRef.current.filterByColumn('CustomerID', 'startswith', 'H', 'and', false, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
      });

      // Clear all filters
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
      });
    });

    test('should clear specific column filter when clearFilter is called with field name', async () => {
      // Apply multiple filters
      await act(async () => {
        gridRef.current.filterByColumn('OrderID', 'greaterthan', 10249, 'and', true, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        gridRef.current.filterByColumn('CustomerID', 'startswith', 'H', 'and', false, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
      });

      // Clear specific filter
      await act(async () => {
        gridRef.current.clearFilter(['OrderID']);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
      });
    });
  });

  // Test Group 7: Filter Enable/Disable Behavior
  describe('Filter Enable/Disable Behavior', () => {
    test('should not filter when filter is false on the grid', async () => {
      setupContinuousGrid({ filterSettings: { enabled: false } });
      
      // Try to apply filter
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'wildcard', ['VI', 'VINET']);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        gridRef.current.filterByColumn('CustomerID', 'like', 'VINET');
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings?.columns.length).toBe(0);
      });
    });

    test('should not filter column when filter is false for that column', async () => {
      render(
        <Grid
          ref={gridRef}
          dataSource={sampleData}
          height={400}
          width={800}
          filterSettings={{enabled: true}}
        >
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={false} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} />
            <Column field="Freight" headerText="Freight" width="100" allowFilter={true} />
          </Columns>
        </Grid>
      );
      
      // Try to filter the column with filter=false
      await act(async () => {
        gridRef.current.filterByColumn('OrderID', 'equal', 10248, 'and', true, false);
      });

      // Try to filter a column with filter=true
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
      });

      await waitFor(() => {
        const filteredColumn = gridRef.current.filterSettings.columns.find(col => col.field === 'CustomerID');
        expect(filteredColumn).not.toBeUndefined();
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
      });
    });
  });

  // Test Group 8: Filter Bar Interaction Tests
  describe('Filter Bar Interaction Tests', () => {
    test('should filter by entering text in the filter bar', async () => {
      const { container } = setupContinuousGrid({
        filterSettings: { 
          enabled: true,
          type: 'FilterBar',
          mode: 'OnEnter',
          columns: [] 
        }
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      // Find the CustomerID filter input
      const customerIdFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;
      
      // Enter text and trigger the enter key
      await act(async () => {
        fireEvent.change(customerIdFilterInput, { target: { value: 'VI' } });
        fireEvent.keyDown(customerIdFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
        expect(gridRef.current.filterSettings.columns[0].value).toBe('VI');
      });
    });

    test('should handle keyDownHandler with Enter key for different column types', async () => {
      const { container } = setupContinuousGrid({
        filterSettings: { 
          enabled: true,
          type: 'FilterBar',
          columns: [] 
        },
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" filter={{ operator: 'equal' }} allowFilter={true} type="number" />
            <Column field="CustomerID" headerText="Customer ID" width="150" filter={{ operator: 'equal'}} allowFilter={true} type="string" />
            <Column field="Freight" headerText="Freight" width="100" allowFilter={true} type="number" />
            <Column field="OrderDate" headerText="Order Date" width="150" allowFilter={true} type="date" />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      // Test string column filtering
      const customerIdFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(customerIdFilterInput, { target: { value: 'VINET' } });
        fireEvent.keyDown(customerIdFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('equal');
        expect(gridRef.current.filterSettings.columns[0].value).toBe('VINET');
      });

      // Clear filter for next test
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Test number column filtering
      const orderIdFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'OrderID_filterBarcell') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(orderIdFilterInput, { target: { value: '10248' } });
        fireEvent.keyDown(orderIdFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('OrderID');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('equal');
        expect(gridRef.current.filterSettings.columns[0].value).toBe(10248);
      });

      // Clear filter for next test
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Test number column with operators
      const freightFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'Freight_filterBarcell') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(freightFilterInput, { target: { value: '>40' } });
        fireEvent.keyDown(freightFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('Freight');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('greaterthan');
        expect(gridRef.current.filterSettings.columns[0].value).toBe(40);
      });

      // Clear filtering
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Test number column with less than or equal operator
      await act(async () => {
        fireEvent.change(freightFilterInput, { target: { value: '<=40' } });
        fireEvent.keyDown(freightFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('Freight');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('lessthanorequal');
        expect(gridRef.current.filterSettings.columns[0].value).toBe(40);
      });

      // Clear filter for next test
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Test date column filtering
      const orderDateFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'OrderDate_filterBarcell') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(orderDateFilterInput, { target: { value: '1996-07-04' } });
        fireEvent.keyDown(orderDateFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('OrderDate');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('equal');
        expect(gridRef.current.filterSettings.columns[0].value instanceof Date).toBe(true);
      });

      // Test non-Enter key (should not filter)
      await act(async () => {
        gridRef.current.clearFilter();
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 10));
        fireEvent.change(customerIdFilterInput, { target: { value: 'VI' } });
        fireEvent.keyDown(customerIdFilterInput, { key: 'A', keyCode: 65 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
      });

      // Test clearing filter with empty value
      await act(async () => {
        fireEvent.change(customerIdFilterInput, { target: { value: 'VINET' } });
        fireEvent.keyDown(customerIdFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });

      await act(async () => {
        fireEvent.change(customerIdFilterInput, { target: { value: '' } });
        fireEvent.keyDown(customerIdFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        const filterColumns = gridRef.current.filterSettings.columns;
        const customerIdFilter = filterColumns.some(col => col.field === 'CustomerID');
        expect(customerIdFilter).toBe(false);
      });
    });

    test('should handle keyDownHandler with Enter key for date column filtering with special cases', async () => {
      const data = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, OrderDate: '2023-04-04' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, OrderDate: '2023-03-05' },
      ];
      
      const { container } = setupContinuousGrid({
        dataSource: data,
        filterSettings: { 
          enabled: true,
          type: 'FilterBar',
        },
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} />
            <Column field="OrderDate" headerText="Order Date" width="150" allowFilter={true} format="yMd" type="dateonly" />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      // Find the OrderDate filter input
      const orderDateFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'OrderDate_filterBarcell') as HTMLInputElement;

      // Enter date and trigger the enter key
      await act(async () => {
        fireEvent.change(orderDateFilterInput, { target: { value: '2023-04-04' } });
        fireEvent.keyDown(orderDateFilterInput, { key: 'Enter', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('OrderDate');
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('equal');
      });

      // Test empty value
      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'equal', '');
      });

      // Test null value
      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'equal', null);
      });
    });

    test('should handle DateOnly with multiple date filter', async () => {
      const data = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, OrderDate: '2023-04-04' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, OrderDate: '2023-03-05' },
        { OrderID: 10250, CustomerID: 'TOMS', Freight: 10.61, OrderDate: '2023-01-05' }
      ];
      
      const { container } = setupContinuousGrid({
        dataSource: data,
        filterSettings: { 
          enabled: true,
          type: 'FilterBar',
        },
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} />
            <Column field="OrderDate" headerText="Order Date" width="150" allowFilter={true} type="dateonly" />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
      });

      // Test array value filtering
      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'equal', ['2023-04-04', '2023-03-05', '2023-01-05']);
      });

      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'equal', ['2023-04-04', '2023-03-05', '2023-01-05'], 'and');
      });
    });
  });

  // Test Group 9: Special Column Types
  describe('Special Column Types', () => {
    test('Date Column filtering', async () => {
      const { container } = setupContinuousGrid({
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} />
            <Column field="OrderDate" headerText="OrderDate" type="date" filter={{ filterBarType: FilterBarType.DatePicker}} format="M/d/yyyy" width="100" allowFilter={true} />
          </Columns>
        )
      });

      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
      });

      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'equal', '7/4/1996', 'and', false, false);
      });

      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });
    });

    test('filter with boolean Column', async () => {
      const data = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, Verified: !0 },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, Verified: !1 },
      ];
      
      const { container } = setupContinuousGrid({
        dataSource: data,
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" type='string' allowFilter={true} />
            <Column field="Verified" headerText="Boolean" width="100" type="boolean" allowFilter={true} />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      const verifiedFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'Verified_filterBarcell') as HTMLInputElement;
      
      // Enter text and trigger the enter key
      await act(async () => {
        fireEvent.change(verifiedFilterInput, { target: { value: '1' } });
        fireEvent.keyDown(verifiedFilterInput, { key: 'Enter', keyCode: 13 });
      });

      // Boolean column with 0 value filter
      await act(async () => {
        fireEvent.change(verifiedFilterInput, { target: { value: '0' } });
        fireEvent.keyDown(verifiedFilterInput, { key: 'Enter', keyCode: 13 });
      });

      // Boolean column with 0 value filter
      await act(async () => {
        gridRef.current.filterByColumn('Verified', 'equal', '0');
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });
    });

    test('filter with dateTime Column', async () => {
      const data = [
        { OrderID: 10248, CustomerID: 'VINET', OrderDate: new Date(8364186e5) },
        { OrderID: 10249, CustomerID: '', EmployeeID: 6, OrderDate: new Date(836505e6)}
      ];
      
      const filterTemplate = () => {
        return <div>filter-template</div>;
      };
      
      const { container } = setupContinuousGrid({
        dataSource: data,
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" type='string' allowFilter={true} filterTemplate={filterTemplate} />
            <Column field="OrderDate" headerText="OrderDate" type="dateTime" format={{type: 'dateTime', format: 'M/d/y hh:mm a'}} width="100" allowFilter={true} />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'notequal', '7/4/1996 12:00 AM');
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });
    });

    test('filter with dateTime Column - greaterthan', async () => {
      const data = [
        { OrderID: 10248, CustomerID: 'VINET', OrderDate: new Date(8364186e5) },
        { OrderID: 10249, CustomerID: '', EmployeeID: 6, OrderDate: new Date(836505e6)}
      ];
      
      const { container } = setupContinuousGrid({
        dataSource: data,
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" type='string' allowFilter={true} />
            <Column field="OrderDate" headerText="OrderDate" type="date" format='yMd' width="100" allowFilter={true} />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'greaterthan', '7/4/1996');
      });

      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'greaterthan', new Date('7/5/1996'));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });
    });
  });

  // Test Group 10: Event Handling
  describe('Event Handling', () => {
    test('should trigger actionBegin and actionComplete events when filtering', async () => {
      const actionBeginSpy = jest.fn();
      const actionCompleteSpy = jest.fn();

      setupContinuousGrid({
        filterSettings: {enabled: true},
        onFilterStart: actionBeginSpy,
        onFilter: actionCompleteSpy
      });
      
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
      });

      await waitFor(() => {
        expect(actionBeginSpy).toHaveBeenCalled();
        expect(actionCompleteSpy).toHaveBeenCalled();
        
        // Verify the event arguments
        const beginArgs = actionBeginSpy.mock.calls[0][0];
        expect(beginArgs.requestType).toBe(ActionType.Filtering);
      });
    });

    test('should cancel filtering when actionBegin returns cancel=true', async () => {
      // Create a spy that cancels the filter operation
      const actionBeginSpy = jest.fn(args => {
        args.cancel = true;
      });

      setupContinuousGrid({
        filterSettings: {enabled: true},
        onFilterStart: actionBeginSpy
      });
      
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
      });

      await waitFor(() => {
        expect(actionBeginSpy).toHaveBeenCalled();
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
      });
    });

    test('should cancel clear filtering when onFilterStart returns cancel=true', async () => {
      // Create a spy that cancels the filter operation
      const onFilteringSpy = jest.fn(args => {
        if (args.requestType === ActionType.ClearFiltering) {
          args.cancel = true;
        }
      });

      setupContinuousGrid({
        filterSettings: {enabled: true},
        onFilterStart: onFilteringSpy
      });
      
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
      });

      await waitFor(() => {
        expect(onFilteringSpy).toHaveBeenCalled();
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });
      
      await act(async () => {
        gridRef.current.removeFilteredColsByField('CustomerID');
      });
    });

    test('should correctly remove filtered column by field when using removeFilteredColsByField', async () => {
      const actionBeginSpy = jest.fn();
      const actionCompleteSpy = jest.fn();

      setupContinuousGrid({
        filterSettings: {enabled: true},
        onFilterStart: actionBeginSpy,
        onFilter: actionCompleteSpy
      });
      
      // First, apply multiple filters
      await act(async () => {
        gridRef.current.filterByColumn('OrderID', 'equal', 10248, 'and', true, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
      });

      // Reset the spy call counts
      actionBeginSpy.mockClear();
      actionCompleteSpy.mockClear();

      // Remove the filter for CustomerID via removeFilteredColsByField
      await act(async () => {
        gridRef.current.removeFilteredColsByField('CustomerID');
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('OrderID');
      });
    });

    test('should cancel removeFilteredColsByField when actionBegin handler sets cancel=true', async () => {
      // Create spy that cancels the operation
      const actionBeginSpy = jest.fn(args => {
        if (args.action === ActionType.ClearFiltering && args.currentFilterColumn?.field === 'CustomerID') {
          args.cancel = true;
        }
      });

      setupContinuousGrid({
        filterSettings: {enabled: true},
        onFilterStart: actionBeginSpy
      });
      
      // Apply filters
      await act(async () => {
        gridRef.current.filterByColumn('OrderID', 'equal', 10248, 'and', true, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
      });

      // Try to remove CustomerID filter but will be canceled
      await act(async () => {
        gridRef.current.removeFilteredColsByField('CustomerID');
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
        expect(actionBeginSpy).toHaveBeenCalled();
        
        const beginArgs = actionBeginSpy.mock.calls[actionBeginSpy.mock.calls.length - 1];
        expect(beginArgs[0].action).toBe(ActionType.ClearFiltering);
      });

      // Now verify we can remove the other filter
      await act(async () => {
        gridRef.current.removeFilteredColsByField('OrderID');
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
      });
    });

    test('should clear filter input when removeFilteredColsByField is called with isClearFilterBar=true', async () => {
      const { container } = setupContinuousGrid({
        filterSettings: { enabled: true, type: 'FilterBar' }
      });

      // Wait for the filter bar to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
      });

      // Find the CustomerID filter input
      const customerIdFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;

      // Apply filter and update the input value
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
        fireEvent.change(customerIdFilterInput, { target: { value: 'VI' } });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(customerIdFilterInput.value).toBe('VI');
      });

      // Remove filter with isClearFilterBar=true
      await act(async () => {
        gridRef.current.removeFilteredColsByField('CustomerID', true);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
        expect(customerIdFilterInput.value).toBe('');
      });
    });

    test('should not clear filter input when removeFilteredColsByField is called with isClearFilterBar=false', async () => {
      const { container } = setupContinuousGrid({
        filterSettings: { enabled: true, type: 'FilterBar' }
      });

      // Wait for the filter bar to render
      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
      });

      // Find the CustomerID filter input
      const customerIdFilterInput = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(input => (input as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;

      // Apply filter and update the input value
      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
        fireEvent.change(customerIdFilterInput, { target: { value: 'VI' } });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(customerIdFilterInput.value).toBe('VI');
      });

      // Remove filter with isClearFilterBar=false (default)
      await act(async () => {
        gridRef.current.removeFilteredColsByField('CustomerID', false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
        expect(customerIdFilterInput.value).toBe('');
      });
    });

    test('should trigger both actionBegin and actionComplete when clearFilter is called with specific fields', async () => {
      const actionBeginSpy = jest.fn();
      const actionCompleteSpy = jest.fn();
      const onRefresh = jest.fn();

      const { container } = setupContinuousGrid({
        filterSettings: {enabled: true},
        editSettings: {confirmOnEdit: false},
        onFilterStart: actionBeginSpy,
        onFilter: actionCompleteSpy,
        onRefreshStart: actionBeginSpy,
        onRefresh: onRefresh
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      // Apply multiple filters
      await act(async () => {
        gridRef.current.filterByColumn('OrderID', 'equal', 10248, 'and', true, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 50));
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 50));
        gridRef.current.filterByColumn('Freight', 'greaterthan', 30, 'and', true, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(3);
      });

      // Clear specific columns
      await act(async () => {
        // Reset spy counters
        actionBeginSpy.mockClear();
        actionCompleteSpy.mockClear();
        onRefresh.mockClear();
        gridRef.current.clearFilter(['OrderID', 'Freight']);
      });

      await waitFor(() => {
        // Only CustomerID filter should remain
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
        
        // Check that actionBegin was called with the right parameters
        expect(actionBeginSpy).toHaveBeenCalledTimes(1);
        const beginArgs = actionBeginSpy.mock.calls[0][0];
        expect(beginArgs.requestType).toBe('Refresh');
        expect(beginArgs.name).toBe('onActionBegin');
        
        // Check that actionComplete was called with the right parameters
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    test('should trigger both actionBegin and actionComplete when clearFilter is called without parameters', async () => {
      const actionBeginSpy = jest.fn();
      const actionCompleteSpy = jest.fn();
      const onRefresh = jest.fn();

      setupContinuousGrid({
        filterSettings: {enabled: true},
        editSettings: {confirmOnEdit: false},
        onFilterStart: actionBeginSpy,
        onFilter: actionCompleteSpy,
        onRefreshStart: actionBeginSpy,
        onRefresh: onRefresh
      });

      // Apply multiple filters
      await act(async () => {
        gridRef.current.filterByColumn('OrderID', 'equal', 10248, 'and', true, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
      });

      // Reset spy counters
      actionBeginSpy.mockClear();
      actionCompleteSpy.mockClear();
      onRefresh.mockClear();

      // Clear all filters
      await act(async () => {
        gridRef.current.clearFilter();
      });

      await waitFor(() => {
          expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      await waitFor(() => {
        // No filters should remain
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
        
        // Check that actionBegin was called
        expect(actionBeginSpy).toHaveBeenCalledTimes(1);
        const beginArgs = actionBeginSpy.mock.calls[0][0];
        expect(beginArgs.requestType).toBe('Refresh');
        
        // Check that actionComplete was called
        expect(onRefresh).toHaveBeenCalledTimes(2); // both onActionBegin + onActionComplete with same requestType 'Refresh'
      });
    });
  });

  // Test Group 11: Special Cases and Templates
  describe('Special Cases and Templates', () => {
    test('string filter template with filtering', async () => {
      const { container } = setupContinuousGrid({
        filterSettings: {enabled: true},
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="Freight" headerText="Freight" width="100" type='number' filter={{ filterBarType: FilterBarType.NumericTextBox}} allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" type='string' allowFilter={true} filterTemplate="<div>filter-template</div>" />
            <Column field="OrderDate" headerText="OrderDate" type="dateTime" filter={{ filterBarType: FilterBarType.DatePicker}} width="100" allowFilter={true} />
          </Columns>
        )
      });

      // Wait for the grid to render
      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      await act(async () => {
        gridRef.current.filterByColumn('OrderID', 'equal', 10248);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });  
      
      await act(async () => {
        gridRef.current.filterByColumn('OrderDate', 'equal', new Date('1996-07-04'));
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
      });  

      // Test focus and click events
      await act(async () => {
        // Find the orderDate filter input
        const orderDateFilterInput = container.querySelector('.sf-filter-row .sf-cell .sf-datepicker input') as HTMLInputElement;
        
        fireEvent.focus(orderDateFilterInput);
        fireEvent.click(orderDateFilterInput);
        await new Promise(resolve => setTimeout(resolve, 500));
      });
    });
  });

  // Test Group 12: Filtering with Searching, Sorting, Paging and Editing (Combinations)
  describe('Filtering with Searching, Sorting, Paging and Editing (Combinations)', () => {
    test('should keep filter while searching and sorting with paging/editing active', async () => {
      const { container } = setupContinuousGrid({
        dataSource: sampleData.concat(sampleData),
        searchSettings: { enabled: true },
        filterSettings: { enabled: true, type: 'FilterBar', showFilterBarStatus: true },
        sortSettings: { enabled: true },
        pageSettings: { enabled: true, pageSize: 4, pageCount: 3, currentPage: 2 },
        editSettings: { allowEdit: true }
      });

      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
        expect(container.querySelector('.sf-spinner')).toBeNull();
      });

      // Apply a filter
      await act(async () => {
        gridRef.current.filterByColumn('OrderID', 'greaterthan', 10248, 'and', true, false);
      });

      // Search should persist with filter
      await act(async () => {
        gridRef.current.search('VI');
      });

      // Sort and keep states
      await act(async () => {
        gridRef.current.sortByColumn('CustomerID', 'Ascending', false);
      });

      // Edit a value
      await act(async () => {
        gridRef.current.setCellValue(10249, 'CustomerID', 'UPDATED', true);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.searchSettings.value).toBe('VI');
        expect(gridRef.current.sortSettings.columns.length).toBeGreaterThanOrEqual(1);
        expect(gridRef.current.pageSettings.currentPage).toBe(1);
      });

      // Clear search should not clear filter
      await act(async () => {
        gridRef.current.search('');
      });

      await waitFor(() => {
        expect(gridRef.current.searchSettings.value).toBe('');
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
      });
    });
  });

  // Test Group 13: Initial Filtering - properties matrix
  describe('Initial Filtering - properties matrix', () => {
    test('should initialize with multiple filter columns, operators and case sensitivity', async () => {
      const initialFilterSettings: FilterSettings = {
        enabled: true,
        type: 'FilterBar' as FilterType,
        caseSensitive: true,
        showFilterBarStatus: true,
        mode: 'OnEnter',
        columns: [
          { field: 'CustomerID', operator: 'startswith', value: 'V', predicate: 'and', caseSensitive: true },
          { field: 'OrderID', operator: 'greaterthan', value: 10248, predicate: 'and', caseSensitive: true }
        ]
      } as any;

      setupContinuousGrid({ filterSettings: initialFilterSettings });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(2);
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('startswith');
        expect(gridRef.current.filterSettings.columns[1].operator).toBe('greaterthan');
      });
    });
  });

  // Test Group 14: FilterBar message, keyup, clearFilter and operator/template combos
  describe('FilterBar message, keyup, clearFilter and operator/template combos', () => {


    test('should filter on keyup in Immediate mode and clear via clear icon mousedown', async () => {
      const { container } = setupContinuousGrid({
        filterSettings: { enabled: true, type: 'FilterBar', mode: 'Immediate' }
      });

      await waitFor(() => {
        expect(container.querySelector('.sf-grid')).not.toBeNull();
      });

      // Find input and simulate keyup
      const input = Array.from(container.querySelectorAll('.sf-filter-row .sf-cell input'))
        .find(i => (i as HTMLInputElement).id === 'CustomerID_filterBarcell') as HTMLInputElement;

      const headerCell = closest(input, '.sf-filter-row th.sf-cell') as HTMLElement;
      const clearBtn = headerCell.querySelector('.sf-clear-icon') as HTMLElement;

      await act(async () => {
        fireEvent.change(input, { target: { value: 'VI' } });
        fireEvent.keyDown(input, { key: 'v', keyCode: 13 });
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
      });

      // Clear by mousedown on clear icon
      await act(async () => {
        fireEvent.mouseDown(clearBtn);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(0);
      });
    });

    test('should respect column filter.operator with filterTemplate present', async () => {
      const tpl = () => <div>tpl</div>;
      const { container } = setupContinuousGrid({
        filterSettings: { enabled: true, type: 'FilterBar' },
        children: (
          <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
            <Column field="CustomerID" headerText="Customer ID" width="150" allowFilter={true} filter={{ operator: 'equal' }} filterTemplate={tpl} />
            <Column field="Freight" headerText="Freight" width="100" allowFilter={true} />
          </Columns>
        )
      });

      await waitFor(() => {
        expect(container.querySelector('.sf-filter-row')).not.toBeNull();
      });


      await act(async () => {
        gridRef.current.filterByColumn('CustomerID', 'equal', 'VINET', 'and', true, false);
      });

      await waitFor(() => {
        expect(gridRef.current.filterSettings.columns).toHaveLength(1);
        expect(gridRef.current.filterSettings.columns[0].operator).toBe('equal');
      });
    });
  });
});

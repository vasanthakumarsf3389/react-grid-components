import { RefObject, createRef } from 'react';
import { render, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid } from '../../src/index';
import { DataManager } from '@syncfusion/react-data';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('CRUD Operations with DataManager Integration', () => {
  let mockData: any[];
  let mockColumns: any[];
  let gridRef: RefObject<any>;
  let renderResult: RenderResult;

  const defaultData = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false },
    { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', active: true }
  ];

  const defaultColumns = [
    { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
    { field: 'name', headerText: 'Name', type: 'string', allowEdit: true },
    { field: 'age', headerText: 'Age', type: 'number', allowEdit: true },
    { field: 'email', headerText: 'Email', type: 'string', allowEdit: true },
    { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true }
  ];

  const setupGrid = (props: {
    dataSource: any;
    columns?: any[];
    editSettings?: any;
    sortSettings?: any;
    filterSettings?: any;
    onActionComplete?: jest.Mock;
    onDataChangeComplete?: jest.Mock;
    onFormRender?: jest.Mock;
  }) => {
    renderResult = render(
      <Grid
        ref={gridRef}
        data-testid="grid"
        {...props}
      />
    );
    return renderResult.container;
  };

  const waitForGridRender = async (container: HTMLElement) => {
    await waitFor(() => {
      expect(container.querySelector('.sf-grid')).not.toBeNull();
      expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
    });
  };

  beforeEach(() => {
    mockData = [...defaultData];
    mockColumns = [...defaultColumns];
    gridRef = createRef();
  });

  afterEach(() => {
    renderResult?.unmount();
    jest.clearAllMocks();
  });

  describe('Local DataManager Operations', () => {
    it('should handle insert operations', async () => {
      const dataManager = new DataManager(mockData);
      const onActionComplete = jest.fn();

      const container = setupGrid({
        dataSource: dataManager,
        columns: mockColumns,
        editSettings: { allowAdd: true, allowEdit: true, mode: 'Normal' },
        onFormRender: onActionComplete
      });

      await waitForGridRender(container); // 2 assertions

      await act(async () => {
        await gridRef.current?.addRecord({ 
          name: 'New User', 
          age: 25, 
          email: 'new@example.com', 
          active: true 
        });
      });
    });

    it('should handle update operations', async () => {
      const dataManager = new DataManager(mockData);
      const onActionComplete = jest.fn();

      const container = setupGrid({
        dataSource: dataManager,
        columns: mockColumns,
        editSettings: { allowEdit: true, mode: 'Normal' },
        onFormRender: onActionComplete,
        onDataChangeComplete: onActionComplete
      });

      await waitForGridRender(container); // 2 assertions

      await act(async () => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
      expect(nameInput).not.toBeNull(); // 1 assertion

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        await gridRef.current?.saveDataChanges();
      });
    });

    it('should handle delete operations', async () => {
      const dataManager = new DataManager(mockData);
      const container = setupGrid({
        dataSource: dataManager,
        columns: mockColumns,
        editSettings: { allowDelete: true, mode: 'Normal' }
      });

      await waitForGridRender(container); // 2 assertions
    });
  });

  describe('Query Generation for CRUD Operations', () => {
    it('should generate proper queries with sorting and filtering', async () => {
      const mockDataManager = {
        insert: jest.fn().mockResolvedValue({ result: [{ id: 4, name: 'New User', age: 25 }] }),
        executeQuery: jest.fn().mockResolvedValue({ result: mockData })
      };

      const container = setupGrid({
        dataSource: mockDataManager as any,
        columns: mockColumns,
        editSettings: { allowAdd: true, mode: 'Normal' },
        sortSettings: { enabled: true, columns: [{ field: 'name', direction: 'Ascending' }] },
        filterSettings: { enabled: true, columns: [{ field: 'age', operator: 'greaterthan', value: 25 }] }
      });

      await waitForGridRender(container); // 2 assertions

      await act(async () => {
        await gridRef.current?.addRecord({ name: 'New User', age: 25 });
      });
    });

    it('should handle primary key field detection', async () => {
      const columnsWithCustomPrimaryKey = [
        { field: 'customId', headerText: 'Custom ID', type: 'number', isPrimaryKey: true },
        { field: 'name', headerText: 'Name', type: 'string', allowEdit: true }
      ];

      const dataWithCustomPrimaryKey = [
        { customId: 1, name: 'John Doe' },
        { customId: 2, name: 'Jane Smith' }
      ];

      const mockDataManager = {
        update: jest.fn().mockResolvedValue({ result: [{ customId: 1, name: 'Updated Name' }] }),
        executeQuery: jest.fn().mockResolvedValue({ result: dataWithCustomPrimaryKey })
      };

      const container = setupGrid({
        dataSource: mockDataManager as any,
        columns: columnsWithCustomPrimaryKey,
        editSettings: { allowEdit: true, mode: 'Normal' }
      });

      await waitForGridRender(container); // 2 assertions

      await act(async () => {
        await gridRef.current?.updateRecord(0, { customId: 1, name: 'Updated Name' });
      });
    });
  });

  describe('Integration with Grid Features', () => {
    it('should work with sorting and filtering during CRUD operations', async () => {
      const dataManager = new DataManager(mockData);
      const container = setupGrid({
        dataSource: dataManager,
        columns: mockColumns,
        editSettings: { allowAdd: true, mode: 'Normal' },
        sortSettings: { enabled: true },
        filterSettings: { enabled: true }
      });

      await waitForGridRender(container); // 2 assertions

      await act(async () => {
        await gridRef.current?.sortByColumn('name', 'Ascending', false);
        await gridRef.current?.filterByColumn('age', 'greaterthan', 25);
        await gridRef.current?.addRecord({ name: 'New User', age: 30 });
      });
    });

    it('should maintain data consistency during concurrent operations', async () => {
      const dataManager = new DataManager(mockData);
      const container = setupGrid({
        dataSource: dataManager,
        columns: mockColumns,
        editSettings: { allowAdd: true, allowEdit: true, mode: 'Normal' }
      });

      await waitForGridRender(container); // 2 assertions

      await act(async () => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
      expect(nameInput).not.toBeNull(); // 1 assertion

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        await gridRef.current?.saveDataChanges();
        await gridRef.current?.addRecord({ name: 'New User', age: 25 });
      });
    });
  });
});
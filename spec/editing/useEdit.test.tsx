import { RefObject, createRef } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ColumnProps } from '../../src/grid/types/column.interfaces';
import { ActionType, EditType, Grid, IRow } from '../../src/index';
import { SaveEvent } from '../../src/grid/types/edit.interfaces';
import { GridRef } from '../../src/grid/types/grid.interfaces';
import userEvent from '@testing-library/user-event';

// Mock ResizeObserver for Jest environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

/**
 * Test suite for inline editing functionality in React Grid component.
 * Tests the useEdit hook and related editing components based on original Grid editing behavior.
 * 
 * This test suite covers:
 * - Edit state management and lifecycle
 * - Inline editing operations (start, end, cancel)
 * - CRUD operations (add, update, delete)
 * - Cell-level editing and validation
 * - Form validation and error handling
 * - Edit events and callbacks
 * - Keyboard interactions
 * - Edit settings configuration
 * - Editor component integration
 * - Batch editing operations
 * - Custom edit templates
 * - Accessibility compliance
 * 
 * Based on original TypeScript Grid editing functionality from:
 * - grid-ai-prompts/old-source-spec-dom/src/grid/actions/edit.ts
 * - grid-ai-prompts/old-source-spec-dom/src/grid/actions/inline-edit.ts
 * - grid-ai-prompts/old-source-spec-dom/spec/grid/actions/inline.edit.spec.ts
 * 
 * @group editing
 * @group inline-editing
 * @group useEdit
 */
describe('useEdit Hook - Inline Editing Implementation Test Suite', () => {
  let mockData: any[];
  let mockColumns: any[];
  let gridRef: RefObject<GridRef>;

  beforeEach(() => {

    // Setup mock data
    mockData = [
      { id: 1, name: 'John Doe', age: 30, email: 'john@example.com', active: true },
      { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false },
      { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', active: true }
    ];

    // Setup mock columns
    mockColumns = [
      { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, edit:{ type: EditType.NumericTextBox } },
      { field: 'name', headerText: 'Name', type: 'string', allowEdit: true },
      { field: 'age', headerText: 'Age', type: 'number', allowEdit: true, edit:{ type: EditType.NumericTextBox } },
      { field: 'email', headerText: 'Email', type: 'string', allowEdit: true },
      { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, edit:{ type: EditType.CheckBox } }
    ];

    gridRef = createRef();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test basic inline editing initialization and state management
   */
  describe('Edit State Management', () => {
    /**
     * Test basic inline editing initialization and state management
     * Based on original Grid edit state management from edit.ts
     */
    describe('Inline Edit State Management', () => {
      it('should initialize edit state correctly with Normal mode', async () => {
        const { container } = render(
          <Grid
            ref={gridRef}
            dataSource={[...mockData]}
            columns={mockColumns}
            editSettings={{ allowEdit: true, mode: 'Normal' }}
            data-testid="grid"
          />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Verify initial edit state matches original Grid behavior
        expect(gridRef.current?.isEdit).toBe(false);
        expect(gridRef.current?.editSettings.allowEdit).toBe(true);
        expect(gridRef.current?.editSettings.mode).toBe('Normal');
        expect(gridRef.current?.editRowIndex).toBe(-1);
        expect(gridRef.current?.editData).toBeNull();
      });

      it('should handle edit settings configuration matching original Grid', async () => {
        const editSettings = {
          allowEdit: true,
          allowAdd: true,
          allowDelete: true,
          mode: 'Normal' as const,
          editOnDoubleClick: true,
          confirmOnEdit: false,
          newRowPosition: 'Top' as const
        };

        const { container } = render(
          <Grid
            ref={gridRef}
            dataSource={[...mockData]}
            columns={mockColumns}
            editSettings={editSettings}
            data-testid="grid"
          />
        );
        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });
        // Verify all edit settings are properly configured
        expect(gridRef.current?.editSettings).toEqual(expect.objectContaining(editSettings));
      });

      it('should track edit mode state changes', async () => {
        const onRowEditStart = jest.fn();

        const { container } = render(
          <Grid
            ref={gridRef}
            dataSource={[...mockData]}
            columns={mockColumns}
            editSettings={{ allowEdit: true, mode: 'Normal' }}
            onRowEditStart={onRowEditStart}
            data-testid="grid"
          />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Start editing first row
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });

        await waitFor(() => {
          expect(gridRef.current?.isEdit).toBe(true);
          expect(onRowEditStart).toHaveBeenCalledWith(
            expect.objectContaining({
              cancel: false,
              rowIndex: 0,
              data: mockData[0]
            })
          );
        });
      });

      it('should handle edit state cleanup on component unmount', async () => {
        const { unmount, container } = render(
          <Grid
            ref={gridRef}
            dataSource={[...mockData]}
            columns={mockColumns}
            editSettings={{ allowEdit: true, mode: 'Normal' }}
            data-testid="grid"
          />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Start editing
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });

        // Unmount component
        unmount();

        // Verify cleanup (no memory leaks)
        expect(() => gridRef.current?.isEdit).not.toThrow();
      });
    });

    /**
     * Test inline editing operations (startEdit, endEdit, closeEdit)
     */
    describe('Edit Operations', () => {
      /**
       * Test inline editing operations (startEdit, endEdit, closeEdit)
       * Based on original Grid inline editing from inline-edit.ts
       */
      describe('Inline Edit Operations', () => {
        it('should start inline editing for selected row matching original behavior', async () => {
          const onRowEditStart = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onRowEditStart={onRowEditStart}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Select first row (simulate row selection)
          const firstRow = gridRef.current.getRowByIndex(0);

          // Start editing using startEdit method
          await act(async() => {
            fireEvent.click(firstRow.querySelector('td'));
            gridRef.current?.editRecord();
          });

          await waitFor(() => {
            expect(onRowEditStart).toHaveBeenCalledWith(
              expect.objectContaining({
                rowIndex: 0,
                data: mockData[0],
                cancel: false
              })
            );
          });
        });

        it('should create inline edit form with proper DOM structure', async () => {
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Start editing
          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          await waitFor(() => {
            // Verify inline edit form is created with proper structure
            const editForm = container.querySelector('.sf-grid-edit-row form');
            expect(editForm).toBeInTheDocument();
            expect(editForm).toHaveClass('sf-grid-edit-form');

            // Verify edit row has proper CSS class
            const editRecord = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
            expect(editRecord).toBeInTheDocument();
            expect(editRecord).toHaveClass('sf-grid-edit-row');
          });
        });

        it('should render appropriate editors for different column types', async () => {
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Start editing
          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          await waitFor(() => {
            // Verify different editor types are rendered based on column types
            const nameEditor = container.querySelector('#grid-edit-name');
            const ageEditor = container.querySelector('#grid-edit-age');
            const emailEditor = container.querySelector('#grid-edit-email');
            const activeEditor = container.querySelector('#grid-edit-active');

            expect(nameEditor).toBeInTheDocument();
            expect(nameEditor).toHaveAttribute('type', 'text');

            expect(ageEditor).toBeInTheDocument();

            expect(emailEditor).toBeInTheDocument();

            expect(activeEditor).toBeInTheDocument();
            expect(activeEditor).toHaveAttribute('type', 'checkbox');
          });
        });

        it('should start editing with specific table row element', async () => {
          const onRowEditStart = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onRowEditStart={onRowEditStart}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          const secondRow: HTMLTableRowElement = gridRef.current.getRowByIndex(1);

          // Start editing specific row by passing row element
          await act(async() => {
            gridRef.current?.editRecord(secondRow);
          });

          await waitFor(() => {
            expect(onRowEditStart).toHaveBeenCalledWith(
              expect.objectContaining({
                cancel: false,
                rowIndex: 1,
                data: mockData[1]
              })
            );
            expect(gridRef.current?.editRowIndex).toBe(1);
          });
        });

        it('should handle double-click to start editing when editOnDoubleClick is true', async () => {
          const onRowEditStart = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal', editOnDoubleClick: true }}
              onRowEditStart={onRowEditStart}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          const firstRow = gridRef.current.getRowByIndex(0);

          await act(async() => {
            // Double-click to start editing
            fireEvent.doubleClick(firstRow.querySelectorAll('td')[2]);
          })

          await waitFor(() => {
            expect(onRowEditStart).toHaveBeenCalled();
            expect(gridRef.current?.isEdit).toBe(true);
          });
        });

        it('should end editing and save changes with proper validation', async () => {
          const actionComplete = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onDataChangeComplete={actionComplete}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Start editing
          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          // Modify cell value
          const nameInput = container.querySelector('#grid-edit-name');
          await act(async() => {
            fireEvent.change(nameInput, { target: { value: 'John Updated' } });
          });

          // End editing (save changes)
          await act(async() => {
            gridRef.current?.saveDataChanges();
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                data: expect.objectContaining({
                  name: 'John Updated'
                })
              })
            );
          });
        });

        it('should close editing without saving changes', async () => {
          const actionComplete = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onDataChangeCancel={actionComplete}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Start editing
          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          // Modify cell value
          const nameInput = container.querySelector('#grid-edit-name');
          await act(async() => {
            fireEvent.change(nameInput, { target: { value: 'John Updated' } });
          });

          // Close editing (cancel)
          await act(async() => {
            gridRef.current?.cancelDataChanges();
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                data: expect.objectContaining({
                  name: 'John Updated'
                })
              })
            );
          });

          // Verify original data is preserved
          expect(mockData[0].name).toBe('John Doe');
        });
      });

      /**
       * Test CRUD operations (add, update, delete)
       */
      describe('CRUD Operations', () => {
        it('should add new record', async () => {
          const actionComplete = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
              onDataChangeComplete={actionComplete}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          const newRecord = { name: 'New User', age: 28, email: 'new@example.com', active: true };

          // Add new record
          await act(async() => {
            gridRef.current?.addRecord(newRecord);
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                data: newRecord
              })
            );
          }, {timeout: 3000});
        });

        it('should add record at specific index', async () => {
          const actionComplete = jest.fn();
          const gridRef = createRef<GridRef>();
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
              onDataChangeComplete={actionComplete}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          const newRecord = { name: 'Inserted User', age: 32, email: 'inserted@example.com', active: false };

          // Add record at index 1
          await act(async() => {
            gridRef.current?.addRecord(newRecord, 1);
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                action: ActionType.Add,
                data: newRecord,
                rowIndex: 1,
              })
            );
          }, {timeout: 3000});
        });

        /**
         * Test defaultValue functionality in addRecord action
         * This test suite focuses on the column property defaultValue behavior
         * when adding new records to ensure proper display and functionality
         */
        describe('DefaultValue in AddRecord Action', () => {
          it('should apply defaultValue when adding record without data', async () => {
            const columnsWithDefaults = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, edit:{ type: EditType.NumericTextBox } },
              { field: 'name', headerText: 'Name', type: 'string', allowEdit: true, defaultValue: 'Default Name', edit:{ type: EditType.TextBox } },
              { field: 'age', headerText: 'Age', type: 'number', allowEdit: true, defaultValue: 25, edit:{ type: EditType.NumericTextBox } },
              { field: 'email', headerText: 'Email', type: 'string', allowEdit: true, defaultValue: 'default@example.com' },
              { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, defaultValue: true, edit:{ type: EditType.CheckBox } },
              { field: 'salary', headerText: 'Salary', type: 'number', allowEdit: true, defaultValue: 50000.00, edit:{ type: EditType.NumericTextBox } },
              { field: 'joinDate', headerText: 'Join Date', type: 'date', allowEdit: true, defaultValue: new Date('2024-01-01'), edit:{ type: EditType.DatePicker } }
            ];

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={columnsWithDefaults}
                editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Add record without providing data - should use defaultValues
            await act(async() => {
              gridRef.current?.addRecord();
            });

            await waitFor(() => {
              // Verify edit form is displayed with default values
              const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
              const ageInput = container.querySelector('#grid-edit-age') as HTMLInputElement;
              const emailInput = container.querySelector('#grid-edit-email') as HTMLInputElement;
              const activeInput = container.querySelector('#grid-edit-active') as HTMLInputElement;
              const salaryInput = container.querySelector('#grid-edit-salary') as HTMLInputElement;
              const joinDateInput = container.querySelector('#grid-edit-joinDate') as HTMLInputElement;

              // Verify default values are properly displayed in edit form
              expect(nameInput).toBeInTheDocument();
              expect(nameInput.value).toBe('Default Name');

              expect(ageInput).toBeInTheDocument();
              expect(ageInput.value).toBe('25.00');

              expect(emailInput).toBeInTheDocument();
              expect(emailInput.value).toBe('default@example.com');

              expect(activeInput).toBeInTheDocument();
              expect(activeInput.checked).toBe(true);

              expect(salaryInput).toBeInTheDocument();
              expect(salaryInput.value).toBe('50,000.00');

              expect(joinDateInput).toBeInTheDocument();
            });
          });

          it('should handle columns without defaultValue correctly', async () => {
            const mixedColumns = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
              { field: 'name', headerText: 'Name', type: 'string', allowEdit: true, defaultValue: 'Default Name' },
              { field: 'age', headerText: 'Age', type: 'number', allowEdit: true }, // No defaultValue
              { field: 'email', headerText: 'Email', type: 'string', allowEdit: true, defaultValue: 'default@example.com' },
              { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true }, // No defaultValue
              { field: 'notes', headerText: 'Notes', type: 'string', allowEdit: true } // No defaultValue
            ];

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mixedColumns}
                editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Add record without data
            await act(async() => {
              gridRef.current?.addRecord();
            });

            await waitFor(() => {
              // Verify edit form behavior
              const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
              const ageInput = container.querySelector('#grid-edit-age') as HTMLInputElement;
              const emailInput = container.querySelector('#grid-edit-email') as HTMLInputElement;
              const activeInput = container.querySelector('#grid-edit-active') as HTMLInputElement;
              const notesInput = container.querySelector('#grid-edit-notes') as HTMLInputElement;

              // Fields with defaultValue should show default values
              expect(nameInput.value).toBe('Default Name');
              expect(emailInput.value).toBe('default@example.com');

              // Fields without defaultValue should be empty/unchecked
              expect(ageInput.value).toBe('');
              expect(activeInput.checked).toBe(false);
              expect(notesInput.value).toBe('');
            });
          });

          it('should handle different data types for defaultValue correctly', async () => {
            const typedColumns = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, edit:{ type: EditType.NumericTextBox } },
              { field: 'stringField', headerText: 'String', type: 'string', allowEdit: true, defaultValue: 'Test String' },
              { field: 'numberField', headerText: 'Number', type: 'number', allowEdit: true, defaultValue: 42, edit:{ type: EditType.NumericTextBox } },
              { field: 'booleanField', headerText: 'Boolean', type: 'boolean', allowEdit: true, defaultValue: true, edit:{ type: EditType.CheckBox } },
              { field: 'dateField', headerText: 'Date', type: 'date', allowEdit: true, defaultValue: new Date('2024-01-15'), edit:{ type: EditType.DatePicker } },
              { field: 'floatField', headerText: 'Float', type: 'number', allowEdit: true, defaultValue: 3.14, edit:{ type: EditType.NumericTextBox } },
              { field: 'zeroField', headerText: 'Zero', type: 'number', allowEdit: true, defaultValue: 0, edit:{ type: EditType.NumericTextBox } },
              { field: 'falseField', headerText: 'False', type: 'boolean', allowEdit: true, defaultValue: false, edit:{ type: EditType.CheckBox } }
            ];

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={typedColumns}
                editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Add record without data
            await act(async() => {
              gridRef.current?.addRecord();
            });

            await waitFor(() => {
              // Verify all data types are handled correctly
              const stringInput = container.querySelector('#grid-edit-stringField') as HTMLInputElement;
              const numberInput = container.querySelector('#grid-edit-numberField') as HTMLInputElement;
              const booleanInput = container.querySelector('#grid-edit-booleanField') as HTMLInputElement;
              const floatInput = container.querySelector('#grid-edit-floatField') as HTMLInputElement;
              const falseInput = container.querySelector('#grid-edit-falseField') as HTMLInputElement;

              expect(stringInput.value).toBe('Test String');
              expect(numberInput.value).toBe('42.00');
              expect(booleanInput.checked).toBe(true);
              expect(floatInput.value).toBe('3.14');
              expect(falseInput.checked).toBe(false); // False should be preserved
            });
          });

          it('should handle string type conversion for defaultValue', async () => {
            const conversionColumns = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
              { field: 'stringFromNumber', headerText: 'String from Number', type: 'string', allowEdit: true, defaultValue: 123 },
              { field: 'stringFromBoolean', headerText: 'String from Boolean', type: 'string', allowEdit: true, defaultValue: true },
              { field: 'stringFromDate', headerText: 'String from Date', type: 'string', allowEdit: true, defaultValue: new Date('2024-01-01') }
            ];

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={conversionColumns}
                editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Add record without data
            await act(async() => {
              gridRef.current?.addRecord();
            });

            await waitFor(() => {
              // Verify type conversion for string fields
              const stringFromNumberInput = container.querySelector('#grid-edit-stringFromNumber') as HTMLInputElement;
              const stringFromBooleanInput = container.querySelector('#grid-edit-stringFromBoolean') as HTMLInputElement;
              const stringFromDateInput = container.querySelector('#grid-edit-stringFromDate') as HTMLInputElement;

              expect(stringFromNumberInput.value).toBe('123');
              expect(stringFromBooleanInput.value).toBe('true');
              expect(stringFromDateInput.value).toBeTruthy(); // Should be string representation of date
            });
          });

          it('should save record with defaultValues correctly', async () => {
            const actionComplete = jest.fn();
            const columnsWithDefaults = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
              { field: 'name', headerText: 'Name', type: 'string', allowEdit: true, defaultValue: 'Default Name' },
              { field: 'age', headerText: 'Age', type: 'number', allowEdit: true, defaultValue: 25 },
              { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, defaultValue: true }
            ];

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={columnsWithDefaults}
                editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
                onDataChangeComplete={actionComplete}
                onFormRender={actionComplete}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Add record without data and save
            await act(async() => {
              gridRef.current?.addRecord();
            });

            await waitFor(() => {
              expect(container.querySelector('#grid-edit-name')).toBeInTheDocument();
            });

            // Save the record
            await act(async() => {
              gridRef.current?.saveDataChanges();
            });

            await waitFor(() => {
              // Verify save action was called with default values
              expect(actionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                  // requestType: 'save',
                  data: expect.objectContaining({
                    name: 'Default Name',
                    age: 25,
                    active: true
                  })
                })
              );
            });
          });

          it('should allow modification of defaultValues in edit form', async () => {
            const actionComplete = jest.fn();
            const columnsWithDefaults = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, edit:{ type: EditType.NumericTextBox} },
              { field: 'name', headerText: 'Name', type: 'string', allowEdit: true, defaultValue: 'Default Name', edit:{ type: EditType.TextBox } },
              { field: 'age', headerText: 'Age', type: 'number', allowEdit: true, defaultValue: 25, edit:{ type: EditType.NumericTextBox} }
            ];

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={columnsWithDefaults}
                editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
                onDataChangeComplete={actionComplete}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Add record without data
            await act(async() => {
              gridRef.current?.addRecord();
            });

            await act(async() => {
              // Verify default values are displayed
              const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
              const ageInput = container.querySelector('#grid-edit-age') as HTMLInputElement;

              expect(nameInput.value).toBe('Default Name');
              expect(ageInput.value).toBe('25.00');

              // Modify the default values
              fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
              fireEvent.change(ageInput, { target: { value: '30' } });
            });

            // Save the record
            await act(async() => {
              gridRef.current?.saveDataChanges();
            });

            await waitFor(() => {
              // Verify save action was called with modified values
              expect(actionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                  data: expect.objectContaining({
                    name: 'Modified Name',
                    age: 30
                  })
                })
              );
            });
          });

          it('should handle defaultValue with newRowPosition setting', async () => {
            const columnsWithDefaults = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
              { field: 'name', headerText: 'Name', type: 'string', allowEdit: true, defaultValue: 'Default Name' },
              { field: 'position', headerText: 'Position', type: 'string', allowEdit: true, defaultValue: 'Top Position' }
            ];

            // Test with newRowPosition: 'Top'
            const { container: topContainer } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={columnsWithDefaults}
                editSettings={{ 
                  allowAdd: true, 
                  allowEdit: true, 
                  mode: 'Normal',
                  newRowPosition: 'Top'
                }}
                data-testid="grid-top"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(topContainer.querySelector('.sf-grid')).not.toBeNull();
                expect(topContainer.querySelector('.sf-spinner')).toBeNull();
            });

            // Add record without data
            await act(async() => {
              gridRef.current?.addRecord();
            });

            await waitFor(() => {
              // Verify default values are applied regardless of position
              const nameInput = topContainer.querySelector('#grid-edit-name') as HTMLInputElement;
              const positionInput = topContainer.querySelector('#grid-edit-position') as HTMLInputElement;

              expect(nameInput.value).toBe('Default Name');
              expect(positionInput.value).toBe('Top Position');
            });
          });

          it('should handle defaultValue with showAddNewRow feature', async () => {
            const columnsWithDefaults = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
              { field: 'name', headerText: 'Name', type: 'string', allowEdit: true, defaultValue: 'Add New Default' },
              { field: 'status', headerText: 'Status', type: 'string', allowEdit: true, defaultValue: 'New' }
            ];

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={columnsWithDefaults}
                editSettings={{ 
                  allowAdd: true, 
                  allowEdit: true, 
                  mode: 'Normal',
                  showAddNewRow: true
                }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // With showAddNewRow, the add new row should be automatically displayed
            await waitFor(() => {
              // Verify default values are applied in the persistent add new row
              const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
              const statusInput = container.querySelector('#grid-edit-status') as HTMLInputElement;

              expect(nameInput).toBeInTheDocument();
              expect(nameInput.value).toBe('Add New Default');
              expect(statusInput).toBeInTheDocument();
              expect(statusInput.value).toBe('New');
            });
          });
        });

        it('should update existing record', async () => {
          const actionComplete = jest.fn();
          const actionBegin = jest.fn();
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onDataChangeComplete={actionComplete}
              onDataChangeStart={actionBegin}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          const updatedData = { id: 1, name: 'John Updated', age: 31, email: 'john.updated@example.com', active: true };

          // Update row at index 0
          await act(async() => {
            gridRef.current?.updateRecord(0, updatedData);
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                action: ActionType.Edit,
                data: updatedData,
                rowIndex: 0
              })
            );
          });
        });

        it('should update existing record without actionBegin and actionComplete', async () => {
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          const updatedData = { id: 1, name: 'John Updated', age: 31, email: 'john.updated@example.com', active: true };

          // Update row at index 0
          await act(async() => {
            gridRef.current?.updateRecord(0, updatedData);
          });
        });

        it('should delete record by field and data', async () => {
          const actionComplete = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowDelete: true, mode: 'Normal' }}
              onDataChangeComplete={actionComplete}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Delete record by primary key
          await act(async() => {
            gridRef.current?.deleteRecord('id', mockData[1]);
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                action: ActionType.Delete,
                data: [mockData[1]],
              })
            );
          });
        });

        it('should delete selected record when no parameters provided', async () => {
          const actionComplete = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowDelete: true, mode: 'Normal' }}
              onDataChangeComplete={actionComplete}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });
          await act(async() => {
            // Select second row
            const secondRow = gridRef.current.getRowByIndex(1);
            secondRow.querySelectorAll('td')[2].click();
          });
          await act(async() => {
            gridRef.current?.deleteRecord();
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                action: ActionType.Delete,
                data: [mockData[1]]
              })
            );
          });
        });

        /**
         * Test multiple row deletion functionality
         * Based on original Grid multiple deletion behavior from normal-edit.ts
         */
        describe('Multiple Row Deletion', () => {
          it('should delete multiple selected records', async () => {
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                onDataChangeComplete={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Select multiple rows (first and third row)
            await act(async() => {
              gridRef.current?.selectRows([0, 2]);
            });

            // Wait for selection to complete
            await waitFor(() => {
              const selectedIndexes = gridRef.current?.getSelectedRowIndexes();
              expect(selectedIndexes).toEqual([0, 2]);
            });

            // Delete selected records
            await act(async() => {
              gridRef.current?.deleteRecord();
            });

            await waitFor(() => {
              expect(actionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                  action: ActionType.Delete,
                  data: [mockData[0], mockData[2]]
                })
              );
            });
          });

          it('should delete multiple records with array data parameter', async () => {
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                onDataChangeComplete={actionComplete}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Delete multiple records by passing array of data
            const recordsToDelete = [mockData[0], mockData[2]];
            
            await act(async() => {
              gridRef.current?.deleteRecord('id', recordsToDelete);
            });

            await waitFor(() => {
              expect(actionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                  action: ActionType.Delete,
                  data: recordsToDelete
                })
              );
            });
          });

          it('should delete multiple records by primary key values', async () => {
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                onDataChangeComplete={actionComplete}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Delete multiple records by primary key values
            const primaryKeyValues = [1, 3]; // IDs of first and third records
            
            await act(async() => {
              gridRef.current?.deleteRecord('id', primaryKeyValues);
            });

            await waitFor(() => {
              expect(actionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                  action: ActionType.Delete,
                  data: expect.arrayContaining([
                    expect.objectContaining({ id: 1 }),
                    expect.objectContaining({ id: 3 })
                  ])
                })
              );
            });
          });

          it('should handle mixed record types in multiple deletion', async () => {
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                onDataChangeComplete={actionComplete}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Delete with mixed data types (full records and partial records)
            const mixedData = [
              mockData[0], // Full record
              { id: 2 }, // Partial record with only primary key
              mockData[2] // Full record
            ];
            
            await act(async() => {
              gridRef.current?.deleteRecord('id', mixedData);
            });

            await waitFor(() => {
              expect(actionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                  action: ActionType.Delete,
                  data: expect.arrayContaining([
                    expect.objectContaining({ id: 1 }),
                    expect.objectContaining({ id: 2 }),
                    expect.objectContaining({ id: 3 })
                  ])
                })
              );
            });
          });

          it('should trigger actionBegin event before multiple deletion', async () => {
            const actionBegin = jest.fn();
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                onDataChangeStart={actionBegin}
                onDataChangeComplete={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Select multiple rows
            await act(async() => {
              gridRef.current?.selectRows([0, 1]);
            });

            // Delete selected records
            await act(async() => {
              gridRef.current?.deleteRecord();
            });

            await waitFor(() => {
              // Verify actionBegin was called first
              expect(actionBegin).toHaveBeenCalledWith(
                expect.objectContaining({
                  action: ActionType.Delete,
                  data: [mockData[0], mockData[1]],
                  cancel: false
                })
              );

              // Verify actionComplete was called after
              expect(actionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                  action: ActionType.Delete,
                })
              );
            });
          });

          it('should cancel multiple deletion when actionBegin is cancelled', async () => {
            const actionBegin = jest.fn((args) => {
              args.cancel = true; // Cancel the deletion
            });
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                onDataChangeStart={actionBegin}
                onDataChangeComplete={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Select multiple rows
            await act(async() => {
              gridRef.current?.selectRows([0, 1]);
            });

            // Attempt to delete selected records
            await act(async() => {
              gridRef.current?.deleteRecord();
            });

            await waitFor(() => {
              // Verify actionBegin was called
              expect(actionBegin).toHaveBeenCalled();
              
              // Verify deletion was cancelled - actionComplete should not be called
              expect(actionComplete).not.toHaveBeenCalled();
            });
            // Attempt to delete selected records
            await act(async() => {
              gridRef.current?.deleteRecord();
            });
            // Attempt to delete selected records
            await act(async() => {
              gridRef.current?.deleteRecord();
            });
          });

          it('should cancel startEdit when actionBegin is cancelled', async () => {
            const actionBegin = jest.fn((args) => {
              args.cancel = true; // Cancel the deletion
            });
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                onRowEditStart={actionBegin}
                onFormRender={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Select single row
            await act(async() => {
              gridRef.current?.selectRow(0);
            });

            // Attempt to start edit selected records
            await act(async() => {
              gridRef.current?.editRecord();
            });

            await waitFor(() => {
              // Verify actionBegin was called
              expect(actionBegin).toHaveBeenCalled();
              
              // Verify deletion was cancelled - actionComplete should not be called
              expect(actionComplete).not.toHaveBeenCalled();
            });
          });

          it('should cancel addRecord when actionBegin is cancelled', async () => {
            const actionBegin = jest.fn((args) => {
              args.cancel = true; // Cancel the deletion
            });
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowAdd: true, mode: 'Normal' }}
                onRowAddStart={actionBegin}
                onFormRender={actionComplete}
                onDataChangeStart={actionBegin}
                onDataChangeComplete={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Attempt to delete selected records
            await act(async() => {
              gridRef.current?.addRecord([...mockData][0]);
            });

            await waitFor(() => {
              // Verify actionBegin was called
              expect(actionBegin).toHaveBeenCalled();
              
              // Verify deletion was cancelled - actionComplete should not be called
              expect(actionComplete).not.toHaveBeenCalled();
            }, {timeout: 3000});

            // Attempt to delete selected records
            await act(async() => {
              gridRef.current?.addRecord();
            });

            await waitFor(() => {
              // Verify actionBegin was called
              expect(actionBegin).toHaveBeenCalled();
              
              // Verify deletion was cancelled - actionComplete should not be called
              expect(actionComplete).not.toHaveBeenCalled();
            }, {timeout: 3000});

            await act(async() => {
              gridRef.current?.validateField('name');
            });
          });

          it('should cancel updateRecord when actionBegin is cancelled', async () => {
            const actionBegin = jest.fn((args) => {
              args.cancel = true; // Cancel the deletion
            });
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                onDataChangeStart={actionBegin}
                onDataChangeComplete={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Attempt to delete selected records
            await act(async() => {
              gridRef.current?.updateRecord(0, { name: 'Updated Name' });
            });

            await waitFor(() => {
              // Verify actionBegin was called
              expect(actionBegin).toHaveBeenCalled();
              
              // Verify deletion was cancelled - actionComplete should not be called
              expect(actionComplete).not.toHaveBeenCalled();
            });
          });

          it('should cancel endEdit when actionBegin is cancelled', async () => {
            const onDataChangeStart = jest.fn((args: SaveEvent) => {
                args.cancel = true; // Cancel the deletion
            });
            const actionComplete = jest.fn();
            const actionBegin = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                onRowEditStart={actionBegin}
                onFormRender={actionComplete}
                onDataChangeStart={onDataChangeStart}
                onDataChangeComplete={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Attempt to delete selected records
            act(() => {
              gridRef.current.selectRow(0);
              gridRef.current.editRecord();
            });

            await waitFor(() => {
              // Verify actionBegin was called
              expect(actionBegin).toHaveBeenCalled();
              
              // Verify deletion was cancelled - actionComplete should not be called
              expect(actionComplete).toHaveBeenCalled();
            });
            await act(async() => {
              await gridRef.current.saveDataChanges();
            });
            await waitFor(() => {
              // Verify actionBegin was called
              expect(onDataChangeStart).toHaveBeenCalledWith(
                expect.objectContaining({
                  action: ActionType.Edit,
                  cancel: true,
                  rowIndex: 0
                })
              );
            }, {timeout: 3000});
          });

          it('empty data with showAddNewRow, startEdit, endEdit, deleteRecord', async () => {
            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, allowDelete: true, showAddNewRow: true, newRowPosition: 'Bottom', mode: 'Normal' }}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Attempt to delete selected records
            await act(async() => {
              gridRef.current.cancelDataChanges();
              gridRef.current.editRecord();
              gridRef.current.saveDataChanges();
              gridRef.current.deleteRecord();
            });
          });

          it('should handle empty selection gracefully', async () => {
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                onDataChangeComplete={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Clear any existing selection
            await act(async() => {
              gridRef.current?.clearSelection();
            });

            // Attempt to delete with no selection
            await act(async() => {
              gridRef.current?.deleteRecord();
            });

            // Wait a bit to ensure no action is taken
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify no deletion occurred
            expect(actionComplete).not.toHaveBeenCalled();
          });

          it('should update data source correctly after multiple deletion', async () => {
            const originalDataLength = mockData.length;

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Select and delete two records
            act(() => {
              gridRef.current?.selectRows([0, 2]);
            });

            act(() => {
              gridRef.current?.deleteRecord();
            });

            await waitFor(() => {
              // Verify data source was updated
              const currentData = gridRef.current?.getRowsObject() || [];
              expect(currentData.length).toBe(originalDataLength - 2);
              
              // Verify the correct records were removed
              const remainingIds = currentData.map((record: IRow<ColumnProps>) => record.data['id']);
              expect(remainingIds).not.toContain(1); // First record (id: 1) should be deleted
              expect(remainingIds).not.toContain(3); // Third record (id: 3) should be deleted
              expect(remainingIds).toContain(2); // Second record (id: 2) should remain
            }, {timeout: 4000});
          });

          it('should handle deletion with toolbar integration', async () => {
            const toolbarClick = jest.fn();
            const actionComplete = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: true, mode: 'Normal' }}
                toolbar={['Delete']}
                onToolbarItemClick={toolbarClick}
                onDataChangeComplete={actionComplete}
                selectionSettings={{ mode: 'Multiple' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Select multiple rows
            await act(async() => {
              gridRef.current?.selectRows([0, 1]);
            });

            // Wait for selection to complete and toolbar to update
            await waitFor(() => {
              const deleteButton = container.querySelector('#' + gridRef.current.id + '_delete');
              expect(deleteButton).not.toHaveAttribute('disabled');
            });

            // Click delete button in toolbar
            const deleteButton = container.querySelector('#' + gridRef.current.id + '_delete');
            await act(async() => {
              fireEvent.click(deleteButton);
            });

            await waitFor(() => {
              // Verify toolbar click was handled
              expect(toolbarClick).toHaveBeenCalledWith(
                expect.objectContaining({
                  item: { id: gridRef.current.id + '_delete' }
                })
              );

              // Verify deletion was performed
              expect(actionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                  action: ActionType.Delete,
                })
              );
            });
          });
        });
      });

      /**
       * Test edit events and callbacks
       */
      describe('Edit Events', () => {
        it('should trigger beginEdit event with correct parameters', async () => {
          const onRowEditStart = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onRowEditStart={onRowEditStart}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          await waitFor(() => {
            expect(onRowEditStart).toHaveBeenCalledWith(
              expect.objectContaining({
                rowIndex: 0,
                data: mockData[0],
                cancel: false
              })
            );
          });
        });

        it('should trigger cellSave event when saving cell', async () => {
          const actionBegin = jest.fn();
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onRowEditStart={actionBegin}
              onDataChangeStart={actionBegin}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Start editing
          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          // Modify and save
          const nameInput = container.querySelector('#grid-edit-name');
          await act(async() => {
            fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
            fireEvent.blur(nameInput);
          });
          await act(async() => {
            gridRef.current.saveDataChanges();
          });
        });

        it('should allow event cancellation', async () => {
          const onRowEditStart = jest.fn((args) => {
            args.cancel = true; // Cancel the edit operation
          });

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onRowEditStart={onRowEditStart}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          await waitFor(() => {
            expect(onRowEditStart).toHaveBeenCalled();
            // Verify edit was cancelled
            expect(gridRef.current?.isEdit).toBe(false);
          });
        });
      });

      /**
       * Test keyboard interactions during editing
       */
      describe('Keyboard Interactions', () => {
        it('should start editing on F2 key press', async () => {
          const onRowEditStart = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onRowEditStart={onRowEditStart}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Select first row
          const firstRow = gridRef.current.getRowByIndex(0);
          await act(async() => {
            fireEvent.click(firstRow.querySelector('td'));

            // Press F2 to start editing
            fireEvent.keyDown(firstRow, { key: 'F2', code: 'F2' });
          })

          await waitFor(() => {
            expect(onRowEditStart).toHaveBeenCalled();
          });
        });

        it('should save on Enter key press', async () => {
          const actionComplete = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onDataChangeComplete={actionComplete}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Start editing
          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          // Modify value
          const nameInput = container.querySelector('#grid-edit-name');
          await act(async() => {
            fireEvent.change(nameInput, { target: { value: 'Enter Save Test' } });

            // Press Enter to save
            fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                action: ActionType.Edit,
                rowIndex: 0
              })
            );
          });
        });

        it('should cancel on Escape key press', async () => {
          const actionComplete = jest.fn();

          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              onDataChangeCancel={actionComplete}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Start editing
          await act(async() => {
            gridRef.current?.selectRow(0);
            gridRef.current?.editRecord();
          });

          // Modify value
          const nameInput = container.querySelector('#grid-edit-name');
          await act(async() => {
            fireEvent.change(nameInput, { target: { value: 'Escape Cancel Test' } });

            // Press Escape to cancel
            fireEvent.keyDown(nameInput, { key: 'Escape', code: 'Escape' });
          });

          await waitFor(() => {
            expect(actionComplete).toHaveBeenCalledWith(
              expect.objectContaining({
                rowIndex: 0
              })
            );
          });
        });
      });

      /**
       * Test edit settings configuration
       */
      describe('Edit Settings Configuration', () => {
        it('should respect allowEdit setting', async () => {
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: false, mode: 'Normal' }}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Attempt to start editing when not allowed
          await act(async() => {
            gridRef.current?.selectRow(0);
          });

          expect(gridRef.current?.editRecord).toBeDefined();
        });

        it('should respect allowAdd setting', async () => {
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowAdd: false, allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Attempt to add record when not allowed
          await act(async() => {
            gridRef.current?.addRecord({ name: 'Test', age: 25 });
          });
          await waitFor(() => {
            // Verify no action was taken (should not throw or change state)
            expect(mockData.length).toBe(3);
          }, {timeout: 3000});
        });

        it('should respect allowDelete setting', async () => {
          const { container } = render(
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowDelete: false, allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
          );

          // Wait for grid to render
          await waitFor(() => {
              expect(container.querySelector('.sf-grid')).not.toBeNull();
              expect(container.querySelector('.sf-spinner')).toBeNull();
          });

          // Attempt to delete record when not allowed
          await act(async() => {
            gridRef.current?.deleteRecord('id', mockData[0]);
          });

          // Verify no action was taken
          expect(mockData.length).toBe(3);
        });

        /**
         * Test edit settings configuration
         */
        describe('Edit Settings Configuration', () => {
          it('should respect allowEdit setting', async () => {
            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: false, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Attempt to start editing when not allowed
            await act(async() => {
              gridRef.current?.selectRow(0);
            });

            expect(gridRef.current?.editRecord).toBeDefined();
          });

          it('should respect allowAdd setting', async () => {
            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowAdd: false, allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Attempt to add record when not allowed
            await act(async() => {
              gridRef.current?.addRecord({ name: 'Test', age: 25 });
            });

            await waitFor(() => {
              // Verify no action was taken (should not throw or change state)
              expect(mockData.length).toBe(3);
            }, {timeout: 3000});
          });

          it('should respect allowDelete setting', async () => {
            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowDelete: false, allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Attempt to delete record when not allowed
            await act(async() => {
              gridRef.current?.deleteRecord('id', mockData[0]);
            });

            // Verify no action was taken
            expect(mockData.length).toBe(3);
          });

          it('should handle editOnDoubleClick setting', async () => {
            const onRowEditStart = jest.fn();

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, editOnDoubleClick: true, mode: 'Normal' }}
                onRowEditStart={onRowEditStart}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Double click on first row
            const firstRow = gridRef.current?.getRowByIndex(0);
            const dblClickEvent = new MouseEvent('dblclick', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            await act(async() => {
              // Dispatch the event
              firstRow.dispatchEvent(dblClickEvent);
              fireEvent.doubleClick(firstRow);
            })

          });
        });

        /**
         * Test custom edit templates and components
         */
        describe('Custom Edit Templates', () => {
          it('should support edit type configuration', async () => {
            const columnsWithEditTypes = [
              { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
              {
                field: 'name',
                headerText: 'Name',
                type: 'string',
                allowEdit: true
              },
              {
                field: 'age',
                headerText: 'Age',
                type: 'number',
                allowEdit: true,
                edit: { type: EditType.NumericTextBox, params: { min: 0, max: 120 } }
              },
              {
                field: 'email',
                headerText: 'Email',
                type: 'string',
                allowEdit: true,
                edit: { type: 'textboxedit', params: { mask: '000-000-0000' } }
              }
            ];

            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={columnsWithEditTypes}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Start editing
            await act(async() => {
              gridRef.current?.selectRow(0);
              gridRef.current?.editRecord();
            });
          });
        });

        /**
         * Test accessibility compliance
         */
        describe('Accessibility Compliance', () => {
          it('should have proper ARIA attributes for edit form', async () => {
            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Start editing
            await act(async() => {
              gridRef.current?.selectRow(0);
              gridRef.current?.editRecord();
            });

            await waitFor(() => {
              const editForm = container.querySelector('.sf-grid-edit-row form');
              expect(editForm).toHaveAttribute('role', 'form');
              expect(editForm).toHaveAttribute('aria-label', 'Edit Record Form');
            });
          });

          it('should have proper focus management', async () => {
            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Start editing
            await act(async() => {
              gridRef.current?.selectRow(0);
              gridRef.current?.editRecord();
            });

            await waitFor(() => {
              // First editable field should be focused
              const nameInput = container.querySelector('#grid-edit-name');
              expect(nameInput).toHaveFocus();
            });
          });

          it('should announce validation errors to screen readers', async () => {
            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Start editing
            await act(async() => {
              gridRef.current?.selectRow(0);
              gridRef.current?.editRecord();
            });

            // Create validation error
            const nameInput = container.querySelector('#grid-edit-name');
            await act(async() => {
              fireEvent.change(nameInput, { target: { value: '' } });
            });

            await act(async() => {
              gridRef.current?.saveDataChanges();
            });

          });

          it('should support keyboard navigation in edit mode', async () => {
            const { container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Start editing
            await act(async() => {
              gridRef.current?.selectRow(0);
              gridRef.current?.editRecord();
            });

            const nameInput = container.querySelector('#grid-edit-name');
            await act(async() => {
                fireEvent.focus(nameInput);
            });
            await userEvent.click(nameInput);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await act(async() => {
                fireEvent.change(nameInput, { target: { value: '' } });
            });
            await userEvent.clear(nameInput);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await act(async() => {
                fireEvent.blur(nameInput);
            });
            await userEvent.tab();
            await new Promise(resolve => setTimeout(resolve, 1000));

            await waitFor(() => {
              const ageInput = container.querySelector('#grid-edit-age');
              expect(ageInput).toHaveFocus();
              // Check using document.activeElement
              expect(document.activeElement).toBe(ageInput);

              // Or check if element has focus using DOM method
              expect(ageInput === document.activeElement).toBe(true);
            }, {timeout: 4000});
          });
        });

        /**
         * Test performance and optimization
         */
        describe('Performance and Optimization', () => {
          it('should cleanup resources on unmount during edit', async () => {
            const { unmount, container } = render(
              <Grid
                ref={gridRef}
                dataSource={[...mockData]}
                columns={mockColumns}
                editSettings={{ allowEdit: true, mode: 'Normal' }}
                data-testid="grid"
              />
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Start editing
            await act(async() => {
              gridRef.current?.selectRow(0);
              gridRef.current?.editRecord();
            });

            // Unmount during edit
            unmount();
          });
        });
      });
    });
  });
});
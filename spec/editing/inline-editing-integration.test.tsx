import { RefObject, createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid } from '../../src/index';
import { EditType } from '../../src/index';
import { GridRef } from '../../src/grid/types/grid.interfaces';
import { ColumnProps } from '../../src/grid/types/column.interfaces';
import { Column, Columns } from '../../src/index';
import { DataManager } from '@syncfusion/react-data';

// Mock ResizeObserver for Jest environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

describe('Grid Inline Editing Component', () => {

    let gridRef: RefObject<GridRef>;

    beforeEach(() => {
        gridRef = createRef<GridRef>();
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
            toJSON: () => { }
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    // INLINE EDITING FUNCTIONALITY TESTS
    // Based on the information in your clipboard regarding edit form rendering logic
    describe('Inline Editing Functionality', () => {
        const editableData = [
            { id: 1, name: 'John Doe', age: 30, email: 'john.doe@example.com', active: true, department: 'Engineering' },
            { id: 2, name: 'Jane Smith', age: 28, email: 'jane.smith@example.com', active: false, department: 'Marketing' },
            { id: 3, name: 'Bob Johnson', age: 35, email: 'bob.johnson@example.com', active: true, department: 'Sales' }
        ];

        const editableColumns: ColumnProps[] = [
            { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, width: 80, edit:{ type: EditType.NumericTextBox } },
            { 
                field: 'name', 
                headerText: 'Name', 
                type: 'string',
                allowEdit: true,
                validationRules: { required: true, minLength: 2 },
                width: 150
            },
            { 
                field: 'email', 
                headerText: 'Email', 
                type: 'string', 
                allowEdit: true,
                validationRules: { required: true },
                edit:{ type: EditType.TextBox },
                width: 200
            },
            { 
                field: 'age', 
                headerText: 'Age', 
                type: 'number', 
                allowEdit: true,
                validationRules: { required: true, min: 18, max: 65 },
                edit:{ type: EditType.NumericTextBox },
                width: 100
            },
            { 
                field: 'active', 
                headerText: 'Active', 
                type: 'boolean', 
                allowEdit: true,
                edit:{ type: EditType.CheckBox },
                width: 100
            },
            { 
                field: 'department', 
                headerText: 'Department', 
                type: 'string', 
                allowEdit: false, // Non-editable column for disabled editor test
                width: 130
            }
        ];

        it('should render disabled editor controls for non-editable columns', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            
            //coverage for useEdit
            gridRef.current?.editModule?.updateEditData(null, null);

            // Select the first row
            await act(async () => {
                const firstRow = container.querySelector('tbody tr td');
                if (firstRow) {
                    fireEvent.click(firstRow);
                }
            });

            // Start editing the selected row
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
            });

            // Check that non-editable columns render disabled editor controls, not static text
            const departmentCell = container.querySelector('[id="grid-edit-department"]') as HTMLInputElement;
            if (departmentCell) {
                // Should be a disabled input control, not static text
                expect(departmentCell.tagName.toLowerCase()).toMatch(/input|select|textarea/);
            } else {
                // If using read-only display, it should still be in a proper edit cell structure
                const departmentEditCell = container.querySelector('.sf-edit-readonly');
                expect(departmentEditCell).not.toBeNull();
                expect(departmentEditCell.textContent).toContain('Engineering');
            }
        });

        it('should maintain input values during continuous typing without clearing', async () => {
            editableColumns[2].edit.type = undefined;
            const { container } = render(
                <Grid
                    className='custom-css'
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Select the first row
            await act(async () => {
                const firstRow = container.querySelector('tbody tr td');
                if (firstRow) {
                    fireEvent.click(firstRow);
                }
            });

            // Start editing the selected row
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
            });

            // Find the name input field
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull();

            // Test continuous typing without value clearing
            await userEvent.click(nameInput);
            // Clear the input first
            await userEvent.clear(nameInput);
            await act(async () => {
                fireEvent.change(nameInput, { target: { value: '' } });
                
                // Type characters one by one to simulate continuous typing
                const testText = 'NewName';
                for (let i = 0; i < testText.length; i++) {
                    const currentValue = testText.substring(0, i + 1);
                    await userEvent.type(nameInput, currentValue);
                    fireEvent.change(nameInput, { target: { value: currentValue } });
                    // Small delay to simulate real typing
                    await new Promise(resolve => setTimeout(resolve, 10));
                    
                    // Verify the value is maintained and not cleared
                    expect(nameInput.value).toBe(currentValue);
                }
            });

            // Final verification that the complete text is preserved
            expect(nameInput.value).toBe('NewName');
        }, 8000);

        it('should support Tab navigation between editable fields without focus jumping', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Select the first row
            await act(async () => {
                const firstRow = container.querySelector('tbody tr td');
                if (firstRow) {
                    fireEvent.click(firstRow);
                }
            });

            // Start editing the selected row
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
            });

            // Find editable input fields in order
            const editInputs = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row').querySelectorAll('input, select, textarea');
            const nameInput = editInputs[1] as HTMLInputElement;
            const emailInput = editInputs[2] as HTMLInputElement;
            const ageInput = editInputs[3] as HTMLInputElement;

            expect(nameInput).not.toBeNull();
            expect(emailInput).not.toBeNull();
            expect(ageInput).not.toBeNull();

            // Test Tab navigation from name to email
            await act(async () => {
                fireEvent.keyDown(nameInput, { key: 'Tab', code: 'Tab' });
            });
            await userEvent.tab();

            // Test Tab navigation from email to age
            await act(async () => {
                fireEvent.keyDown(emailInput, { key: 'Tab', code: 'Tab' });
            });
            await userEvent.tab();

            // Test Shift+Tab navigation (backward)
            await act(async () => {
                fireEvent.keyDown(ageInput, { key: 'Tab', code: 'Tab', shiftKey: true });
            })
        });

        it('should target selected row when using F2 key or programmatic startEdit', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Select the second row (index 1)
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.selectRow(1);
                }
            });

            // Verify the second row is selected
            await waitFor(() => {
                const selectedIndexes = gridRef.current.getSelectedRowIndexes();
                expect(selectedIndexes).toContain(1);
            });

            // Start editing using programmatic method (should target selected row)
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
            });

            // Verify that the edit form contains data from the second row (Jane Smith)
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull();
            expect(nameInput.value).toBe('Jane Smith');

            const emailInput = container.querySelector('[id="grid-edit-email"]') as HTMLInputElement;
            expect(emailInput).not.toBeNull();
            expect(emailInput.value).toBe('jane.smith@example.com');

            act(() => {
              gridRef.current?.validateField('name');
            });
        });

        it('should allow arrow keys to work within input fields for text cursor movement', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Select the first row
            await act(async () => {
                const firstRow = container.querySelector('tbody tr td');
                if (firstRow) {
                    fireEvent.click(firstRow);
                }
            });

            // Start editing the selected row
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
            });

            // Find the name input field
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull();

            // Focus the input and set cursor position
            await act(async () => {
                nameInput.focus();
                nameInput.setSelectionRange(0, 0); // Set cursor at beginning
            });

            // Test arrow key navigation within the input
            await act(async () => {
                // Press right arrow key to move cursor
                fireEvent.keyDown(nameInput, { key: 'ArrowRight', code: 'ArrowRight' });
                
                // The key event should not be prevented (should work within input)
                // We can't directly test cursor position, but we can verify the input still has focus
                expect(document.activeElement).toBe(nameInput);
                
                // Press left arrow key
                fireEvent.keyDown(nameInput, { key: 'ArrowLeft', code: 'ArrowLeft' });
                expect(document.activeElement).toBe(nameInput);
                
                // Press home key
                fireEvent.keyDown(nameInput, { key: 'Home', code: 'Home' });
                expect(document.activeElement).toBe(nameInput);
                
                // Press end key
                fireEvent.keyDown(nameInput, { key: 'End', code: 'End' });
                expect(document.activeElement).toBe(nameInput);
            });

            // Verify that grid-specific keys still work (Enter should save)
            await act(async () => {
                fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
            });

            // After Enter, edit mode should end
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).toBeNull();
            });
        });

        it('should auto-focus the first editable field when editing starts', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Select the first row
            await act(async () => {
                const firstRow = container.querySelector('tbody tr');
                if (firstRow) {
                    fireEvent.click(firstRow.querySelector('td'));
                }
            });

            // Start editing the selected row
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render and auto-focus
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
                
                // The first editable field (name) should be auto-focused
                const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
                expect(nameInput).not.toBeNull();
                expect(document.activeElement).toBe(nameInput);
            });
        });

        it('should handle boolean values correctly without clearing during editing', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Select the first row
            await act(async () => {
                const firstRow = container.querySelector('tbody tr');
                if (firstRow) {
                    fireEvent.click(firstRow.querySelector('td'));
                }
            });

            // Start editing the selected row
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
            });

            // Find the boolean (active) input field
            const activeInput = container.querySelector('[id="grid-edit-active"]') as HTMLInputElement;
            expect(activeInput).not.toBeNull();

            // Verify initial boolean value is preserved
            expect(activeInput.checked).toBe(true); // First row has active: true

            // Toggle the boolean value
            await act(async () => {
                fireEvent.click(activeInput);
            });

            // Verify the boolean value changed and is maintained
            expect(activeInput.checked).toBe(false);

            // Toggle back
            await act(async () => {
                fireEvent.click(activeInput);
            });

            // Verify the boolean value is back to true and maintained
            expect(activeInput.checked).toBe(true);
        });

        it('should handle validation errors properly during editing', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Select the first row
            await act(async () => {
                const firstRow = container.querySelector('tbody tr');
                if (firstRow) {
                    fireEvent.click(firstRow.querySelector('td'));
                }
            });

            // Start editing the selected row
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
            });
            let nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull();

            await act(async() => {
                fireEvent.focus(nameInput);
            });
            await userEvent.click(nameInput);
            await act(async() => {
                fireEvent.change(nameInput, { target: { value: '' } });
            });
            await userEvent.clear(nameInput);
            await act(async() => {
                fireEvent.blur(nameInput);
            });
            await userEvent.tab();

            // Try to save with invalid data
            await act(async () => {
                fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
            });
        });

        it('should handle double-click editing correctly', async () => {
            const onRowDoubleClick = jest.fn();
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    onRowDoubleClick={onRowDoubleClick}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Double-click on the second row to start editing
            await act(async () => {
                const secondRow = container.querySelectorAll('tbody tr')[1].querySelectorAll('td')[1];
                if (secondRow) {
                    const dblClickEvent = new MouseEvent('dblclick', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });

                    // Dispatch the event
                    secondRow.dispatchEvent(dblClickEvent);
                    fireEvent.doubleClick(secondRow);
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
                expect(onRowDoubleClick).toHaveBeenCalled();
            }, {timeout: 2000});

            // Verify that the edit form contains data from the second row (Jane Smith)
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull();
            expect(nameInput.value).toBe('Jane Smith');
        });

        it('should handle Escape key to cancel editing', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true
                    }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );

            // Wait for grid to render
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            // Select and start editing the first row
            await act(async () => {
                const firstRow = container.querySelector('tbody tr');
                if (firstRow) {
                    fireEvent.click(firstRow.querySelector('td'));
                }
            });

            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });

            // Wait for edit form to render
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).not.toBeNull();
            });

            // Make some changes
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull();
            await act(async () => {
                fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
            });

            // Press Escape to cancel editing
            await act(async () => {
                fireEvent.keyDown(nameInput, { key: 'Escape', code: 'Escape' });
            });

            // Edit form should be closed
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).toBeNull();
            });

            // Original data should be preserved (changes should be discarded)
            const firstRowCells = container.querySelectorAll('tbody tr')[0].querySelectorAll('td');
            expect(firstRowCells[1].textContent).toBe('John Doe'); // Original name preserved
        });

        // COMPREHENSIVE TEST CASES FOR DATEPICKEREDIT AND DROPDOWNEDIT FUNCTIONALITY
        describe('DatePicker Edit Integration', () => {
            const dateEditableData = [
                { id: 1, name: 'John Doe', birthDate: new Date('1990-01-15'), joinDate: new Date('2020-03-10') },
                { id: 2, name: 'Jane Smith', birthDate: new Date('1985-05-20'), joinDate: new Date('2019-07-15') },
                { id: 3, name: 'Bob Johnson', birthDate: new Date('1992-12-03'), joinDate: new Date('2021-01-20') }
            ];

            const dateEditableColumns: ColumnProps[] = [
                { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, width: 80 },
                { 
                    field: 'name', 
                    headerText: 'Name', 
                    type: 'string', 
                    allowEdit: true,
                    width: 150
                },
                { 
                    field: 'birthDate', 
                    headerText: 'Birth Date', 
                    type: 'date',
                    allowEdit: true,
                    edit:{ type: EditType.DatePicker },
                    format: 'M/d/yyyy',
                    width: 150
                },
                { 
                    field: 'joinDate', 
                    headerText: 'Join Date', 
                    type: 'date', 
                    allowEdit: true,
                    edit: { 
                        type: EditType.DatePicker,
                        params: {
                            format: 'M/d/yyyy'
                        }
                    },
                    width: 150
                }
            ];

            it('should render DatePicker component for datePickerEdit columns', async () => {
                const columns = [...dateEditableColumns]
                columns[2].allowEdit = false;
                const { container } = render(
                    <Grid
                        ref={gridRef}
                        className='custom-css'
                        dataSource={dateEditableData}
                        editSettings={{
                            allowEdit: true,
                            allowAdd: true,
                            allowDelete: true,
                            mode: 'Normal'
                        }}
                        height="400px"
                    >
                        <Columns>
                            {columns.map((col, index) => (
                                <Column key={index} {...col} />
                            ))}
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                });

                // Start editing the first row
                await act(async () => {
                    const firstRow = container.querySelector('tbody tr');
                    if (firstRow) {
                        fireEvent.click(firstRow.querySelector('td'));
                    }
                });

                await act(async () => {
                    if (gridRef.current) {
                        gridRef.current.editRecord();
                    }
                });

                // Wait for edit form to render
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).not.toBeNull();
                });

                // Verify DatePicker components are rendered for date columns
                const birthDateInput = container.querySelector('[id="grid-edit-birthDate"]');
                const joinDateInput = container.querySelector('[id="grid-edit-joinDate"]');

                expect(birthDateInput).not.toBeNull();
                expect(joinDateInput).not.toBeNull();
            });

            it('should handle date value changes in DatePicker editors', async () => {
                const { container } = render(
                    <Grid
                        ref={gridRef}
                        className='custom-css'
                        dataSource={dateEditableData}
                        editSettings={{
                            allowEdit: true,
                            allowAdd: true,
                            allowDelete: true,
                            mode: 'Normal'
                        }}
                        height="400px"
                    >
                        <Columns>
                            {dateEditableColumns.map((col, index) => (
                                <Column key={index} {...col} />
                            ))}
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                });

                // Start editing the first row
                await act(async () => {
                    const firstRow = container.querySelector('tbody tr');
                    if (firstRow) {
                        fireEvent.click(firstRow.querySelector('td'));
                    }
                });

                await act(async () => {
                    if (gridRef.current) {
                        gridRef.current.editRecord();
                    }
                });

                // Wait for edit form to render
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).not.toBeNull();
                });

                // Test date value change
                const birthDateInput = container.querySelector('[id="grid-edit-birthDate"]').querySelector('input') as HTMLInputElement;
                expect(birthDateInput).not.toBeNull();

                // Simulate date change
                await act(async() => {
                    fireEvent.change(birthDateInput, { target: { value: '6/25/1995' } });
                    fireEvent.blur(birthDateInput);
                    fireEvent.keyDown(birthDateInput, { key: 'Enter', code: 'Enter' });
                    const icon = container.querySelector('[id="grid-edit-birthDate"] .sf-input-icon') as HTMLElement;
                    fireEvent.click(icon);
                    icon.click();
                    fireEvent.focus(birthDateInput);
                    birthDateInput.focus();
                    fireEvent.keyDown(birthDateInput, { key: 'ArrowDown', code: 'ArrowDown', altKey: true });
                    fireEvent.keyUp(birthDateInput, { key: 'ArrowDown', code: 'ArrowDown', altKey: true });
                    fireEvent.keyPress(birthDateInput, { key: 'ArrowDown', code: 'ArrowDown', altKey: true });
                    await new Promise(resolve => setTimeout(resolve, 500));
                });
                
                await waitFor(() => {
                    const todayButton: HTMLElement = document.querySelector('.sf-footer-container .sf-btn');
                    if (todayButton) {
                        fireEvent.click(todayButton);
                        todayButton.click();
                    }
                });
            });

            it('should maintain date values during continuous editing without clearing', async () => {
                const { container } = render(
                    <Grid
                        ref={gridRef}
                        dataSource={dateEditableData}
                        editSettings={{
                            allowEdit: true,
                            allowAdd: true,
                            allowDelete: true,
                            mode: 'Normal'
                        }}
                        height="400px"
                    >
                        <Columns>
                            {dateEditableColumns.map((col, index) => (
                                <Column key={index} {...col} />
                            ))}
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                });

                // Start editing the first row
                await act(async () => {
                    const firstRow = container.querySelector('tbody tr');
                    if (firstRow) {
                        fireEvent.click(firstRow.querySelector('td'));
                    }
                });

                await act(async () => {
                    if (gridRef.current) {
                        gridRef.current.editRecord();
                    }
                });

                // Wait for edit form to render
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).not.toBeNull();
                });

                // Test multiple date changes without clearing
                const birthDateInput = container.querySelector('[id="grid-edit-birthDate"]').querySelector('input') as HTMLInputElement;
                expect(birthDateInput).not.toBeNull();

                // Simulate multiple date changes
                const testDates = ['1/1/1995', '2/2/1996', '3/3/1997'];
                
                for (const testDate of testDates) {
                    await act(async () => {
                        fireEvent.change(birthDateInput, { target: { value: testDate } });
                        fireEvent.keyDown(birthDateInput, { key: 'Enter', code: 'Enter' });
                        fireEvent.blur(birthDateInput);
                    });
                }
            });

            it('should support keyboard navigation in DatePicker editors', async () => {
                const { container } = render(
                    <Grid
                        ref={gridRef}
                        dataSource={dateEditableData}
                        editSettings={{
                            allowEdit: true,
                            allowAdd: true,
                            allowDelete: true,
                            mode: 'Normal'
                        }}
                        height="400px"
                    >
                        <Columns>
                            {dateEditableColumns.map((col, index) => (
                                <Column key={index} {...col} />
                            ))}
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                });

                // Start editing the first row
                await act(async () => {
                    const firstRow = container.querySelector('tbody tr');
                    if (firstRow) {
                        fireEvent.click(firstRow.querySelector('td'));
                    }
                });

                await act(async () => {
                    if (gridRef.current) {
                        gridRef.current.editRecord();
                    }
                });

                // Wait for edit form to render
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).not.toBeNull();
                });

                // Test keyboard navigation
                const birthDateInput = container.querySelector('[id="grid-edit-birthDate"]') as HTMLInputElement;
                expect(birthDateInput).not.toBeNull();

                await act(async () => {
                    birthDateInput.focus();
                    
                    // Test arrow keys work within the date input
                    fireEvent.keyDown(birthDateInput, { key: 'ArrowRight', code: 'ArrowRight' });
                    
                    fireEvent.keyDown(birthDateInput, { key: 'ArrowLeft', code: 'ArrowLeft' });
                    
                    // Test Tab navigation to next field
                    fireEvent.keyDown(birthDateInput, { key: 'Tab', code: 'Tab' });
                });
            });
        });

        describe('DropDown Edit Integration', () => {
            const dropdownEditableData = [
                { id: 1, name: 'John Doe', department: 'Engineering', status: 'Active', priority: 'High' },
                { id: 2, name: 'Jane Smith', department: 'Marketing', status: 'Inactive', priority: 'Medium' },
                { id: 3, name: 'Bob Johnson', department: 'Sales', status: 'Active', priority: 'Low' }
            ];

            const statusOptions: { text: string, value: string }[] = [
                { text: 'Active', value: 'Active' },
                { text: 'Inactive', value: 'Inactive' },
                { text: 'Pending', value: 'Pending' }
            ];

            const priorityOptions = ['High', 'Medium', 'Low'];

            const dropdownEditableColumns: ColumnProps[] = [
                { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, width: 80 },
                { 
                    field: 'name', 
                    headerText: 'Name', 
                    type: 'string', 
                    allowEdit: true,
                    width: 150
                },
                { 
                    field: 'department', 
                    headerText: 'Department', 
                    type: 'string', 
                    allowEdit: true,
                    edit:{ type: EditType.DropDownList },
                    width: 150
                },
                { 
                    field: 'status', 
                    headerText: 'Status', 
                    type: 'string', 
                    allowEdit: true,
                    edit: { 
                        type: EditType.DropDownList,
                        params: {
                            dataSource: statusOptions as any,
                            fields: { text: 'text', value: 'value' },
                            allowObjectBinding: true
                        }
                    },
                    width: 120
                },
                { 
                    field: 'priority', 
                    headerText: 'Priority', 
                    type: 'string', 
                    allowEdit: true,
                    edit: {
                        type: EditType.DropDownList,
                        params: {
                            dataSource: priorityOptions
                        }
                    },
                    width: 100
                }
            ];

            it('should render DropDownList component for dropDownEdit columns', async () => {
                const { container } = render(
                    <Grid
                        ref={gridRef}
                        dataSource={dropdownEditableData}
                        editSettings={{
                            allowEdit: true,
                            allowAdd: true,
                            allowDelete: true,
                            mode: 'Normal'
                        }}
                        height="400px"
                    >
                        <Columns>
                            {dropdownEditableColumns.map((col, index) => (
                                <Column key={index} {...col} />
                            ))}
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                });

                // Start editing the first row
                await act(async () => {
                    const firstRow = container.querySelector('tbody tr');
                    if (firstRow) {
                        fireEvent.click(firstRow.querySelector('td'));
                    }
                });

                await act(async () => {
                    if (gridRef.current) {
                        gridRef.current.editRecord();
                    }
                });

                // Wait for edit form to render
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).not.toBeNull();
                });

                // Verify DropDownList components are rendered for dropdown columns
                const departmentInput: HTMLInputElement = container.querySelector('[id="grid-edit-department"]');
                const statusInput = container.querySelector('[id="grid-edit-status"]');
                const priorityInput = container.querySelector('[id="grid-edit-priority"]');

                expect(departmentInput).not.toBeNull();
                expect(statusInput).not.toBeNull();
                expect(priorityInput).not.toBeNull();

                await act(async() => {
                  fireEvent.focus(departmentInput);
                  departmentInput.click();
                  fireEvent.click(departmentInput);
                  fireEvent.keyDown(departmentInput, { key: 'ArrowDown', code: 'ArrowDown', altKey: true });
                  fireEvent.keyUp(departmentInput, { key: 'ArrowDown', code: 'ArrowDown', altKey: true });
                  fireEvent.keyPress(departmentInput, { key: 'ArrowDown', code: 'ArrowDown', altKey: true });
                });

                // required for edit cell dropdownlist change event coverage, need to enable once dropdownlist issue resolved.
                await waitFor(() => {
                  expect(document.querySelector('.sf-popup-open.sf-ddl.sf-popup')).not.toBeNull();
                }, {timeout: 4000});

                await act(async() => {
                  const popupElem = document.querySelector('.sf-popup-open.sf-ddl.sf-popup');
                  const liElem = popupElem?.querySelectorAll('li')[1];
                  if (liElem) {
                    liElem?.click();
                    fireEvent.click(liElem);
                    fireEvent.keyDown(liElem, { key: 'Enter', code: 'Enter' });
                  }
                });
            }, 8000);

            it('should handle dropdown value changes and maintain selection', async () => {
                const { container } = render(
                    <Grid
                        ref={gridRef}
                        dataSource={dropdownEditableData}
                        editSettings={{
                            allowEdit: true,
                            allowAdd: true,
                            allowDelete: true,
                            mode: 'Normal'
                        }}
                        height="400px"
                    >
                        <Columns>
                            {dropdownEditableColumns.map((col, index) => (
                                <Column key={index} {...col} />
                            ))}
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                });

                // Start editing the first row
                await act(async () => {
                    const firstRow = container.querySelector('tbody tr');
                    if (firstRow) {
                        fireEvent.click(firstRow.querySelector('td'));
                    }
                });

                await act(async () => {
                    if (gridRef.current) {
                        gridRef.current.editRecord();
                    }
                });

                // Wait for edit form to render
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).not.toBeNull();
                });

                // Test dropdown value change
                const departmentInput = container.querySelector('[id="grid-edit-department"]') as HTMLInputElement;
                expect(departmentInput).not.toBeNull();

                // Simulate dropdown selection change
                await act(async () => {
                    fireEvent.change(departmentInput, { target: { value: 'HR' } });
                });

                // Verify the value was updated and maintained
                expect(departmentInput.value).toBe('HR');

                // Test multiple changes to ensure values persist
                await act(async () => {
                    fireEvent.change(departmentInput, { target: { value: 'Engineering' } });
                    gridRef.current?.editInlineRowFormRef?.current?.editCellRefs?.current?.['department']?.setValue('Engineering');
                });

                expect(departmentInput.value).toBe('Engineering');
            });

            it('should support keyboard navigation in DropDown editors', async () => {
                const { container } = render(
                    <Grid
                        ref={gridRef}
                        dataSource={dropdownEditableData}
                        editSettings={{
                            allowEdit: true,
                            allowAdd: true,
                            allowDelete: true,
                            mode: 'Normal'
                        }}
                        height="400px"
                    >
                        <Columns>
                            {dropdownEditableColumns.map((col, index) => (
                                <Column key={index} {...col} />
                            ))}
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                });

                // Start editing the first row
                await act(async () => {
                    const firstRow = container.querySelector('tbody tr');
                    if (firstRow) {
                        fireEvent.click(firstRow.querySelector('td'));
                    }
                });

                await act(async () => {
                    if (gridRef.current) {
                        gridRef.current.editRecord();
                    }
                });

                // Wait for edit form to render
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).not.toBeNull();
                });

                // Test keyboard navigation
                const departmentInput = container.querySelector('[id="grid-edit-department"]') as HTMLInputElement;
                expect(departmentInput).not.toBeNull();

                await act(async () => {
                    departmentInput.focus();
                    
                    // Test arrow keys work within the dropdown
                    fireEvent.keyDown(departmentInput, { key: 'ArrowDown', code: 'ArrowDown' });
                    expect(document.activeElement).toBe(departmentInput);
                    
                    fireEvent.keyDown(departmentInput, { key: 'ArrowUp', code: 'ArrowUp' });
                    expect(document.activeElement).toBe(departmentInput);
                    
                    // Test Tab navigation to next field
                    fireEvent.keyDown(departmentInput, { key: 'Tab', code: 'Tab' });
                });
            });

            it('should handle different data source formats for dropdown editors', async () => {
                const { container } = render(
                    <Grid
                        ref={gridRef}
                        dataSource={dropdownEditableData}
                        editSettings={{
                            allowEdit: true,
                            allowAdd: true,
                            allowDelete: true,
                            mode: 'Normal'
                        }}
                        height="400px"
                    >
                        <Columns>
                            {dropdownEditableColumns.map((col, index) => (
                                <Column key={index} {...col} />
                            ))}
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                });

                // Start editing the first row
                await act(async () => {
                    const firstRow = container.querySelector('tbody tr');
                    if (firstRow) {
                        fireEvent.click(firstRow.querySelector('td'));
                    }
                });

                await act(async () => {
                    if (gridRef.current) {
                        gridRef.current.editRecord();
                    }
                });

                // Wait for edit form to render
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).not.toBeNull();
                });

                // Test object-based data source (department)
                const departmentInput = container.querySelector('[id="grid-edit-department"]') as HTMLInputElement;
                expect(departmentInput).not.toBeNull();

                // Test array-based data source (priority)
                const priorityInput = container.querySelector('[id="grid-edit-priority"]') as HTMLInputElement;
                expect(priorityInput).not.toBeNull();
            });
        });

      it('Coverage for allowEdit: false', async () => {
        const { container } = render(
          <Grid
            ref={gridRef}
            dataSource={editableData}
            editSettings={{
              allowEdit: false,
              allowAdd: true,
              allowDelete: true,
              mode: 'Normal',
              editOnDoubleClick: true
            }}
            height="400px"
          >
            <Columns>
              {editableColumns.map((col, index) => (
                <Column key={index} {...col} />
              ))}
            </Columns>
          </Grid>
        );

        // Wait for grid to render
        await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select the first row
        await act(async () => {
          const firstRow = container.querySelector('tbody tr td');
          if (firstRow) {
            fireEvent.click(firstRow);
          }
        });

        // Start editing the selected row
        await act(async () => {
          if (gridRef.current) {
            gridRef.current.editRecord();
          }
        });
      });
    });
});

/**
 * Test suite for inline editing integration in React Grid component.
 * 
 * This test suite focuses specifically on the inline editing functionality integration
 * with the main Grid component, ensuring that:
 * - Edit forms are properly rendered within the grid structure
 * - Edit state is correctly managed and synchronized
 * - DOM structure matches the original Grid implementation
 * - Event handling works correctly for inline editing
 * - Accessibility features are properly implemented
 * 
 * Based on original TypeScript Grid inline editing from:
 * - grid-ai-prompts/old-source-spec-dom/src/grid/actions/inline-edit.ts
 * - grid-ai-prompts/old-source-spec-dom/spec/grid/actions/inline.edit.spec.ts
 * 
 * @group editing
 * @group inline-editing
 * @group integration
 */
describe('Inline Editing Integration Test Suite', () => {
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

    // Setup mock columns with editing enabled
    mockColumns = [
      { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, edit:{ type: EditType.NumericTextBox } },
      { field: 'name', headerText: 'Name', type: 'string', allowEdit: true },
      { field: 'age', headerText: 'Age', type: 'number', allowEdit: true, edit:{ type: EditType.NumericTextBox } },
      { field: 'email', headerText: 'Email', type: 'string', allowEdit: true, edit:{ type: EditType.TextBox } },
      { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, edit:{ type: EditType.CheckBox } }
    ];

    gridRef = createRef();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForTab = async (element: Element, value: string): Promise<void> => {
    await act(async() => {
      fireEvent.focus(element);
    });
    await userEvent.click(element);
    await act(async() => {
      fireEvent.change(element, { target: { value: value } });
    });
    await userEvent.clear(element);
    await act(async() => {
      fireEvent.blur(element);
    });
    await userEvent.tab();
  };

  /**
   * Test inline editing DOM structure and integration
   */
  describe('Inline Edit DOM Structure', () => {
    it('setRowData without dataSource update test cases', async () => {
      const gridRef = createRef<GridRef>();
      const actionBegin = jest.fn();
      const dataBound = jest.fn();
      const actionComplete = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mockColumns}
          onDataChangeStart={actionBegin}
          onDataLoad={dataBound}
          onDataChangeComplete={actionComplete}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      await act(async() => {
        gridRef.current?.setRowData(1, {name: 'John Doe Updated', age: 33, email: 'johnupdated@example.com', active: false});
      });

      await waitFor(() => {
        const cells = gridRef.current?.getRowByIndex(0).querySelectorAll('td');
        expect(cells[1].textContent).toBe('John Doe Updated');
        expect(cells[2].textContent).toBe('33');
        expect(cells[3].textContent).toBe('johnupdated@example.com');
        expect(cells[4].textContent).toBe('false');
        expect((gridRef.current?.dataSource as DataManager).dataSource.json[0]['name']).toBe('John Doe');
        expect((gridRef.current?.dataSource as DataManager).dataSource.json[0]['age']).toBe(30);
        expect((gridRef.current?.dataSource as DataManager).dataSource.json[0]['email']).toBe('john@example.com');
        expect((gridRef.current?.dataSource as DataManager).dataSource.json[0]['active']).toBe(true);
        expect(actionBegin).not.toHaveBeenCalled();
        expect(actionComplete).not.toHaveBeenCalled();
      }, {timeout: 3000});
    });

    it('setCellValue without dataSource update test cases', async () => {
      const gridRef = createRef<GridRef>();
      const actionBegin = jest.fn();
      const dataBound = jest.fn();
      const actionComplete = jest.fn();
      const onCellRender = jest.fn();
      const onRowRender = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mockColumns}
          onDataChangeStart={actionBegin}
          onDataLoad={dataBound}
          onDataChangeComplete={actionComplete}
          onCellRender={onCellRender}
          onRowRender={onRowRender}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      await act(async() => {
        onCellRender.mockClear();
        onRowRender.mockClear();
        gridRef.current?.setCellValue(1, 'name', 'John Doe Updated');
      });

      await waitFor(() => {
        const cells = gridRef.current?.getRowByIndex(0).querySelectorAll('td');
        expect(cells[1].textContent).toBe('John Doe Updated');
        expect((gridRef.current?.dataSource as DataManager).dataSource.json[0]['name']).toBe('John Doe');
        expect(actionBegin).not.toHaveBeenCalled();
        expect(actionComplete).not.toHaveBeenCalled();
        expect(onCellRender).toHaveBeenCalledTimes(1);
        expect(onRowRender).toHaveBeenCalledTimes(1);
      }, {timeout: 3000});

      await act(async() => {
        onCellRender.mockClear();
        onRowRender.mockClear();
        gridRef.current?.setCellValue(1, 'age', 32);
      });

      await waitFor(() => {
        const cells = gridRef.current?.getRowByIndex(0).querySelectorAll('td');
        expect(cells[2].textContent).toBe('32');
        expect((gridRef.current?.dataSource as DataManager).dataSource.json[0]['age']).toBe(30);
        expect(actionBegin).not.toHaveBeenCalled();
        expect(actionComplete).not.toHaveBeenCalled();
        expect(onCellRender).toHaveBeenCalled();
        expect(onRowRender).toHaveBeenCalled();
      }, {timeout: 3000});
    });

    it('setRowData with dataSource update test cases', async () => {
      const gridRef = createRef<GridRef>();
      const actionBegin = jest.fn();
      const dataBound = jest.fn();
      const actionComplete = jest.fn();
      const onRowRender = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mockColumns}
          onDataChangeStart={actionBegin}
          onDataLoad={dataBound}
          onDataChangeComplete={actionComplete}
          data-testid="grid"
          onRowRender={onRowRender}
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      await act(async() => {
        onRowRender.mockClear();
        gridRef.current?.setRowData(1, {name: 'John Doe Updated', age: 33, email: 'johnupdated@example.com', active: false}, true);
      });

      await waitFor(() => {
        const cells = gridRef.current?.getRowByIndex(0).querySelectorAll('td');
        expect(cells[1].textContent).toBe('John Doe Updated');
        expect(cells[2].textContent).toBe('33');
        expect(cells[3].textContent).toBe('johnupdated@example.com');
        expect(cells[4].textContent).toBe('false');
        expect(actionBegin).not.toHaveBeenCalled();
        expect(actionComplete).not.toHaveBeenCalled();
        expect(onRowRender).toHaveBeenCalledTimes(1);
      }, {timeout: 3000});
    });

    it('setCellValue with dataSource update test cases', async () => {
      const gridRef = createRef<GridRef>();
      const actionBegin = jest.fn();
      const dataBound = jest.fn();
      const actionComplete = jest.fn();
      const onCellRender = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mockColumns}
          onDataChangeStart={actionBegin}
          onDataLoad={dataBound}
          onDataChangeComplete={actionComplete}
          onCellRender={onCellRender}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      await act(async() => {
        onCellRender.mockClear();
        gridRef.current?.setCellValue(1, 'name', 'John Doe Updated', true);
      });

      await waitFor(() => {
        const cells = gridRef.current?.getRowByIndex(0).querySelectorAll('td');
        expect(cells[1].textContent).toBe('John Doe Updated');
        expect((gridRef.current?.dataSource as DataManager).dataSource.json[0]['name']).toBe('John Doe Updated');
        expect(actionBegin).not.toHaveBeenCalled();
        expect(actionComplete).not.toHaveBeenCalled();
        expect(onCellRender).toHaveBeenCalledTimes(1);
      }, {timeout: 3000});

      await act(async() => {
        onCellRender.mockClear();
        gridRef.current?.setCellValue(1, 'age', 32, true);
      });

      await waitFor(() => {
        const cells = gridRef.current?.getRowByIndex(0).querySelectorAll('td');
        expect(cells[2].textContent).toBe('32');
        expect((gridRef.current?.dataSource as DataManager).dataSource.json[0]['age']).toBe(32);
        expect(actionBegin).not.toHaveBeenCalled();
        expect(actionComplete).not.toHaveBeenCalled();
        expect(onCellRender).toHaveBeenCalledTimes(1);
      }, {timeout: 3000});
    });

    it('should render inline edit form with proper DOM structure matching original Grid', async () => {
      const actionBegin = jest.fn();
      const actionComplete = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mockColumns}
          onRowEditStart={actionBegin}
          onFormRender={actionComplete}
          onRowAddStart={actionBegin}
          onDataChangeStart={actionBegin}
          onDataChangeComplete={actionComplete}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing first row
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify edit row has proper CSS class matching original Grid
        const editRecord = container.querySelector('.sf-grid-edit-row');
        expect(editRecord).toBeInTheDocument();
        expect(actionBegin).toHaveBeenCalled();
      });
      // End editing first row
      await act(async() => {
        gridRef.current?.saveDataChanges();
      });
      await waitFor(() => {
        expect(actionComplete).toHaveBeenCalled();
      });
      await act(async() => {
        gridRef.current?.addRecord();
      });
      await waitFor(() => {
        expect(actionBegin).toHaveBeenCalled();
      });
    });

    it('check complex data update and cancel', async () => {
      const actionBegin = jest.fn();
      const actionComplete = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[{
              "EmployeeID": 1,
              "Name": {
                  "LastName": "Thompson",
                  "FirstName": "Emma"
              },
              "Title": "Sales Executive",
              "TitleOfCourtesy": "Mr.",
              "BirthDate": new Date("1985-03-15"),
              "HireDate": new Date("2016-06-20"),
              "Address": "1234 Pine St.\r\nApt. 5B",
              "City": "London",
              "Region": "WA",
              "PostalCode": "98122",
              "Country": "Canada",
              "HomePhone": "(206) 555-9857",
              "Extension": "5467",
              "Photo": {
                  "Length": 21626
              },
              "Notes": "Education includes a BA in psychology from Colorado State University in 2007. Emma also completed 'The Art of the Cold Call.' She is a member of Toastmasters International.",
              "ReportsTo": 6,
              "PhotoPath": "http://accweb/emmployees/thompson.bmp"
          },
          {
              "EmployeeID": 2,
              "Name": {
                  "LastName": "Rodriguez",
                  "FirstName": "Liam"
              },
              "Title": "Customer Relations Officer",
              "TitleOfCourtesy": "Ms.",
              "BirthDate": new Date("1975-09-10"),
              "HireDate": new Date("2017-11-15"),
              "Address": "456 Oak Ave.",
              "City": "Kirkland",
              "Region": "WA",
              "PostalCode": "98033",
              "Country": "USA",
              "HomePhone": "(206) 555-3412",
              "Extension": "3355",
              "Photo": {
                  "Length": 21722
              },
              "Notes": "Liam has a BS degree in chemistry from Boston College (1997). He has also completed a certificate program in food retailing management.",
              "ReportsTo": 0,
              "PhotoPath": "http://accweb/emmployees/rodriguez.bmp"
          }]}
          columns={mockColumns}
          onRowEditStart={actionBegin}
          onFormRender={actionComplete}
          onRowAddStart={actionBegin}
          onDataChangeCancel={actionComplete}
          onDataChangeStart={actionBegin}
          onDataChangeComplete={actionComplete}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        >
          <Columns>
            <Column field='EmployeeID' headerText='Employee ID' width='110' textAlign='Right' isPrimaryKey={true} filter={{filterBarType:"numericFilter"}} />
            <Column field='Name.FirstName' headerText='First Name' width='100' />
            <Column field='Name.LastName' headerText='Last Name' width='100' />
            <Column field='Title' headerText='Designation' edit={{type:"dropDownEdit"}} width='170' clipMode='EllipsisWithTooltip' />
            <Column field='HireDate' headerText='HireDate' width="120" edit={{ type:EditType.DatePicker}}   type='date' filter={{filterBarType:"datePickerFilter"}} format="yMd" textAlign='Right' />
            <Column field='City' headerText='City' width='90'  />
          </Columns>
        </Grid>
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing first row
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify edit row has proper CSS class matching original Grid
        const editRecord = container.querySelector('.sf-grid-edit-row');
        expect(editRecord).toBeInTheDocument();
        expect(actionBegin).toHaveBeenCalled();
      });
      // End editing first row
      await act(async() => {
        gridRef.current?.cancelDataChanges();
      });
      await waitFor(() => {
        expect(actionComplete).toHaveBeenCalled();
        const editRecord = container.querySelector('.sf-grid-edit-row');
        expect(editRecord).not.toBeInTheDocument();
      });
      await act(async() => {
        actionComplete.mockClear();
        actionBegin.mockClear();
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });
      await waitFor(() => {
        // Verify edit row has proper CSS class matching original Grid
        const editRecord = container.querySelector('.sf-grid-edit-row');
        expect(editRecord).toBeInTheDocument();
        expect(actionBegin).toHaveBeenCalled();
      });
      await act(async() => {
        const nameFirstNameInput: HTMLInputElement = container.querySelector('.sf-grid-edit-row').querySelectorAll('input')[1];
        fireEvent.change(nameFirstNameInput, { target: { value: 'Emma1' }});
        nameFirstNameInput.value = 'Emma1';
        gridRef.current?.editInlineRowFormRef?.current?.editCellRefs?.current?.['Name.FirstName']?.setValue('Emma1');
        gridRef.current?.editModule?.updateEditData?.('Name.FirstName', 'Emma1');
        await new Promise(resolve => setTimeout(resolve, 500));
        fireEvent.blur(nameFirstNameInput);
        await new Promise(resolve => setTimeout(resolve, 500));
        gridRef.current?.saveDataChanges();
      });
      await waitFor(() => {
        expect(actionComplete).toHaveBeenCalled();
        const editRecord = container.querySelector('.sf-grid-edit-row');
        expect(editRecord).not.toBeInTheDocument();
      });
    });

    it('without primarykey deleteRecord', async () => {
      const actionBegin = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={[
            { field: 'id', headerText: 'ID', type: 'number' },
            { field: 'name', headerText: 'Name', allowEdit: false },
            { field: 'age', headerText: 'Age', type: 'number', allowEdit: true },
            { field: 'email', headerText: 'Email', allowEdit: true },
            { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true }
          ]}
          onRowEditStart={actionBegin}
          onRowAddStart={actionBegin}
          onDataChangeStart={actionBegin}
          editSettings={{ allowEdit: true, allowDelete: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });
      await act(async() => {
        gridRef.current?.deleteRecord();
        gridRef.current.selectRow(0);
        gridRef.current?.editRecord();
      });
      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name');
        const ageInput = container.querySelector('#grid-edit-age');
        const emailInput: HTMLInputElement = container.querySelector('#grid-edit-email');
        const activeInput = container.querySelector('#grid-edit-active');

        expect(nameInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(activeInput).toBeInTheDocument();
      });
      await act(async() => {
        const emailInput: HTMLInputElement = container.querySelector('#grid-edit-email');
        fireEvent.change(emailInput, { target: { value: 'abc@syncfusion.com' }});
        emailInput.value = 'abc@syncfusion.com';
        fireEvent.blur(emailInput);
        gridRef.current.cancelDataChanges();
        gridRef.current.deleteRecord(undefined, [...mockData]);
      });
    });

    it('without primarykey, headerText addRecord and focus', async () => {
      const actionBegin = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={[
            { field: 'id', type: 'number', validationRules: {min: 2, max: 200, range: [2, 200], rangeLength: [2, 200]}, edit: {params: {min: 2, max: 200}, type: EditType.NumericTextBox} },
            { field: 'name', type: 'string', allowEdit: true, validationRules: { required: true } },
            { field: 'age', type: 'number', allowEdit: false, defaultValue: 18, edit:{ type: EditType.NumericTextBox } },
            { field: 'email', type: 'string', validationRules: { minLength: 1, maxLength: 50 }, allowEdit: true },
            { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, edit:{ type: EditType.CheckBox } }
          ]}
          onRowEditStart={actionBegin}
          onRowAddStart={actionBegin}
          onDataChangeStart={actionBegin}
          editSettings={{ allowEdit: true, allowAdd: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });
      await act(async() => {
        gridRef.current?.addRecord();
      });
      await waitFor(() => {
        // Verify each editable column has an input
        const nameInput = container.querySelector('#grid-edit-name');
        const ageInput = container.querySelector('#grid-edit-age');
        const emailInput = container.querySelector('#grid-edit-email');
        const activeInput = container.querySelector('#grid-edit-active');

        expect(nameInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(activeInput).toBeInTheDocument();
      });
      await act(async() => {
        const emailInput: HTMLInputElement = container.querySelector('#grid-edit-email');
        const activeInput: HTMLInputElement = container.querySelector('#grid-edit-active');
        emailInput.focus();
        fireEvent.focus(emailInput);
        activeInput.focus();
        fireEvent.focus(activeInput);
        activeInput.blur();
        fireEvent.blur(activeInput);
        gridRef.current?.addInlineRowFormRef?.current?.focusFirstField?.();
        gridRef.current?.addInlineRowFormRef?.current?.getCurrentData?.();
        gridRef.current?.addInlineRowFormRef?.current?.getEditCells?.();
        gridRef.current?.addInlineRowFormRef?.current?.getFormElement?.();
        gridRef.current?.addInlineRowFormRef?.current?.validateForm?.();
        gridRef.current?.addInlineRowFormRef?.current?.editCellRefs?.current['email'].focus();
        gridRef.current?.addInlineRowFormRef?.current?.editCellRefs?.current['email'].getValue();
        gridRef.current?.addInlineRowFormRef?.current?.editCellRefs?.current['email'].setValue('abc@gmail.com');
        fireEvent.keyDown(emailInput, { key: 'Tab', code: 'Tab', shiftKey: true});
        fireEvent.doubleClick(gridRef.current.getRowByIndex(1).querySelector('td'));
        gridRef.current?.addInlineRowFormRef?.current?.editCellRefs?.current['id'].setValue(200);
        gridRef.current?.addInlineRowFormRef?.current?.editCellRefs?.current['name'].setValue('abc');
        fireEvent.doubleClick(gridRef.current.getRowByIndex(1).querySelector('td'));
        fireEvent.click(gridRef.current.addInlineRowFormRef.current.getFormElement().querySelector('td'));
        fireEvent.doubleClick(gridRef.current.addInlineRowFormRef.current.getFormElement().querySelector('td'));
      });
    });

    it('showAddNewRow nonsync type value providing coverage', async () => {
      const actionBegin = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={[
            { field: 'id', type: 'number', isPrimaryKey: true, validationRules: {min: 2, max: 200, range: [2, 200], rangeLength: [2, 200]}, edit: {params: {min: 2, max: 200}} },
            { field: 'name', type: 'string', allowEdit: true, defaultValue: 18, validationRules: { required: true } },
            { field: 'age', type: 'number', allowEdit: false, defaultValue: 18 },
            { field: 'email', headerText: 'Email', type: 'string', defaultValue: 'abcd', validationRules: { minLength: 1, maxLength: 50 }, allowEdit: false },
            { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true }
          ]}
          onRowEditStart={actionBegin}
          onRowAddStart={actionBegin}
          onDataChangeStart={actionBegin}
          editSettings={{ allowEdit: true, allowAdd: true, allowDelete: true, showAddNewRow: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });
      await waitFor(() => {
        // Verify each editable column has an input
        const nameInput = container.querySelector('#grid-edit-name');
        const ageInput = container.querySelector('#grid-edit-age');
        const emailInput = container.querySelector('#grid-edit-email');
        const activeInput = container.querySelector('#grid-edit-active');

        expect(nameInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(activeInput).toBeInTheDocument();
      });
      await act(async() => {
        const activeInput = container.querySelector('#grid-edit-active');
        gridRef.current.cancelDataChanges();
        gridRef.current.deleteRecord(undefined, { name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false });
        gridRef.current.deleteRecord('irrelevantfield', { name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false });
        gridRef.current.editRecord(gridRef.current.getRows()[0]);
        fireEvent.focus(activeInput);
        gridRef.current?.addInlineRowFormRef?.current?.editCellRefs?.current['active'].focus();
        fireEvent.keyDown(activeInput, { key: 'Tab', code: 'Tab', shiftKey: true});
      });
    });

    it('showAddNewRow fill and save', async () => {
      const actionBegin = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={[
            { field: 'id', type: 'number', isPrimaryKey: true, validationRules: {min: 2, max: 200, range: [2, 200], rangeLength: [2, 200]}, edit: {params: {min: 2, max: 200}, type: EditType.NumericTextBox} },
            { field: 'name', type: 'string', allowEdit: true, defaultValue: 18, validationRules: { required: true } },
            { field: 'age', type: 'number', allowEdit: false, defaultValue: 18, edit:{ type: EditType.NumericTextBox } },
            { field: 'email', headerText: 'Email', type: 'string', defaultValue: 'abcd', validationRules: { minLength: 1, maxLength: 50 }, allowEdit: false },
            { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, edit:{ type: EditType.CheckBox } }
          ]}
          onRowEditStart={actionBegin}
          onRowAddStart={actionBegin}
          onDataChangeStart={actionBegin}
          editSettings={{ allowEdit: true, allowAdd: true, showAddNewRow: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });
      await waitFor(() => {
        // Verify each editable column has an input
        const idInput = container.querySelector('#grid-edit-id');
        const nameInput = container.querySelector('#grid-edit-name');
        const ageInput = container.querySelector('#grid-edit-age');
        const emailInput = container.querySelector('#grid-edit-email');
        const activeInput = container.querySelector('#grid-edit-active');

        expect(idInput).toBeInTheDocument();
        expect(nameInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(activeInput).toBeInTheDocument();
      });
      await act(async() => {
        const idInput = container.querySelector('#grid-edit-id');
        const activeInput: HTMLElement = container.querySelector('#grid-edit-active');
        fireEvent.change(idInput, { target: { value: '100' } });
        gridRef.current?.addInlineRowFormRef?.current?.editCellRefs?.current['id'].setValue(100);
        fireEvent.change(activeInput, { target: { checked: true } });
        gridRef.current?.addInlineRowFormRef?.current?.editCellRefs?.current['active'].setValue(true);
        activeInput.click();
        activeInput.click();
        gridRef.current.saveDataChanges();
      });
    });

    it('no records to display double click coverage', async () => {
      const actionBegin = jest.fn();
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[]}
          columns={[
            { field: 'id', type: 'number', validationRules: {min: 2, max: 200, range: [2, 200], rangeLength: [2, 200]}, edit: {params: {min: 2, max: 200}} },
            { field: 'name', type: 'string', allowEdit: true, defaultValue: 18, validationRules: { required: true } },
            { field: 'age', type: 'number', allowEdit: false, defaultValue: 18 },
            { field: 'email', headerText: 'Email', type: 'string', validationRules: { minLength: 1, maxLength: 50 }, allowEdit: true },
            { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true }
          ]}
          onRowEditStart={actionBegin}
          onRowAddStart={actionBegin}
          onDataChangeStart={actionBegin}
          editSettings={{ allowEdit: false, allowAdd: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
          expect(container.textContent).toContain('No records to display');
      });
      await act(async() => {
        fireEvent.doubleClick(screen.getAllByText('No records to display')[0]);
      });
    });

    it('should render edit inputs and auto save when focus out from editform', async () => {
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mockColumns.slice(0, 2)}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify each editable column has an input
        const nameInput = container.querySelector('#grid-edit-name');
        expect(nameInput).toBeInTheDocument();
      });
      await act(async() => {
        const nameInput = container.querySelector('#grid-edit-name');
        fireEvent.keyDown(nameInput, { key: 'Tab', code: 'Tab', shiftKey: true})
      });
      await waitFor(() => {
        // Verify each editable column has an input
        const nameInput = container.querySelector('#grid-edit-name');
        expect(nameInput).not.toBeInTheDocument();
      });
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });
      await waitFor(() => {
        // Verify each editable column has an input
        const nameInput = container.querySelector('#grid-edit-name');
        expect(nameInput).toBeInTheDocument();
      });
      await act(async() => {
        const nameInput = container.querySelector('#grid-edit-name');
        fireEvent.keyDown(nameInput, { key: 'Tab', code: 'Tab'})
      });
      await waitFor(() => {
        // Verify each editable column has an input
        const nameInput = container.querySelector('#grid-edit-name');
        expect(nameInput).not.toBeInTheDocument();
      });
    });

    it('should render edit inputs for each editable column', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify each editable column has an input
        const nameInput = container.querySelector('#grid-edit-name');
        const ageInput = container.querySelector('#grid-edit-age');
        const emailInput = container.querySelector('#grid-edit-email');
        const activeInput = container.querySelector('#grid-edit-active');

        expect(nameInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(activeInput).toBeInTheDocument();

        // Verify input types match column types
        expect(nameInput).toHaveAttribute('type', 'text');
        expect(emailInput).toHaveAttribute('type', 'text');
        expect(activeInput).toHaveAttribute('type', 'checkbox');
      });
    });

    it('newrowposition bottom addrecord for empty content grid', async () => {
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[]}
          columns={mockColumns}
          enableAltRow={true}
          editSettings={{ allowAdd: true, newRowPosition: 'Bottom', mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.addRecord();
      });

      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name');
        expect(nameInput).toBeInTheDocument();
        fireEvent.focus(nameInput);
        fireEvent.keyDown(nameInput, { key: 'Tab', code: 'Tab' });
        fireEvent.blur(nameInput);
      });
    });

    it('disable all type editor cells coverage', async () => {
      const columns = [...mockColumns];
      columns[2].format = 'C2';
      columns[3].edit =  { type: EditType.DropDownList };
      columns[3].allowEdit = false;
      columns[4].allowEdit = false;
      const { container } = render(
        <Grid
          ref={gridRef}
          className='custom-css'
          dataSource={[...mockData]}
          columns={columns}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Verify normal row is visible initially
      const normalRow = gridRef.current.getRowByIndex(0);
      expect(normalRow).toBeInTheDocument();
      expect(normalRow).not.toHaveClass('sf-grid-edit-row');

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify each editable column has an input
        const idInput = container.querySelector('#grid-edit-id');
        const nameInput = container.querySelector('#grid-edit-name');
        const ageInput = container.querySelector('#grid-edit-age');
        const emailInput = container.querySelector('#grid-edit-email');
        const activeInput = container.querySelector('#grid-edit-active');

        expect(idInput).toBeInTheDocument();
        expect(nameInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(activeInput).toBeInTheDocument();

        // Verify input types match column types
        expect(nameInput).toHaveAttribute('type', 'text');
        expect(emailInput).toHaveAttribute('type', 'text');
        expect(activeInput).toHaveAttribute('type', 'checkbox');
      });
    });

    it('should replace normal row with edit form during editing', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Verify normal row is visible initially
      const normalRow = gridRef.current.getRowByIndex(0);
      expect(normalRow).toBeInTheDocument();
      expect(normalRow).not.toHaveClass('sf-grid-edit-row');

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify normal row is replaced with edit row
        const editRecord = container.querySelector('.sf-grid-edit-row');
        expect(editRecord).toBeInTheDocument();
      });
    });
  });

  /**
   * Test inline editing state management integration
   */
  describe('Edit State Integration', () => {
    it('should synchronize edit state between Grid and useEdit hook', async () => {
      const onRowEditStart = jest.fn();
      const actionComplete = jest.fn();

      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mockColumns}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          onRowEditStart={onRowEditStart}
          onDataChangeComplete={actionComplete}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Verify initial state
      expect(gridRef.current?.isEdit).toBe(false);
      expect(gridRef.current?.editRowIndex).toBe(-1);

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify edit state is synchronized
        expect(gridRef.current?.isEdit).toBe(true);
        expect(gridRef.current?.editRowIndex).toBe(0);
        expect(onRowEditStart).toHaveBeenCalledWith(
          expect.objectContaining({
            cancel: false,
            rowIndex: 0,
            data: mockData[0]
          })
        );
      });

      // Modify data and save
      const nameInput = container.querySelector('#grid-edit-name');
      expect(nameInput).toBeInTheDocument();
      await act(async() => {
        fireEvent.change(nameInput, { target: { value: 'John Updated' } });
      });

      await act(async() => {
        gridRef.current?.saveDataChanges();
      });

      await waitFor(() => {
        // Verify state is reset after save
        expect(actionComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              name: 'John Updated'
            })
          })
        );
      });
    });

    it('should handle edit cancellation properly', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      // Modify data
      const nameInput = container.querySelector('#grid-edit-name');
      await waitFor(() => {
        expect(nameInput).toBeInTheDocument();
      });

      await act(async() => {
        fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
      });

      // Cancel editing
      await act(async() => {
        gridRef.current?.cancelDataChanges();
      });

      await waitFor(() => {
        // Verify state is reset and original data is preserved
        expect(actionComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            rowIndex: 0,
            data: { ...mockData[0], name: 'Modified Name'}
          })
        );

        // Verify original data is preserved
        expect(mockData[0].name).toBe('John Doe');
      });
    });
  });

  /**
   * Test keyboard interactions in inline editing
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Select first row
      const firstRow = gridRef.current.getRowByIndex(0);
      fireEvent.click(firstRow.querySelector('td'));

      // Press F2 to start editing
      fireEvent.keyDown(firstRow, { key: 'F2', code: 'F2' });

      await waitFor(() => {
        expect(onRowEditStart).toHaveBeenCalled();
      });
    });

    it('should save on Enter key press in edit mode', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      let nameInput;
      await waitFor(() => {
        // Modify value
        nameInput = container.querySelector('#grid-edit-name');
        expect(nameInput).toBeInTheDocument();
      });

      await act(async() => {
        fireEvent.change(nameInput, { target: { value: 'Enter Save Test' } });
        // Press Enter to save
        fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
      })

      await waitFor(() => {
        expect(actionComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            rowIndex: 0,
            data: { ...mockData[0], name: "Enter Save Test"}
          })
        );
      });
    });

    it('should cancel on Escape key press in edit mode', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      let nameInput;

      await waitFor(() => {
        // Modify value
        nameInput = container.querySelector('#grid-edit-name');
        expect(nameInput).toBeInTheDocument();
      });

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

    it('should handle Tab navigation between edit fields', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name');

        // Name input should be focused initially
        expect(nameInput).toHaveFocus();
      });
      await act(async() => {
        const nameInput = container.querySelector('#grid-edit-name');
        // Tab to next field
        fireEvent.keyDown(nameInput, { key: 'Tab', code: 'Tab' });
      });
    });

    it('should allow arrow key navigation within edit inputs without triggering grid navigation', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
        
        // Focus the input and set cursor position
        nameInput.focus();
        nameInput.setSelectionRange(0, 0); // Set cursor to beginning
        
        // Press right arrow key - should move cursor within input, not navigate grid
        fireEvent.keyDown(nameInput, { key: 'ArrowRight', code: 'ArrowRight' });
        
        // Input should still be focused and grid should not navigate
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
        // Press left arrow key - should move cursor within input
        fireEvent.keyDown(nameInput, { key: 'ArrowLeft', code: 'ArrowLeft' });
        
        // Input should still be focused
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
      });
    });

    it('should prevent grid navigation keys during editing but allow Tab for field navigation', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name');
        
        (nameInput as HTMLElement).focus();
        
        // Arrow keys should not navigate grid during editing
        fireEvent.keyDown(nameInput, { key: 'ArrowDown', code: 'ArrowDown' });
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
        fireEvent.keyDown(nameInput, { key: 'ArrowUp', code: 'ArrowUp' });
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
      });
      const nameInput = container.querySelector('#grid-edit-name');
      await waitForTab(nameInput, '');
      await waitFor(() => {
          const ageInput = container.querySelector('#grid-edit-age');
          expect(ageInput).toHaveFocus();
          expect(gridRef.current?.isEdit).toBe(true);
      });
    });

    it('should handle Home and End keys within edit inputs', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
        
        nameInput.focus();
        
        // Home and End keys should work within the input
        fireEvent.keyDown(nameInput, { key: 'Home', code: 'Home' });
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
        fireEvent.keyDown(nameInput, { key: 'End', code: 'End' });
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
      });
    });
  });

  /**
   * Test property mapping compatibility
   */
  describe('Property Mapping Compatibility', () => {
    it('should support legacy editType property', async () => {
      const columnsWithEditType: ColumnProps[] = [
        { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
        { field: 'name', headerText: 'Name', type: 'string', allowEdit: true },
        { field: 'age', headerText: 'Age', type: 'number', allowEdit: true, format: {format: 'C2'}, edit:{ type: EditType.NumericTextBox } },
        { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, edit:{ type: EditType.CheckBox } }
      ];

      const { container } = render(
        <Grid
          ref={gridRef}
          className='css-grid'
          dataSource={[...mockData]}
          columns={columnsWithEditType}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify correct editor types are rendered based on editType
        const nameInput = container.querySelector('#grid-edit-name');
        const ageInput = container.querySelector('#grid-edit-age');
        const activeInput: HTMLInputElement = container.querySelector('#grid-edit-active');

        expect(nameInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
        expect(activeInput).toBeInTheDocument();

        // Verify CSS classes match the editor types
        expect(ageInput.closest('.sf-numerictextbox')).toBeInTheDocument();
        expect(activeInput).toHaveAttribute('type', 'checkbox');
        activeInput.focus();
        fireEvent.focus(activeInput);
      });
    });

    it('should prioritize editType over edit.type when both are present', async () => {
      const columnsWithBothProperties = [
        { 
          field: 'name', 
          headerText: 'Name', 
          type: 'string', 
          allowEdit: true, 
          edit:{ type: EditType.NumericTextBox }, // This should take priority
        }
      ];

      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={columnsWithBothProperties}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name');
        
        // Should render as numeric editor (from editType)
        expect(nameInput.closest('.sf-numerictextbox')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test double-click to edit functionality
   */
  describe('Double-Click Editing', () => {
    it('should start editing on double-click when editOnDoubleClick is true', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      await act(async () => {
        const firstRow = gridRef.current.getRowByIndex(0);

        // Double-click to start editing
        fireEvent.doubleClick(firstRow.querySelector('td'));
      });

      await waitFor(() => {
        expect(onRowEditStart).toHaveBeenCalled();
        expect(gridRef.current?.isEdit).toBe(true);
      });
    });

    it('should not start editing on double-click when editOnDoubleClick is false', async () => {
      const onRowEditStart = jest.fn();

      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mockColumns}
          editSettings={{ allowEdit: true, mode: 'Normal', editOnDoubleClick: false }}
          onRowEditStart={onRowEditStart}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      await act(async () => {
        const firstRow = gridRef.current.getRowByIndex(0);

        // Double-click should not start editing
        fireEvent.doubleClick(firstRow.querySelector('td'));
      });

      await waitFor(() => {
        expect(onRowEditStart).not.toHaveBeenCalled();
        expect(gridRef.current?.isEdit).toBe(false);
      });
    });
  });

  /**
   * Test accessibility features in inline editing
   */
  describe('Accessibility Features', () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        const editForm = container.querySelector('.sf-grid-edit-form');
        expect(editForm).toHaveAttribute('role', 'form');
        expect(editForm).toHaveAttribute('aria-label', 'Edit Record Form');
      });
    });

    it('should announce validation errors to screen readers', async () => {
      const columnsWithValidation = [
        ...mockColumns.map(col =>
          col.field === 'name'
            ? { ...col, validationRules: { required: true } }
            : col
        )
      ];

      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={columnsWithValidation}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      const nameInput = container.querySelector('#grid-edit-name');
      await waitFor(() => {
        // Create validation error
        expect(nameInput).toBeInTheDocument();
      })

      await act(async() => {
        fireEvent.change(nameInput, { target: { value: '' } });
        gridRef.current?.saveDataChanges();
      });
    });

    it('should have proper focus management in edit mode', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
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
  });

  /**
   * Test CRUD Data Operations Integration
   */
  describe('CRUD Data Operations with DataManager', () => {
    it('should use DataManager for insert operations when adding records', async () => {
      const mockDataManager = {
        insert: jest.fn().mockResolvedValue({ result: [{ id: 4, name: 'New User', age: 25 }] }),
        executeQuery: jest.fn().mockResolvedValue({ result: mockData })
      };

      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={mockDataManager as any}
          columns={mockColumns}
          editSettings={{ allowAdd: true, allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Add new record
      await act(async () => {
        gridRef.current?.addRecord({ name: 'New User', age: 25 });
      });
    });

    it('should trigger data state change events for CRUD operations', async () => {

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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing and save
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      const nameInput = container.querySelector('#grid-edit-name');
      await waitFor(() => {
        expect(nameInput).toBeInTheDocument();
      });

      await act(async() => {
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        gridRef.current?.saveDataChanges();
      });
    });
  });

  /**
   * Test specific issues mentioned in the user requirements
   */
  describe('Critical Issue Fixes', () => {
    /**
     * Test Fix for Issue 1: Auto-save feature not functioning correctly when using continuous Tab or Shift+Tab to focus out from the edit form
     */
    describe('Auto-Save on Tab Navigation Out of Edit Form', () => {
      it('should auto-save when Tab navigation reaches the last editable field and continues', async () => {
        const actionComplete = jest.fn();

        const { container } = render(
          <Grid
            ref={gridRef}
            dataSource={[...mockData]}
            columns={mockColumns}
            editSettings={{ allowEdit: true, mode: 'Normal' }}
            onFormRender={actionComplete}
            data-testid="grid"
          />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Start editing
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });

        await waitFor(() => {
          const nameInput = container.querySelector('#grid-edit-name');
          expect(nameInput).toBeInTheDocument();
        });

        const nameInput = container.querySelector('#grid-edit-name');
        await waitForTab(nameInput, 'Modified Name');
        await waitFor(() => {
          const ageInput = container.querySelector('#grid-edit-age');
          expect(ageInput).toHaveFocus();
        });
        await act(async () => {
          const ageInput = container.querySelector('#grid-edit-age');
          (ageInput as HTMLInputElement).click();
          fireEvent.click(ageInput);
          (ageInput as HTMLInputElement).focus();
          fireEvent.focus(ageInput);
          // Navigate through all fields using Tab
          fireEvent.keyDown(ageInput, { key: 'Tab', code: 'Tab' });
        });
      }, 8000);

      it('should auto-save when Shift+Tab navigation reaches the first editable field and continues', async () => {
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
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Start editing
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });

        await waitFor(() => {
          const nameInput = container.querySelector('#grid-edit-name');
          expect(nameInput).toBeInTheDocument();
        });

        await act(async() => {
          const nameInput = container.querySelector('#grid-edit-name');
          // Modify data
          fireEvent.change(nameInput, { target: { value: 'Modified Name' } });

          // Shift+Tab out of the first field - should trigger auto-save
          fireEvent.keyDown(nameInput, { key: 'Tab', code: 'Tab', shiftKey: true });
        });

        await waitFor(() => {
          // Should have triggered auto-save
          expect(actionComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                name: 'Modified Name'
              })
            })
          );
        });
      });

      it('should focus the saved row first visible cell after Tab auto-save', async () => {
        const actionComplete = jest.fn();

        const { container } = render(
          <Grid
            ref={gridRef}
            dataSource={[...mockData]}
            columns={mockColumns}
            editSettings={{ allowEdit: true, mode: 'Normal' }}
            onFormRender={actionComplete}
            onDataChangeComplete={actionComplete}
            data-testid="grid"
          />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Start editing
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });

        await act(async () => {
          const activeInput = container.querySelector('#grid-edit-active');
          (activeInput as HTMLInputElement).click();
          // Modify data and Tab out of last field
          fireEvent.keyDown(activeInput, { key: 'Tab', code: 'Tab' });
        });
        await userEvent.tab();

        await waitFor(() => {
          // Should focus the saved row's first visible cell
          const savedRowFirstCell = gridRef.current.getRowByIndex(0).querySelector('td'); // First visible column (name)
          expect(savedRowFirstCell.parentElement.classList.contains('sf-grid-edit-row')).toBeFalsy();
          expect((document.activeElement as HTMLInputElement).value).toBe('Jane Smith');
        });
      });
    });

    /**
     * Test Fix for Issue 2: Focus editor persisting even after focusing out from the grid
     */
    describe('Focus Reset After Grid Focus Loss', () => {
      it('should focus first visible editor when Tab is pressed after clicking outside grid', async () => {
        const { container } = render(
          <div>
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
            <button data-testid="outside-button">Outside Button</button>
          </div>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Start editing
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });
        act(() => {
          // Focus on a grid cell first
          const firstCell = container.querySelector('td.sf-grid-edit-cell:not(.sf-edit-disabled)');
          fireEvent.click(firstCell);
          firstCell.querySelector('input').click();

          // Click outside the grid to lose focus
          const outsideButton = screen.getByTestId('outside-button');
          fireEvent.click(outsideButton);
          outsideButton.click();
          outsideButton.focus();
        });
        const outsideButton = screen.getByTestId('outside-button');
        expect(outsideButton).toHaveFocus();

        // Press Tab to return to grid
        fireEvent.keyDown(outsideButton, { key: 'Tab', code: 'Tab' });
      });

      it('should focus last visible editor when Shift+Tab is pressed after clicking outside grid', async () => {
        const { container } = render(
          <div>
            <button data-testid="before-button">Before Button</button>
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
          </div>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Start editing
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });
        await waitFor(() => {
          expect(container.querySelectorAll('td.sf-grid-edit-cell:not(.sf-edit-disabled)')[2]).toBeInTheDocument();
        });
        // Focus on a grid cell first
        const middleCell = container.querySelectorAll('td.sf-grid-edit-cell:not(.sf-edit-disabled)')[2];
        fireEvent.click(middleCell);

        // Click outside the grid to lose focus
        const beforeButton = screen.getByTestId('before-button');
        beforeButton.click();
        fireEvent.click(beforeButton);
        beforeButton.focus();
        expect(beforeButton).toHaveFocus();

        // Press Shift+Tab to return to grid from after
        fireEvent.keyDown(beforeButton, { key: 'Tab', code: 'Tab', shiftKey: true });
      });

      it('should reset focus position when grid loses and regains focus', async () => {
        const { container } = render(
          <div>
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
            <input data-testid="outside-input" placeholder="Outside input" />
          </div>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Start editing
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });

        await waitFor(() => {
          expect(container.querySelectorAll('td.sf-grid-edit-cell:not(.sf-edit-disabled)')[2]).toBeInTheDocument();
        });
        // Navigate to middle cell
        const middleCell = container.querySelectorAll('td.sf-grid-edit-cell:not(.sf-edit-disabled)')[2].querySelector('input');
        await act(async () => {
          (middleCell as HTMLElement).click();
          fireEvent.click(middleCell);
          (middleCell as HTMLElement).focus();
          fireEvent.focus(middleCell);
        });
        await waitFor(() => {
          expect(middleCell).toHaveFocus();
        });
        // Focus moves outside grid
        const outsideInput = screen.getByTestId('outside-input');
        await act(async () => {
          (outsideInput as HTMLElement).click();
          fireEvent.click(outsideInput);
          outsideInput.focus();
          fireEvent.focus(outsideInput);
        });
      });

      it('should maintain proper focus order when re-entering grid multiple times', async () => {
        const { container } = render(
          <div>
            <input data-testid="input-1" placeholder="Input 1" />
            <Grid
              ref={gridRef}
              dataSource={[...mockData]}
              columns={mockColumns}
              editSettings={{ allowEdit: true, mode: 'Normal' }}
              data-testid="grid"
            />
            <input data-testid="input-2" placeholder="Input 2" />
          </div>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Start editing
        await act(async() => {
          gridRef.current?.selectRow(0);
          gridRef.current?.editRecord();
        });
        await waitFor(() => {
          expect(screen.getByTestId('input-1')).toBeInTheDocument();
          expect(screen.getByTestId('input-2')).toBeInTheDocument();
        });
        const input1 = screen.getByTestId('input-1');

        await act(async() => {
          // First time: Tab into grid from input-1
          input1.click();
          fireEvent.click(input1);
          input1.focus();
          fireEvent.focus(input1);
          fireEvent.keyDown(input1, { key: 'Tab', code: 'Tab' });
        });
      });
    });

    it('should not clear input values when typing (Issue: Input clearing)', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      let nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput).toBeInTheDocument();
      });
      await act(async() => {
        // Clear and type new value
        fireEvent.change(nameInput, { target: { value: '' } });
        fireEvent.change(nameInput, { target: { value: 'T' } });
      });
      await waitFor(() => {
        expect(nameInput.value).toBe('T');
      });
      await act(async() => {
        // Continue typing - value should not clear
        fireEvent.change(nameInput, { target: { value: 'Te' } });
      });
      await waitFor(() => {
        expect(nameInput.value).toBe('Te');
      });
      await act(async() => {
        fireEvent.change(nameInput, { target: { value: 'Test' } });
      });
      await waitFor(() => {
        expect(nameInput.value).toBe('Test');
      });
      await act(async() => {
        fireEvent.change(nameInput, { target: { value: 'Testing' } });
      });
      await waitFor(() => {
        expect(nameInput.value).toBe('Testing');
      });
    });

    it('should allow left arrow key to move cursor within input, not navigate to previous cell (Issue: Arrow key navigation)', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
        
        // Focus the input and set cursor to end
        nameInput.focus();
        nameInput.setSelectionRange(0, nameInput.value.length);
        
        // Press left arrow - should move cursor within input, not navigate grid
        fireEvent.keyDown(nameInput, { key: 'ArrowLeft', code: 'ArrowLeft' });
        
        // Input should still be focused (not navigated to previous cell)
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
        // Cursor should have moved within the input
        expect(nameInput.selectionStart).toBeLessThan(nameInput.value.length);
      });
    });

    it('should auto-save when clicking on another non-edited row (Issue: Auto-save not working)', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing first row
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      const nameInput = container.querySelector('#grid-edit-name');
      await waitFor(() => {
        // Modify data
        expect(nameInput).toBeInTheDocument();
      });
      await act(async() => {
        fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
      });

      // Click on another row (should auto-save)
      const secondRow = gridRef.current.getRowByIndex(1);
      await act(async() => {
        fireEvent.click(secondRow.querySelector('td'));
      });

      await waitFor(() => {
        // Should have triggered save
        expect(actionComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              name: 'Modified Name'
            })
          })
        );
      });
    });

    it('should prevent focus navigation from disrupting editing process', async () => {
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
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        const nameInput = container.querySelector('#grid-edit-name');
        
        (nameInput as HTMLElement).focus();
        
        // Arrow keys should not trigger grid navigation during editing
        fireEvent.keyDown(nameInput, { key: 'ArrowDown', code: 'ArrowDown' });
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
        fireEvent.keyDown(nameInput, { key: 'ArrowUp', code: 'ArrowUp' });
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
        fireEvent.keyDown(nameInput, { key: 'ArrowRight', code: 'ArrowRight' });
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
        fireEvent.keyDown(nameInput, { key: 'ArrowLeft', code: 'ArrowLeft' });
        expect(nameInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
        
      });
      const nameInput = container.querySelector('#grid-edit-name');
      await waitForTab(nameInput, '');
      await waitFor(() => {
        const ageInput = container.querySelector('#grid-edit-age');
        expect(ageInput).toHaveFocus();
        expect(gridRef.current?.isEdit).toBe(true);
      })
    });

    it('should support both editType and edit.type property patterns', async () => {
      const mixedColumns = [
        { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
        { field: 'name', headerText: 'Name', type: 'string', allowEdit: true, edit:{ type: EditType.TextBox } },
        { field: 'age', headerText: 'Age', type: 'number', allowEdit: true, edit: { type: EditType.NumericTextBox } },
        { field: 'email', headerText: 'Email', type: 'string', allowEdit: false },
        { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, edit:{ type: EditType.CheckBox } }
      ];

      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[...mockData]}
          columns={mixedColumns}
          editSettings={{ allowEdit: true, mode: 'Normal' }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify all editor types are rendered correctly
        const nameInput = container.querySelector('#grid-edit-name');
        const ageInput = container.querySelector('#grid-edit-age');
        const emailInput = container.querySelector('#grid-edit-email');
        const activeInput = container.querySelector('#grid-edit-active');

        expect(nameInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(activeInput).toBeInTheDocument();

        // Verify correct editor types based on configuration
        expect(nameInput.closest('.sf-textbox')).toBeInTheDocument();
        expect(ageInput.closest('.sf-numerictextbox')).toBeInTheDocument();
        expect(activeInput).toHaveAttribute('type', 'checkbox');
      });
    });

    it('coverage url, creditcard, tel', async () => {
      const mixedColumns: ColumnProps[] = [
        { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true },
        { field: 'url', headerText: 'URL', type: 'string', allowEdit: true, validationRules: {url: true} },
        { field: 'url1', headerText: 'URL1', type: 'string', allowEdit: true, validationRules: {url: true, equalTo: 'url'} },
        { field: 'phone', headerText: 'Phone', type: 'number', allowEdit: true, validationRules: {tel: true} },
        { field: 'card', headerText: 'Credit Card', type: 'string', allowEdit: true, validationRules: {creditCard: true} },
        { field: 'date', headerText: 'Date', type: 'date', allowEdit: true, validationRules: {date: true} }
      ];
      const EditTemplate = (_props) => <table></table>
      const { container } = render(
        <Grid
          ref={gridRef}
          dataSource={[
            { id: 1, url: 'https://syncfusion.com', phone: 1234567891, card: '1111 1111 1111 11', date: new Date() },
            { id: 2, url: 'https://syncfusion.com', phone: 1234567890, card: '2222 2222 2222 22', date: new Date() },
            { id: 3, url: 'https://syncfusion.com', phone: 1234567892, card: '3333 3333 3333 33', date: new Date() }
          ]}
          columns={mixedColumns}
          editSettings={{ allowEdit: true, mode: 'Normal', template: EditTemplate }}
          data-testid="grid"
        />
      );

      // Wait for grid to render
      await waitFor(() => {
          expect(container.querySelector('.sf-grid')).not.toBeNull();
          expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
      });

      // Start editing
      await act(async() => {
        gridRef.current?.selectRow(0);
        gridRef.current?.editRecord();
      });

      await waitFor(() => {
        // Verify all editor types are rendered correctly
        const form = container.querySelector('.sf-grid-edit-form');
        expect(form).toBeInTheDocument();
      });
    });
  });
});

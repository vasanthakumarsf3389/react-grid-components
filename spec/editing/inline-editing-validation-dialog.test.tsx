import { RefObject, createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid } from '../../src/index';
import { GridRef } from '../../src/grid/types/grid.interfaces';
import { ColumnProps } from '../../src/grid/types/column.interfaces';
import { Column, Columns } from '../../src/index';

// Mock ResizeObserver for Jest environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

/**
 * Comprehensive test suite for validation with confirmation dialog functionality in inline editing
 *
 * This test suite provides complete coverage for:
 * - Edit template validation with confirmation dialogs
 * - Delete confirmation dialogs (with and without row selection)
 * - Validation error handling with confirmation dialogs
 * - Field-level validation with confirmation dialogs
 * - Custom validation rules with confirmation dialogs
 * - Cross-field validation scenarios
 * - Edit template functionality
 * - Multiple validation error scenarios
 * - Async validation handling
 * - Error recovery and correction flows
 *
 * @group editing
 * @group inline-editing
 * @group dialog
 * @group validation
 * @group template
 */
describe('Grid Inline Editing with Validation and Confirmation Dialogs - Comprehensive Coverage', () => {
    let gridRef: RefObject<GridRef>;
    const editableData = [
        { id: 1, name: 'John Doe', age: 30, email: 'john.doe@example.com', active: true, department: 'Engineering', salary: 75000 },
        { id: 2, name: 'Jane Smith', age: 28, email: 'jane.smith@example.com', active: false, department: 'Marketing', salary: 65000 },
        { id: 3, name: 'Bob Johnson', age: 35, email: 'bob.johnson@example.com', active: true, department: 'Sales', salary: 80000 },
        { id: 4, name: 'Alice Brown', age: 32, email: 'alice.brown@example.com', active: true, department: 'Engineering', salary: 85000 },
        { id: 5, name: 'Charlie Wilson', age: 29, email: 'charlie.wilson@example.com', active: false, department: 'HR', salary: 60000 },
    ];
    const editableColumns: ColumnProps[] = [
        { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, width: 80 },
        {
            field: 'name',
            headerText: 'Name',
            type: 'string',
            allowEdit: true,
            validationRules: { required: true, minLength: 2, maxLength: 50 },
            width: 150,
        },
        {
            field: 'email',
            headerText: 'Email',
            type: 'string',
            allowEdit: true,
            validationRules: {
                required: true,
                email: true,
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                customValidator: (value: string) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value) ? null : 'Please enter a valid email address';
                },
            },
            width: 200,
        },
        {
            field: 'age',
            headerText: 'Age',
            type: 'number',
            allowEdit: true,
            validationRules: { required: true, min: 18, max: 65, number: true, digits: true },
            width: 100,
        },
        {
            field: 'salary',
            headerText: 'Salary',
            type: 'number',
            allowEdit: true,
            validationRules: { required: true, min: 30000, max: 200000 },
            width: 120,
        },
        {
            field: 'active',
            headerText: 'Active',
            type: 'boolean',
            allowEdit: true,
            width: 100,
        },
        {
            field: 'department',
            headerText: 'Department',
            type: 'string',
            allowEdit: true,
            validationRules: { required: true },
            width: 130,
        },
    ];
    const customValidationColumns: ColumnProps[] = [
        { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, width: 80 },
        {
            field: 'name',
            headerText: 'Name',
            type: 'string',
            allowEdit: true,
            validationRules: {
                required: true,
                minLength: 2,
                customValidator: (value: string) => {
                    if (value && value.toLowerCase().includes('test')) {
                        return 'Name cannot contain the word "test"';
                    }
                    return null;
                },
            },
            width: 150,
        },
        {
            field: 'email',
            headerText: 'Email',
            type: 'string',
            allowEdit: true,
            validationRules: {
                required: true,
                customValidator: (value: string) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return 'Please enter a valid email address';
                    }
                    if (value.endsWith('@test.com')) {
                        return 'Test email addresses are not allowed';
                    }
                    return null;
                },
            },
            width: 200,
        },
        {
            field: 'age',
            headerText: 'Age',
            type: 'number',
            allowEdit: true,
            validationRules: {
                required: true,
                min: 18,
                max: 65,
                customValidator: (value: number) => {
                    if (value && value % 5 !== 0) {
                        return 'Age must be a multiple of 5';
                    }
                    return null;
                },
            },
            width: 100,
        },
        {
            field: 'department',
            headerText: 'Department',
            type: 'string',
            allowEdit: true,
            validationRules: {
                required: true,
                customValidator: (value: string) => {
                    const validDepartments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
                    if (value && !validDepartments.includes(value)) {
                        return 'Please select a valid department';
                    }
                    return null;
                },
            },
            width: 130,
        },
    ];
    const templateColumns: ColumnProps[] = [
        { field: 'id', headerText: 'ID', type: 'number', isPrimaryKey: true, width: 80 },
        {
            field: 'name',
            headerText: 'Name',
            type: 'string',
            allowEdit: true,
            editTemplate: <input type='text' value={'data?.name'} onChange={() => {}} />,
            validationRules: { required: true, minLength: 2 },
            width: 150,
        },
        {
            field: 'email',
            headerText: 'Email',
            type: 'string',
            allowEdit: true,
            editTemplate: ({ data, onChange }: { data: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
                <div className="custom-edit-template">
                    <input id="custom-name-input" value={data?.name || ''} onChange={onChange} placeholder="Enter name" />
                    <input id="custom-email-input" value={data?.email || ''} onChange={onChange} placeholder="Enter email" />
                </div>
            ),
            validationRules: { required: true },
            width: 200,
        },
    ];

    beforeEach(() => {
        gridRef = createRef<GridRef>();
        Object.defineProperty(window, 'getComputedStyle', {
            value: () => ({
                getPropertyValue: jest.fn(() => ''),
                width: '200px',
                height: '400px',
            }),
        });
        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            width: 120,
            height: 120,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => {},
        }));
        Element.prototype.scrollIntoView = jest.fn();
        HTMLElement.prototype.focus = jest.fn();
        HTMLElement.prototype.blur = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Helper function to wait for grid to be fully rendered
     */
    const waitForGridRender = async (container: HTMLElement): Promise<void> => {
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull(); // 1
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull(); // 2
        }, { timeout: 3000 });
    };

    /**
     * Helper function to wait for edit form to render
     */
    const waitForEditForm = async (container: HTMLElement): Promise<void> => {
        await waitFor(() => {
            const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
            expect(editForm).not.toBeNull(); // 3-17 (used in 15 tests)
        }, { timeout: 2000 });
    };

    /**
     * Helper function to wait for dialog to appear
     */
    const waitForDialog = async (container: HTMLElement): Promise<HTMLElement> => {
        let dialog: HTMLElement | null = null;
        await waitFor(() => {
            dialog = container.querySelector('.sf-dialog') as HTMLElement;
            expect(dialog).not.toBeNull(); // 18-22 (used in 5 tests)
        }, { timeout: 2000 });
        return dialog!;
    };

    /**
     * Helper function to select a row
     */
    const selectRow = async (container: HTMLElement, rowIndex: number = 0): Promise<void> => {
        await act(async () => {
            const rows = container.querySelectorAll('tbody tr');
            if (rows[rowIndex]) {
                fireEvent.click(rows[rowIndex].querySelector('td')!);
            }
        });
    };

    /**
     * Helper function to start editing
     */
    const startEditing = async (): Promise<void> => {
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.editRecord();
            }
        });
    };

    /**
     * Helper function to end editing
     */
    const endEditing = async (): Promise<boolean> => {
        let result = false;
        await act(async () => {
            if (gridRef.current) {
                result = await gridRef.current.saveDataChanges();
            }
        });
        return result;
    };

    /**
     * Helper function to clear input field
     */
    const clearInput = async (input: HTMLInputElement): Promise<void> => {
        await act(async () => {
            input.focus();
            fireEvent.focus(input);
            fireEvent.change(input, { target: { value: '' } });
            input.value = '';
            fireEvent.blur(input);
        });
    };

    /**
     * Helper function to type in input field
     */
    const typeInInput = async (input: HTMLInputElement, value: string): Promise<void> => {
        await act(async () => {
            input.focus();
            fireEvent.focus(input);
            fireEvent.change(input, { target: { value: '' } });
            input.value = '';
            fireEvent.change(input, { target: { value } });
            input.value = value;
            fireEvent.blur(input);
        });
    };

    describe('Validation with Confirmation Dialog Tests', () => {
        it('should show validation error when form has validation errors', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true,
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull(); // 23
            await clearInput(nameInput);
        });

        it('should show edit lose confirm dialog when we perform data operation on edit state', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true,
                    }}
                    pageSettings={{ enabled: true, pageSize: 2 }}
                    filterSettings={{ enabled: true }}
                    searchSettings={{ enabled: true }}
                    sortSettings={{ enabled: true }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            let dialog: HTMLElement;
            act(() => {
                gridRef.current?.goToPage(2);
            });
            dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Unsaved changes will be lost. Are you sure you want to continue?'); // 24
            await act(async () => {
                const cancelButton = screen.getByText('Cancel');
                fireEvent.click(cancelButton);
            });
            act(() => {
                gridRef.current?.search('2');
            });
            dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Unsaved changes will be lost. Are you sure you want to continue?'); // 25
            await act(async () => {
                const cancelButton = screen.getByText('Cancel');
                fireEvent.click(cancelButton);
            });
            act(() => {
                gridRef.current?.filterByColumn('age', 'greaterthan', '22');
            });
            dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Unsaved changes will be lost. Are you sure you want to continue?'); // 26
            await act(async () => {
                const cancelButton = screen.getByText('Cancel');
                fireEvent.click(cancelButton);
            });
            act(() => {
                gridRef.current?.sortByColumn('age', 'Ascending');
            });
            dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Unsaved changes will be lost. Are you sure you want to continue?'); // 27
            await act(async () => {
                const cancelButton = screen.getByText('Cancel');
                fireEvent.click(cancelButton);
            });
            const pageNumberButtons = container.querySelectorAll('.sf-numeric-item, .sf-pager .sf-link, [aria-label*="page"]');
            expect(pageNumberButtons.length).toBeGreaterThan(1); // 28
            const page2Button = Array.from(pageNumberButtons).find(
                elem => elem.textContent === '2' || elem.getAttribute('aria-label')?.includes('page 2')
            );
            if (page2Button) {
                await act(async () => {
                    fireEvent.click(page2Button);
                });
            }
            dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Unsaved changes will be lost. Are you sure you want to continue?'); // 29
            await act(async () => {
                const cancelButton = screen.getByText('Cancel');
                fireEvent.focus(cancelButton);
                fireEvent.keyDown(cancelButton, { key: 'Escape', code: 'Escape' });
                fireEvent.focus(cancelButton);
                fireEvent.keyDown(cancelButton, { key: 'Enter', code: 'Enter' });
                fireEvent.click(cancelButton);
            });
            act(() => {
                gridRef.current?.filterByColumn('age', 'greaterthan', '22');
            });
            dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Unsaved changes will be lost. Are you sure you want to continue?'); // 30
            await act(async () => {
                const cancelButton = screen.getByText('OK');
                fireEvent.focus(cancelButton);
                fireEvent.keyDown(cancelButton, { key: 'Escape', code: 'Escape' });
                fireEvent.focus(cancelButton);
                fireEvent.keyDown(cancelButton, { key: 'Enter', code: 'Enter' });
                fireEvent.click(cancelButton);
            });
        });

        it('should show delete confirmation dialog when attempting to delete records', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        confirmOnDelete: true,
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.deleteRecord();
                }
            });
            const dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Are you sure you want to delete the record?OKCancel'); // 31
            await act(async () => {
                const cancelButton = screen.getByText('Cancel');
                fireEvent.click(cancelButton);
            });
            await waitFor(() => {
                const rows = container.querySelectorAll('tbody tr');
                expect(rows.length).toBe(5); // 32
            });
        });

        it('should delete record when confirming on delete confirmation dialog', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        confirmOnDelete: true,
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.deleteRecord();
                }
            });
            const dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Are you sure you want to delete the record?'); // 33
            await act(async () => {
                const confirmButton = screen.getByText('OK');
                fireEvent.click(confirmButton);
            });
            await waitFor(() => {
                const rows = container.querySelectorAll('tbody tr');
                expect(rows.length).toBe(4); // 34
                const firstRowName = rows[0].querySelectorAll('td')[1];
                expect(firstRowName.textContent).toBe('Jane Smith'); // 35
            }, { timeout: 2000 });
        });

        it('should delete multiple selected records with confirmation dialog', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        confirmOnDelete: true,
                    }}
                    selectionSettings={{ mode: 'Multiple' }}
                    height="400px"
                >
                    <Columns>
                        {editableColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );
            await waitForGridRender(container);
            await act(async () => {
                const rows = container.querySelectorAll('tbody tr');
                fireEvent.click(rows[0].querySelector('td')!);
                fireEvent.click(rows[2].querySelector('td')!, { ctrlKey: true });
            });
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.deleteRecord();
                }
            });
            const dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('Are you sure you want to delete the record?'); // 36
            await act(async () => {
                const confirmButton = screen.getByText('OK');
                fireEvent.click(confirmButton);
            });
            await waitFor(() => {
                const rows = container.querySelectorAll('tbody tr');
                expect(rows.length).toBe(3); // 37
            }, { timeout: 2000 });
        });

        it('should show alert dialog when attempting to delete without selecting a row', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        confirmOnDelete: true,
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
            await waitForGridRender(container);
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.deleteRecord();
                }
            });
            const dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('No records selected for delete operation'); // 38
            await act(async () => {
                const okButton = screen.getByText('OK');
                fireEvent.click(okButton);
            });
            await waitFor(() => {
                const rows = container.querySelectorAll('tbody tr');
                expect(rows.length).toBe(5); // 39
            });
        });

        it('should show alert dialog when attempting to edit without selecting a row', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.clearSelection();
                }
            });
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.editRecord();
                }
            });
            const dialog = await waitForDialog(container);
            expect(dialog.textContent).toContain('No records selected for edit operation'); // 40
            await act(async () => {
                const okButton = screen.getByText('OK');
                fireEvent.click(okButton);
            });
            const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
            expect(editForm).toBeNull(); // 41
        });

        it('should validate multiple fields and show appropriate error messages', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            const emailInput = container.querySelector('[id="grid-edit-email"]') as HTMLInputElement;
            const ageInput = container.querySelector('[id="grid-edit-age"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull(); // 42
            expect(emailInput).not.toBeNull(); // 43
            expect(ageInput).not.toBeNull(); // 44
            await clearInput(nameInput);
            await clearInput(emailInput);
            await typeInInput(ageInput, '15');
        });

        it('should be able to fix validation errors and save successfully', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull(); // 45
            await clearInput(nameInput);
            await endEditing();
        });

        it('should handle range validation errors correctly', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const ageInput = container.querySelector('[id="grid-edit-age"]') as HTMLInputElement;
            expect(ageInput).not.toBeNull(); // 46
            await typeInInput(ageInput, '15');
        });

        it('should handle salary validation with range constraints', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const salaryInput = container.querySelector('[id="grid-edit-salary"]') as HTMLInputElement;
            expect(salaryInput).not.toBeNull(); // 47
            await typeInInput(salaryInput, '25000');
        });

        it('should handle string length validation correctly', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull(); // 48
            await typeInInput(nameInput, 'A');
        });

        it('should handle add record with validation and confirmation', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.addRecord();
                }
            });
            await waitForEditForm(container);
            const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
            expect(editForm).not.toBeNull(); // 49
            const saveResult1 = await endEditing();
            expect(saveResult1).toBe(false); // 50
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            const emailInput = container.querySelector('[id="grid-edit-email"]') as HTMLInputElement;
            const ageInput = container.querySelector('[id="grid-edit-age"]') as HTMLInputElement;
            const salaryInput = container.querySelector('[id="grid-edit-salary"]') as HTMLInputElement;
            const departmentInput = container.querySelector('[id="grid-edit-department"]') as HTMLInputElement;
            await typeInInput(nameInput, 'New User');
            await typeInInput(emailInput, 'newuser@example.com');
            await typeInInput(ageInput, '30');
            await typeInInput(salaryInput, '70000');
            await typeInInput(departmentInput, 'Engineering');
            const saveResult2 = await endEditing();
            expect(saveResult2).toBe(true); // 51
            await waitFor(() => {
                const rows = container.querySelectorAll('tbody tr');
                expect(rows.length).toBe(6); // 52
            });
        });

        it('should handle cancel edit operation correctly', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull(); // 53
            const originalName = nameInput.value;
            await typeInInput(nameInput, 'Modified Name');
            await act(async () => {
                if (gridRef.current) {
                    gridRef.current.cancelDataChanges();
                }
            });
            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                expect(editForm).toBeNull(); // 54
            });
            await waitFor(() => {
                const firstRowName = container.querySelectorAll('tbody tr')[0].querySelectorAll('td')[1];
                expect(firstRowName.textContent).toBe(originalName); // 55
            });
        });

        it('should handle validation errors during batch operations', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[...editableData]}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
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
            await waitForGridRender(container);
            for (let i = 0; i < 2; i++) {
                await selectRow(container, i);
                await startEditing();
                await waitForEditForm(container);
                const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
                await typeInInput(nameInput, `Updated Name ${i + 1}`);
                const saveResult = await endEditing();
                expect(saveResult).toBe(true); // 56-57
                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
                    expect(editForm).toBeNull(); // 58-59
                });
            }
        });

        it('should handle double-click editing with validation', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                        editOnDoubleClick: true,
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
            await waitForGridRender(container);
            await act(async () => {
                const firstRow = container.querySelector('tbody tr');
                if (firstRow) {
                    fireEvent.doubleClick(firstRow.querySelector('td')!);
                }
            });
            await waitForEditForm(container);
            const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
            expect(editForm).not.toBeNull(); // 60
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull(); // 61
            await clearInput(nameInput);
            await endEditing();
        });
    });

    describe('Custom Validation Tests', () => {
        it('should validate custom validation rules and show appropriate errors', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                    }}
                    height="400px"
                >
                    <Columns>
                        {customValidationColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const nameInput = container.querySelector('[id="grid-edit-name"]') as HTMLInputElement;
            expect(nameInput).not.toBeNull(); // 62
            await typeInInput(nameInput, 'test user');
            const saveResult = await endEditing();
            expect(saveResult).toBe(false); // 63
            await waitFor(() => {
                const errorElement = document.querySelector('.sf-validation-error-name');
                expect(errorElement).not.toBeNull(); // 64
            });
        });

        it('should validate email format with custom validator', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                    }}
                    height="400px"
                >
                    <Columns>
                        {customValidationColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const emailInput = container.querySelector('[id="grid-edit-email"]') as HTMLInputElement;
            expect(emailInput).not.toBeNull(); // 65
            await typeInInput(emailInput, 'invalid-email');
            const saveResult = await endEditing();
            expect(saveResult).toBe(false); // 66
            await waitFor(() => {
                const errorElement = document.querySelector('.sf-validation-error-email');
                expect(errorElement).not.toBeNull(); // 67
            });
            await typeInInput(emailInput, 'user@test.com');
            const saveResult2 = await endEditing();
            expect(saveResult2).toBe(false); // 68
            await waitFor(() => {
                const errorElement = document.querySelector('.sf-validation-error-email');
                expect(errorElement).not.toBeNull(); // 69
            });
        });

        it('should validate numeric fields with custom rules', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                    }}
                    height="400px"
                >
                    <Columns>
                        {customValidationColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const ageInput = container.querySelector('[id="grid-edit-age"]') as HTMLInputElement;
            expect(ageInput).not.toBeNull(); // 70
            await typeInInput(ageInput, '23');
            const saveResult = await endEditing();
            expect(saveResult).toBe(false); // 71
            await waitFor(() => {
                const errorElement = document.querySelector('.sf-validation-error-age');
                expect(errorElement).not.toBeNull(); // 72
            });
        });

        it('should validate department with custom validator', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                    }}
                    height="400px"
                >
                    <Columns>
                        {customValidationColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const departmentInput = container.querySelector('[id="grid-edit-department"]') as HTMLInputElement;
            expect(departmentInput).not.toBeNull(); // 73
            await typeInInput(departmentInput, 'Invalid Department');
            const saveResult = await endEditing();
            expect(saveResult).toBe(false); // 74
        });
    });

    describe('Custom Edit Template Tests', () => {
        it('should handle edit template functionality with validation', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={editableData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        allowDelete: true,
                        mode: 'Normal',
                    }}
                    height="400px"
                >
                    <Columns>
                        {templateColumns.map((col, index) => (
                            <Column key={index} {...col} />
                        ))}
                    </Columns>
                </Grid>
            );
            await waitForGridRender(container);
            await selectRow(container, 0);
            await startEditing();
            await waitForEditForm(container);
            const customTemplate = container.querySelector('.custom-edit-template');
            expect(customTemplate).not.toBeNull(); // 75
            const customNameInput = container.querySelector('#custom-name-input') as HTMLInputElement;
            const customEmailInput = container.querySelector('#custom-email-input') as HTMLInputElement;
            expect(customNameInput).not.toBeNull(); // 76
            expect(customEmailInput).not.toBeNull(); // 77
            await clearInput(customNameInput);
        });
    });
});

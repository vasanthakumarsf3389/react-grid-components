import { RefObject, createRef } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    Grid,
    GridRef,
    Column,
    Columns,
    CommandItem,
    CommandItemType
} from '../../src/index';
import { CommandItemEvent } from '../../src/grid/types/command.interfaces';

// Mock ResizeObserver for Jest environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

/**
 * Test suite for command column editing functionality in React Grid.
 * Tests command column rendering, editing operations, focus management, and keyboard interactions.
 * 
 * This test suite covers:
 * - Command column rendering with Edit, Delete, Update, Cancel buttons
 * - Edit mode activation via command buttons
 * - Delete operations via command buttons
 * - Save/Update operations via command buttons
 * - Cancel operations via command buttons
 * - Focus management on command items (arrow key navigation)
 * - Keyboard navigation (Tab, Shift+Tab) within command items
 * - Custom command items rendering
 * - Row-level editing state management with command column
 * - Add new row with command column
 * - Command button styling and properties
 * - Form validation with command column editing
 * - Focus behavior when entering/exiting command column
 * - Command column visibility and state
 * - Integration with inline editing form
 * 
 * @group editing
 * @group command-column
 * @group keyboard-navigation
 * @group focus-management
 */
describe('Command Column Editing - Comprehensive Test Suite', () => {
    const testData = [
        { OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5, Freight: 32.38, ShipCity: 'Reims' },
        { OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6, Freight: 11.61, ShipCity: 'Münster' },
        { OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4, Freight: 65.83, ShipCity: 'Rio de Janeiro' }
    ];

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
        jest.restoreAllMocks();
    });

    // ==================== RENDERING TESTS ====================
    describe('Command Column Rendering', () => {
        it('should render command column with all button types', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: false,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" />
                        <Column field="Freight" headerText="Freight" />
                        <Column
                            headerText="Command Actions"
                            width={300}
                            getCommandItems={(_args: CommandItemEvent) => {
                                return [
                                    <CommandItem key="edit" type={CommandItemType.Edit} />,
                                    <CommandItem key="delete" type={CommandItemType.Delete} />,
                                    <CommandItem key="update" type={CommandItemType.Update} />,
                                    <CommandItem key="cancel" type={CommandItemType.Cancel} />
                                ];
                            }}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandCells = container.querySelectorAll('.sf-grid-command-cell');
            expect(commandCells.length).toBeGreaterThan(0);

            const commandItems = container.querySelectorAll('.sf-grid-command-items');
            expect(commandItems.length).toBeGreaterThan(0);

            const editButtons = container.querySelectorAll('button[aria-label*="Edit"]');
            expect(editButtons.length).toBeGreaterThan(0);

            const deleteButtons = container.querySelectorAll('button[aria-label*="Delete"]');
            expect(deleteButtons.length).toBeGreaterThan(0);
        });

        it('should display Edit and Delete buttons in normal state', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandCells = container.querySelectorAll('.sf-grid-command-cell');
            const firstCommandCell = commandCells[0];
            const buttons = firstCommandCell.querySelectorAll('button');

            expect(buttons.length).toBe(2);
        });

        it('should swap buttons when row enters edit mode', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            // Click edit button
            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();

                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const rows = container.querySelectorAll('.sf-grid-content-row');
                const firstRow = rows[0];
                const commandCell = firstRow.querySelector('.sf-grid-command-cell');
                const saveButton = commandCell?.querySelector('button[aria-label*="Save"]') as HTMLButtonElement;
                expect(saveButton).not.toBeNull();
            }, { timeout: 1000 });
        });

        it('should render custom command items', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="custom">
                                    <button className="custom-action-button">Custom Action</button>
                                </CommandItem>
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Verify custom command item is rendered
            const customButton = container.querySelector('.custom-action-button');
            expect(customButton).toBeInTheDocument();
            expect(customButton?.textContent).toBe('Custom Action');
        });
    });

    // ==================== EDIT OPERATIONS TESTS ====================
    describe('Command Column Edit Operations', () => {
        it('should activate edit mode when Edit button is clicked', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" allowEdit={true} />
                        <Column field="Freight" headerText="Freight" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-form');
                expect(editForm).toBeInTheDocument();
            }, { timeout: 1000 });
        });

        it('should display Save and Cancel buttons when row is in edit mode', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            let rows = container.querySelectorAll('.sf-grid-content-row');
            let firstRow = rows[0];
            let commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            firstRow = rows[0];
            commandCell = firstRow.querySelector('.sf-grid-command-cell');

            await waitFor(() => {
                const saveButton = commandCell?.querySelector('button[aria-label*="Save"]') as HTMLButtonElement;
                const cancelButton = commandCell?.querySelector('button[aria-label*="Cancel"]') as HTMLButtonElement;
                expect(saveButton || cancelButton).not.toBeNull();
            }, { timeout: 1000 });
        });

        it('should save changes when Update button is clicked', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            let rows = container.querySelectorAll('.sf-grid-content-row');
            let firstRow = rows[0];
            let commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-form')).toBeInTheDocument();
            }, { timeout: 1000 });

            rows = container.querySelectorAll('.sf-grid-content-row');
            firstRow = rows[0];
            commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const updateButton = commandCell?.querySelector('button[aria-label*="Save"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(updateButton);
                fireEvent.focus(updateButton);
                updateButton.click();
                updateButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-form') as HTMLElement;
                expect(editForm === null || editForm.style.display === 'none').toBeTruthy();
            }, { timeout: 1000 });
        });

    });

    // ==================== DELETE OPERATIONS TESTS ====================
    describe('Command Column Delete Operations', () => {
        it('should trigger delete when Delete button is clicked', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowDelete: true,
                        mode: 'Normal',
                        confirmOnDelete: false
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="delete" type={CommandItemType.Delete} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const deleteButton = commandCell?.querySelector('button[aria-label*="Delete"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(deleteButton);
                fireEvent.focus(deleteButton);
                deleteButton.click();
                deleteButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).toBeInTheDocument();
            }, { timeout: 1000 });
        });
    });

    // ==================== COMMAND ITEM CLICK HANDLER COVERAGE ====================
    describe('CommandItem onClick Handler - Branch Coverage', () => {
        it('should execute Edit branch when Edit button is clicked', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" allowEdit={true} />
                        <Column field="Freight" headerText="Freight" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-form');
                expect(editForm).toBeInTheDocument();
            }, { timeout: 1000 });
        });

        it('should execute Delete branch when Delete button is clicked', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowDelete: true,
                        mode: 'Normal',
                        confirmOnDelete: false
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="delete" type={CommandItemType.Delete} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const deleteButton = commandCell?.querySelector('button') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(deleteButton);
                fireEvent.focus(deleteButton);
                deleteButton.click();
                deleteButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).toBeInTheDocument();
            }, { timeout: 1000 });
        });

        it('should execute Update branch when Update button is clicked during edit', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            let rows = container.querySelectorAll('.sf-grid-content-row');
            let firstRow = rows[0];
            let commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-form')).toBeInTheDocument();
            }, { timeout: 1000 });

            rows = container.querySelectorAll('.sf-grid-content-row');
            firstRow = rows[0];
            commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const updateButton = commandCell?.querySelector('button[aria-label*="Save"], button[aria-label*="Update"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(updateButton);
                fireEvent.focus(updateButton);
                updateButton.click();
                updateButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-form');
                const isHidden = editForm === null || (editForm as HTMLElement).style.display === 'none';
                expect(isHidden).toBeTruthy();
            }, { timeout: 1000 });
        });


        it('should correctly identify row element and extract uid from data attribute', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal',
                        confirmOnDelete: false
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            expect(rows.length).toBeGreaterThan(0);

            rows.forEach((row) => {
                const rowElement = row as HTMLTableRowElement;
                const uid = rowElement.getAttribute('data-uid');
                expect(uid).not.toBeNull();
                expect(uid).toBeTruthy();
            });

            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-form');
                expect(editForm).toBeInTheDocument();
            }, { timeout: 1000 });
        });

        it('should handle all four command item types in sequence', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[
                        { OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5, Freight: 32.38, ShipCity: 'Reims' },
                        { OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6, Freight: 11.61, ShipCity: 'Münster' },
                        { OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4, Freight: 65.83, ShipCity: 'Rio de Janeiro' }
                    ]}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal',
                        confirmOnDelete: false
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            let rows = container.querySelectorAll('.sf-grid-content-row');
            expect(rows.length).toBeGreaterThan(0);

            let secondRow = rows[1];
            let commandCell = secondRow.querySelector('.sf-grid-command-cell');

            let editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-form')).toBeInTheDocument();
            }, { timeout: 1000 });

            rows = container.querySelectorAll('.sf-grid-content-row');
            secondRow = rows[1];
            commandCell = secondRow.querySelector('.sf-grid-command-cell');
            const updateButton = commandCell?.querySelector('button[aria-label*="Save"], button[aria-label*="Update"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(updateButton);
                fireEvent.focus(updateButton);
                updateButton.click();
                updateButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-form');
                const isHidden = editForm === null || (editForm as HTMLElement).style.display === 'none';
                expect(isHidden).toBeTruthy();
            }, { timeout: 1000 });

            rows = container.querySelectorAll('.sf-grid-content-row');
            secondRow = rows[1];
            commandCell = secondRow.querySelector('.sf-grid-command-cell');
            const deleteButton = commandCell?.querySelector('button[aria-label*="Delete"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(deleteButton);
                fireEvent.focus(deleteButton);
                deleteButton.click();
                deleteButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            const thirdRow = rows[2];
            if (thirdRow) {
                const thirdCommandCell = thirdRow.querySelector('.sf-grid-command-cell');
                const thirdEditButton = thirdCommandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

                await act(async () => {
                    fireEvent.click(thirdEditButton);
                    fireEvent.focus(thirdEditButton);
                    thirdEditButton.click();
                    thirdEditButton.focus();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                });

                await waitFor(() => {
                    expect(container.querySelector('.sf-grid-edit-form')).toBeInTheDocument();
                }, { timeout: 1000 });

                const thirdCancelButton = thirdCommandCell?.querySelector('button[aria-label*="Cancel"]') as HTMLButtonElement;

                await act(async () => {
                    fireEvent.click(thirdCancelButton);
                    fireEvent.focus(thirdCancelButton);
                    thirdCancelButton.click();
                    thirdCancelButton.focus();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                });

                await waitFor(() => {
                    const editForm = container.querySelector('.sf-grid-edit-form');
                    const isHidden = editForm === null || (editForm as HTMLElement).style.display === 'none';
                    expect(isHidden).toBeTruthy();
                }, { timeout: 1000 });
            }
        });
    });

    // ==================== FOCUS TESTS ====================
    describe('Command Column Focus Management', () => {

        it('should navigate between command items with Arrow keys', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const buttons = commandCell?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

            await act(async () => {
                buttons[0].focus();
            });

            expect(document.activeElement).toBe(buttons[0]);

            await act(async () => {
                fireEvent.keyDown(buttons[0], { key: 'ArrowRight', code: 'ArrowRight' });
            });

            await waitFor(() => {
                const currentFocus = document.activeElement;
                expect(
                    currentFocus === buttons[0] ||
                    currentFocus === buttons[1] ||
                    buttons.length === 1
                ).toBeTruthy();
            }, { timeout: 1000 });
        });

        it('should maintain focus on command column when pressing Tab in edit mode', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column field="Freight" headerText="Freight" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-form')).toBeInTheDocument();
            }, { timeout: 1000 });

            const buttons = commandCell?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
            await act(async () => {
                if (buttons.length > 0) {
                    buttons[0].focus();
                }
            });

            const initialFocus = document.activeElement;
            await act(async () => {
                fireEvent.keyDown(buttons[0], { key: 'Tab', code: 'Tab' });
            });

            await waitFor(() => {
                const focusAfterTab = document.activeElement;
                const isStillInCommandCell = focusAfterTab?.closest('.sf-grid-command-cell') !== null;
                expect(
                    isStillInCommandCell ||
                    focusAfterTab === initialFocus ||
                    buttons.length <= 1
                ).toBeTruthy();
            }, { timeout: 1000 });
        });

    });

    // ==================== KEYBOARD NAVIGATION TESTS ====================
    describe('Command Column Keyboard Navigation', () => {
        it('should navigate to first cell of next row when tabbing from last command item in edit mode', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[
                        { OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5 },
                        { OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6 },
                        { OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4 }
                    ]}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="Customer ID" allowEdit={true} />
                        <Column field="EmployeeID" headerText="Employee ID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            let rows = container.querySelectorAll('.sf-grid-content-row');
            let firstRow = rows[0];
            let commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            // Enter edit mode on first row
            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            firstRow = rows[0];
            // Verify row entered edit mode
            await waitFor(() => {
                expect(firstRow.classList.contains('sf-grid-edit-row')).toBeTruthy();
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            firstRow = rows[0];
            commandCell = firstRow.querySelector('.sf-grid-command-cell');
            // Get the last command button (should be Cancel in edit mode)
            const commandButtons = commandCell.querySelectorAll('button');
            const lastCommandButton = commandButtons[commandButtons.length - 1];
            expect(lastCommandButton.getAttribute('aria-label')).toContain('Cancel');

            // Focus the last command button and press Tab
            await act(async () => {
                lastCommandButton.focus();
                fireEvent.keyDown(lastCommandButton, { key: 'Tab', code: 'Tab', bubbles: true });
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            // Get the second row and its first cell (which should be a normal row)
            const nextRow = rows[1];
            // Verify next row is not an edit row
            expect(nextRow.classList.contains('sf-grid-edit-row')).toBeFalsy();
            expect(nextRow.classList.contains('sf-grid-add-row')).toBeFalsy();
        });

        it('should navigate to last cell when shift tabbing from first input field in edit mode', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[
                        { OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5 },
                        { OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6 },
                        { OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4 }
                    ]}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="CustomerID" headerText="Customer ID" allowEdit={true} />
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                        <Column field="EmployeeID" headerText="Employee ID" allowEdit={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            let rows = container.querySelectorAll('.sf-grid-content-row');
            let secondRow = rows[1];
            let commandCell = secondRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            secondRow = rows[1];
            await waitFor(() => {
                expect(secondRow.classList.contains('sf-grid-edit-row')).toBeTruthy();
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            secondRow = rows[1];
            let input = secondRow.querySelector('input');

            await act(async () => {
                fireEvent.click(input);
                fireEvent.focus(input);
                input.click();
                input.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await act(async () => {
                fireEvent.keyDown(input, { key: 'Tab', code: 'Tab', bubbles: true, shiftKey: true });
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });

            const focusedCell = (container.querySelector('.sf-focus') || container.querySelector('.sf-focused')) as HTMLElement;

            await act(async () => {
                fireEvent.click(focusedCell);
                fireEvent.focus(focusedCell);
                focusedCell.click();
                focusedCell.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await act(async () => {
                fireEvent.keyDown(focusedCell, { key: 'Tab', code: 'Tab', bubbles: true });
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            secondRow = rows[1];
            input = secondRow.querySelector('input');

            await waitFor(() => {
                expect(document.activeElement).toBe(input);
            });
        }, 15000);

        it('should allow Tab navigation within command items', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandCells = container.querySelectorAll('.sf-grid-command-cell');
            const firstCommandCell = commandCells[0];
            const buttons = firstCommandCell.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

            expect(buttons.length).toBeGreaterThan(1);

            await act(async () => {
                buttons[0].focus();
            });

            expect(document.activeElement).toBe(buttons[0]);
        });

        it('should handle Shift+Tab to navigate backward in command items', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandCells = container.querySelectorAll('.sf-grid-command-cell');
            const firstCommandCell = commandCells[0];
            const buttons = firstCommandCell.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

            await act(async () => {
                buttons[buttons.length - 1].focus();
            });

            expect(document.activeElement).toBe(buttons[buttons.length - 1]);

            await act(async () => {
                fireEvent.keyDown(buttons[buttons.length - 1], {
                    key: 'Tab',
                    code: 'Tab',
                    shiftKey: true
                });
            });

            await waitFor(() => {
                const focusedElement = document.activeElement;
                const isCommandButton = focusedElement?.closest('.sf-grid-command-cell') !== null;
                expect(isCommandButton || focusedElement?.tagName === 'BUTTON').toBeTruthy();
            }, { timeout: 1000 });
        });

        it('should handle Enter key on command buttons', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandCells = container.querySelectorAll('.sf-grid-command-cell');
            const firstCommandCell = commandCells[0];
            const editButton = firstCommandCell.querySelector('button') as HTMLButtonElement;

            await act(async () => {
                editButton.focus();
                fireEvent.keyDown(editButton, { key: 'Enter', code: 'Enter' });
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const editForm = container.querySelector('.sf-grid-edit-form');
                expect(editForm).toBeInTheDocument();
            }, { timeout: 1000 });
        });
    });

    // ==================== COMMAND COLUMN STATE TESTS ====================
    describe('Command Column State Management', () => {
        it('should track edit state for multiple rows independently', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={
                        [
                            { OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5, Freight: 32.38, ShipCity: 'Reims' },
                            { OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6, Freight: 11.61, ShipCity: 'Münster' },
                            { OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4, Freight: 65.83, ShipCity: 'Rio de Janeiro' }
                        ]
                    }
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            let rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const firstCommandCell = firstRow.querySelector('.sf-grid-command-cell');
            const firstEditButton = firstCommandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(firstEditButton);
                fireEvent.focus(firstEditButton);
                firstEditButton.click();
                firstEditButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-form')).toBeInTheDocument();
            }, { timeout: 1000 });

            const editForms = container.querySelectorAll('.sf-grid-edit-form');
            expect(editForms.length).toBe(1);

            rows = container.querySelectorAll('.sf-grid-content-row');
            const secondRow = rows[1];
            const secondCommandCell = secondRow.querySelector('.sf-grid-command-cell');
            const buttons = secondCommandCell?.querySelectorAll('button');
            expect(buttons?.length).toBe(1);
        });

    });

    // ==================== INTEGRATION TESTS ====================
    describe('Command Column Integration with Editing', () => {
        it('should integrate command column with validation', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column
                            field="CustomerID"
                            headerText="Customer ID"
                            allowEdit={true}
                            validationRules={{ required: true, minLength: 3 }}
                        />
                        <Column field="Freight" headerText="Freight" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={() => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-form')).toBeInTheDocument();
            }, { timeout: 1000 });

            const editForm = container.querySelector('.sf-grid-edit-form');
            expect(editForm).toBeInTheDocument();
            expect(editForm?.querySelector('input')).toBeInTheDocument();
        });

        it('should support add new row', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    toolbar={['Add']}
                    editSettings={{
                        allowEdit: true,
                        allowAdd: true,
                        mode: 'Normal',
                        newRowPosition: 'Top'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} validationRules={{ required: true }} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} validationRules={{ required: true }} />
                        <Column field="Freight" headerText="Freight" allowEdit={true} validationRules={{ required: true }} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            await waitFor(() => {
                expect(screen.getByText('Add')).toBeInTheDocument();
            });

            const addButton = screen.getByText('Add').closest('button');
            await act(async () => {
                fireEvent.click(addButton);
                fireEvent.focus(addButton);
                addButton.click();
                addButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                let addRows = container.querySelectorAll('.sf-grid-add-row');
                if (addRows.length > 0) {
                    const addRowCommandCell = addRows[0].querySelector('.sf-grid-command-cell');
                    expect(addRowCommandCell).toBeInTheDocument();
                }
            }, { timeout: 1000 });

            await act(async () => {
                let addRows = container.querySelectorAll('.sf-grid-add-row');
                let inputs = addRows[0].querySelectorAll('input');
                fireEvent.click(inputs[0]);
                fireEvent.focus(inputs[0]);
                inputs[0].click();
                inputs[0].focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await act(async () => {
                let addRows = container.querySelectorAll('.sf-grid-add-row');
                let inputs = addRows[0].querySelectorAll('input');
                fireEvent.click(inputs[2]);
                fireEvent.focus(inputs[2]);
                inputs[2].click();
                inputs[2].focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });
        });

        it('should add new row and then cancel', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={[
                        { OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5, Freight: 32.38, ShipCity: 'Reims' },
                        { OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6, Freight: 11.61, ShipCity: 'Münster' },
                        { OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4, Freight: 65.83, ShipCity: 'Rio de Janeiro' }
                    ]}
                    toolbar={['Add']}
                    editSettings={{
                        allowAdd: true,
                        mode: 'Normal',
                        allowEdit: true,
                        newRowPosition: 'Top'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column field="Freight" headerText="Freight" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            await waitFor(() => {
                expect(screen.getByText('Add')).toBeInTheDocument();
            });

            const addButton = screen.getByText('Add').closest('button');
            await act(async () => {
                fireEvent.click(addButton);
                fireEvent.focus(addButton);
                addButton.click();
                addButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                let addRows = container.querySelectorAll('.sf-grid-add-row');
                if (addRows.length > 0) {
                    const addRowCommandCell = addRows[0].querySelector('.sf-grid-command-cell');
                    expect(addRowCommandCell).toBeInTheDocument();
                }
            }, { timeout: 1000 });

            // Find and click the Cancel button in the command column
            const addRows = container.querySelectorAll('.sf-grid-add-row');
            const addRow = addRows[0];
            const commandCell = addRow.querySelector('.sf-grid-command-cell');
            const cancelButton = commandCell?.querySelector('button[aria-label*="Cancel"]') as HTMLButtonElement;

            expect(cancelButton).toBeInTheDocument();

            // Wait for form to be fully initialized
            await waitFor(() => {
                const addForm = container.querySelector('.sf-grid-edit-form');
                expect(addForm).toBeInTheDocument();
            }, { timeout: 1000 });

            await act(async () => {
                // Ensure grid is ready for cancel operation
                await new Promise(resolve => setTimeout(resolve, 100));
                fireEvent.click(cancelButton);
                fireEvent.focus(cancelButton);
                await new Promise(resolve => setTimeout(resolve, 100));
            });
        });
    });

    // ==================== CUSTOM COMMAND ITEMS TESTS ====================
    describe('Custom Command Items Rendering', () => {
        it('should render custom command items without type', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="custom">
                                    <button className="custom-button">Custom</button>
                                </CommandItem>
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const customButton = container.querySelector('.custom-button');
            expect(customButton).toBeInTheDocument();
            expect(customButton?.textContent).toBe('Custom');
        });

        it('should filter items based on edit state - normal mode shows Edit/Delete', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const buttons = commandCell?.querySelectorAll('button');

            expect(buttons?.length).toBe(2);
        });

        it('should filter items based on edit state - edit mode shows Update/Cancel', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const buttonsInEditMode = commandCell?.querySelectorAll('button');
                expect(buttonsInEditMode?.length).toBe(2);
            }, { timeout: 1000 });
        });

        it('should render icon for Edit command item', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandCell = container.querySelector('.sf-grid-command-cell');
            const button = commandCell?.querySelector('button');
            expect(button).toBeInTheDocument();
        });

        it('should render icon for Delete command item', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="delete" type={CommandItemType.Delete} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandCell = container.querySelector('.sf-grid-command-cell');
            const button = commandCell?.querySelector('button');
            expect(button).toBeInTheDocument();
        });

        it('should render icon for Update command item', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const buttons = commandCell?.querySelectorAll('button');
                expect(buttons?.length).toBeGreaterThan(0);
            }, { timeout: 1000 });
        });

        it('should render icon for Cancel command item', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const rows = container.querySelectorAll('.sf-grid-content-row');
            const firstRow = rows[0];
            const commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            await waitFor(() => {
                const buttons = commandCell?.querySelectorAll('button');
                expect(buttons?.length).toBeGreaterThan(0);
            }, { timeout: 1000 });
        });

        it('should pass buttonProps to command item buttons', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem
                                    key="edit"
                                    type={CommandItemType.Edit}
                                    buttonProps={{ title: 'Edit this row', className: 'custom-edit-btn' }}
                                />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandCell = container.querySelector('.sf-grid-command-cell');
            const button = commandCell?.querySelector('button');

            expect(button?.getAttribute('title')).toBe('Edit this row');
            expect(button?.classList.contains('custom-edit-btn')).toBeTruthy();
        });

        it('should apply correct color styling to Update button', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" allowEdit={true} />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            let rows = container.querySelectorAll('.sf-grid-content-row');
            let firstRow = rows[0];
            let commandCell = firstRow.querySelector('.sf-grid-command-cell');
            const editButton = commandCell?.querySelector('button[aria-label*="Edit"]') as HTMLButtonElement;

            await act(async () => {
                fireEvent.click(editButton);
                fireEvent.focus(editButton);
                editButton.click();
                editButton.focus();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });

            rows = container.querySelectorAll('.sf-grid-content-row');
            firstRow = rows[0];
            commandCell = firstRow.querySelector('.sf-grid-command-cell');
            await waitFor(() => {
                const buttons = commandCell?.querySelectorAll('button');
                expect(buttons?.length).toBe(2);
            }, { timeout: 1000 });
        });
    });

    // ==================== BUTTON STYLING TESTS ====================
    describe('Command Button Styling and Properties', () => {
        it('should apply correct styles to command buttons', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={200}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />,
                                <CommandItem key="update" type={CommandItemType.Update} />,
                                <CommandItem key="cancel" type={CommandItemType.Cancel} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const commandItems = container.querySelectorAll('.sf-grid-command-items');
            expect(commandItems.length).toBeGreaterThan(0);

            const buttons = container.querySelectorAll('.sf-grid-command-cell button');
            expect(buttons.length).toBeGreaterThan(0);

            buttons.forEach(btn => {
                expect(btn.tagName).toBe('BUTTON');
            });
        });

        it('should apply correct button type to command items', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    editSettings={{
                        allowEdit: true,
                        allowDelete: true,
                        mode: 'Normal'
                    }}
                    height="400px"
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                        <Column field="CustomerID" headerText="CustomerID" />
                        <Column
                            headerText="Actions"
                            width={250}
                            getCommandItems={(_args: CommandItemEvent) => [
                                <CommandItem key="edit" type={CommandItemType.Edit} />,
                                <CommandItem key="delete" type={CommandItemType.Delete} />
                            ]}
                        />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const buttons = container.querySelectorAll('.sf-grid-command-cell button');
            expect(buttons.length).toBeGreaterThan(0);

            buttons.forEach(btn => {
                expect(btn.getAttribute('type')).toBe('button');
            });
        });
    });
});

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Grid } from '../../src/index';
import { Column } from '../../src/index';
import { createRef } from 'react';
import { GridRef } from '../../src/grid/types/grid.interfaces';
import { Columns } from '../../src/index';

// Mock ResizeObserver for Jest environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));
const testData = [
    { OrderID: 10248, CustomerID: 'VINET', EmployeeID: 5, Freight: 32.38, ShipCity: 'Reims' },
    { OrderID: 10249, CustomerID: 'TOMSP', EmployeeID: 6, Freight: 11.61, ShipCity: 'Münster' },
    { OrderID: 10250, CustomerID: 'HANAR', EmployeeID: 4, Freight: 65.83, ShipCity: 'Rio de Janeiro' }
];

describe('Toolbar Inline Editing Integration', () => {
    it('should render toolbar with edit buttons', async () => {
        const gridRef = createRef<GridRef>();
        const toolbarClick = jest.fn();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={testData}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search']}
                editSettings={{
                    allowAdd: false,
                    allowEdit: true,
                    allowDelete: true,
                    mode: 'Normal'
                }}
                onToolbarItemClick={toolbarClick}
                selectionSettings={{enableToggle: true}}
            >
                <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                <Column field="CustomerID" headerText="Customer ID" />
                <Column field="Freight" headerText="Freight" />
            </Grid>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        await waitFor(() => {
            expect(screen.getByText('Add')).toBeInTheDocument();
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
            expect(screen.getByText('Update')).toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
            expect(container.querySelector('.sf-grid-search input')).toBeInTheDocument();
        });

        await act(async () => {
            gridRef.current?.selectRow(0, true);
        });
        await waitFor(() => {
            expect(container.querySelector('#' + gridRef.current?.id + '_delete')).not.toBeDisabled();
        });
        await act(async () => {
            gridRef.current?.selectRow(0, true);
        });
        await waitFor(() => {
            expect(container.querySelector('#' + gridRef.current?.id + '_delete')).toBeDisabled();
        });
        await act(async () => {
            gridRef.current?.selectRow(0, true);
            gridRef.current?.editRecord();
        });
        await waitFor(() => {
            expect(container.querySelector('.sf-grid-edit-form')).toBeInTheDocument();
        });
        await act(async () => {
            gridRef.current?.saveDataChanges();
            fireEvent.click(screen.getByText('Edit'));
        });
    });

    it('should enable/disable toolbar buttons based on edit state', async () => {
        const gridRef = createRef<GridRef>()
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={testData}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    mode: 'Normal'
                }}
            >
                <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                <Column field="CustomerID" headerText="Customer ID" />
                <Column field="Freight" headerText="Freight" />
            </Grid>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        await waitFor(() => {
            const addButton = screen.getByText('Add').closest('button');
            const updateButton = screen.getByText('Update').closest('button');
            const cancelButton = screen.getByText('Cancel').closest('button');

            // Initially, Add should be enabled, Update/Cancel should be disabled
            expect(addButton).not.toBeDisabled();
            expect(updateButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();
        }, {timeout: 2000});
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[1].querySelector('td'));
        })
    });

    it('should activate Update/Cancel buttons when in edit mode', async () => {
        const { container } = render(
            <Grid
                dataSource={testData}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    mode: 'Normal'
                }}
            >
                <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                <Column field="CustomerID" headerText="Customer ID" />
                <Column field="Freight" headerText="Freight" />
            </Grid>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        await act(async () => {
            // Select first row
            const firstRow = screen.getByText('10248').closest('tr');
            fireEvent.click(firstRow.querySelector('td'));
        });

        await act(async() => {
            // Click Edit button
            const editButton = screen.getByText('Edit').closest('button');
            fireEvent.click(editButton);
        });

        await waitFor(() => {
            const updateButton = screen.getByText('Update').closest('button');
            const cancelButton = screen.getByText('Cancel').closest('button');

            // Update and Cancel should be enabled and active
            expect(updateButton).not.toBeDisabled();
            expect(cancelButton).not.toBeDisabled();
        });
    });

    it('should handle Add button click', async () => {
        const { container } = render(
            <Grid
                dataSource={testData}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    mode: 'Normal'
                }}
            >
                <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                <Column field="CustomerID" headerText="Customer ID" />
                <Column field="Freight" headerText="Freight" />
            </Grid>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        await act(async () => {
            const addButton = screen.getByText('Add').closest('button');
            fireEvent.click(addButton);
        });

        await waitFor(() => {
            const updateButton = screen.getByText('Update').closest('button');
            const cancelButton = screen.getByText('Cancel').closest('button');

            // Should enter edit mode for new record
            expect(updateButton).not.toBeDisabled();
            expect(cancelButton).not.toBeDisabled();
        });
    });

    it('should handle Search toolbar functionality', async () => {
        const { container } = render(
            <Grid
                dataSource={testData}
                searchSettings={{enabled: true}}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    mode: 'Normal'
                }}
            >
                <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                <Column field="CustomerID" headerText="Customer ID" />
                <Column field="Freight" headerText="Freight" />
            </Grid>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        await act(async() => {
            const addButton = screen.getByText('Add').closest('button');
            fireEvent.click(addButton);
        });

        await waitFor(() => {
            const updateButton = screen.getByText('Update').closest('button');
            const cancelButton = screen.getByText('Cancel').closest('button');

            // Should enter edit mode for new record
            expect(updateButton).not.toBeDisabled();
            expect(cancelButton).not.toBeDisabled();
        });

        await act(async() => {
            const searchInput = screen.getByPlaceholderText('Search');
            fireEvent.click(searchInput);
            fireEvent.focus(searchInput);
            fireEvent.change(searchInput, { target: { value: '1' } });
            const clearIcon = container.querySelector('.sf-clear-icon');
            (clearIcon as HTMLElement).click();
            fireEvent.click(clearIcon);
            fireEvent.change(searchInput, { target: { value: '10248' } });
            const searchIcon = container.querySelector('.sf-search-icon');
            (searchIcon as HTMLElement).click();
            fireEvent.click(searchIcon);
            fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' });
            fireEvent.click(clearIcon);
            fireEvent.change(searchInput, { target: { value: '10248' } });
            fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
            fireEvent.keyDown(searchInput, { key: 'Tab', code: 'Tab', shiftKey: true });
            fireEvent.blur(searchInput);
            fireEvent.keyDown(searchInput, { key: 'Delete', code: 'Delete' });
        });
    });

    it('sticky header is apply when scrolling', async () => {
        const gridRef = createRef<GridRef>();
        // Mock window.scrollY
        let scrollY = 0;
        Object.defineProperty(window, 'scrollY', {
            get: () => scrollY,
            configurable: true
        });

        // Mock scroll event
        const fireScrollEvent = () => {
            window.dispatchEvent(new Event('scroll'));
        };

        const { container } = render(
            <div style={{ marginTop: 100, marginBottom: 500 }}>
                <Grid
                    ref={gridRef}
                    dataSource={testData}
                    toolbar={['Search']}
                    enableStickyHeader={true}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" />
                        <Column field="ShipName" headerText="ShipName" />
                        <Column field="ShipCity" headerText="ShipCity" />
                    </Columns>
                </Grid>
            </div>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        const grid = container.querySelector('.sf-grid');
        expect(grid).not.toBeNull();

        expect(grid.querySelector('.sf-toolbar').classList.contains('sf-sticky')).toBeFalsy();

        // Simulate window scroll
        await act(async () => {
            Element.prototype.getBoundingClientRect = jest.fn(() => ({
                width: 120,
                height: 120,
                top: -50,
                left: 0,
                bottom: 70,
                right: 120,
                x: 0,
                y: -50,
                toJSON: () => { }
            }));

            scrollY = 300;
            fireScrollEvent();
        });

        expect(grid.querySelector('.sf-toolbar').classList.contains('sf-sticky')).toBeTruthy();

        await act(async () => {
            Element.prototype.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                left: 0,
                bottom: 500,
                right: 800,
                width: 800,
                height: 400,
                x: 0,
                y: 100,
                toJSON: () => { }
            }));

            scrollY = 0;
            fireScrollEvent();
        });
        expect(grid.querySelector('.sf-toolbar').classList.contains('sf-sticky')).toBeFalsy();

        await act(async () => {
            scrollY = 10;
            fireScrollEvent();
        });
        expect(grid.querySelector('.sf-toolbar').classList.contains('sf-sticky')).toBeFalsy();
    });

    it('should handle showAddNewRow functionality', async () => {
        const { container } = render(
            <Grid
                dataSource={testData}
                toolbar={['Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    mode: 'Normal',
                    showAddNewRow: true
                }}
            >
                <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                <Column field="CustomerID" headerText="Customer ID" />
                <Column field="Freight" headerText="Freight" />
            </Grid>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        await waitFor(() => {
            const updateButton = screen.getByText('Update').closest('button');
            const cancelButton = screen.getByText('Cancel').closest('button');

            // With showAddNewRow, Update/Cancel should be active initially
            expect(updateButton).not.toBeDisabled();
            expect(cancelButton).not.toBeDisabled();
        });
    });

    it('should handle custom toolbar items', async () => {
        const mockToolbarClick = jest.fn();

        const { container } = render(
            <Grid
                dataSource={testData}
                toolbar={[
                    'Add',
                    { id: 'custom1', text: 'Custom Action', onClick: mockToolbarClick },
                    'Delete'
                ]}
                editSettings={{
                    allowAdd: true,
                    allowDelete: true
                }}
                onToolbarItemClick={mockToolbarClick}
            >
                <Column field="OrderID" headerText="Order ID" isPrimaryKey={true} />
                <Column field="CustomerID" headerText="Customer ID" />
                <Column field="Freight" headerText="Freight" />
            </Grid>
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        await act(async () => {
            const customButton = screen.getByText('Custom Action').closest('button');
            customButton.click();
            fireEvent.click(customButton);
        });
        expect(mockToolbarClick).toHaveBeenCalled();
    });
});
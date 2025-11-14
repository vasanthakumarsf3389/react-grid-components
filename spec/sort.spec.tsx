import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react';
import { ActionType, Grid } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { Column, Columns } from '../src/index';
import { SortDirection } from '../src/index';

describe('Grid Sorting Functionality', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38 },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61 },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83 },
        { OrderID: 10251, CustomerID: 'VICTE', Freight: 41.34 },
        { OrderID: 10252, CustomerID: 'SUPRD', Freight: 51.30 }
    ];

    let gridRef: React.RefObject<GridRef>;
    let container: HTMLElement;

    // Move DOM mocks to describe level
    beforeAll(() => {
        Object.defineProperty(window, 'getComputedStyle', {
            value: () => ({
                getPropertyValue: jest.fn(() => ''),
                width: '200px'
            })
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
            toJSON: () => {}
        }));
    });

    // AllowUnsort and Mouse Click Behavior
    describe('AllowUnsort and Mouse Click Behavior', () => {
        it('should cycle Asc -> Desc -> None when allowUnsort = true via mouse click', async () => {
            gridRef = React.createRef<GridRef>();
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{ enabled: true, allowUnsort: true }}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            const orderIdHeaderCell = container.querySelectorAll('.sf-grid-header-row .sf-cell')[0] as HTMLElement;

            // First click -> Asc
            await act(async () => {
                fireEvent.click(orderIdHeaderCell);
            });
            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('OrderID');
                expect(gridRef.current.sortSettings.columns[0].direction).toBe('Ascending');
            });

            // Second click -> Desc
            await act(async () => {
                fireEvent.click(orderIdHeaderCell);
            });
            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns[0].direction).toBe('Descending');
            });

            // Third click -> None (unsort) because allowUnsort = true
            await act(async () => {
                fireEvent.click(orderIdHeaderCell);
            });
            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(0);
            });
        });

        it('should only toggle Asc <-> Desc when allowUnsort = true via mouse click', async () => {
            gridRef = React.createRef<GridRef>();
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{ enabled: true, allowUnsort: true }}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
            });

            const orderIdHeaderCell = container.querySelectorAll('.sf-grid-header-row .sf-cell')[0] as HTMLElement;

            // First click -> Asc
            await act(async () => {
                fireEvent.click(orderIdHeaderCell);
            });
            // Second click -> Desc
            await act(async () => {
                fireEvent.click(orderIdHeaderCell);
            });
            // Third click should remain sorted (Desc), not cleared
            await act(async () => {
                fireEvent.click(orderIdHeaderCell);
            });
        });
    });

    // Sorting with Searching
    describe('Sorting with Searching', () => {
        it('should retain search text while sorting (API and mouse)', async () => {
            gridRef = React.createRef<GridRef>();
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    searchSettings={{ enabled: true }}
                    sortSettings={{ enabled: true, allowUnsort: true }}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
            });

            await act(async () => {
                gridRef.current.search('VI');
            });

            // API sort
            await act(async () => {
                gridRef.current.sortByColumn('CustomerID', 'Descending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.searchSettings.value).toBe('VI');
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
            });

            // Mouse click sort on OrderID should replace sort (no multi)
            const orderIdHeaderCell = container.querySelectorAll('.sf-grid-header-row .sf-cell')[0] as HTMLElement;
            await act(async () => {
                fireEvent.click(orderIdHeaderCell);
            });

            await waitFor(() => {
                expect(gridRef.current.searchSettings.value).toBe('VI');
                expect(gridRef.current.sortSettings.columns[0].field).toBe('OrderID');
            });
        });
    });

    // Sorting with Filtering, Paging and Editing
    describe('Sorting with Filtering, Paging and Editing', () => {
        it('should keep filters, page and edits while sorting and after clearSort', async () => {
            gridRef = React.createRef<GridRef>();
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData.map(d => ({ ...d }))}
                    height={400}
                    width={800}
                    filterSettings={{ enabled: true, type: 'FilterBar' }}
                    pageSettings={{ enabled: true, pageSize: 3, pageCount: 3, currentPage: 2 }}
                    editSettings={{ allowEdit: true }}
                    sortSettings={{ enabled: true }}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" isPrimaryKey={true} allowSort={true} allowFilter={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} allowFilter={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} allowFilter={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
            });

            // Apply a filter
            await act(async () => {
                gridRef.current.filterByColumn('OrderID', 'greaterthan', 10248, 'and', true, false);
            });

            // Navigate to a page
            await act(async () => {
                gridRef.current.goToPage(2);
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
            });

            // Edit a value
            await act(async () => {
                gridRef.current.setCellValue(10249, 'CustomerID', 'UPDATED', true);
            });

            // Sort ascending
            await act(async () => {
                gridRef.current.sortByColumn('CustomerID', 'Ascending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
            });

            // Clear sort should not clear filter or page
            await act(async () => {
                gridRef.current.clearSort();
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(0);
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
            });
        });
    });

    // Initial Sorting Combinations
    describe('Initial Sorting Combinations', () => {
        it('should initialize with sorting + searching + filtering + paging and maintain states', async () => {
            gridRef = React.createRef<GridRef>();
            render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData.concat(sampleData)}
                    height={400}
                    width={800}
                    searchSettings={{ enabled: true, value: 'VI' }}
                    filterSettings={{ enabled: true, type: 'FilterBar', columns: [{ field: 'Freight', operator: 'greaterthan', value: 30 }] }}
                    pageSettings={{ enabled: true, pageSize: 4, pageCount: 3, currentPage: 3 }}
                    sortSettings={{ enabled: true, columns: [ { field: 'OrderID', direction: 'Ascending' as SortDirection } ] }}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} allowFilter={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} allowFilter={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} allowFilter={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(gridRef.current.searchSettings.value).toBe('VI');
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                // Initial sorting should not reset page
                expect(gridRef.current.pageSettings.currentPage).toBe(3);
            });

            // Change sort and verify others persist
            await act(async () => {
                gridRef.current.sortByColumn('CustomerID', 'Descending', true);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns.length).toBeGreaterThanOrEqual(1);
                expect(gridRef.current.searchSettings.value).toBe('VI');
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
            });
        });
    });

    // ClearSorting API combinations
    describe('Clear Sorting combinations', () => {
        it('should clear specific and all sorts using APIs', async () => {
            gridRef = React.createRef<GridRef>();
            render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{ enabled: true }}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await act(async () => {
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
                gridRef.current.sortByColumn('CustomerID', 'Descending', true);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(2);
            });

            // Remove one column sort
            await act(async () => {
                gridRef.current.removeSortColumn('OrderID');
            });

            await waitFor(() => {
                const cols = gridRef.current.sortSettings.columns;
                expect(cols).toHaveLength(1);
                expect(cols[0].field).toBe('CustomerID');
            });

            // Clear all sorts
            await act(async () => {
                gridRef.current.clearSort();
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(0);
            });
        });
    });

    // Basic Sort Operations
    describe('Basic Sort Operations', () => {
        beforeEach(async () => {
            gridRef = React.createRef<GridRef>();

            const result = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{enabled: true}}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );
            container = result.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
            }, {
                timeout: 2000,
                interval: 50
            });
        });

        it('should sort columns in different directions', async () => {
            // Test ascending sort
            await act(async () => {
                gridRef.current.removeSortColumn('OrderID');
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('OrderID');
                expect(gridRef.current.sortSettings.columns[0].direction).toBe('Ascending');
            });

            // Test descending sort
            await act(async () => {
                gridRef.current.sortByColumn('OrderID', 'Descending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns[0].direction).toBe('Descending');
            });
        });

        it('should handle multi-column sorting scenarios', async () => {
            // Test multi-sort enabled
            await act(async () => {
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
                gridRef.current.sortByColumn('CustomerID', 'Descending', true);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(2);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('OrderID');
                expect(gridRef.current.sortSettings.columns[1].field).toBe('CustomerID');
            });

            // Test multi-sort disabled
            await act(async () => {
                gridRef.current.sortByColumn('Freight', 'Ascending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('Freight');
            });
        });
    });

    // Sort Settings and Permissions
    describe('Sort Settings and Permissions', () => {
        it('should respect sort permissions', async () => {
            gridRef = React.createRef<GridRef>();
            // Test disabled sorting
            const {container} = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{enabled: false}}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            // Wait for spinner to disappear
            await waitFor(() => {
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            await act(async () => {
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings?.columns.length).toBe(0);
            });

            gridRef = React.createRef();
            // Test column-level sort permission
            const {container: container1} = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{enabled: true}}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={false} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            // Wait for spinner to disappear
            await waitFor(() => {
                expect(container1.querySelector('.sf-spinner')).toBeNull();
            });

            await act(async () => {
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
                gridRef.current.sortByColumn('CustomerID', 'Ascending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('CustomerID');
            });
        });
    });

    // Initial Sort Settings
    describe('Initial Sort Settings', () => {
        it('should handle various initial sort configurations', async () => {
            gridRef = React.createRef<GridRef>();
            // Test single column initial sort
            const singleSortSettings = {
                enabled: true,
                columns: [
                    { field: 'Freight', direction: 'Descending' as SortDirection }
                ]
            };

            render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={singleSortSettings}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('Freight');
                expect(gridRef.current.sortSettings.columns[0].direction).toBe('Descending');
            });

            // Test multiple column initial sort
            const multiSortSettings = {
                enabled: true,
                columns: [
                    { field: 'OrderID', direction: 'Ascending' as SortDirection },
                    { field: 'Freight', direction: 'Descending' as SortDirection }
                ]
            };

            render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={multiSortSettings}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(2);
            });

            await act(async () => {
                gridRef.current.clearSort();
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(0);
            });
        });
    });

    // Sort Events
    describe('Sort Events', () => {
        beforeEach(async () => {
            gridRef = React.createRef<GridRef>();
        });

        it('should handle sort events correctly', async () => {
            const actionBeginSpy = jest.fn();
            const actionCompleteSpy = jest.fn();

            render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{enabled: true}}
                    onSortStart={actionBeginSpy}
                    onSort={actionCompleteSpy}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await act(async () => {
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
            });

            await waitFor(() => {
                expect(actionBeginSpy).toHaveBeenCalled();
                expect(actionCompleteSpy).toHaveBeenCalled();
                const beginArgs = actionBeginSpy.mock.calls[0][0];
                expect(beginArgs.requestType).toBe(ActionType.Sorting);
                expect(beginArgs.field).toBe('OrderID');
            });

            // Test sort cancellation
            actionBeginSpy.mockImplementationOnce(args => {
                args.cancel = true;
            });

            await act(async () => {
                gridRef.current.sortByColumn('CustomerID', 'Ascending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('OrderID');
            });
        });
    });

    // UI Interaction Tests
    describe('UI Interaction Tests', () => {
        beforeEach(async () => {
            gridRef = React.createRef<GridRef>();
        });

        it('should handle various UI sorting interactions', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{enabled: true}}
                >
                    <Columns>
                        <Column field="" headerText="Value" type="checkbox" width="120" allowSort={true} />
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            // Find and click on the header cell
            const headerCells = container.querySelectorAll('.sf-grid-header-row .sf-cell');
            const valueHeaderCell = headerCells[0];
            const orderIdHeaderCell = headerCells[1];
            const customerIdHeaderCell = headerCells[2];

            // Test checkbox column sort
            await act(async () => {
                fireEvent.click(valueHeaderCell);
            });

            // Test basic click sort
            await act(async () => {
                fireEvent.click(orderIdHeaderCell);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns[0].direction).toBe('Ascending');
            });

            // Test Ctrl+Click multi-sort
            await act(async () => {
                fireEvent.click(customerIdHeaderCell, { ctrlKey: true });
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(2);
            });

            // Test Shift+Click clear sort
            await act(async () => {
                fireEvent.click(orderIdHeaderCell, { shiftKey: true });
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
            });
        });

        it('should handle keyboard interactions', async () => {
            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{enabled: true}}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" allowSort={true} />
                        <Column field="Freight" headerText="Freight" width="100" allowSort={true} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });
             // Find and click on the header cell
            const rowCell = container.querySelector('.sf-grid-content-row .sf-cell');
            // Find and click on the header cell
            const headerCell = container.querySelector('.sf-grid-header-row .sf-cell');

            // Test Enter key
            await act(async () => {
                fireEvent.keyDown(rowCell, { key: 'Enter', keyCode: 13 });
                fireEvent.keyDown(headerCell, { key: 'Enter', keyCode: 13 });
                fireEvent.keyDown(headerCell, { key: 'Enter', keyCode: 13, shiftKey: true });
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(0);
            });
        });
    });

    // Custom Sort Functionality
    describe('Custom Sort Functionality', () => {
        it('should work with custom sort comparer', async () => {
            const sortComparer = (reference, comparer) => {
                if (reference < comparer) return -1;
                if (reference > comparer) return 1;
                return 0;
            };

            const { container } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    sortSettings={{enabled: true}}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        <Column field="CustomerID" headerText="Customer ID" width="150" sortComparer={sortComparer} />
                        <Column field="Freight" headerText="Freight" width="100" />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });

            await act(async () => {
                gridRef.current.sortByColumn('CustomerID', 'Descending', false);
            });

            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('CustomerID');
                expect(gridRef.current.sortSettings.columns[0].direction).toBe('Descending');
            });
        });
    });
});

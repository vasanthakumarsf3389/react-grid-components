import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { act, fireEvent, render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createRef, RefObject } from 'react';
import { Grid } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { Column, Columns } from '../src/index';
import { SortEvent } from '../src/grid/types/sort.interfaces';
import { RowSelectEvent } from '../src/grid/types/selection.interfaces';

// Mock DOM methods that might not be available in the test environment
const mockDOMMethods = () => {
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

    if (!(window as any).ResizeObserver) {
        (window as any).ResizeObserver = class {
            observe() {/* noop */}
            unobserve() {/* noop */}
            disconnect() {/* noop */}
        };
    }
};

describe('Grid Selection-Editing Interactions', () => {
    const editableData = [
        { OrderID: 1, CustomerID: 'VINET', Freight: 32.38 },
        { OrderID: 2, CustomerID: 'TOMSP', Freight: 11.61 },
        { OrderID: 3, CustomerID: 'HANAR', Freight: 65.83 },
        { OrderID: 4, CustomerID: 'VICTE', Freight: 41.34 },
        { OrderID: 5, CustomerID: 'SUPRD', Freight: 51.30 }
    ];

    const editableColumns = [
        { field: 'OrderID', headerText: 'Order ID', width: '120', isPrimaryKey: true },
        { 
            field: 'CustomerID',
            headerText: 'Customer ID', 
            width: '120',
            validationRules: { required: true, minLength: 3 }
        },
        { 
            field: 'Freight', 
            headerText: 'Freight', 
            width: '120',
            validationRules: { required: true, min: 0 }
        }
    ];

    let gridRef: RefObject<GridRef>;
    let container: HTMLElement;

    beforeEach(async () => {
        mockDOMMethods();
        gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={editableData}
                editSettings={{
                    allowEdit: true,
                    allowAdd: true,
                    allowDelete: true,
                    mode: 'Normal'
                }}
                selectionSettings={{ mode: 'Multiple' }}
                height={400}
            >
                <Columns>
                    {editableColumns.map((col, index) => (
                        <Column key={index} {...col} />
                    ))}
                </Columns>
            </Grid>
        );
        
        container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should maintain selection after adding new record', async () => {
        // Select first two rows
        await act(async () => {
            gridRef.current.selectRows([0, 1]);
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1]);

        // Add new record at index 0 (top)
        await act(async () => {
            gridRef.current.addRecord({ OrderID: 6, CustomerID: 'NEWCS', Freight: 45.00 }, 0);
            await new Promise(resolve => setTimeout(resolve, 50));
        });

        await waitFor(() => {
            const addForm = container.querySelector('.sf-editedrow, .sf-addedrow');
            expect(addForm).toBeNull();
        });

        // Previous selections should be cleared and only the new row should be selected
        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });
    });

    it('should preserve selection after editing and saving row', async () => {
        // Select second and third rows
        await act(async () => {
            gridRef.current.selectRows([1, 2]);
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2]);

        // Edit and save the first row (non-selected)
        await act(async () => {
            gridRef.current.selectRow(0);
            gridRef.current.editRecord();
        });

        // Modify the data
        await act(async () => {
            const customerIdInput = container.querySelector('#grid-edit-CustomerID') as HTMLInputElement;
            fireEvent.change(customerIdInput, { target: { value: 'MODIF' } });
            gridRef.current.saveDataChanges();
        });

        // Previous selections should be cleared and only the edited row should be selected
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
    });

    it('should maintain selection after failed validation', async () => {
        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([1, 2, 3]);
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2, 3]);

        // Edit row 2 with invalid data
        await act(async () => {
            gridRef.current.selectRow(2);
            gridRef.current.editRecord();
        });

        // Try to save with invalid data
        await act(async () => {
            const customerIdInput = container.querySelector('#grid-edit-CustomerID') as HTMLInputElement;
            fireEvent.change(customerIdInput, { target: { value: 'A' } }); // Too short to pass validation
            gridRef.current.saveDataChanges();
        });

        // Selection should remain on the row being edited when validation fails
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([2]);
    });

    it('should update selection after deleting selected rows', async () => {
        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([1, 2, 3]);
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2, 3]);

        // Delete middle selected row
        await act(async () => {
            gridRef.current.selectRow(2);
            gridRef.current.deleteRecord();
        });

        // Selection should be updated: remaining selections should shift up
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([]);
    });

    it('should preserve selection through edit-save-edit cycle', async () => {
        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([0, 2]);
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 2]);

        // First edit-save cycle
        await act(async () => {
            gridRef.current.selectRow(1); // Edit non-selected row
            gridRef.current.editRecord();
        });

        await act(async () => {
            const customerIdInput = container.querySelector('#grid-edit-CustomerID') as HTMLInputElement;
            fireEvent.change(customerIdInput, { target: { value: 'EDIT1' } });
            gridRef.current.saveDataChanges();
        });

        // Only the edited row should be selected
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Second edit cycle
        await act(async () => {
            gridRef.current.selectRow(1);
            gridRef.current.editRecord();
        });

        await act(async () => {
            const customerIdInput = container.querySelector('#grid-edit-CustomerID') as HTMLInputElement;
            fireEvent.change(customerIdInput, { target: { value: 'EDIT2' } });
            gridRef.current.saveDataChanges();
        });

        // Only the last edited row should be selected
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);
    });

    it('should maintain selection when editing one of the selected rows', async () => {
        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([0, 1, 2]);
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1, 2]);

        // Edit one of the selected rows
        await act(async () => {
            gridRef.current.selectRow(1); // Select middle row for edit
            gridRef.current.editRecord();
        });

        // Modify and save the data
        await act(async () => {
            const customerIdInput = container.querySelector('#grid-edit-CustomerID') as HTMLInputElement;
            fireEvent.change(customerIdInput, { target: { value: 'MODIF' } });
            gridRef.current.saveDataChanges();
        });

        // Only the edited row should remain selected
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);
    });

    it('should maintain selection after canceling edit', async () => {

        // Start editing a selected row
        await act(async () => {
            gridRef.current.selectRow(2);
        });

        await act(async () => {
            gridRef.current.editRecord();
        });

        const customerIdInput = container.querySelector('#grid-edit-CustomerID') as HTMLInputElement;
        expect(customerIdInput).not.toBeNull();
        // Make changes but cancel them
        await act(async () => {
            fireEvent.change(customerIdInput, { target: { value: 'CANCELED' } });
        });

        await act(async () => {
            fireEvent.keyDown(customerIdInput, { key: 'Escape', code: 'Escape' });
        });

        // Original selection and data should be preserved
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([2]);
        const rowData = gridRef.current.getSelectedRecords()[0];
        expect(rowData['CustomerID']).not.toBe('CANCELED');
    });

    it('should handle deleting multiple selected rows simultaneously', async () => {
        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([1, 2, 3]);
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2, 3]);

        // Delete all selected rows
        await act(async () => {
            const selectedRecords = gridRef.current.getSelectedRecords();
            selectedRecords.forEach(record => {
                gridRef.current.deleteRecord(record['OrderID'].toString());
            });
        });

        // Verify rows were deleted and selection is cleared
        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([]);
        });
        
        await waitFor(() => {
            // Verify remaining records
            const allRecords = gridRef.current.getCurrentViewRecords();
            expect(allRecords.length).toBe(2); // Only rows 0 and 4 should remain
            expect(allRecords[1]['OrderID']).toBe(5);
        });
    });
});

describe('Grid Selection Continuous - Default Mode', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' }
    ];

    let gridRef: RefObject<GridRef>;
    let container: HTMLElement;

    beforeEach(async () => {
        mockDOMMethods();
        gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('select the row', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        const gridObj = container.querySelector('.sf-grid');
        expect(gridObj).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                (gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell') as HTMLElement).click();
            }
        });
        
        expect(parseInt(gridObj.querySelectorAll('tr[aria-selected="true"]')[0].getAttribute('aria-rowindex'), 10) - 1).toBe(1);
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getSelectedRecords().length).toBe(1);
        expect(gridRef?.current.getSelectedRowIndexes().length).toBe(1);
        expect(gridRef?.current.getSelectedRows().length).toBe(1);
        expect(gridRef?.current.selectionModule.activeTarget).toBeDefined();
        
        await act(async () => {
            if (gridRef.current) {
                (gridRef?.current?.getRows()[2].querySelector('.sf-grid-content-row .sf-cell') as HTMLElement).click();
            }
        });
        
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();
    });

    it('select the row - selectRow API', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(0, true);
            }
        });
        
        expect(gridRef?.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.element.querySelectorAll('.sf-active').length).toBe(2);
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(1);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(1);

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(2, true);
            }
        });
        
        expect(gridRef?.current.getRows()[2].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(1);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(1);
        expect(gridRef?.current.getRows()[0].hasAttribute('aria-selected')).toBeFalsy();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeFalsy();

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.clearSelection();
                gridRef.current.selectRow(-1, true);
            }
        });
        
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeFalsy();
    });

    it('clear row selection testing', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(0, true);
                gridRef.current.clearSelection();
            }
        });
        
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(0);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(0);
    });

    it('selection for column template', async () => {
        // Render a new grid with column template (this test needs its own grid)
        const templateGridRef = createRef<GridRef>();
        const templateResult = render(
            <Grid
                ref={templateGridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Single'}}
                height={400}
            >
                <Columns>
                    <Column headerText="Order ID" field="OrderID" template={(data: any) => <div>{data['OrderID']}</div>} width="120" />
                    <Column headerText="Customer ID" field='CustomerID' width="120" />
                </Columns>
            </Grid>
        );
        
        const templateContainer = templateResult.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(templateContainer.querySelector('.sf-grid')).not.toBeNull();
            expect(templateContainer.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(templateGridRef.current).not.toBeNull();
        });
        
        await act(async () => {
            if (templateGridRef.current) {
                fireEvent.click((templateGridRef?.current?.getRows()[1].querySelector('div')));
            }
        });
        
        expect(templateGridRef?.current.selectionModule.selectedRows.length).toBe(1);
    });
});

describe('Grid Selection Continuous - Single Mode', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' }
    ];

    let gridRef: RefObject<GridRef>;
    let container: HTMLElement;

    beforeEach(async () => {
        mockDOMMethods();
        gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{mode: 'Single', enableToggle: false}}
                height={400}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('enableToggle false check', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        const gridObj = container.querySelector('.sf-grid');
        expect(gridObj).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                (gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell') as HTMLElement).click();
            }
        });
        
        expect(parseInt(gridObj.querySelectorAll('tr[aria-selected="true"]')[0].getAttribute('aria-rowindex'), 10) - 1).toBe(1);
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getSelectedRecords().length).toBe(1);
        expect(gridRef?.current.getSelectedRowIndexes().length).toBe(1);
        expect(gridRef?.current.getSelectedRows().length).toBe(1);
        expect(gridRef?.current.selectionModule.activeTarget).toBeDefined();
        
        await act(async () => {
            if (gridRef.current) {
                (gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell') as HTMLElement).click();
            }
        });
        
        // With enableToggle false, row should remain selected
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
    });

    it('single selection - selectRows testing', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRows([1, 2]);
            }
        });
        
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(1);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(1);
    });

    it('single selection- selectRowsByRange testing', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRowByRange(0, 1);
            }
        });
        
        expect(gridRef?.current.getRows()[0].hasAttribute('aria-selected')).toBeFalsy();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(1);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(1);
    });
    
    it('addRowsToSelection', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef?.current.selectionModule.addRowsToSelection([0, 2]);
            }
        });
        
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(1);
    });
});

describe('Grid Selection Continuous - Multiple Mode', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' }
    ];

    let gridRef: RefObject<GridRef>;
    let container: HTMLElement;

    beforeEach(async () => {
        mockDOMMethods();
        gridRef = createRef<GridRef>();
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Multiple'}}
                height={400}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        container = result.container;
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Multiple row selection testing', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRows([1, 2]);
            }
        });
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(2);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(2);
    });

    it('Multiple selection- selectRowByRange testing', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRowByRange(1, 2);
            }
        });
        
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(2);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(2);
    });

    it('Multiple selection- selectRowByRange testing with clear', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRows([0, 1]);
                gridRef.current.selectRow(0, true);
            }
        });
        
        expect(gridRef?.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(1);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(1);

        //Clear multiple row selection
        await act(async () => {
            if (gridRef.current) {
                gridRef?.current.clearSelection();
            }
        });
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.getRows()[2].hasAttribute('aria-selected')).toBeFalsy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(0);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(0);
    });

    it('Clear row selection for specific row index', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRows([0, 1, 2]);
            }
        });
        
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(3);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(3);

        //Clear multiple row selection
        await act(async () => {
            if (gridRef.current) {
                gridRef?.current.clearRowSelection([0, 2]);
            }
        });
        
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(1);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(1);

        await act(async () => {
            if (gridRef.current) {
                gridRef?.current.clearRowSelection([0]);
                gridRef?.current.clearRowSelection([-1]);
            }
        });
    });

    it('Coverage for selectedRowIndexes', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();
        
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRows([0, 1, 2]);
            }
        });
        
        expect(gridRef?.current.selectedRowIndexes.length).toBe(3);
    });

    it('shift+space row range selection testing', async () => {
        // Verify gridRef is still available
        expect(gridRef.current).not.toBeNull();

        // Select and focus the first row
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });

        // Move focus to the second row using keyboard navigation (ArrowDown)
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
        });

        // Trigger range selection with Shift + Space
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: ' ', code: 'Space', shiftKey: true, keyCode: 32 });
        });

        // Validate that the first and second rows are selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeTruthy();
            expect(gridRef.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0, 1]);
            expect(gridRef.current.selectionModule.selectedRows.length).toBe(2);
        });
    });
});

describe('Grid Selection Continuous - Event Handling', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' }
    ];

    beforeAll(() => {
        mockDOMMethods();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('selection event', async () => {
        const onRowSelecting = jest.fn();
        const onRowSelect = jest.fn();
        const onRowDeselecting = jest.fn();
        const onRowDeselect = jest.fn();
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Single' }}
                height={400}
                onRowSelecting={onRowSelecting}
                onRowSelect={onRowSelect}
                onRowDeselecting={onRowDeselecting}
                onRowDeselect={onRowDeselect}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(1, true);
            }
        });
        
        expect(onRowSelecting).toHaveBeenCalled();
        expect(onRowSelect).toHaveBeenCalled();

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(2, true);
            }
        });
        
        expect(onRowSelecting).toHaveBeenCalled();
        expect(onRowDeselecting).toHaveBeenCalled();
        expect(onRowDeselect).toHaveBeenCalled();
        expect(onRowSelect).toHaveBeenCalled();

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.clearSelection();
                gridRef.current.selectRows([1, 2]);
            }
        });
        
        expect(onRowSelecting).toHaveBeenCalled();
        expect(onRowSelect).toHaveBeenCalled();
    });

    it('selectRow - onRowSelecting event cancellation', async () => {
        const onRowSelecting = jest.fn((args: { cancel?: boolean }) => {
            args.cancel = true;
        });
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Single' }}
                height={400}
                onRowSelecting={onRowSelecting}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(1, true);
            }
        });
        
        expect(onRowSelecting).toHaveBeenCalled();
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
    });

    it('selectRows - onRowSelecting event cancellation', async () => {
        const onRowSelecting = jest.fn((args: { cancel?: boolean }) => {
            args.cancel = true;
        });
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Single' }}
                height={400}
                onRowSelecting={onRowSelecting}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRows([0, 1]);
            }
        });
        
        expect(onRowSelecting).toHaveBeenCalled();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
    });

    it('onRowDeselecting event cancellation', async () => {
        const onRowDeselecting = jest.fn((args: { cancel?: boolean }) => {
            args.cancel = true;
        });
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Single' }}
                height={400}
                onRowDeselecting={onRowDeselecting}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(1, true);
            }
        });
        
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(2, true);
            }
        });
                
        expect(onRowDeselecting).toHaveBeenCalled();
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();
    });

    it('Multiple selection- ctrl and shift click testing', async () => {
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Multiple'}}
                height={400}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        //multiple row - ctrl click testing
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click((gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell')));
                fireEvent.click((gridRef?.current?.getRows()[0].querySelector('.sf-grid-content-row .sf-cell')), { ctrlKey: true });
            }
        });
        
        expect(gridRef?.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(2);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(2);

        // multi row toogle - ctrl click testing
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click((gridRef?.current?.getRows()[2].querySelector('.sf-grid-content-row .sf-cell')), { ctrlKey: true });
            }
        });
        
        expect(gridRef?.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(3);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(3);

        //multiple row - shift click testing
        await act(async () => {
            if (gridRef.current) {
                gridRef?.current.clearSelection();
                fireEvent.click((gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell')));
                fireEvent.click((gridRef?.current?.getRows()[0].querySelector('.sf-grid-content-row .sf-cell')), { shiftKey: true });
            }
        });
        
        expect(gridRef?.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(2);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(2);

        // multi row toogle - shift click testing
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click((gridRef?.current?.getRows()[2].querySelector('.sf-grid-content-row .sf-cell')), { shiftKey: true });
            }
        });
        
        expect(gridRef?.current.getRows()[0].hasAttribute('aria-selected')).toBeFalsy();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.selectionModule.selectedRowIndexes.length).toBe(2);
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(2);
    });

    it('ctrl click - onRowSelecting event cancellation', async () => {
        const onRowSelecting = jest.fn((args: { cancel?: boolean }) => {
            args.cancel = true;
        });
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Multiple'}}
                height={400}
                onRowSelecting={onRowSelecting}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        //multiple row - ctrl click testing
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click((gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell')));
                fireEvent.click((gridRef?.current?.getRows()[0].querySelector('.sf-grid-content-row .sf-cell')), { ctrlKey: true });
            }
        });
        
        expect(onRowSelecting).toHaveBeenCalled();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
    });

    it('shift click - onRowSelecting event cancellation', async () => {
        const onRowSelecting = jest.fn((args: { cancel?: boolean }) => {
            args.cancel = true;
        });
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Multiple'}}
                height={400}
                onRowSelecting={onRowSelecting}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        //multiple row - ctrl click testing
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click((gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell')));
                fireEvent.click((gridRef?.current?.getRows()[0].querySelector('.sf-grid-content-row .sf-cell')), { shiftKey: true });
            }
        });
        
        expect(onRowSelecting).toHaveBeenCalled();
        expect(gridRef?.current.getRows()[0].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
    });

    it('ctrl click - onRowSelecting event', async () => {
        const onRowDeselecting = jest.fn();
        const onRowDeselect = jest.fn();
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Multiple'}}
                height={400}
                onRowDeselecting={onRowDeselecting}
                onRowDeselect={onRowDeselect}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        //multiple row - ctrl click testing
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click((gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell')));
                fireEvent.click((gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell')), { ctrlKey: true });
            }
        });
        
        expect(onRowDeselecting).toHaveBeenCalled();
        expect(onRowDeselect).toHaveBeenCalled();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeFalsy();
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(0);
    });

    it('ctrl click - onRowDeselecting event cancellation', async () => {
        const onRowDeselecting = jest.fn((args: { cancel?: boolean }) => {
            args.cancel = true;
        });
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Multiple'}}
                height={400}
                onRowDeselecting={onRowDeselecting}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        //multiple row - ctrl click testing
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click((gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell')));
                fireEvent.click((gridRef?.current?.getRows()[1].querySelector('.sf-grid-content-row .sf-cell')), { ctrlKey: true });
            }
        });
        
        expect(onRowDeselecting).toHaveBeenCalled();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(1);
    });

    it('clearRowSelection - onRowDeselecting event cancellation', async () => {
        const onRowDeselecting = jest.fn((args: { cancel?: boolean }) => {
            args.cancel = true;
        });
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Multiple' }}
                height={400}
                onRowDeselecting={onRowDeselecting}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRows([1, 2]);
            }
        });
        
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.clearRowSelection([1, 2]);
            }
        });
                
        expect(onRowDeselecting).toHaveBeenCalled();
        expect(gridRef?.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].hasAttribute('aria-selected')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();
    });

    it('clearRowSelection -onRowDeselecting event', async () => {
        const onRowDeselecting = jest.fn();
        const onRowDeselect = jest.fn();
        
        const gridRef = createRef<GridRef>();
        
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                selectionSettings={{ mode: 'Multiple'}}
                height={400}
                onRowDeselecting={onRowDeselecting}
                onRowDeselect={onRowDeselect}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );
        
        const container = result.container;
        
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });
        
        // Wait for gridRef to be populated
        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRows([1, 2]);
            }
        });
        
        expect(gridRef?.current.getRows()[1].firstElementChild.classList.contains('sf-active')).toBeTruthy();
        expect(gridRef?.current.getRows()[2].firstElementChild.classList.contains('sf-active')).toBeTruthy();

        await act(async () => {
            if (gridRef.current) {
                gridRef.current.clearRowSelection([1, 2]);
            }
        });
        
        expect(onRowDeselecting).toHaveBeenCalled();
        expect(onRowDeselect).toHaveBeenCalled();
        expect(gridRef?.current.selectionModule.selectedRows.length).toBe(0);
    });
});

describe('Grid Selection – Additional Scenarios', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' }
    ];

    beforeAll(() => {
        // Ensure mocked DOM helpers exist for these tests as well
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
            toJSON: () => { }
        }));
    });

    it('should have no selection on initial load', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid ref={gridRef} dataSource={sampleData} height={400}>
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(gridRef.current).not.toBeNull();
        });

        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
        expect(container.querySelectorAll('tr[aria-selected="true"]').length).toBe(0);
    });

    it('should ignore selection attempts when selectionSettings.enabled = false', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ enabled: false }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );

        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);

        // Try programmatic API
        await act(async () => {
            gridRef.current.selectRow(1, true);
        });

        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
        expect(container.querySelectorAll('tr[aria-selected="true"]').length).toBe(0);
    });

    it('Single mode should ignore Shift / Ctrl modifiers and keep single selection', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Single' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );

        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[1].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([1]);
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Shift + click on third row – should replace selection
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[2].querySelector('.sf-grid-content-row .sf-cell'), { shiftKey: true });
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([2]);

        // Ctrl + click on first row – still single selection
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'), { ctrlKey: true });
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
    });

    it('Escape key should clear selection in Single mode', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Single' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );

        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        // Press Escape
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'Escape', code: 'Escape' });
        });

        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });

    it('Escape key should clear all selections in Multiple mode', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Multiple' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );

        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });

        await act(async () => {
            gridRef.current.selectRows([0, 1]);
        });
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(2);

        // Press Escape
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'Escape', code: 'Escape' });
        });

        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });

    it('Ctrl+A should select all rows when mode is Multiple', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Multiple' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );

        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });

        // Trigger Ctrl+A
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'a', code: 'KeyA', ctrlKey: true });
        });

        expect(gridRef.current.getSelectedRowIndexes().length).toBe(sampleData.length);
    });

    it('Enter / Shift+Enter keys should not alter current selection', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Single' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer ID" width="120" />
                </Columns>
            </Grid>
        );

        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[1].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[1].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([1]);
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Press Enter
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'Enter', code: 'Enter' });
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Press Shift+Enter
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'Enter', code: 'Enter', shiftKey: true });
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);
    });
});

describe('Grid Selection – Keyboard & Toggle scenarios', () => {
    const sampleData = [
        { OrderID: 1, CustomerID: 'A' },
        { OrderID: 2, CustomerID: 'B' },
        { OrderID: 3, CustomerID: 'C' }
    ];

    beforeAll(() => {
        Object.defineProperty(window, 'getComputedStyle', {
            value: () => ({ getPropertyValue: jest.fn(() => '') })
        });
        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            width: 100, height: 30, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => { }
        }));
    });

    it('Single mode Space key selects focused row and clears previous selection', async () => {
        const gridRef = createRef<GridRef>();
        const {container} = render(
            <Grid ref={gridRef} dataSource={sampleData} height={300}
                selectionSettings={{ mode: 'Single' }}>
                <Columns>
                    <Column field="OrderID" headerText="ID" width="100" />
                </Columns>
            </Grid>
        );
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        // Move focus to second row and press Space – selection should move to index 1
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            fireEvent.keyDown(gridRef.current.element, { key: ' ', code: 'Space', keyCode: 32 });
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);
    });

    it('Single mode enableToggle=true re-click toggles off selection', async () => {
        const gridRef = createRef<GridRef>();
        const {container} = render(
            <Grid ref={gridRef} dataSource={sampleData} height={300}
                selectionSettings={{ mode: 'Single', enableToggle: true }}>
                <Columns>
                    <Column field="OrderID" headerText="ID" width="100" />
                </Columns>
            </Grid>
        );
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        // Re-click same row – should clear selection
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
        });
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });

    it('Multiple mode enableToggle=true re-click', async () => {
        const gridRef = createRef<GridRef>();
        const {container} = render(
            <Grid ref={gridRef} dataSource={sampleData} height={300}
                selectionSettings={{ mode: 'Multiple', enableToggle: true }}>
                <Columns>
                    <Column field="OrderID" headerText="ID" width="100" />
                </Columns>
            </Grid>
        );
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
        });
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });

    it('Multiple mode enableToggle=false re-click keeps row selected', async () => {
        const gridRef = createRef<GridRef>();
        const {container} = render(
            <Grid ref={gridRef} dataSource={sampleData} height={300}
                selectionSettings={{ mode: 'Multiple', enableToggle: false }}>
                <Columns>
                    <Column field="OrderID" headerText="ID" width="100" />
                </Columns>
            </Grid>
        );
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        // Re-click the same row – selection should remain unchanged
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
    });

    it('Ctrl+Space adds and removes selection without affecting others', async () => {
        const gridRef = createRef<GridRef>();
        const {container} = render(
            <Grid ref={gridRef} dataSource={sampleData} height={300}
                selectionSettings={{ mode: 'Multiple' }}>
                <Columns>
                    <Column field="OrderID" headerText="ID" width="100" />
                </Columns>
            </Grid>
        );
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        // Move focus to second row and press Ctrl+Space to add
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            fireEvent.keyDown(gridRef.current.element, { key: ' ', code: 'Space', keyCode: 32, ctrlKey: true });
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1]);

        // Ctrl+Space again on same row should remove it
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: ' ', code: 'Space', keyCode: 32, ctrlKey: true });
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
    });

    it('Shift+Space selects contiguous range', async () => {
        const gridRef = createRef<GridRef>();
        const {container} = render(
            <Grid ref={gridRef} dataSource={sampleData} height={300}
                selectionSettings={{ mode: 'Multiple' }}>
                <Columns>
                    <Column field="OrderID" headerText="ID" width="100" />
                </Columns>
            </Grid>
        );
        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });

        // Move focus to third row (index 2)
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
        });

        // Shift + Space should select rows 0-2
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: ' ', code: 'Space', keyCode: 32, shiftKey: true });
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1, 2]);
    });

    it('Re-issuing identical selectRows is ignored (no duplicate events)', async () => {
        const onRowSelect = jest.fn();
        const gridRef = createRef<GridRef>();
        const {container} = render(
            <Grid ref={gridRef} dataSource={sampleData} height={300}
                selectionSettings={{ mode: 'Multiple' }}
                onRowSelect={onRowSelect}>
                <Columns>
                    <Column field="OrderID" headerText="ID" width="100" />
                </Columns>
            </Grid>
        );
        
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });

        await act(async () => { gridRef.current.selectRows([0, 1]); });
        expect(onRowSelect).toHaveBeenCalledTimes(2);

        // Select same combination again – no new event
        await act(async () => { gridRef.current.selectRows([0, 1]); });
        expect(onRowSelect).toHaveBeenCalledTimes(2);
    });

    it('Shift+Arrow Down then Shift+Arrow Up updates range correctly', async () => {
        const gridRef = createRef<GridRef>();
        const {container} = render(
            <Grid ref={gridRef} dataSource={sampleData} height={300}
                selectionSettings={{ mode: 'Multiple' }}>
                <Columns>
                    <Column field="OrderID" headerText="ID" width="100" />
                </Columns>
            </Grid>
        );

        // Wait for grid to be fully rendered
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Ensure the first row is selected
        await waitFor(() => {
            expect(gridRef.current.getRows()[0].hasAttribute('aria-selected')).toBeTruthy();
            expect(gridRef.current.selectionModule.selectedRowIndexes).toEqual([0]);
        });
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        // Shift+ArrowDown (include row1)
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown', shiftKey: true });
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0,1]);

        // Another Shift+ArrowDown (include row2)
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown', shiftKey: true });
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0,1,2]);

        // Reverse direction Shift+ArrowUp (remove bottom)
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowUp', code: 'ArrowUp', shiftKey: true });
        });
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0,1]);
    });
});

describe('Grid Sort-Selection Interactions', () => {
    const sampleData = [
        { OrderID: 1, CustomerID: 'A', Freight: 32.38 },
        { OrderID: 2, CustomerID: 'B', Freight: 11.61 },
        { OrderID: 3, CustomerID: 'C', Freight: 65.83 },
        { OrderID: 4, CustomerID: 'D', Freight: 41.34 },
        { OrderID: 5, CustomerID: 'E', Freight: 51.30 }
    ];

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

    it('should clear selection after single-column sort', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                sortSettings={{enabled: true}}
                selectionSettings={{mode: 'Single'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowSort={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowSort={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select a row first
        await act(async () => {
            gridRef.current.selectRow(1);
        });
        
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Now sort a column
        await act(async () => {
            gridRef.current.sortByColumn('OrderID', 'Descending', false);
        });

        // Selection should be cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
        expect(container.querySelectorAll('tr[aria-selected="true"]').length).toBe(0);
    });

    it('should clear selection after multi-column sort', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                sortSettings={{enabled: true, mode: 'Multiple'}}
                selectionSettings={{mode: 'Multiple'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowSort={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowSort={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([1, 2]);
        });
        
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2]);

        // Sort multiple columns
        await act(async () => {
            gridRef.current.sortByColumn('OrderID', 'Ascending', true);
            gridRef.current.sortByColumn('CustomerID', 'Descending', true);
        });

        // Selection should be cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });

    it('should retain selection when sort is cancelled', async () => {
        const gridRef = createRef<GridRef>();
        const onSortStart = jest.fn((args: SortEvent) => {
            args.cancel = true;
        });

        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                sortSettings={{enabled: true}}
                selectionSettings={{mode: 'Single'}}
                onSortStart={onSortStart}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowSort={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowSort={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select a row
        await act(async () => {
            gridRef.current.selectRow(1);
        });
        
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Try to sort (will be cancelled)
        await act(async () => {
            gridRef.current.sortByColumn('OrderID', 'Descending', false);
        });

        // Selection should still be there since sort was cancelled
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);
        expect(container.querySelectorAll('tr[aria-selected="true"]').length).toBe(1);
    });

    it('should allow new selections after sort', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                sortSettings={{enabled: true}}
                selectionSettings={{mode: 'Single'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowSort={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowSort={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Sort first
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.sortByColumn('OrderID', 'Descending', false);
            }
        });

        await waitFor(() => {
            expect(gridRef.current.sortSettings.columns.length).toBe(1);
        });

        // Then try to select
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(1);
            }
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);
            expect(container.querySelectorAll('tr[aria-selected="true"]').length).toBe(1);
        });
    });

    it('should maintain correct selection after re-sorting', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                sortSettings={{enabled: true}}
                selectionSettings={{mode: 'Single'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowSort={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowSort={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Sort ascending
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
            }
        });

        await waitFor(() => {
            expect(gridRef.current.sortSettings.columns.length).toBe(1);
        });
        // Select a row
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(1);
            }
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);
        });

        // Sort descending
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.sortByColumn('OrderID', 'Descending', false);
            }
        });

        await waitFor(() => {
            expect(gridRef.current.sortSettings.columns.length).toBe(1);
        });

        // Selection should be cleared
        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
        });

        // Make new selection
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(2);
            }
        });
        
        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([2]);
        });
    });

    it('should handle shift+click range selection after sort', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                sortSettings={{enabled: true}}
                selectionSettings={{mode: 'Multiple'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowSort={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowSort={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Sort first
        await act(async () => {
            gridRef.current.sortByColumn('OrderID', 'Descending', false);
        });

        // Click first row
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[1].querySelector('.sf-grid-content-row .sf-cell'));
        });

        // Shift+click third row
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[3].querySelector('.sf-grid-content-row .sf-cell'), { shiftKey: true });
        });

        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2, 3]);
    });

    it('should handle ctrl+click multi-selection after sort', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                sortSettings={{enabled: true}}
                selectionSettings={{mode: 'Multiple'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowSort={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowSort={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Sort first
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.sortByColumn('CustomerID', 'Ascending', false);
            }
        });

        await waitFor(() => {
            expect(gridRef.current.sortSettings.columns.length).toBe(1);
        });

        // Click first row
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0]);
        });

        // Ctrl+click third row
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[2].querySelector('.sf-grid-content-row .sf-cell'), { ctrlKey: true });
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 2]);
        });
    });

    it('should handle keyboard selection after sort', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                sortSettings={{enabled: true}}
                selectionSettings={{mode: 'Multiple'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowSort={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowSort={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowSort={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Sort first
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.sortByColumn('Freight', 'Ascending', false);
            }
        });

        await waitFor(() => {
            expect(gridRef.current.sortSettings.columns.length).toBe(1);
        });

        // Select first row
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });

        // Move down with arrow and space select
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            fireEvent.keyDown(gridRef.current.element, { key: ' ', code: 'Space', shiftKey: true });
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1]);
        });
    });
});

describe('Grid Selection Event Arguments', () => {
    const sampleData = [
        { OrderID: 1, CustomerID: 'VINET', Freight: 32.38 },
        { OrderID: 2, CustomerID: 'TOMSP', Freight: 11.61 },
        { OrderID: 3, CustomerID: 'HANAR', Freight: 65.83 },
        { OrderID: 4, CustomerID: 'VICTE', Freight: 41.34 },
        { OrderID: 5, CustomerID: 'SUPRD', Freight: 51.30 }
    ];

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

    it('Multiple mode - should provide correct event args for shift+click selection', async () => {
        const onRowSelect = jest.fn() as jest.MockedFunction<(args: RowSelectEvent<any>) => void>;
        const gridRef = createRef<GridRef>();
        
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Multiple' }}
                onRowSelect={onRowSelect}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Click first row to anchor
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[1].querySelector('.sf-grid-content-row .sf-cell'));
        });

        // Shift+click third row
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[3].querySelector('.sf-grid-content-row .sf-cell'), { shiftKey: true });
        });

        // Verify onRowSelect was called with correct args
        const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectEvent<any>;
        const selectedIndexes = lastCall.selectedRowIndexes as number[];
        const currentIndexes = lastCall.selectedCurrentRowIndexes as number[];
        
        expect(selectedIndexes.sort()).toEqual([1, 2, 3]); // All selected rows
        expect(currentIndexes.sort()).toEqual([2, 3]); // Newly selected rows
        expect(Array.isArray(lastCall.data)).toBe(true);
        expect((lastCall.data as any[]).length).toBe(3); // Should contain all selected records
        expect(Array.isArray(lastCall.row)).toBe(true);
        expect((lastCall.row as Element[]).length).toBe(3); // Should contain all selected row elements
        expect(lastCall.event).toBeTruthy();
        expect(lastCall.event.shiftKey).toBe(true); // Should indicate shift key was pressed
    });

    it('Multiple mode - should provide correct data property shape in onRowSelect', async () => {
        const onRowSelect = jest.fn();
        const gridRef = createRef<GridRef>();
        
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Multiple' }}
                onRowSelect={onRowSelect}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([1, 2]);
        });

        // Verify onRowSelect data property
        const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectEvent<any>;
        const data = lastCall.data as any[];
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(2);
        expect(data[0].OrderID).toBe(2); // First selected row
        expect(data[1].OrderID).toBe(3); // Second selected row
    });

    it('Single mode - should provide correct data property shape in onRowSelect', async () => {
        const onRowSelect = jest.fn();
        const gridRef = createRef<GridRef>();
        
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Single' }}
                onRowSelect={onRowSelect}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Select a single row
        await act(async () => {
            gridRef.current.selectRow(1);
        });

        // Verify onRowSelect data property
        const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectEvent<any>;
        const { data, row, selectedRowIndex } = lastCall;
        expect(Array.isArray(data)).toBe(false);
        expect((data as any).OrderID).toBe(2); // Selected row data
        expect(selectedRowIndex).toBe(1); // Selected row index
        expect(row instanceof HTMLTableRowElement).toBe(true); // Single row element
    });

    it('Multiple mode - should provide correct event args when deselecting rows', async () => {
        const onRowDeselect = jest.fn();
        const gridRef = createRef<GridRef>();
        
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                selectionSettings={{ mode: 'Multiple' }}
                onRowDeselect={onRowDeselect}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Select multiple rows first
        await act(async () => {
            gridRef.current.selectRows([1, 2, 3]);
        });

        // Deselect middle row
        await act(async () => {
            gridRef.current.clearRowSelection([2]);
        });

        // Verify onRowDeselect event args
        const lastCall = onRowDeselect.mock.calls[onRowDeselect.mock.calls.length - 1][0] as RowSelectEvent<any>;
        const { data, row, selectedRowIndexes, deSelectedCurrentRowIndexes } = lastCall;
        expect(deSelectedCurrentRowIndexes).toEqual([2]); // Currently deselected rows
        expect(selectedRowIndexes?.sort()).toEqual([1, 3]); // Remaining selected rows
        expect(data).toBeTruthy(); // Should contain deselected row data
        expect(row).toBeTruthy(); // Should contain deselected row element
    });
});

describe('Grid Filter-Selection Interactions', () => {
    const sampleData = [
        { OrderID: 1, CustomerID: 'A', Freight: 32.38 },
        { OrderID: 2, CustomerID: 'B', Freight: 11.61 },
        { OrderID: 3, CustomerID: 'C', Freight: 65.83 },
        { OrderID: 4, CustomerID: 'D', Freight: 41.34 },
        { OrderID: 5, CustomerID: 'E', Freight: 51.30 }
    ];

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

    it('should clear selection after single-column filter', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                filterSettings={{enabled: true}}
                selectionSettings={{mode: 'Single'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowFilter={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowFilter={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select a row first
        await act(async () => {
            gridRef.current.selectRow(1);
        });
        
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Now filter a column
        await act(async () => {
            gridRef.current.filterByColumn('CustomerID', 'contains', 'B');
        });

        // Selection should be cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
        expect(container.querySelectorAll('tr[aria-selected="true"]').length).toBe(0);
    });

    it('should clear selection after multiple-column filter', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                filterSettings={{enabled: true}}
                selectionSettings={{mode: 'Multiple'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowFilter={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowFilter={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([1, 2]);
        });
        
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2]);

        // Apply multiple filters
        await act(async () => {
            gridRef.current.filterByColumn('Freight', 'greaterthan', 30);
            gridRef.current.filterByColumn('CustomerID', 'startswith', 'C');
        });

        // Selection should be cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });

    it('should allow new selections after filter operation', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                filterSettings={{enabled: true}}
                selectionSettings={{mode: 'Single'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowFilter={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowFilter={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Filter first
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.filterByColumn('CustomerID', 'startswith', 'B');
            }
        });

        // Wait for filter to be applied
        await waitFor(() => {
            expect(gridRef.current.filterSettings.columns.length).toBe(1);
        });

        // Then select a row from filtered results
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.selectRow(0);
            }
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });
    });

    it('should handle multiple selection operations on filtered data', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                filterSettings={{enabled: true}}
                selectionSettings={{mode: 'Multiple'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowFilter={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowFilter={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Filter data first
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.filterByColumn('Freight', 'greaterthan', 30);
            }
        });

        // Wait for filter to be applied
        await waitFor(() => {
            expect(gridRef.current.filterSettings.columns.length).toBe(1);
        });

        // Perform multiple selection operations on filtered data
        await act(async () => {
            if (gridRef.current) {
                // Click first row
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        // Verify selection
        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });

        // Shift+click third row
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[2].querySelector('.sf-grid-content-row .sf-cell'), { shiftKey: true });
            }
        });

        // Verify range selection
        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1, 2]);
        });

        // Ctrl+click to deselect middle row
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[1].querySelector('.sf-grid-content-row .sf-cell'), { ctrlKey: true });
            }
        });

        // Verify updated selection
        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 2]);
        });
    });

    it('should handle keyboard selection on filtered data', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                filterSettings={{enabled: true}}
                selectionSettings={{mode: 'Multiple'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowFilter={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowFilter={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Filter data first
        await act(async () => {
            if (gridRef.current) {
                gridRef.current.filterByColumn('Freight', 'greaterthan', 30);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        });

        // Wait for filter to be applied and view to be updated
        await waitFor(() => {
            expect(gridRef.current.filterSettings.columns.length).toBe(1);
        });

        // Select first row
        await act(async () => {
            if (gridRef.current) {
                fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
            }
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });

        // Use keyboard to select next row (Shift+Down)
        await act(async () => {
            if (gridRef.current) {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown', shiftKey: true });
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1]);
        });

        // Use Space to toggle selection
        await act(async () => {
            if (gridRef.current) {
                fireEvent.keyDown(gridRef.current.element, { key: ' ', code: 'Space', keyCode: 32, ctrlKey: true });
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });
    });

    it('should maintain proper selection state when clearing filters', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                filterSettings={{enabled: true}}
                selectionSettings={{mode: 'Multiple'}}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowFilter={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowFilter={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Apply filter and make selection
        await act(async () => {
            gridRef.current.filterByColumn('Freight', 'greaterthan', 30);
            await new Promise(resolve => setTimeout(resolve, 10));
            gridRef.current.selectRows([0, 1]);
        });

        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1]);

        // Clear filter
        await act(async () => {
            gridRef.current.clearFilter();
        });

        // Selection should be cleared after filter is cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);

        // Make new selection on unfiltered data
        await act(async () => {
            gridRef.current.selectRows([2, 3]);
        });

        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([2, 3]);
    });
});

describe('Grid Paging-Selection Interactions', () => {
    const generateSampleData = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
            OrderID: 10247 + i + 1,
            CustomerID: `CUST${(i + 1).toString().padStart(3, '0')}`,
            Freight: Math.round((Math.random() * 100) * 100) / 100
        }));
    };

    const sampleData = generateSampleData(50); // 50 records for paging tests

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

    it('should clear selection when changing pages', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                pageSettings={{ enabled: true, pageSize: 10 }}
                selectionSettings={{ mode: 'Single' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select a row on first page
        await act(async () => {
            gridRef.current.selectRow(1);
        });
        
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Change to page 2
        await act(async () => {
            gridRef.current.goToPage(2);
        });

        // Selection should be cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
        expect(container.querySelectorAll('tr[aria-selected="true"]').length).toBe(0);
    });

    it('should handle selection correctly when changing page size', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                pageSettings={{ enabled: true, pageSize: 10 }}
                selectionSettings={{ mode: 'Multiple' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([1, 2]);
        });
        
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2]);

        // Change page size
        await act(async () => {
            gridRef.current.pageSettings.pageSize = 20;
            gridRef.current.refresh(); // Ensure grid updates with new page size
        });

        // Wait for grid to update with new page size
        await waitFor(() => {
            expect(gridRef.current.pageSettings.pageSize).toBe(20);
        });

        // Selection should be cleared after page size change
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });

    it('should maintain selection when toggling paging on/off', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                pageSettings={{ enabled: false }}
                selectionSettings={{ mode: 'Single' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select a row with paging disabled
        await act(async () => {
            gridRef.current.selectRow(1);
        });
        
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Enable paging
        await act(async () => {
            gridRef.current.pageSettings.enabled = true;
            gridRef.current.pageSettings.pageSize = 10;
            gridRef.current.refresh(); // Ensure grid updates with new paging settings
        });

        // Wait for grid to update with new paging settings
        await waitFor(() => {
            expect(gridRef.current.pageSettings.enabled).toBe(true);
            expect(gridRef.current.pageSettings.pageSize).toBe(10);
        });

        // Selection should be cleared when enabling paging
        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
        });
    });

    it('should trigger proper events during page changes', async () => {
        const onRowDeselecting = jest.fn();
        const onRowDeselect = jest.fn();
        const gridRef = createRef<GridRef>();
        
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                pageSettings={{ enabled: true, pageSize: 10 }}
                selectionSettings={{ mode: 'Multiple' }}
                onRowDeselecting={onRowDeselecting}
                onRowDeselect={onRowDeselect}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select multiple rows
        await act(async () => {
            gridRef.current.selectRows([1, 2]);
        });
        
        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2]);

        // Change page - should trigger deselection events
        await act(async () => {
            gridRef.current.goToPage(2);
        });

        expect(onRowDeselecting).toHaveBeenCalled();
        expect(onRowDeselect).toHaveBeenCalled();
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });

    it('should handle keyboard selection correctly with paging', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                pageSettings={{ enabled: true, pageSize: 10 }}
                selectionSettings={{ mode: 'Multiple' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        // Select last row of first page with keyboard
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[9].querySelector('.sf-grid-content-row .sf-cell'));
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([9]);

        // Try to extend selection to next page using keyboard (shouldn't work)
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown', shiftKey: true });
        });

        // Selection should remain on current page
        expect(gridRef.current.getSelectedRowIndexes()).toEqual([9]);

        // Change page
        await act(async () => {
            gridRef.current.goToPage(2);
        });

        // Selection should be cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);

        // Make new selection on second page
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
    });
});

describe('Grid Search-Selection Interactions', () => {
    const sampleData = [
        { OrderID: 1, CustomerID: 'VINET', Freight: 32.38 },
        { OrderID: 2, CustomerID: 'TOMSP', Freight: 11.61 },
        { OrderID: 3, CustomerID: 'HANAR', Freight: 65.83 },
        { OrderID: 4, CustomerID: 'VICTE', Freight: 41.34 },
        { OrderID: 5, CustomerID: 'SUPRD', Freight: 51.30 }
    ];

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
            toJSON: () => { }
        }));
    });

    it('should clear selection when search changes', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                searchSettings={{ enabled: true }}
                selectionSettings={{ mode: 'Single' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Select a row
        await act(async () => {
            gridRef.current.selectRow(1);
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);

        // Perform search
        await act(async () => {
            gridRef.current.search('VINET');
        });

        // Selection should be cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
        expect(container.querySelectorAll('tr[aria-selected="true"]').length).toBe(0);
    });

    it('should maintain correct selection after multiple searches', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                searchSettings={{ enabled: true }}
                selectionSettings={{ mode: 'Multiple' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Search for a term
        await act(async () => {
            gridRef.current.search('TOM');
            await new Promise(resolve => setTimeout(resolve, 500));
        });

        // Select row from search results
        await act(async () => {
            gridRef.current.selectRow(0);
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });

        // Change search term
        await act(async () => {
            gridRef.current.search('VIN');
            await new Promise(resolve => setTimeout(resolve, 500));
        });

        // Selection should be cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);

        // Make new selection from new search results
        await act(async () => {
            gridRef.current.selectRow(0);
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
    });

    it('should handle keyboard selection with search results', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                searchSettings={{ enabled: true }}
                selectionSettings={{ mode: 'Multiple' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Search for multiple matches
        await act(async () => {
            gridRef.current.search('T'); // Should match TOMSP, VICTE
            await new Promise(resolve => setTimeout(resolve, 500));
        });

        // Select first row
        await act(async () => {
            fireEvent.click(gridRef.current.getRows()[0].querySelector('.sf-grid-content-row .sf-cell'));
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });

        // Use Shift+Arrow to extend selection
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown', shiftKey: true });
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([0, 1]);
        });

        // Use Ctrl+Space to toggle selection
        await act(async () => {
            fireEvent.keyDown(gridRef.current.element, { key: ' ', code: 'Space', keyCode: 32, ctrlKey: true });
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });
    });

    it('should handle selection after clearing search', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                searchSettings={{ enabled: true }}
                selectionSettings={{ mode: 'Multiple' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" />
                    <Column field="CustomerID" headerText="Customer" width="120" />
                    <Column field="Freight" headerText="Freight" width="120" />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Search and select
        await act(async () => {
            gridRef.current.search('TOM');
            gridRef.current.selectRow(0);
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        // Clear search
        await act(async () => {
            gridRef.current.search('');
        });

        // Selection should be cleared when search is cleared
        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);

        // Select multiple rows in full data view
        await act(async () => {
            gridRef.current.selectRows([1, 2]);
        });

        expect(gridRef.current.getSelectedRowIndexes().sort()).toEqual([1, 2]);
    });

    it('should maintain proper selection state with search and filter combined', async () => {
        const gridRef = createRef<GridRef>();
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={sampleData}
                height={400}
                searchSettings={{ enabled: true }}
                filterSettings={{ enabled: true }}
                selectionSettings={{ mode: 'Multiple' }}
            >
                <Columns>
                    <Column field="OrderID" headerText="Order ID" width="120" allowFilter={true} />
                    <Column field="CustomerID" headerText="Customer" width="120" allowFilter={true} />
                    <Column field="Freight" headerText="Freight" width="120" allowFilter={true} />
                </Columns>
            </Grid>
        );

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => { expect(gridRef.current).not.toBeNull(); });

        // Apply filter first
        await act(async () => {
            gridRef.current.filterByColumn('Freight', 'greaterthan', 30);
        });

        // Then search within filtered results
        await act(async () => {
            gridRef.current.search('T');
        });

        // Select from combined filter + search results
        await act(async () => {
            gridRef.current.selectRow(0);
        });

        expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);

        // Change search - should clear selection
        await act(async () => {
            gridRef.current.search('V');
        });

        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);

        // Clear filter - should clear selection
        await act(async () => {
            gridRef.current.clearFilter();
        });

        expect(gridRef.current.getSelectedRowIndexes().length).toBe(0);
    });
});

describe('Grid Toolbar & Selection Integration', () => {
    const toolbarData = [
        { OrderID: 1, CustomerID: 'VINET', Freight: 32.38 },
        { OrderID: 2, CustomerID: 'TOMSP', Freight: 11.61 },
        { OrderID: 3, CustomerID: 'HANAR', Freight: 65.83 }
    ];

    const toolbarColumns = [
        { field: 'OrderID', headerText: 'Order ID', width: '120', isPrimaryKey: true },
        { field: 'CustomerID', headerText: 'Customer ID', width: '120', validationRules: { required: true, minLength: 3 } },
        { field: 'Freight', headerText: 'Freight', width: '120', validationRules: { required: true, min: 0 } }
    ];

    let gridRef: RefObject<GridRef>;
    let container: HTMLElement;

    beforeEach(async () => {
        mockDOMMethods();
        gridRef = createRef<GridRef>();
        const result = render(
            <Grid
                ref={gridRef}
                dataSource={toolbarData}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{ allowAdd: true, allowEdit: true, allowDelete: true, mode: 'Normal' }}
                selectionSettings={{ mode: 'Multiple' }}
                height={400}
            >
                <Columns>
                    {toolbarColumns.map((col) => (
                        <Column {...col} />
                    ))}
                </Columns>
            </Grid>
        );
        container = result.container;

        // Wait for grid and toolbar to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        });

        await waitFor(() => {
            expect(gridRef.current).not.toBeNull();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should preserve existing selection after toolbar Add + Update', async () => {
        // Select second row (index 1)
        await act(async () => {
            gridRef.current.selectRow(1, true);
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([1]);
        });

        // Click Add button
        await act(async () => {
            screen.getByText('Add').closest('button').click();
        });

        // Fill mandatory inputs in the add form
        await act(async () => {
            const orderInput = container.querySelector('#grid-edit-OrderID') as HTMLInputElement;
            const customerInput = container.querySelector('#grid-edit-CustomerID') as HTMLInputElement;
            const freightInput = container.querySelector('#grid-edit-Freight') as HTMLInputElement;

            fireEvent.change(orderInput, { target: { value: '6' } });
            fireEvent.change(customerInput, { target: { value: 'NEWCUS' } });
            fireEvent.change(freightInput, { target: { value: '10' } });
        });

        // Click Update to save the new record
        await act(async () => {
            screen.getByText('Update').closest('button').click();
            // give some time for internal save
            await new Promise((res) => setTimeout(res, 50));
        });

        // Wait until add/edit row is gone
        await waitFor(() => {
            expect(container.querySelector('.sf-addedrow, .sf-edit-row, .sf-grid-edit-form')).toBeNull();
        });

        await waitFor(() => {
            expect(gridRef.current.getSelectedRowIndexes()).toEqual([0]);
        });
    });
});
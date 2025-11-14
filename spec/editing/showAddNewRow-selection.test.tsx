import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionType, Grid } from '../../src/index';
import { ColumnProps } from '../../src/grid/types/column.interfaces';
import { act, createRef } from 'react';
import { GridRef } from '../../src/grid/types/grid.interfaces';

// Mock ResizeObserver for Jest environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));
// Mock data for testing
const mockData = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' }
];

const mockColumns: ColumnProps[] = [
    { field: 'id', headerText: 'ID', isPrimaryKey: true, width: 100 },
    { field: 'name', headerText: 'Name', width: 150, allowEdit: true },
    { field: 'age', headerText: 'Age', width: 100, allowEdit: true },
    { field: 'email', headerText: 'Email', width: 200, allowEdit: true }
];

describe('Grid showAddNewRow Selection Functionality', () => {
    beforeEach(() => {
        // Clear any previous DOM state
        document.body.innerHTML = '';
    });

    afterEach(() => {
        // Clean up after each test
        document.body.innerHTML = '';
    });

    test('should allow row selection when showAddNewRow is enabled', async () => {
        const onRowSelect = jest.fn();
        const gridRef = createRef<GridRef>()
        const { container } = render(
            <Grid
                ref={gridRef}
                dataSource={mockData}
                columns={mockColumns}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true,
                    newRowPosition: 'Bottom'
                }}
                onRowSelect={onRowSelect}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Find the first data row (not the add new row)
        const firstDataRow = screen.getByText('John Doe').closest('td');
        expect(firstDataRow).toBeInTheDocument();

        await act(async () => {
            // Click on the first data row to select it
            fireEvent.click(firstDataRow!);
        });

        // Wait for selection to be processed
        await waitFor(() => {
            // Check if the row has selection styling
            expect(firstDataRow.closest('tr')).toHaveAttribute('aria-selected', 'true');;
        }, { timeout: 1000 });

        // Verify that the onRowSelect callback was called
        expect(onRowSelect).toHaveBeenCalled();
        await act(async() => {
            const nameInput: HTMLInputElement = container.querySelector('#grid-edit-name');
            fireEvent.change(nameInput, { target: { value: 'syncfusion' }});
            nameInput.value = 'syncfusion';
            await new Promise(resolve => setTimeout(resolve, 100));
            fireEvent.blur(nameInput);
            await new Promise(resolve => setTimeout(resolve, 100));
            gridRef.current?.cancelDataChanges();
            await new Promise(resolve => setTimeout(resolve, 100));
        });
    });

    test('should allow multiple row selection when showAddNewRow is enabled', async () => {
        const onRowSelect = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                selectionSettings={{
                    mode: 'Multiple'
                }}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true
                }}
                onRowSelect={onRowSelect}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Find the first and second data rows
        const firstDataRow = screen.getByText('John Doe').closest('tr');
        const secondDataRow = screen.getByText('Jane Smith').closest('tr');
        
        expect(firstDataRow).toBeInTheDocument();
        expect(secondDataRow).toBeInTheDocument();

        await act(async () => {
            // Click on the first data row to select it
            fireEvent.click(firstDataRow.querySelector('td')!);
        });

        // Wait for first selection
        await waitFor(() => {
            expect(firstDataRow).toHaveAttribute('aria-selected', 'true');;
        });

        await act(async () => {
            // Ctrl+Click on the second data row to add it to selection
            fireEvent.click(secondDataRow.querySelector('td')!, { ctrlKey: true });
        });

        // Wait for second selection
        await waitFor(() => {
            expect(secondDataRow).toHaveAttribute('aria-selected', 'true');;
        });

        // Both rows should be selected
        expect(firstDataRow).toHaveAttribute('aria-selected', 'true');;
        expect(secondDataRow).toHaveAttribute('aria-selected', 'true');;
    });

    test('should maintain selection when clicking between data rows with showAddNewRow enabled', async () => {
        const onRowSelect = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true
                }}
                onRowSelect={onRowSelect}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Find the first and second data rows
        const firstDataRow = screen.getByText('John Doe').closest('tr');
        const secondDataRow = screen.getByText('Jane Smith').closest('tr');
        
        expect(firstDataRow).toBeInTheDocument();
        expect(secondDataRow).toBeInTheDocument();

        await act(async () => {
            // Click on the first data row to select it
            fireEvent.click(firstDataRow.querySelector('td')!);
        });

        // Wait for first selection
        await waitFor(() => {
            expect(firstDataRow).toHaveAttribute('aria-selected', 'true');;
        });

        await act(async () => {
            // Click on the second data row to select it (should deselect first)
            fireEvent.click(secondDataRow.querySelector('td')!);
        });

        // Wait for second selection
        await waitFor(() => {
            expect(secondDataRow).toHaveAttribute('aria-selected', 'true');;
        });

        // First row should no longer be selected, second should be selected
        expect(firstDataRow).not.toHaveAttribute('aria-selected', 'true');;
        expect(secondDataRow).toHaveAttribute('aria-selected', 'true');;
    });

    test('should allow row selection even when add new row is present', async () => {
        const onRowSelect = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true,
                    newRowPosition: 'Top'
                }}
                onRowSelect={onRowSelect}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render with add new row
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // The add new row should be present (typically at the top)
        const addNewRow = document.querySelector('.sf-grid-add-row');
        expect(addNewRow).toBeInTheDocument();

        // Find a data row
        const dataRow = screen.getByText('John Doe').closest('tr');
        expect(dataRow).toBeInTheDocument();

        await act(async () => {
            // Click on the data row to select it
            fireEvent.click(dataRow.querySelector('td')!);
        });

        // Wait for selection to be processed
        await waitFor(() => {
            expect(dataRow).toHaveAttribute('aria-selected', 'true');;
        });

        // Verify that the onRowSelect callback was called
        expect(onRowSelect).toHaveBeenCalled();
    });

    test('should not interfere with add new row functionality when selecting data rows', async () => {
        const onActionComplete = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true
                }}
                onFormRender={onActionComplete}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // The add new row should be present and functional
        const addNewRow = document.querySelector('.sf-grid-add-row');
        expect(addNewRow).toBeInTheDocument();

        // Find a data row and select it
        const dataRow = screen.getByText('John Doe').closest('tr');
        expect(dataRow).toBeInTheDocument();

        await act(async () => {
            // Click on the data row to select it
            fireEvent.click(dataRow.querySelector('td')!);
        });

        // Wait for selection
        await waitFor(() => {
            expect(dataRow).toHaveAttribute('aria-selected', 'true');;
        });

        // The add new row should still be present and functional
        expect(addNewRow).toBeInTheDocument();
        
        // Try to interact with add new row (e.g., click on an input field)
        const addNewRowInput = addNewRow.querySelector('input');
        await act(async () => {
            if (addNewRowInput) {
                fireEvent.click(addNewRowInput);
                fireEvent.change(addNewRowInput, { target: { value: 'Test Name' } });
            }
        });
    });

    // CRITICAL FIX: Toolbar Integration Tests for showAddNewRow functionality
    // Based on the comparison documentation, these tests ensure proper toolbar behavior
    // when showAddNewRow is enabled and during editing operations

    test('should properly enable/disable toolbar items when showAddNewRow is active', async () => {
        const onToolbarItemClick = jest.fn();
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true
                }}
                onToolbarItemClick={onToolbarItemClick}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render with toolbar
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Check initial toolbar state with showAddNewRow active
        const addButton = screen.getByText('Add');
        const editButton = screen.getByText('Edit');
        const deleteButton = screen.getByText('Delete');
        const updateButton = screen.getByText('Update');
        const cancelButton = screen.getByText('Cancel');

        // Initially with showAddNewRow active (no edited row):
        // - Add should be enabled (for showAddNewRow)
        // - Edit/Delete should be disabled (no selection)
        // - Update/Cancel should be enabled (for showAddNewRow)
        expect(addButton).toBeInTheDocument();
        expect(editButton).toBeInTheDocument();
        expect(deleteButton).toBeInTheDocument();
        expect(updateButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
        await waitFor(() => {
            // Edit and Delete should be disabled initially (no selection)
            expect(editButton.closest('button')).toHaveAttribute('disabled');
            expect(deleteButton.closest('button')).toHaveAttribute('disabled');
        });

        // Update and Cancel should be enabled for showAddNewRow
        expect(updateButton.closest('button')).not.toHaveAttribute('disabled');
        expect(cancelButton.closest('button')).not.toHaveAttribute('disabled');
        await act(async() => {
            const nameInput: HTMLInputElement = container.querySelector('#grid-edit-name');
            fireEvent.change(nameInput, { target: { value: 'syncfusion' }});
            nameInput.value = 'syncfusion';
            await new Promise(resolve => setTimeout(resolve, 100));
            fireEvent.click(cancelButton);
            cancelButton.click();
            await new Promise(resolve => setTimeout(resolve, 500));
        })
    });

    test('should disable showAddNewRow inputs when editing existing row with toolbar integration', async () => {
        const onRowEditStart = jest.fn();
        const onToolbarItemClick = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true,
                    editOnDoubleClick: true
                }}
                onRowEditStart={onRowEditStart}
                onToolbarItemClick={onToolbarItemClick}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // The add new row should be present initially
        let addNewRow = document.querySelector('.sf-grid-add-row');
        expect(addNewRow).toBeInTheDocument();

        // Find and select a data row
        const dataRow = screen.getByText('John Doe').closest('tr');
        expect(dataRow).toBeInTheDocument();

        await act(async () => {
            // Click to select the row first
            fireEvent.click(dataRow.querySelector('td')!);
        });

        // Wait for selection
        await waitFor(() => {
            expect(dataRow).toHaveAttribute('aria-selected', 'true');;
        });

        await act(async () => {
            // Double-click to start editing the existing row
            fireEvent.doubleClick(dataRow.querySelector('td')!);
        });

        // Wait for edit mode to start
        await waitFor(() => {
            expect(onRowEditStart).toHaveBeenCalled();
        });

        await waitFor(() => {
            const editRecord = container.querySelector('.sf-grid-edit-row');
            expect(editRecord).toBeInTheDocument();
            addNewRow = document.querySelector('.sf-grid-add-row');
        }, {timeout: 2000});

        // Check that showAddNewRow inputs are disabled when editing existing row
        await waitFor(() => {
            // Check that showAddNewRow inputs are disabled when editing existing row
            const addNewRowInputs = addNewRow?.querySelectorAll('input');
            addNewRowInputs?.forEach(async (input) => {
                expect(input).toHaveAttribute('disabled');
            });
        }, { timeout: 2000 });

        // Check toolbar state when editing existing row:
        // - Add should be disabled
        // - Edit should be disabled
        // - Delete should be disabled
        // - Update should be enabled
        // - Cancel should be enabled
        const addButton = screen.getByText('Add');
        const editButton = screen.getByText('Edit');
        const deleteButton = screen.getByText('Delete');
        const updateButton = screen.getByText('Update');
        const cancelButton = screen.getByText('Cancel');

        await waitFor(() => {
            expect(addButton.closest('button')).toHaveAttribute('disabled');
            expect(editButton.closest('button')).toHaveAttribute('disabled');
            expect(deleteButton.closest('button')).toHaveAttribute('disabled');
            expect(updateButton.closest('button')).not.toHaveAttribute('disabled');
            expect(cancelButton.closest('button')).not.toHaveAttribute('disabled');
        });
    });

    test('should re-enable showAddNewRow inputs after saving edited row', async () => {
        const onActionComplete = jest.fn();
        const onToolbarItemClick = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true,
                    editOnDoubleClick: true
                }}
                onDataChangeComplete={onActionComplete}
                onToolbarItemClick={onToolbarItemClick}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // The add new row should be present initially
        const addNewRow = document.querySelector('.sf-grid-add-row');
        expect(addNewRow).toBeInTheDocument();

        // Find and select a data row
        const dataRow = screen.getByText('John Doe').closest('tr');
        expect(dataRow).toBeInTheDocument();

        await act(async () => {
            // Click to select the row first
            fireEvent.click(dataRow.querySelector('td')!);
        });

        // Wait for selection
        await waitFor(() => {
            expect(dataRow).toHaveAttribute('aria-selected', 'true');;
        });

        await act(async () => {
            // Double-click to start editing
            fireEvent.doubleClick(dataRow.querySelector('td')!);
        });

        // Wait for edit mode
        await waitFor(() => {
            const editForm = document.querySelector('.sf-grid-edit-row');
            expect(editForm).toBeInTheDocument();
        });

        // Click Update button to save changes
        const updateButton = screen.getByText('Update');
        await act(async () => {
            fireEvent.click(updateButton.closest('button'));
        });

        // Wait for save to complete
        await waitFor(() => {
            expect(onActionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: ActionType.Edit,
                    rowIndex: 0
                })
            );
        });

        // After save, showAddNewRow inputs should be re-enabled
        const addNewRowInputs = addNewRow?.querySelectorAll('input');
        addNewRowInputs?.forEach(input => {
            expect(input).not.toHaveAttribute('disabled');
        });

        // Toolbar should return to showAddNewRow state:
        // - Update/Cancel should be enabled (for showAddNewRow)
        const cancelButton = screen.getByText('Cancel');

        await waitFor(() => {
            expect(updateButton.closest('button')).not.toHaveAttribute('disabled');
            expect(cancelButton.closest('button')).not.toHaveAttribute('disabled');
        });
    });

    test('should re-enable showAddNewRow inputs after canceling edited row', async () => {
        const onActionComplete = jest.fn();
        const onToolbarItemClick = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true,
                    editOnDoubleClick: true
                }}
                onDataChangeCancel={onActionComplete}
                onToolbarItemClick={onToolbarItemClick}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // The add new row should be present initially
        const addNewRow = document.querySelector('.sf-grid-add-row');
        expect(addNewRow).toBeInTheDocument();

        // Find and select a data row
        const dataRow = screen.getByText('John Doe').closest('tr');
        expect(dataRow).toBeInTheDocument();

        await act(async () => {
            // Click to select the row first
            fireEvent.click(dataRow.querySelector('td')!);
        });

        // Wait for selection
        await waitFor(() => {
            expect(dataRow).toHaveAttribute('aria-selected', 'true');;
        });

        await act(async() => {
            // Double-click to start editing
            fireEvent.doubleClick(dataRow.querySelector('td')!);
        });

        // Wait for edit mode
        await waitFor(() => {
            const editForm = document.querySelector('.sf-grid-edit-row');
            expect(editForm).toBeInTheDocument();
        });

        // Click Cancel button to cancel changes
        const cancelButton = screen.getByText('Cancel');
        await act(async () => {
            fireEvent.click(cancelButton.closest('button'));
        });

        // Wait for cancel to complete
        await waitFor(() => {
            expect(onActionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                    rowIndex: 0
                })
            );
        });

        // After cancel, showAddNewRow inputs should be re-enabled
        const addNewRowInputs = addNewRow?.querySelectorAll('input');
        addNewRowInputs?.forEach(input => {
            expect(input).not.toHaveAttribute('disabled');
        });

        // Toolbar should return to showAddNewRow state
        const updateButton = screen.getByText('Update');

        await waitFor(() => {
            expect(updateButton.closest('button')).not.toHaveAttribute('disabled');
            expect(cancelButton.closest('button')).not.toHaveAttribute('disabled');
        });
    });

    test('should handle toolbar button clicks correctly with showAddNewRow enabled', async () => {
        const onToolbarItemClick = jest.fn();
        const onActionComplete = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true
                }}
                onToolbarItemClick={onToolbarItemClick}
                onDataChangeCancel={onActionComplete}
                onDataChangeComplete={onActionComplete}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        await act(async () => {
            // Test Update button click (should save showAddNewRow data)
            const updateButton = screen.getByText('Update');
            fireEvent.click(updateButton.closest('button'));
        });

        // Should trigger toolbar click event
        expect(onToolbarItemClick).toHaveBeenCalledWith(
            expect.objectContaining({
                item: expect.objectContaining({
                    id: expect.stringContaining('_update')
                })
            })
        );

        // Test Cancel button click (should cancel showAddNewRow)
        const cancelButton = screen.getByText('Cancel');
        await act(async () => {
            fireEvent.click(cancelButton.closest('button'));
        });

        // Should trigger toolbar click event
        expect(onToolbarItemClick).toHaveBeenCalledWith(
            expect.objectContaining({
                item: expect.objectContaining({
                    id: expect.stringContaining('_cancel')
                })
            })
        );
    });

    test('should maintain proper toolbar state when switching between showAddNewRow and row editing', async () => {
        const onToolbarItemClick = jest.fn();
        const onRowEditStart = jest.fn();
        const onActionComplete = jest.fn();
        
        const { container } = render(
            <Grid
                dataSource={mockData}
                columns={mockColumns}
                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                editSettings={{
                    allowAdd: true,
                    allowEdit: true,
                    allowDelete: true,
                    showAddNewRow: true,
                    editOnDoubleClick: true
                }}
                onToolbarItemClick={onToolbarItemClick}
                onRowEditStart={onRowEditStart}
                onDataChangeComplete={onActionComplete}
            />
        );

        // Wait for grid to render
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });

        // Wait for grid to render
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Initial state: showAddNewRow active, no edited row
        const updateButton = screen.getByText('Update');
        const cancelButton = screen.getByText('Cancel');
        const editButton = screen.getByText('Edit');
        const deleteButton = screen.getByText('Delete');

        // Update/Cancel should be enabled for showAddNewRow
        expect(updateButton.closest('button')).not.toHaveAttribute('disabled');
        expect(cancelButton.closest('button')).not.toHaveAttribute('disabled');
        await waitFor(() => {
            // Edit/Delete should be disabled (no selection)
            expect(editButton.closest('button')).toHaveAttribute('disabled');
            expect(deleteButton.closest('button')).toHaveAttribute('disabled');
        });

        // Select a row
        const dataRow = screen.getByText('John Doe').closest('tr');
        await act(async () => {
            fireEvent.click(dataRow.querySelector('td')!);
        });

        // Wait for selection
        await waitFor(() => {
            expect(dataRow).toHaveAttribute('aria-selected', 'true');;
        });

        // After selection, Edit/Delete should be enabled
        await waitFor(() => {
            expect(editButton.closest('button')).not.toHaveAttribute('disabled');
            expect(deleteButton.closest('button')).not.toHaveAttribute('disabled');
        });

        await act(async() => {
            // Double-click to start editing existing row
            fireEvent.doubleClick(dataRow.querySelector('td')!);
        });

        // Wait for edit mode
        await waitFor(() => {
            expect(onRowEditStart).toHaveBeenCalled();
        });

        // During existing row edit:
        // - Edit/Delete should be disabled
        // - Update/Cancel should remain enabled
        await waitFor(() => {
            expect(editButton.closest('button')).toHaveAttribute('disabled');
            expect(deleteButton.closest('button')).toHaveAttribute('disabled');
            expect(updateButton.closest('button')).not.toHaveAttribute('disabled');
            expect(cancelButton.closest('button')).not.toHaveAttribute('disabled');
        });

        await act(async () => {
            // Save the edit
            fireEvent.click(updateButton);
        });

        // Wait for save to complete
        await waitFor(() => {
            expect(onActionComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                    rowIndex: 1
                })
            );
        });

        // After save, should return to showAddNewRow state
        // Update/Cancel should remain enabled for showAddNewRow
        await waitFor(() => {
            expect(updateButton.closest('button')).not.toHaveAttribute('disabled');
            expect(cancelButton.closest('button')).not.toHaveAttribute('disabled');
        });
    });
});
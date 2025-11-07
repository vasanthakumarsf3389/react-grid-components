import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { ActionType, Grid } from '../../src/index';
import { GridRef } from '../../src/grid/types/grid.interfaces';
import { ColumnProps } from '../../src/grid/types/column.interfaces';
import { createRef, RefObject } from 'react';
import { Column, Columns } from '../../src/index';
import userEvent from '@testing-library/user-event';

describe('Inline Editing Focus Management', () => {
    const sampleData = [
        { id: 1, name: 'John Doe', age: 30, active: true, email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', age: 25, active: false, email: 'jane@example.com' },
        { id: 3, name: 'Bob Johnson', age: 35, active: true, email: 'bob@example.com' }
    ];

    const defaultColumns: ColumnProps[] = [
        { field: 'id', headerText: 'ID', isPrimaryKey: true, width: 80 },
        { field: 'name', headerText: 'Name', allowEdit: true, width: 150 },
        { field: 'age', headerText: 'Age', type: 'number', allowEdit: true, width: 100 },
        { field: 'active', headerText: 'Active', type: 'boolean', allowEdit: true, width: 100 },
        { field: 'email', headerText: 'Email', allowEdit: true, width: 200 }
    ];

    const altColumns: ColumnProps[] = [
        { field: 'OrderID', headerText: 'Order ID', width: 120, isPrimaryKey: true },
        { field: 'CustomerID', headerText: 'Customer ID', width: 150, allowEdit: true },
        { field: 'Freight', headerText: 'Freight', width: 100, allowEdit: true },
        { field: 'ShipCountry', headerText: 'Ship Country', width: 150, allowEdit: true }
    ];

    const defaultProps = {
        dataSource: sampleData,
        height: 400,
        width: 800,
        editSettings: { allowEdit: true, allowAdd: true, allowDelete: true, mode: 'Normal' as const }
    };

    let gridRef: RefObject<GridRef>;

    beforeEach(() => {
        gridRef = createRef<GridRef>();
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
        if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).blur();
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('Edit Mode Integration', () => {
        let container: HTMLElement;
        let onActionComplete: jest.Mock;

        beforeEach(async () => {
            onActionComplete = jest.fn();
            const renderResult = render(
                <Grid ref={gridRef} {...defaultProps} onDataChangeComplete={onActionComplete}>
                    <Columns>
                        {altColumns.map(col => <Column key={col.field} {...col} />)}
                    </Columns>
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            }, { timeout: 100 });
        });

        it('should skip navigation when grid is in edit mode', async () => {
            await act(async () => {
                gridRef.current?.selectRow(0);
                gridRef.current?.editRecord();
            });
            const editInput = container.querySelector('[id="grid-edit-CustomerID"]') as HTMLInputElement;
            await waitFor(() => {
                expect(gridRef.current?.isEdit).toBe(true);
                expect(editInput).not.toBeNull();
                editInput.focus();
                expect(document.activeElement).toBe(editInput);
            }, { timeout: 100 });
            await act(async () => {
                fireEvent.keyDown(editInput, { key: 'ArrowRight', code: 'ArrowRight' });
            });
            expect(document.activeElement).toBe(editInput);
            await act(async () => {
                fireEvent.keyDown(editInput, { key: 'ArrowDown', code: 'ArrowDown' });
            });
            expect(document.activeElement).toBe(editInput);
            expect(gridRef.current?.isEdit).toBe(true);
        });

        it('should allow Tab navigation between edit fields', async () => {
            await act(async () => {
                gridRef.current?.selectRow(0);
                gridRef.current?.editRecord();
            });
            const customerInput = container.querySelector('[id="grid-edit-CustomerID"]') as HTMLInputElement;
            const freightInput = container.querySelector('[id="grid-edit-Freight"]') as HTMLInputElement;
            await waitFor(() => {
                expect(customerInput).not.toBeNull();
                expect(freightInput).not.toBeNull();
                customerInput.focus();
                expect(document.activeElement).toBe(customerInput);
            }, { timeout: 100 });
            await userEvent.click(customerInput);
            await userEvent.clear(customerInput);
            await userEvent.tab();
            await waitFor(() => {
                expect(document.activeElement).toBe(freightInput);
            }, { timeout: 100 });
        });

        it('should allow Enter and Escape keys in edit mode', async () => {
            await act(async () => {
                gridRef.current?.selectRow(0);
                gridRef.current?.editRecord();
            });
            const editInput = container.querySelector('[id="grid-edit-CustomerID"]') as HTMLInputElement;
            await waitFor(() => {
                expect(editInput).not.toBeNull();
                editInput.focus();
                expect(document.activeElement).toBe(editInput);
            }, { timeout: 100 });
            await act(async () => {
                fireEvent.change(editInput, { target: { value: 'MODIFIED' } });
                fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' });
            });
            await waitFor(() => {
                expect(onActionComplete).toHaveBeenCalledWith(
                    expect.objectContaining({ action: ActionType.Edit, rowIndex: 0 })
                );
            }, { timeout: 100 });
        });

        it('should resume grid navigation after exiting edit mode', async () => {
            await act(async () => {
                gridRef.current?.selectRow(0);
                gridRef.current?.editRecord();
            });
            await act(async () => {
                gridRef.current?.saveDataChanges();
            });
            await waitFor(() => {
                expect(gridRef.current?.isEdit).toBe(false);
            }, { timeout: 100 });
            const cells = container.querySelectorAll('td');
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(cells[0]);
            }, { timeout: 100 });
            await act(async () => {
                fireEvent.keyDown(gridRef.current!.element, { key: 'ArrowRight', code: 'ArrowRight' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).not.toBe(cells[0]);
            }, { timeout: 100 });
        });

        it('should handle focus properly when switching between edit and normal mode', async () => {
            const cells = container.querySelectorAll('td');
            await act(async () => {
                fireEvent.click(cells[1]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBe(cells[1]);
            }, { timeout: 100 });
            await act(async () => {
                gridRef.current?.editRecord();
            });
            await waitFor(() => {
                const editInput = container.querySelector('[id="grid-edit-CustomerID"]') as HTMLInputElement;
                expect(editInput).not.toBeNull();
                expect(document.activeElement).toBe(editInput);
            }, { timeout: 100 });
            await act(async () => {
                gridRef.current?.cancelDataChanges();
            });
            await waitFor(() => {
                expect(gridRef.current?.isEdit).toBe(false);
            }, { timeout: 100 });
        });
    });

    describe('Auto-focus and Typing Persistence', () => {
        let container: HTMLElement;

        beforeEach(async () => {
            const renderResult = render(<Grid ref={gridRef} {...defaultProps} columns={defaultColumns} />);
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            }, { timeout: 100 });
        });

        it('should auto-focus first editable field only on startEdit', async () => {
            await act(async () => {
                const firstRow = gridRef.current?.getRowByIndex(0);
                expect(firstRow).toBeInTheDocument();
                container?.querySelector?.('.syncfusion-react-license-error')?.remove?.();
                fireEvent.doubleClick(firstRow!.querySelector('td')!);
            });
            await waitFor(() => {
                const editRecord = container.querySelector('.sf-grid-edit-row');
                expect(editRecord).toBeInTheDocument();
                const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                expect(document.activeElement).toBe(nameInput); // due to dynamic license banner prerender core team method, randomly failure happens.
            }, { timeout: 100 });
        });

        it('should not auto-focus if another edit field is already focused', async () => {
            const mockInput = document.createElement('input');
            mockInput.className = 'sf-textbox';
            container.appendChild(mockInput);
            await act(async () => {
                mockInput.focus();
            });
            await act(async () => {
                const firstRow = gridRef.current?.getRowByIndex(0);
                expect(firstRow).toBeInTheDocument();
                fireEvent.doubleClick(firstRow!.querySelector('td')!);
            });
            await waitFor(() => {
                const editRecord = container.querySelector('.sf-grid-edit-row');
                expect(editRecord).toBeInTheDocument();
                expect(document.activeElement).toBe(mockInput);
            }, { timeout: 100 });
            container.removeChild(mockInput);
        });

        it('should maintain focus on the same input during continuous typing', async () => {
            await act(async () => {
                const firstRow = gridRef.current?.getRowByIndex(0);
                expect(firstRow).toBeInTheDocument();
                fireEvent.doubleClick(firstRow!.querySelector('td')!);
            });
            let nameInput: HTMLInputElement;
            await waitFor(() => {
                nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                expect(document.activeElement).toBe(nameInput);
            }, { timeout: 100 });
            const testString = 'New Name Value';
            for (let i = 0; i < testString.length; i++) {
                const currentValue = testString.substring(0, i + 1);
                await act(async () => {
                    fireEvent.change(nameInput, { target: { value: currentValue } });
                });
                expect(document.activeElement).toBe(nameInput);
                expect(nameInput.value).toBe(currentValue);
            }
            expect(nameInput.value).toBe(testString);
            expect(document.activeElement).toBe(nameInput);
        });

        it('should maintain focus during rapid typing in numeric field', async () => {
            await act(async () => {
                const firstRow = gridRef.current?.getRowByIndex(0);
                expect(firstRow).toBeInTheDocument();
                fireEvent.doubleClick(firstRow!.querySelector('td')!);
                await new Promise(resolve => setTimeout(resolve, 100));
            });
            let ageInput: HTMLInputElement;
            await waitFor(() => {
                ageInput = container.querySelector('#grid-edit-age') as HTMLInputElement;
                expect(ageInput).toBeInTheDocument();
            });
            await act(async () => {
                ageInput.focus();
                fireEvent.focus(ageInput);
                await new Promise(resolve => setTimeout(resolve, 100));
            });
            await waitFor(() => {
                expect(document.activeElement).toBe(ageInput);
            });
            const numbers = [1, 12, 123.00, 1234.00];
            for (const number of numbers) {
                await act(async () => {
                    fireEvent.change(ageInput, { target: { value: number } });
                    await new Promise(resolve => setTimeout(resolve, 100));
                });
                expect(Number(ageInput.value)).toBe(Number(number));
                expect(document.activeElement).toBe(ageInput);
            }
        });

        it('should maintain focus during checkbox state changes', async () => {
            await act(async () => {
                const firstRow = gridRef.current?.getRowByIndex(0);
                expect(firstRow).toBeInTheDocument();
                fireEvent.doubleClick(firstRow!.querySelector('td')!);
            });
            let activeCheckbox: HTMLInputElement;
            await waitFor(() => {
                activeCheckbox = container.querySelector('#grid-edit-active') as HTMLInputElement;
                expect(activeCheckbox).toBeInTheDocument();
                activeCheckbox.focus();
                expect(document.activeElement).toBe(activeCheckbox);
            }, { timeout: 100 });
            for (let i = 0; i < 3; i++) {
                await act(async () => {
                    fireEvent.click(activeCheckbox);
                });
                expect(document.activeElement).toBe(activeCheckbox);
            }
        });
    });

    describe('Tab and Arrow Key Navigation', () => {
        let container: HTMLElement;

        beforeEach(async () => {
            const renderResult = render(<Grid ref={gridRef} {...defaultProps} columns={defaultColumns} />);
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            }, { timeout: 100 });
            await act(async () => {
                const firstRow = gridRef.current?.getRowByIndex(0);
                expect(firstRow).toBeInTheDocument();
                fireEvent.doubleClick(firstRow!.querySelector('td')!);
            });
        });

        it('should allow Tab navigation between editable fields without focus jumping', async () => {
            let nameInput: HTMLInputElement;
            await waitFor(() => {
                nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                expect(document.activeElement).toBe(nameInput);
            }, { timeout: 100 });
            await userEvent.tab();
            await waitFor(() => {
                const ageInput = container.querySelector('#grid-edit-age') as HTMLInputElement;
                expect(ageInput).toBeInTheDocument();
                expect(document.activeElement).toBe(ageInput);
            }, { timeout: 100 });
        });

        it('should handle Shift+Tab for backward navigation', async () => {
            let ageInput: HTMLInputElement;
            await waitFor(() => {
                const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                ageInput = container.querySelector('#grid-edit-age') as HTMLInputElement;
                expect(ageInput).toBeInTheDocument();
                ageInput.focus();
                expect(document.activeElement).toBe(ageInput);
            }, { timeout: 100 });
            await userEvent.tab({ shift: true });
            await waitFor(() => {
                const nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(document.activeElement).toBe(nameInput);
            }, { timeout: 100 });
        });

        it('should allow arrow keys for text cursor movement without grid interference', async () => {
            let nameInput: HTMLInputElement;
            await waitFor(() => {
                nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                expect(document.activeElement).toBe(nameInput);
            }, { timeout: 100 });
            await act(async () => {
                fireEvent.change(nameInput, { target: { value: 'Test Name' } });
                nameInput.setSelectionRange(4, 4);
                const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
                const preventDefaultSpy = jest.spyOn(arrowRightEvent, 'preventDefault');
                const stopPropagationSpy = jest.spyOn(arrowRightEvent, 'stopPropagation');
                fireEvent.keyDown(nameInput, arrowRightEvent);
                expect(preventDefaultSpy).not.toHaveBeenCalled();
                expect(stopPropagationSpy).not.toHaveBeenCalled();
                expect(document.activeElement).toBe(nameInput);
            });
        });

        it('should handle Home and End keys for text navigation', async () => {
            let nameInput: HTMLInputElement;
            await waitFor(() => {
                nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                expect(document.activeElement).toBe(nameInput);
            }, { timeout: 100 });
            await act(async () => {
                fireEvent.change(nameInput, { target: { value: 'Long Test Name' } });
                fireEvent.keyDown(nameInput, { key: 'Home' });
                fireEvent.keyDown(nameInput, { key: 'End' });
            });
            expect(document.activeElement).toBe(nameInput);
        });
    });

    describe('Enter and Escape Key Handling', () => {
        let container: HTMLElement;

        beforeEach(async () => {
            const renderResult = render(<Grid ref={gridRef} {...defaultProps} columns={defaultColumns} />);
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            }, { timeout: 100 });
            await act(async () => {
                const firstRow = gridRef.current?.getRowByIndex(0);
                expect(firstRow).toBeInTheDocument();
                fireEvent.doubleClick(firstRow!.querySelector('td')!);
            });
        });

        it('should handle Enter key to save without focus jumping', async () => {
            let nameInput: HTMLInputElement;
            await waitFor(() => {
                nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                expect(document.activeElement).toBe(nameInput);
            }, { timeout: 100 });
            await act(async () => {
                fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
                fireEvent.keyDown(nameInput, { key: 'Enter' });
            });
            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-row')).not.toBeInTheDocument();
            }, { timeout: 100 });
        });

        it('should handle Escape key to cancel without focus jumping', async () => {
            let nameInput: HTMLInputElement;
            await waitFor(() => {
                nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                expect(document.activeElement).toBe(nameInput);
            }, { timeout: 100 });
            await act(async () => {
                fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
                fireEvent.keyDown(nameInput, { key: 'Escape' });
            });
            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-row')).not.toBeInTheDocument();
            }, { timeout: 100 });
        });

        it('should not sync external value changes when user is actively typing', async () => {
            let nameInput: HTMLInputElement;
            await waitFor(() => {
                nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
                expect(document.activeElement).toBe(nameInput);
            }, { timeout: 100 });
            await act(async () => {
                fireEvent.change(nameInput, { target: { value: 'User Typing' } });
                fireEvent.focus(nameInput);
            });
            expect(nameInput.value).toBe('User Typing');
        });

        it('should sync external value changes when user is not actively typing', async () => {
            let nameInput: HTMLInputElement;
            await waitFor(() => {
                nameInput = container.querySelector('#grid-edit-name') as HTMLInputElement;
                expect(nameInput).toBeInTheDocument();
            }, { timeout: 100 });
            await act(async () => {
                nameInput.blur();
            });
            await waitFor(() => {
                expect(container.querySelector('.sf-grid-edit-row')).toBeInTheDocument();
            }, { timeout: 100 });
        });
    });
});

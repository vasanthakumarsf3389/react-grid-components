import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act, createRef, RefObject, KeyboardEvent } from 'react';
import { Grid } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { Column } from '../src/index';
import { Columns } from '../src/index';
import { AggregateColumn, AggregateRow, Aggregates } from '../src/index';

describe('Grid Focus Strategy', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' }
    ];

    const basicColumns = (
        <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" />
            <Column field="CustomerID" headerText="Customer ID" width="150" />
            <Column field="Freight" headerText="Freight" width="100" />
            <Column field="ShipCountry" headerText="Ship Country" width="150" />
        </Columns>
    );

    const wideDataset = Array.from({ length: 2 }, (_, i) => ({
        OrderID: 10000 + i,
        CustomerID: `CUST${i}`,
        Freight: Math.random() * 100,
        ShipCountry: ['USA', 'UK', 'Germany', 'France', 'Brazil'][i % 5],
        Field1: 'Data1', Field2: 'Data2', Field3: 'Data3', Field4: 'Data4',
        Field5: 'Data5', Field6: 'Data6', Field7: 'Data7', Field8: 'Data8'
    }));

    const wideColumns = (
        <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" />
            <Column field="CustomerID" headerText="Customer ID" width="150" />
            <Column field="Freight" headerText="Freight" width="100" />
            <Column field="ShipCountry" headerText="Ship Country" width="150" />
            <Column field="Field1" headerText="Field 1" width="120" />
            <Column field="Field2" headerText="Field 2" width="120" />
            <Column field="Field3" headerText="Field 3" width="120" />
            <Column field="Field4" headerText="Field 4" width="120" />
            <Column field="Field5" headerText="Field 5" width="120" />
            <Column field="Field6" headerText="Field 6" width="120" />
            <Column field="Field7" headerText="Field 7" width="120" />
            <Column field="Field8" headerText="Field 8" width="120" />
        </Columns>
    );

    let gridRef: RefObject<GridRef>;
    let container: HTMLElement;
    let renderResult: any;

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
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        if (renderResult) {
            renderResult.unmount();
        }
    });

    describe('Basic Rendering and Focus', () => {
        beforeEach(async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
        });

        it('should focus on a cell when clicked', async () => {
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);

            await act(async () => {
                fireEvent.click(cells[1]);
            });

            await waitFor(() => {
                expect(cells[1].classList.contains('sf-focus') ||
                    cells[1].classList.contains('sf-focused')).toBeTruthy();
            });
            expect(gridRef.current?.getContentTable().querySelectorAll('[tabindex="0"]')).toHaveLength(1);

            await act(async () => {
                fireEvent.click(cells[7]);
            });

            await waitFor(() => {
                expect(cells[7].classList.contains('sf-focus') ||
                    cells[7].classList.contains('sf-focused')).toBeTruthy();
            });
            expect(gridRef.current?.getContentTable().querySelectorAll('[tabindex="0"]')).toHaveLength(1);
        });

        it('should handle focus callbacks', async () => {
            const onCellFocus = jest.fn();
            const onCellClick = jest.fn();
            const beforeCellFocus = jest.fn();

            renderResult.rerender(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    onCellFocus={onCellFocus}
                    onCellClick={onCellClick}
                    onCellFocusStart={beforeCellFocus}
                >
                    {basicColumns}
                </Grid>
            );

            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);

            await act(async () => {
                fireEvent.click(cells[0]);
            });

            expect(beforeCellFocus).toHaveBeenCalled();
            expect(onCellClick).toHaveBeenCalled();
            expect(onCellFocus).toHaveBeenCalled();
        });

        it('should handle focus when grid is empty', async () => {
            renderResult.rerender(
                <Grid
                    ref={gridRef}
                    dataSource={[]}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );

            await waitFor(() => {
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });

            await act(async () => {
                fireEvent.keyDown(document.body, { 
                    key: 'w', 
                    code: 'KeyW', 
                    altKey: true,
                    keyCode: 87 
                });
            });

            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') ||
                    container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('No records to display');
            });

            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, {
                    key: 'Tab',
                    code: 'Tab',
                    shiftKey: true
                });
            });

            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') ||
                    gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toBe('Ship Country');
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });

            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, {
                    key: 'Tab',
                    code: 'Tab'
                });
            });

            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') ||
                    gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('No records to display');
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });

            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, {
                    key: 'ArrowUp', code: 'ArrowUp'
                });
            });

            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') ||
                    gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('Order ID');
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });

            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, {
                    key: 'ArrowRight', code: 'ArrowRight'
                });
            });

            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') ||
                    gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('Customer ID');
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });

            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, {
                    key: 'ArrowDown', code: 'ArrowDown'
                });
            });

            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') ||
                    gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('No records to display');
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });
        });

        it('should handle custom emptyRecordTemplate', async () => {
            const customEmptyTemplate = <div data-testid="custom-empty">No data available</div>;

            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={[]}
                    height={400}
                    width={800}
                    emptyRecordTemplate={customEmptyTemplate}
                >
                    {basicColumns}
                </Grid>
            );

            const { getByTestId } = renderResult;
            expect(getByTestId('custom-empty')).not.toBeNull();
            expect(getByTestId('custom-empty').textContent).toBe('No data available');
        });
    });

    describe('Keyboard Navigation', () => {
        beforeEach(async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
        });

        it('should navigate between cells using keyboard', async () => {
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight' });
            });

            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).not.toBe(container.querySelectorAll('td')[0]);
                expect(focusedCell).toBe(container.querySelectorAll('td')[1]);
            });
        });

        it('should handle tab key navigation', async () => {
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });

            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).not.toBe(container.querySelectorAll('td')[0]);
            });
        });

        it('should handle shift+tab key navigation', async () => {
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(1);
            await act(async () => {
                fireEvent.click(cells[1]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(cells[1]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).not.toBe(cells[1]);
            });
        });

        it('should handle arrow key navigation', async () => {
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight' });
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowLeft', code: 'ArrowLeft' });
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowUp', code: 'ArrowUp' });
            });

            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
        });

        it('should handle home and end key navigation', async () => {
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(4);
            await act(async () => {
                fireEvent.click(cells[1]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
        });

        it('should handle Ctrl+Home and Ctrl+End navigation', async () => {
            const cells = container.querySelectorAll('td');
            const middleCellIndex = Math.floor(cells.length / 2);
            await act(async () => {
                fireEvent.click(cells[middleCellIndex]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                const firstCell = container.querySelector('td');
                expect(focusedCell).toBe(firstCell);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                const allCells = container.querySelectorAll('td');
                const lastCell = allCells[allCells.length - 1];
                expect(focusedCell).toBe(lastCell);
            });
        });

        it('should handle Enter key navigation', async () => {
            const cells = container.querySelectorAll('.sf-grid-content-container td');
            expect(cells.length).toBeGreaterThan(4);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Enter', code: 'Enter' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('tr.sf-grid-content-row[aria-rowindex="2"] td.sf-focus') ||
                    container.querySelector('tr.sf-grid-content-row[aria-rowindex="2"] td.sf-focused');
                expect(focusedCell).not.toBeNull();
                const secondRowFirstCell = gridRef.current.getRows()[1].cells[0];
                expect(focusedCell).toBe(secondRowFirstCell);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Enter', code: 'Enter', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('tr.sf-grid-content-row[aria-rowindex="1"] td.sf-focus') ||
                    container.querySelector('tr.sf-grid-content-row[aria-rowindex="1"] td.sf-focused');
                expect(focusedCell).not.toBeNull();
                const firstRowFirstCell = gridRef.current.getRows()[0].cells[0];
                expect(focusedCell).toBe(firstRowFirstCell);
            });
        });
    });

    describe('Boundary and Tab Navigation', () => {
        beforeEach(async () => {
            renderResult = render(
                <Grid
                    key={`grid-${Date.now()}`}
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                expect(gridRef.current).not.toBeNull();
                expect(gridRef.current.element).not.toBeNull();
            });
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });
        });

        it('should handle focus when tabbing into the grid', async () => {
            await act(async () => {
                fireEvent.focus(gridRef.current.element);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.querySelector('.sf-grid-header-text')?.innerHTML).toBe('Order ID');
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });
        });

        it('should handle focus loss when tabbing out of the grid', async () => {
            const cells = container.querySelectorAll('td');
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
            await act(async () => {
                const outsideElement = document.createElement('button');
                document.body.appendChild(outsideElement);
                fireEvent.blur(gridRef.current.element, { relatedTarget: outsideElement });
                outsideElement.focus();
                document.body.removeChild(outsideElement);
            });
        });

        it('should handle tabbing out from the last cell of content', async () => {
            const rows: NodeListOf<HTMLTableRowElement> = container.querySelectorAll('tbody tr');
            const lastRow = rows[rows.length - 1];
            const lastCell = lastRow.cells[lastRow.cells.length - 1];
            await act(async () => {
                fireEvent.click(lastCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(lastCell);
                expect(focusedCell.textContent).toContain('Brazil');
            });
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Content');
                const contentMatrix = gridRef.current.focusModule.getContentMatrix();
                const rowIndex = Array.from(rows).indexOf(lastRow);
                const colIndex = Array.from(lastRow.cells).indexOf(lastCell);
                contentMatrix.select(rowIndex, colIndex);
                contentMatrix.current = [rowIndex, colIndex];
                Object.defineProperty(gridRef.current.focusModule, 'lastFocusableContentCellIndex', {
                    get: () => [rowIndex, colIndex],
                    configurable: true
                });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
                expect(gridRef.current.focusModule.isGridFocused).toBeFalsy();
            }, { timeout: 4000 });
        });

        it('should handle boundary navigation between header and content', async () => {
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Header');
                const headerMatrix = gridRef.current.focusModule.getHeaderMatrix();
                const lastHeaderRow = headerMatrix.rows;
                const lastHeaderCol = headerMatrix.columns;
                gridRef.current.focusModule.navigateToCell(lastHeaderRow, lastHeaderCol, 'Header');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Header');
                const headerMatrix = gridRef.current.focusModule.getHeaderMatrix();
                const headerRow = 0;
                const lastHeaderCol = headerMatrix.columns;
                gridRef.current.focusModule.navigateToCell(headerRow, lastHeaderCol, 'Header');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Content');
                gridRef.current.focusModule.navigateToCell(0, 0, 'Content');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowUp', code: 'ArrowUp' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Content');
                gridRef.current.focusModule.navigateToCell(0, 0, 'Content');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });
        });

        it('should handle navigation between header and content', async () => {
            const headerCells = container.querySelectorAll('.sf-grid-header-row th.sf-cell');
            expect(headerCells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(headerCells[0]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused') || container.querySelector('[tabindex="0"]');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            }, { timeout: 2000 });
            await act(async () => {
                const gridElement = gridRef.current.element;
                fireEvent.keyDown(gridElement, { key: 'ArrowDown', code: 'ArrowDown', bubbles: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('td.sf-focus') || container.querySelector('td.sf-focused') || container.querySelector('td[tabindex="0"]');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            }, { timeout: 2000 });
            await act(async () => {
                const gridElement = gridRef.current.element;
                fireEvent.keyDown(gridElement, { key: 'ArrowUp', code: 'ArrowUp', bubbles: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('th.sf-focus') || container.querySelector('th.sf-focused') || container.querySelector('th[tabindex="0"]');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            }, { timeout: 2000 });
        });

        it('should handle Tab navigation from header to content', async () => {
            const headerCells = container.querySelectorAll('.sf-grid-header-row th.sf-cell');
            const lastHeaderCell = headerCells[headerCells.length - 1];
            await act(async () => {
                fireEvent.click(lastHeaderCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused') || container.querySelector('[tabindex="0"]');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(lastHeaderCell);
            }, { timeout: 2000 });
            await act(async () => {
                const gridElement = gridRef.current.element;
                fireEvent.keyDown(gridElement, { key: 'Tab', code: 'Tab', bubbles: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('td.sf-focus') || container.querySelector('td.sf-focused') || container.querySelector('td[tabindex="0"]');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
                const firstContentRow = container.querySelector('tbody tr');
                if (firstContentRow) {
                    const firstContentCell = firstContentRow.querySelector('td');
                    expect(focusedCell).toBe(firstContentCell);
                }
            }, { timeout: 2000 });
        });

        it('should handle Shift+Tab navigation from content to header', async () => {
            const contentCells = container.querySelectorAll('td');
            const firstContentCell = contentCells[0];
            await act(async () => {
                fireEvent.click(firstContentCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstContentCell);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
                const headerCells = container.querySelectorAll('th');
                const lastHeaderCell = headerCells[headerCells.length - 1];
                expect(focusedCell).toBe(lastHeaderCell);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
                const headerCell = container.querySelector('th');
                expect(focusedCell).toBe(headerCell);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
                const headerCells = container.querySelectorAll('th');
                expect(focusedCell).toBe(headerCells[headerCells.length - 1]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
                const headerCell = container.querySelector('th');
                expect(focusedCell).toBe(headerCell);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
                const headerCells = container.querySelectorAll('th');
                expect(focusedCell).toBe(headerCells[headerCells.length - 1]);
            });
        });

        it('should handle Shift+Tab on first header cell to exit grid - 1', async () => {
            const headerCells = container.querySelectorAll('th');
            const firstHeaderCell = headerCells[0];
            await act(async () => {
                fireEvent.click(firstHeaderCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstHeaderCell);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('th.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
            }, { timeout: 3000 });
            expect(gridRef.current.focusModule.isGridFocused).toBeFalsy();
        });

        it('should handle Tab on last content cell to exit grid', async () => {
            const rows = container.querySelectorAll('tbody tr');
            const lastRow = rows[rows.length - 1] as HTMLTableRowElement;
            const lastCell = lastRow.cells[lastRow.cells.length - 1];
            await act(async () => {
                fireEvent.click(lastCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(lastCell);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
            }, {timeout: 3000});
        });

        it('should handle Shift+Tab on first header cell to exit grid', async () => {
            const headerCells = container.querySelectorAll('th');
            const firstHeaderCell = headerCells[0];
            await act(async () => {
                fireEvent.click(firstHeaderCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstHeaderCell);
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Header');
                const headerMatrix = gridRef.current.focusModule.getHeaderMatrix();
                const headerRows = gridRef.current.getHeaderRows();
                const headerRow = headerRows[0];
                const rowIndex = 0;
                const colIndex = Array.from(headerRow.cells).indexOf(firstHeaderCell);
                headerMatrix.select(rowIndex, colIndex);
                headerMatrix.current = [rowIndex, colIndex];
                gridRef.current.focusModule.navigateToCell(rowIndex, colIndex, 'Header');
                Object.defineProperty(gridRef.current.focusModule, 'firstFocusableHeaderCellIndex', {
                    get: () => [rowIndex, colIndex],
                    configurable: true
                });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
                expect(gridRef.current.focusModule.isGridFocused).toBeFalsy();
            });
        });

        it('should handle Tab on last content cell to exit grid', async () => {
            const rows = container.querySelectorAll('tbody tr');
            const lastRow = rows[rows.length - 1] as HTMLTableRowElement;
            const lastCell = lastRow.cells[lastRow.cells.length - 1];
            await act(async () => {
                fireEvent.click(lastCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(lastCell);
                expect(focusedCell.textContent).toContain('Brazil');
            });
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Content');
                const contentMatrix = gridRef.current.focusModule.getContentMatrix();
                const rowIndex = Array.from(rows).indexOf(lastRow);
                const colIndex = Array.from(lastRow.cells).indexOf(lastCell);
                contentMatrix.select(rowIndex, colIndex);
                contentMatrix.current = [rowIndex, colIndex];
                gridRef.current.focusModule.navigateToCell(rowIndex, colIndex, 'Content');
                Object.defineProperty(gridRef.current.focusModule, 'lastFocusableContentCellIndex', {
                    get: () => [rowIndex, colIndex],
                    configurable: true
                });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
                expect(gridRef.current.focusModule.isGridFocused).toBeFalsy();
            });
        });
    });

    describe('Page Navigation', () => {
        beforeEach(async () => {
            const dataBoundMock = jest.fn();
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={Array.from({ length: 50 }, (_, i) => ({
                        OrderID: 10000 + i,
                        CustomerID: `CUST${i}`,
                        Freight: Math.random() * 100,
                        ShipCountry: ['USA', 'UK', 'Germany', 'France', 'Brazil'][i % 5]
                    }))}
                    height={300}
                    width={800}
                    onDataLoad={dataBoundMock}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            expect(dataBoundMock).toHaveBeenCalled();
            await act(async () => {
                Object.defineProperty(gridRef.current.contentPanelRef, 'offsetWidth', { configurable: true, get: () => 500 });
                Object.defineProperty(gridRef.current.contentPanelRef, 'clientWidth', { configurable: true, get: () => 480 });
                gridRef.current.scrollModule.setPadding();
                if (gridRef.current.headerPanelRef) {
                    gridRef.current.headerPanelRef.style.paddingRight = '20px';
                }
            });
            expect(parseInt(gridRef.current.headerPanelRef.style.paddingRight)).toBeGreaterThan(5);
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await act(async () => {
                Object.defineProperty(gridRef.current.contentPanelRef, 'scrollHeight', { configurable: true, get: () => 600 });
                fireEvent.scroll(gridRef.current.contentPanelRef);
            });
        });

        it('should handle page up and page down navigation', async () => {
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'PageDown', code: 'PageDown' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'PageUp', code: 'PageUp' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
        });
    });

    describe('Alt Key Shortcuts', () => {
        beforeEach(async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
        });

        it('should handle Alt+J to focus the grid', async () => {
            const buttonRef = createRef<HTMLButtonElement>();
            const buttonRef1 = createRef<HTMLButtonElement>();
            renderResult.rerender(
                <>
                    <button ref={buttonRef}>Outside Button</button>
                    <Grid ref={gridRef} dataSource={sampleData} height={400} width={800}>
                        {basicColumns}
                    </Grid>
                    <button ref={buttonRef1}>Outside Button</button>
                </>
            );
            const cells = container.querySelectorAll('th');
            await act(async () => {
                fireEvent.click(buttonRef.current);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
            }, { timeout: 1000 });
            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'j', code: 'KeyJ', altKey: true, keyCode: 74 });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(document.activeElement).toBe(cells[0]);
            }, { timeout: 1000 });
            await act(async () => {
                fireEvent.click(buttonRef1.current);
                fireEvent.focus(buttonRef1.current);
                buttonRef1.current.click();
                buttonRef1.current.focus();
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
            }, { timeout: 1000 });
            await act(async () => {
                fireEvent.keyDown(buttonRef1.current, { key: 'Tab', code: 'Tab', shiftKey: true });
                fireEvent.focus(gridRef.current.element, { relatedTarget: buttonRef1.current });
            });
        });

        it('should handle Alt+W to focus the grid content', async () => {
            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'w', code: 'KeyW', altKey: true, keyCode: 87 });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.innerHTML).toBe('10248');
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });
        });

        it('should handle Alt+W to focus the grid first visible cell and Ctrl+End to focus last visible cell then Tab to exit grid', async () => {
            const buttonRef = createRef<HTMLButtonElement>();
            renderResult.rerender(
                <>
                    <button ref={buttonRef}>Dummy Button</button>
                    <Grid ref={gridRef} dataSource={sampleData} height={400} width={800}>
                        <Columns>
                            <Column field="OrderID" headerText="Order ID" width="120" visible={false} />
                            <Column field="CustomerID" headerText="Customer ID" width="150" />
                            <Column field="Freight" headerText="Freight" width="100" />
                            <Column field="ShipCountry" headerText="Ship Country" width="150" visible={false} />
                        </Columns>
                    </Grid>
                </>
            );
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            await act(async () => {
                gridRef.current.element.focus();
                fireEvent.keyDown(buttonRef.current, { key: 'Tab', keyCode: 'Tab' });
                fireEvent.focus(gridRef.current.element, { relatedTarget: buttonRef.current });
            });
            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') || gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toBe('Customer ID');
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });
            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'w', code: 'KeyW', altKey: true, keyCode: 87 });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.innerHTML).toBe('VINET');
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('65.83');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
                expect(gridRef.current.focusModule.isGridFocused).toBeFalsy();
            }, { timeout: 4000 });
        });

        it('visible cell and boundary navigation check', async () => {
            const buttonRef = createRef<HTMLButtonElement>();
            renderResult.rerender(
                <>
                    <button ref={buttonRef}>Dummy Button</button>
                    <Grid ref={gridRef} dataSource={sampleData} height={400} width={800}>
                        <Columns>
                            <Column field="OrderID" headerText="Order ID" width="120" visible={false} />
                            <Column field="CustomerID" headerText="Customer ID" width="150" />
                            <Column field="Freight" headerText="Freight" width="100" />
                            <Column field="ShipCountry" headerText="Ship Country" width="150" visible={false} />
                        </Columns>
                    </Grid>
                </>
            );
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'w', code: 'KeyW', altKey: true, keyCode: 87 });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.innerHTML).toBe('VINET');
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            }, { timeout: 600 });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') || gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toBe('Freight');
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            }, { timeout: 600 });
            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'w', code: 'KeyW', altKey: true, keyCode: 87 });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.innerHTML).toBe('VINET');
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            }, { timeout: 600 });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            });
            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') || gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toBe('TOMSP');
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') || gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toBe('32.38');
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });
        });
    });

    describe('Hidden Columns Navigation', () => {
        it('should handle focus with hidden columns', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        <Column field="CustomerID" headerText="Customer ID" width="150" visible={false} />
                        <Column field="Freight" headerText="Freight" width="100" />
                        <Column field="ShipCountry" headerText="Ship Country" width="150" />
                    </Columns>
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('32.38');
            });
        });

        it('should handle focus with first column hidden', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" visible={false} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" />
                        <Column field="Freight" headerText="Freight" width="100" />
                        <Column field="ShipCountry" headerText="Ship Country" width="150" />
                    </Columns>
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td:not(.sf-display-none)');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
                expect(cells[0].textContent).toContain('VINET');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('32.38');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('France');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('VINET');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('Brazil');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('65.83');
            });
        });

        it('should handle focus with last column hidden', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        <Column field="CustomerID" headerText="Customer ID" width="150" />
                        <Column field="Freight" headerText="Freight" width="100" />
                        <Column field="ShipCountry" headerText="Ship Country" width="150" visible={false} />
                    </Columns>
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
                expect(cells[0].textContent).toContain('10248');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('32.38');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('65.83');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('10250');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('HANAR');
            });
        });

        it('should handle focus with both first and last columns hidden', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" visible={false} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" />
                        <Column field="Freight" headerText="Freight" width="100" />
                        <Column field="ShipCountry" headerText="Ship Country" width="150" visible={false} />
                    </Columns>
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td:not(.sf-display-none)');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
                expect(cells[0].textContent).toContain('VINET');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('32.38');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('VINET');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('HANAR');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('65.83');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('VINET');
            });
        });

        it('should test findCellIndex method with complex navigation patterns', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" visible={false} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" />
                        <Column field="Freight" headerText="Freight" width="100" visible={false} />
                        <Column field="ShipCountry" headerText="Ship Country" width="150" />
                    </Columns>
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td:not(.sf-display-none)');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
                expect(cells[0].textContent).toContain('VINET');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('France');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowLeft', code: 'ArrowLeft' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('VINET');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('France');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('VINET');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('TOMSP');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('Germany');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('TOMSP');
            });
        });
    });

    describe('Focus Cancellation and Programmatic Methods', () => {
        it('should handle focus with beforeCellFocus cancellation', async () => {
            const beforeCellFocus = jest.fn((args: { columnIndex?: number; cancel?: boolean }) => {
                if (args.columnIndex === 2) {
                    args.cancel = true;
                }
            });
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    onCellFocusStart={beforeCellFocus}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
            });
            await act(async () => {
                fireEvent.click(cells[2]);
            });
            expect(beforeCellFocus).toHaveBeenCalled();
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(cells[0]);
            });
        });

        it('should handle programmatic focus methods', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const focusModule = gridRef.current.focusModule;
            expect(focusModule).not.toBeNull();
            await act(async () => {
                focusModule.navigateToCell(0, 1, 'Content');
                await new Promise(resolve => setTimeout(resolve, 1000));
            });
            await act(async () => {
                focusModule.navigateToFirstCell();
                await new Promise(resolve => setTimeout(resolve, 1000));
            });
        });

        it('should handle focus with keyboard-only navigation', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            await act(async () => {
                fireEvent.focus(gridRef.current.element);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.tagName.toLowerCase()).toBe('td');
            });
        });

        it('should directly test getNavigationDirection function for all key combinations', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const getNavigationDirection = gridRef.current.focusModule.getNavigationDirection;
            expect(typeof getNavigationDirection).toBe('function');
            const testCases = [
                { event: { key: 'ArrowUp' }, expected: 'upArrow' },
                { event: { key: 'ArrowDown' }, expected: 'downArrow' },
                { event: { key: 'ArrowLeft' }, expected: 'leftArrow' },
                { event: { key: 'ArrowRight' }, expected: 'rightArrow' },
                { event: { key: 'Tab', shiftKey: false }, expected: 'tab' },
                { event: { key: 'Tab', shiftKey: true }, expected: 'shiftTab' },
                { event: { key: 'Home', ctrlKey: false }, expected: 'home' },
                { event: { key: 'Home', ctrlKey: true }, expected: 'ctrlHome' },
                { event: { key: 'End', ctrlKey: false }, expected: 'end' },
                { event: { key: 'End', ctrlKey: true }, expected: 'ctrlEnd' },
                { event: { key: 'Enter', shiftKey: false }, expected: 'enter' },
                { event: { key: 'Enter', shiftKey: true }, expected: 'shiftEnter' },
                { event: { key: 'A' }, expected: null }
            ];
            testCases.forEach(({ event, expected }) => {
                const result = getNavigationDirection(event as KeyboardEvent);
                expect(result).toBe(expected);
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            const keyboardEvents = [
                { key: 'ArrowLeft', code: 'ArrowLeft' },
                { key: 'ArrowRight', code: 'ArrowRight' },
                { key: 'Home', code: 'Home' },
                { key: 'Home', code: 'Home', ctrlKey: true },
                { key: 'End', code: 'End' },
                { key: 'End', code: 'End', ctrlKey: true },
                { key: 'Enter', code: 'Enter' },
                { key: 'Enter', code: 'Enter', shiftKey: true }
            ];
            for (const keyEvent of keyboardEvents) {
                await act(async () => {
                    fireEvent.keyDown(gridRef.current.element, keyEvent);
                });
                await waitFor(() => {
                    const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                    expect(focusedCell).not.toBeNull();
                });
            }
        });

        it('should test navigateToNextCell with all direction parameters', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            const directions = ['up', 'down', 'left', 'right', 'nextCell', 'prevCell'];
            for (const direction of directions) {
                await act(async () => {
                    gridRef.current.focusModule.navigateToNextCell(direction as any);
                });
                await waitFor(() => {
                    const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                    expect(focusedCell).not.toBeNull();
                });
            }
        });

        it('should test navigateToLastCell and ensure proper matrix selection', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(cells[0]);
            });
            await act(async () => {
                gridRef.current.focusModule.navigateToLastCell();
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
            expect(gridRef.current.focusModule.getActiveMatrix()).toBe(gridRef.current.focusModule.getContentMatrix());
        });

        it('should test the !current condition in onKeyPress by mocking the matrix', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await act(async () => {
                const activeMatrix = gridRef.current.focusModule.getActiveMatrix();
                const originalMatrix = [...activeMatrix.matrix];
                activeMatrix.matrix = [];
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight' });
                activeMatrix.matrix = originalMatrix;
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
            });
        });

        it('should test the isAtContentLastCell and isLastCell condition', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const rows: NodeListOf<HTMLTableRowElement> = container.querySelectorAll('tbody tr');
            const lastRow = rows[rows.length - 1];
            const lastCell = lastRow.cells[lastRow.cells.length - 1];
            await act(async () => {
                fireEvent.click(lastCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(lastCell);
            });
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Content');
                const contentMatrix = gridRef.current.focusModule.getContentMatrix();
                const rowIndex = rows.length - 1;
                const colIndex = lastRow.cells.length - 1;
                contentMatrix.select(rowIndex, colIndex);
                contentMatrix.current = [rowIndex, colIndex];
                Object.defineProperty(gridRef.current.focusModule, 'lastFocusableContentCellIndex', {
                    get: () => [rowIndex, colIndex],
                    configurable: true
                });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
                expect(gridRef.current.focusModule.isGridFocused).toBeFalsy();
            });
        });

        it('should test the firstFocusableHeaderCellIndex condition with Shift+Tab', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const headerCells = container.querySelectorAll('th');
            const firstHeaderCell = headerCells[0];
            await act(async () => {
                fireEvent.click(firstHeaderCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstHeaderCell);
            });
            await act(async () => {
                gridRef.current.focusModule.setActiveMatrix('Header');
                const headerMatrix = gridRef.current.focusModule.getHeaderMatrix();
                const rowIndex = 0;
                const colIndex = 0;
                headerMatrix.select(rowIndex, colIndex);
                headerMatrix.current = [rowIndex, colIndex];
                Object.defineProperty(gridRef.current.focusModule, 'firstFocusableHeaderCellIndex', {
                    get: () => [rowIndex, colIndex],
                    configurable: true
                });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
                expect(gridRef.current.focusModule.isGridFocused).toBeFalsy();
            }, {timeout: 600});
        });
    });

    describe('Scrolling and Synchronization', () => {
        let originalScrollLeftDescriptor: any;
        let scrollLeftMap: Map<any, any>;

        beforeEach(() => {
            originalScrollLeftDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollLeft');
            scrollLeftMap = new Map();
            Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
                configurable: true,
                get: function() {
                    return scrollLeftMap.get(this) || 0;
                },
                set: function(value) {
                    scrollLeftMap.set(this, value);
                }
            });
        });

        afterEach(() => {
            if (originalScrollLeftDescriptor) {
                Object.defineProperty(HTMLElement.prototype, 'scrollLeft', originalScrollLeftDescriptor);
            }
        });

        it('should test onContentScroll when tabbing to cells outside viewport and handle early return conditions', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={wideDataset}
                    height={400}
                    width={500}
                >
                    {wideColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const headerScrollElement = gridRef.current.headerScrollRef;
            const contentScrollElement = gridRef.current.contentScrollRef;
            expect(headerScrollElement).not.toBeNull();
            expect(contentScrollElement).not.toBeNull();
            const scrollModule = gridRef.current.scrollModule;
            expect(scrollModule).not.toBeNull();
            const contentScrollHandler = jest.fn();
            const headerScrollHandler = jest.fn();
            contentScrollElement.addEventListener('scroll', contentScrollHandler);
            headerScrollElement.addEventListener('scroll', headerScrollHandler);
            await act(async () => {
                Object.defineProperty(contentScrollElement, 'offsetWidth', { configurable: true, get: () => 500 });
                Object.defineProperty(contentScrollElement, 'clientWidth', { configurable: true, get: () => 480 });
                scrollModule.setPadding();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(cells[0]);
            });
            await act(async () => {
                for (let i = 0; i < 6; i++) {
                    fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).not.toBe(cells[0]);
            });
            await act(async () => {
                const originalHeaderScrollRef = gridRef.current.headerScrollRef;
                Object.defineProperty(gridRef.current, 'headerScrollRef', { configurable: true, get: () => null });
                const contentScrollSpy = jest.spyOn(gridRef.current.contentScrollRef, 'scrollLeft', 'set');
                fireEvent.scroll(gridRef.current.contentScrollRef);
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(contentScrollSpy).not.toHaveBeenCalled();
                Object.defineProperty(gridRef.current, 'headerScrollRef', { configurable: true, get: () => originalHeaderScrollRef });
                contentScrollSpy.mockRestore();
            });
            await act(async () => {
                gridRef.current.contentScrollRef.scrollLeft = 200;
                fireEvent.scroll(gridRef.current.contentScrollRef);
                await new Promise(resolve => setTimeout(resolve, 50));
            });
            expect(contentScrollHandler).toHaveBeenCalled();
            expect(gridRef.current.headerScrollRef.scrollLeft).toBe(200);
            await act(async () => {
                gridRef.current.contentScrollRef.scrollLeft = 0;
                gridRef.current.headerScrollRef.scrollLeft = 0;
                contentScrollHandler.mockClear();
                headerScrollHandler.mockClear();
                const originalContentScrollRef = gridRef.current.contentScrollRef;
                Object.defineProperty(gridRef.current, 'contentScrollRef', { configurable: true, get: () => null });
                const headerScrollSpy = jest.spyOn(gridRef.current.headerScrollRef, 'scrollLeft', 'get');
                fireEvent.scroll(gridRef.current.headerScrollRef);
                Object.defineProperty(gridRef.current, 'contentScrollRef', { configurable: true, get: () => originalContentScrollRef });
                headerScrollSpy.mockRestore();
                const contentScrollSpy = jest.spyOn(gridRef.current.contentScrollRef, 'scrollLeft', 'set');
                fireEvent.scroll(gridRef.current.headerScrollRef);
                contentScrollSpy.mockClear();
                fireEvent.scroll(gridRef.current.headerScrollRef);
                await new Promise(resolve => setTimeout(resolve, 50));
                contentScrollSpy.mockRestore();
                gridRef.current.headerScrollRef.scrollLeft = 250;
                fireEvent.scroll(gridRef.current.headerScrollRef);
                await new Promise(resolve => setTimeout(resolve, 50));
            });
            expect(headerScrollHandler).toHaveBeenCalled();
            expect(gridRef.current.contentScrollRef.scrollLeft).toBe(250);
            await act(async () => {
                contentScrollHandler.mockClear();
                headerScrollHandler.mockClear();
                gridRef.current.contentScrollRef.scrollLeft = 0;
                gridRef.current.headerScrollRef.scrollLeft = 0;
                Object.defineProperty(contentScrollElement, 'offsetWidth', { configurable: true, get: () => 300 });
                Object.defineProperty(contentScrollElement, 'clientWidth', { configurable: true, get: () => 290 });
                const headerScrollSpy = jest.spyOn(gridRef.current.headerScrollRef, 'scrollLeft', 'set');
                for (let i = 0; i < 5; i++) {
                    gridRef.current.contentScrollRef.scrollLeft = i * 10;
                    headerScrollSpy.mockClear();
                    fireEvent.scroll(gridRef.current.contentScrollRef);
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
                headerScrollSpy.mockRestore();
                await new Promise(resolve => setTimeout(resolve, 50));
                gridRef.current.contentScrollRef.scrollLeft = 300;
                fireEvent.scroll(gridRef.current.contentScrollRef);
                await new Promise(resolve => setTimeout(resolve, 50));
            });
            expect(contentScrollHandler).toHaveBeenCalled();
            expect(gridRef.current.headerScrollRef.scrollLeft).toBe(300);
            contentScrollElement.removeEventListener('scroll', contentScrollHandler);
            headerScrollElement.removeEventListener('scroll', headerScrollHandler);
        });

        it('should handle horizontal scrolling when tabbing to cells outside viewport', async () => {
            const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
            const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
            await act(async () => {
                Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                    configurable: true,
                    get: function() {
                        if (this.classList && this.classList.contains('sf-grid-content')) {
                            return 600;
                        }
                        return 120;
                    }
                });
                Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
                    configurable: true,
                    get: function() {
                        if (this.classList && this.classList.contains('sf-grid-content')) {
                            return 580;
                        }
                        return 120;
                    }
                });
            });
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={wideDataset}
                    height={400}
                    width={500}
                >
                    {wideColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const headerScrollElement = gridRef.current.headerScrollRef;
            const contentScrollElement = gridRef.current.contentScrollRef;
            expect(headerScrollElement).not.toBeNull();
            expect(contentScrollElement).not.toBeNull();
            const headerScrollSpy = jest.spyOn(headerScrollElement, 'scrollLeft', 'set');
            const contentScrollSpy = jest.spyOn(contentScrollElement, 'scrollLeft', 'set');
            const visibleCells = container.querySelectorAll('td');
            const lastVisibleCell = visibleCells[3];
            await act(async () => {
                fireEvent.click(lastVisibleCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBe(lastVisibleCell);
            });
            expect(gridRef.current.contentScrollRef.scrollLeft).toBe(0);
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await act(async () => {
                const focusModule = gridRef.current.focusModule;
                focusModule.navigateToCell(0, 8, 'Content');
                gridRef.current.headerScrollRef.scrollLeft = 100;
                gridRef.current.contentScrollRef.scrollLeft = 100;
                fireEvent.scroll(gridRef.current.contentScrollRef);
                fireEvent.scroll(gridRef.current.headerScrollRef);
            });
            await waitFor(() => {
                expect(contentScrollSpy).toHaveBeenCalled();
                expect(headerScrollSpy).toHaveBeenCalled();
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).not.toBe(lastVisibleCell);
            });
            jest.restoreAllMocks();
            if (originalOffsetWidth) {
                Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
            }
            if (originalClientWidth) {
                Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth);
            }
        });

        it('should test scroll synchronization between header and content', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={wideDataset}
                    height={400}
                    width={500}
                >
                    {wideColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const headerScrollElement = gridRef.current.headerScrollRef;
            const contentScrollElement = gridRef.current.contentScrollRef;
            expect(headerScrollElement).not.toBeNull();
            expect(contentScrollElement).not.toBeNull();
            await act(async () => {
                gridRef.current.contentScrollRef.scrollLeft = 100;
                fireEvent.scroll(gridRef.current.contentScrollRef);
                await new Promise(resolve => setTimeout(resolve, 50));
            });
            expect(gridRef.current.headerScrollRef.scrollLeft).toBe(100);
            await act(async () => {
                gridRef.current.contentScrollRef.scrollLeft = 0;
                gridRef.current.headerScrollRef.scrollLeft = 0;
                gridRef.current.headerScrollRef.scrollLeft = 150;
                fireEvent.scroll(gridRef.current.headerScrollRef);
                await new Promise(resolve => setTimeout(resolve, 50));
            });
            expect(gridRef.current.contentScrollRef.scrollLeft).toBe(150);
        });
    });

    describe('Dynamic Updates and Visibility Changes', () => {
        it('should handle focus with dynamic data updates', async () => {
            const { container: dynContainer, rerender } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            await waitFor(() => {
                expect(dynContainer.querySelector('.sf-grid')).not.toBeNull();
                expect(dynContainer.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = dynContainer.querySelectorAll('td');
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
            });
            const newData = [
                { OrderID: 10251, CustomerID: 'NEWCUST', Freight: 45.52, ShipCountry: 'Italy' },
                { OrderID: 10252, CustomerID: 'OTHERCUST', Freight: 12.34, ShipCountry: 'Spain' }
            ];
            await act(async () => {
                rerender(
                    <Grid
                        ref={gridRef}
                        dataSource={newData}
                        height={400}
                        width={800}
                    >
                        {basicColumns}
                    </Grid>
                );
            });
            await waitFor(() => {
                expect(dynContainer.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const newCells = dynContainer.querySelectorAll('td');
            await act(async () => {
                fireEvent.click(newCells[0]);
            });
        });

        it('should handle column visibility state changes and maintain proper focus navigation', async () => {
            const columnVisibility = {
                OrderID: true,
                CustomerID: true,
                Freight: true,
                ShipCountry: true
            };
            const { container: visContainer, rerender: visRerender } = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" visible={columnVisibility.OrderID} />
                        <Column field="CustomerID" headerText="Customer ID" width="150" visible={columnVisibility.CustomerID} />
                        <Column field="Freight" headerText="Freight" width="100" visible={columnVisibility.Freight} />
                        <Column field="ShipCountry" headerText="Ship Country" width="150" visible={columnVisibility.ShipCountry} />
                    </Columns>
                </Grid>
            );
            await waitFor(() => {
                expect(visContainer.querySelector('.sf-grid')).not.toBeNull();
                expect(visContainer.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = visContainer.querySelectorAll('td');
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                const focusedCell = visContainer.querySelector('.sf-focus') || visContainer.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('10248');
            });
            columnVisibility.OrderID = false;
            await act(async () => {
                visRerender(
                    <Grid
                        key={`grid-${Date.now()}`}
                        ref={gridRef}
                        dataSource={sampleData}
                        height={400}
                        width={800}
                    >
                        <Columns>
                            <Column field="OrderID" headerText="Order ID" width="120" visible={columnVisibility.OrderID} />
                            <Column field="CustomerID" headerText="Customer ID" width="150" visible={columnVisibility.CustomerID} />
                            <Column field="Freight" headerText="Freight" width="100" visible={columnVisibility.Freight} />
                            <Column field="ShipCountry" headerText="Ship Country" width="150" visible={columnVisibility.ShipCountry} />
                        </Columns>
                    </Grid>
                );
            });
            await waitFor(() => {
                expect(visContainer.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'w', code: 'KeyW', altKey: true, keyCode: 87 });
            });
            await waitFor(() => {
                const focusedCell = visContainer.querySelector('.sf-focus') || visContainer.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('VINET');
            }, {timeout: 1000});
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = gridRef.current.element.querySelector('.sf-focus') || gridRef.current.element.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toBe('Ship Country');
                expect(focusedCell.tagName.toLowerCase()).toBe('th');
            });
            columnVisibility.ShipCountry = false;
            await act(async () => {
                visRerender(
                    <Grid
                        key={`grid-${Date.now()}`}
                        ref={gridRef}
                        dataSource={sampleData}
                        height={400}
                        width={800}
                    >
                        <Columns>
                            <Column field="OrderID" headerText="Order ID" width="120" visible={columnVisibility.OrderID} />
                            <Column field="CustomerID" headerText="Customer ID" width="150" visible={columnVisibility.CustomerID} />
                            <Column field="Freight" headerText="Freight" width="100" visible={columnVisibility.Freight} />
                            <Column field="ShipCountry" headerText="Ship Country" width="150" visible={columnVisibility.ShipCountry} />
                        </Columns>
                    </Grid>
                );
            });
            await waitFor(() => {
                expect(visContainer.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'w', code: 'KeyW', altKey: true, keyCode: 87 });
            });
            await waitFor(() => {
                const focusedCell = visContainer.querySelector('.sf-focus') || visContainer.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('VINET');
            }, {timeout: 1000});
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = visContainer.querySelector('.sf-focus') || visContainer.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('32.38');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = visContainer.querySelector('.sf-focus') || visContainer.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('TOMSP');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = visContainer.querySelector('.sf-focus') || visContainer.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('32.38');
            });
        });
    });

    describe('Mac-Specific Navigation', () => {
        let originalPlatform: any;

        beforeEach(() => {
            originalPlatform = Object.getOwnPropertyDescriptor(navigator, 'platform');
            Object.defineProperty(navigator, 'platform', {
                get: () => 'MacIntel',
                configurable: true
            });
        });

        afterEach(() => {
            if (originalPlatform) {
                Object.defineProperty(navigator, 'platform', originalPlatform);
            }
        });

        it('should handle Mac-specific key combinations', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home', metaKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('10248');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End', metaKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.textContent).toContain('Brazil');
            });
            await act(async () => {
                fireEvent.click(cells[0]);
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight', metaKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(cells[0]);
            });
        });

        it('should test Mac-specific key combinations with else path', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'PageDown', code: 'PageDown', metaKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(cells[0]);
            });
        });

        it('should handle Mac-specific key combinations with both paths', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home', metaKey: true });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End', metaKey: true });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown', metaKey: true });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { code: 'Space' });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Escape' });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowUp', shiftKey: true });
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', shiftKey: true });
            });
        });
    });

    describe('Non-Navigation Keys and Default Paths', () => {
        beforeEach(async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
        });

        it('should handle non-navigation keys correctly', async () => {
            const initialFocusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'A', code: 'KeyA' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(initialFocusedCell);
            });
        });

        it('should test the default return true path in onKeyPress', async () => {
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'A', code: 'KeyA' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(container.querySelectorAll('td')[0]);
            });
        });
    });

    describe('Filterbar Focus Navigation', () => {
        it('test the filterbar focus navigation', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    filterSettings={{enabled: true}}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            const headerCells = container.querySelectorAll('th');
            await act(async () => {
                fireEvent.click(headerCells[0]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell.querySelector('.sf-grid-header-text')?.textContent).toContain('Order ID');
            });
            await act(async () => {
                fireEvent.keyDown(headerCells[0], { key: 'End', code: 'End', ctrlKey: true });
            });
            await waitFor(() => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                const headerCells = filterRow.querySelectorAll('th');
                expect(document.activeElement).toBe(headerCells[headerCells.length - 1].querySelector('input'));
            });
            await act(async () => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                const headerCells = filterRow.querySelectorAll('th');
                fireEvent.keyDown(headerCells[headerCells.length - 1], { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                const headerCells = filterRow.querySelectorAll('th');
                expect(document.activeElement).toBe(headerCells[headerCells.length - 2].querySelector('input'));
            });
            await act(async () => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                fireEvent.keyDown(filterRow.querySelectorAll('th')[2], { key: 'Tab', code: 'Tab', shiftKey: true });
                fireEvent.keyDown(filterRow.querySelectorAll('th')[1], { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                const headerCells = filterRow.querySelectorAll('th');
                expect(document.activeElement).toBe(headerCells[0].querySelector('input'));
            });
            await act(async () => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                fireEvent.keyDown(filterRow.querySelectorAll('th')[0], { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                const headerCells = filterRow.querySelectorAll('th');
                expect(document.activeElement).toBe(headerCells[1].querySelector('input'));
            });
            await act(async () => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                fireEvent.keyDown(filterRow.querySelectorAll('th')[1], { key: 'Tab', code: 'Tab' });
                fireEvent.keyDown(filterRow.querySelectorAll('th')[2], { key: 'Tab', code: 'Tab' });
                fireEvent.keyDown(filterRow.querySelectorAll('th')[3], { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const firstContentRow = container.querySelectorAll('tbody tr')[0];
                const firstRowContentCells = firstContentRow.querySelectorAll('td');
                expect(document.activeElement).toBe(firstRowContentCells[0]);
                expect(firstRowContentCells[0].className).toContain('sf-focused');
            });
            await act(async () => {
                const firstContentRow = container.querySelectorAll('tbody tr')[0];
                const firstRowContentCells = firstContentRow.querySelectorAll('td');
                fireEvent.keyDown(firstRowContentCells[0], { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const filterRow = container.querySelectorAll('thead tr')[1];
                const headerCells = filterRow.querySelectorAll('th');
                expect(document.activeElement).toBe(headerCells[headerCells.length - 1].querySelector('input'));
            });
        });

        it('test the filterbar focus navigation - 1', async () => {
            const buttonRef = createRef<HTMLButtonElement>();
            renderResult = render(
                <>
                    <Grid
                        key={`grid-${Date.now()}`}
                        ref={gridRef}
                        dataSource={sampleData}
                        filterSettings={{enabled: true}}
                        height={400}
                        width={800}
                    >
                        {basicColumns}
                    </Grid>
                    <button ref={buttonRef}>Outside Button</button>
                </>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
            });
            await act(async () => {
                fireEvent.click(buttonRef.current);
                fireEvent.focus(buttonRef.current);
                buttonRef.current.click();
                buttonRef.current.focus();
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).toBeNull();
            }, { timeout: 1000 });
            const contentCells = container.querySelectorAll('.sf-grid-content-container td');
            await act(async () => {
                fireEvent.click(contentCells[5]);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                const expectedFocusedContentCell = container.querySelectorAll('.sf-grid-content-container td')[5];
                expect(focusedCell).toBe(expectedFocusedContentCell);
            });
            await act(async () => {
                fireEvent.click(buttonRef.current);
                fireEvent.focus(buttonRef.current);
                buttonRef.current.click();
                buttonRef.current.focus();
            });
        });
    });

    describe('Aggregate Focus Navigation', () => {
        const footerSum = (props: any) => (<span>Sum: {props.Sum}</span>);
        const footerMax = (props: any) => (<span>Max: {props.Max}</span>);
        const footerMin = (props: any) => (<span>Min: {props.Min}</span>);
        const footerCount = (props: any) => (<span>Count: {props.Count}</span>);
        const customAggregateFn = (datas: any): Object => datas.result.length;
        const footerCustom = (props: any) => (<span>Custom: {props.Custom}</span>);

        const aggregateData = [
            { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
            { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
            { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' },
            { OrderID: 10251, CustomerID: 'VICTE', Freight: 41.34, ShipCountry: 'USA' },
            { OrderID: 10252, CustomerID: 'SUPRD', Freight: 51.30, ShipCountry: 'Canada' }
        ];

        const aggregates = (
            <Aggregates>
                <AggregateRow>
                    <AggregateColumn field="Freight" type="Sum" footerTemplate={footerSum} />
                    <AggregateColumn field="OrderID" type="Max" footerTemplate={footerMax} />
                    <AggregateColumn field="CustomerID" type="Count" footerTemplate={footerCount} />
                    <AggregateColumn field="ShipCountry" type="Count" footerTemplate={footerCount} />
                </AggregateRow>
                <AggregateRow>
                    <AggregateColumn field="Freight" type="Min" footerTemplate={footerMin} />
                    <AggregateColumn field="OrderID" type="Custom" customAggregate={customAggregateFn} footerTemplate={footerCustom} />
                    <AggregateColumn field="CustomerID" type="Count" />
                    <AggregateColumn field="ShipCountry" type="Count" />
                </AggregateRow>
            </Aggregates>
        );

        beforeEach(async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={aggregateData}
                    height={400}
                    width={800}
                >
                    {basicColumns}
                    {aggregates}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                expect(container.querySelector('.sf-grid-footer-container')).not.toBeNull();
                expect(container.querySelector('.sf-grid-summary-row')).not.toBeNull();
                expect(container.querySelectorAll('.sf-grid-summary-row')).toHaveLength(2);
            });
        });

        it('should handle aggregate focus navigation with all keyboard keys', async () => {
            const aggregateRows = container.querySelectorAll('.sf-grid-summary-row');
            const firstAggregateRow = aggregateRows[0] as HTMLTableRowElement;
            const firstAggregateCell = firstAggregateRow.cells[0];
            await act(async () => {
                fireEvent.click(firstAggregateCell);
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstAggregateCell);
                expect(focusedCell.textContent).toContain('Max: 10252');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstAggregateRow.cells[1]);
                expect(focusedCell.textContent).toContain('Count: 5');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstAggregateRow.cells[2]);
                expect(focusedCell.textContent).toContain('Sum: 202.45999999999998');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                const secondAggregateRow = aggregateRows[1] as HTMLTableRowElement;
                expect(focusedCell).toBe(secondAggregateRow.cells[2]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowLeft', code: 'ArrowLeft' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                const secondAggregateRow = aggregateRows[1] as HTMLTableRowElement;
                expect(focusedCell).toBe(secondAggregateRow.cells[1]);
                expect(focusedCell.textContent).toContain('5');
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowUp', code: 'ArrowUp' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstAggregateRow.cells[1]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstAggregateRow.cells[0]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstAggregateRow.cells[3]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Home', code: 'Home', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                expect(focusedCell).toBe(firstAggregateRow.cells[0]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'End', code: 'End', ctrlKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                const secondAggregateRow = aggregateRows[1] as HTMLTableRowElement;
                expect(focusedCell).toBe(secondAggregateRow.cells[3]);
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'Tab', code: 'Tab', shiftKey: true });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
                expect(focusedCell).not.toBeNull();
                const secondAggregateRow = aggregateRows[1] as HTMLTableRowElement;
                expect(focusedCell).toBe(secondAggregateRow.cells[2]);
            });
        });
    });

    describe('RTL and Custom Height', () => {
        it('should handle focus with RTL mode', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    enableRtl={true}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                expect(container.querySelector('.sf-rtl')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
            });
            const initialFocusedCell = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowRight', code: 'ArrowRight' });
            });
            const focusedCellAfterRight = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowLeft', code: 'ArrowLeft' });
            });
            const focusedCellAfterLeft = container.querySelector('.sf-focus') || container.querySelector('.sf-focused');
            expect(focusedCellAfterLeft).toBe(initialFocusedCell);
            expect(focusedCellAfterLeft).not.toBe(focusedCellAfterRight);
        });

        it('should handle focus with custom row height', async () => {
            renderResult = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                    rowHeight={50}
                >
                    {basicColumns}
                </Grid>
            );
            container = renderResult.container;
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
                expect(container.querySelector('.sf-row-min-height')).not.toBeNull();
            });
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
            await act(async () => {
                fireEvent.click(cells[0]);
            });
            await waitFor(() => {
                expect(cells[0].classList.contains('sf-focus') || cells[0].classList.contains('sf-focused')).toBeTruthy();
            });
            await act(async () => {
                fireEvent.keyDown(gridRef.current.element, { key: 'ArrowDown', code: 'ArrowDown' });
            });
            await waitFor(() => {
                const focusedCell = container.querySelector('tr.sf-grid-content-row[aria-rowindex="2"] td.sf-focus') ||
                    container.querySelector('tr.sf-grid-content-row[aria-rowindex="2"] td.sf-focused');
                expect(focusedCell).not.toBeNull();
                const secondRowFirstCell = gridRef.current.getRows()[1].cells[0];
                expect(focusedCell).toBe(secondRowFirstCell);
            });
        });
    });
});

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createRef, RefObject } from 'react';
import { Grid, IValueFormatter } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { ColumnProps } from '../src/grid/types/column.interfaces';
import { Column } from '../src/index';
import { Columns } from '../src/index';
import { useValueFormatter } from '../src/grid/services/value-formatter';
import { DateFormatOptions, NumberFormatOptions } from '@syncfusion/react-base';

describe('Column Value Formatter', () => {
    // Move DOM mocks outside beforeEach
    beforeAll(() => {
        // Set up mocks
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
    const sampleData = [
        { 
            OrderID: 10248, 
            CustomerID: 'VINET', 
            Freight: 32.38, 
            ShipCountry: 'France',
            OrderDate: new Date('1996-07-04'),
            ShippedDate: new Date('1996-07-16T12:30:00'),
            RequiredDate: '1996-08-01',
            Price: 1234.56,
            Discount: 0.15,
            Quantity: 5
        },
        { 
            OrderID: 10249, 
            CustomerID: 'TOMSP', 
            Freight: 11.61, 
            ShipCountry: 'Germany',
            OrderDate: new Date('1996-07-05'),
            ShippedDate: new Date('1996-07-17T14:45:00'),
            RequiredDate: new Date('1996-08-16'),
            Price: 5678.90,
            Discount: 0.05,
            Quantity: 10
        }
    ];

    describe('Number Formatting Tests', () => {
        let gridRef: RefObject<GridRef>;
        let container: HTMLElement;
        const originalConsoleError = console.error;
        beforeEach(async () => {
            console.error = jest.fn(); // Suppress error logs
            gridRef = createRef<GridRef>();

            // Render grid with all number format scenarios
            const result = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        <Column field="Price" headerText="Price" width="100" type="number" format="N2" />
                        <Column field="Discount" headerText="Discount" width="100" type="number" format="P0" />
                        <Column field="Quantity" headerText="Quantity" width="100" type="number" format="N0" />
                        <Column 
                            field="Freight" 
                            headerText="Custom Freight" 
                            width="100" 
                            format={{ 
                                type: 'number',
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3
                            }} 
                        />
                    </Columns>
                </Grid>
            );
            
            container = result.container;
            
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
            console.error = originalConsoleError; // Restore original
        });

        it('verifies all number format scenarios', async () => {
            const cells = container.querySelectorAll('tbody tr:first-child td');
            
            // Basic number formats
            expect(cells[1].textContent).toContain('1,234.56'); // Number with decimals
            expect(cells[2].textContent).toContain('15%'); // Percentage
            expect(cells[3].textContent).toBe('5'); // Number without decimals
            
            // Custom number format
            expect(cells[4].textContent).toContain('32.380'); // 3 decimal places
        });

        it('handles null and invalid values', async () => {
            // Mock console.error to prevent test output pollution
            const originalConsoleError = console.error;
            console.error = jest.fn();
            const dataWithInvalidNumbers = [{ 
                OrderID: 10248, 
                Freight: null,
                Price: 'invalid',
                Discount: undefined,
                Quantity: NaN
            }];

            try {
                const { container: testContainer } = render(
                    <Grid
                        ref={gridRef}
                        dataSource={dataWithInvalidNumbers}
                        height={400}
                        width={800}
                    >
                        <Columns>
                            <Column field="OrderID" headerText="Order ID" width="120" />
                            <Column field="Freight" headerText="Freight" width="100" type="number" format={{format: "C2"}} />
                            <Column field="Price" headerText="Price" width="100" type="number" format="N2" />
                            <Column field="Discount" headerText="Discount" width="100" type="number" format="P0" />
                            <Column field="Quantity" headerText="Quantity" width="100" type="number" format="N0" />
                        </Columns>
                    </Grid>
                );

                // Wait for grid to render
                await waitFor(() => {
                    expect(testContainer.querySelector('.sf-grid')).not.toBeNull();
                    expect(testContainer.querySelector('.sf-spinner')).toBeNull();
                });

                let fmtr: IValueFormatter = gridRef.current.serviceLocator.getService<IValueFormatter>('valueFormatter');
                expect(fmtr.fromView('$32.00', fmtr.getParserFunction((gridRef.current.getColumns() as ColumnProps[])[1].format as NumberFormatOptions | DateFormatOptions) as any, 'custom')).toBe('$32.00');

                // Get all cells in the first row
                const cells = testContainer.querySelectorAll('tbody tr:first-child td');
                
                // Check if invalid number values are handled gracefully
                expect(cells[1].textContent).toBe(''); // null
                expect(cells[2].textContent).toBe(''); // invalid string
                expect(cells[3].textContent).toBe(''); // undefined
                expect(cells[4].textContent).toBe('NaN'); // NaN
            } finally {
                console.error = originalConsoleError;
            }
        });
    });

    describe('Date Formatting Tests', () => {
        let gridRef: RefObject<GridRef>;
        let container: HTMLElement;
        const originalConsoleError = console.error;
        beforeEach(async () => {
            console.error = jest.fn(); // Suppress error logs
            gridRef = createRef<GridRef>();

            const result = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        <Column field="ShippedDate" headerText="Shipped Date" width="150" type="datetime" format="M/dd/yyyy hh:mm" />
                        <Column field="RequiredDate" headerText="Required Date" width="150" type="dateonly" format="yMd" />
                        <Column 
                            field="OrderDate" 
                            headerText="Custom Date" 
                            width="150" 
                            format={{ 
                                type: 'date',
                                skeleton: 'full'
                            }} 
                        />
                    </Columns>
                </Grid>
            );
            
            container = result.container;
            
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
            console.error = originalConsoleError; // Restore original
        });

        it('verifies all date format scenarios', async () => {
            const cells = container.querySelectorAll('tbody tr:first-child td');
            
            // DateTime format
            expect(cells[1].textContent).toContain('7/16/1996');
            expect(cells[1].textContent).toContain('12:30');
            
            // Date only format
            expect(cells[2].textContent).toContain('8/1/1996');
            
            // Custom date format
            expect(cells[3].textContent).not.toBe('');
        });

        it('handles invalid dates and format operations', async () => {
            // Mock console.error to prevent test output pollution
            const originalConsoleError = console.error;
            console.error = jest.fn();
            
            try {
                const { container: testContainer } = render(
                    <Grid
                        ref={gridRef}
                        dataSource={sampleData}
                        height={400}
                        width={800}
                    >
                        <Columns>
                            <Column field="OrderID" headerText="Order ID" width="120" />
                            <Column field="OrderDate" headerText="Order Date" width="150" format={{ type: 'date', skeleton: 'yMd' }} />
                            <Column field="ShippedDate" headerText="Shipped Date" width="150" format={{ type: 'datetime', format: 'M/dd/yyyy hh:mm' }} />
                            <Column field="RequiredDate" headerText="Required Date" width="150" format={{ type: 'date', format: 'yMd' }} />
                        </Columns>
                    </Grid>
                );

                await waitFor(() => {
                    expect(testContainer.querySelector('.sf-grid')).not.toBeNull();
                    expect(testContainer.querySelector('.sf-spinner')).toBeNull();
                });

                let fmtr: IValueFormatter = gridRef.current.serviceLocator.getService<IValueFormatter>('valueFormatter');
                
                // Test parser function with valid date
                const dateFormat = (gridRef.current.getColumns() as ColumnProps[])[1].format as DateFormatOptions;
                expect(fmtr.fromView('7/16/1996', fmtr.getParserFunction(dateFormat) as any, 'custom')).toBe('7/16/1996');
                
                // Test invalid date handling
                const result = render(
                    <Grid
                        ref={gridRef}
                        dataSource={[{ 
                            OrderID: 10248,
                            OrderDate: 'invalid-date',
                            ShippedDate: null,
                            RequiredDate: undefined
                        }]}
                        height={400}
                        width={800}
                    >
                        <Columns>
                            <Column field="OrderID" headerText="Order ID" width="120" />
                            <Column field="OrderDate" headerText="Order Date" width="150" type="date" format={{ type: 'date', format: 'yMd' }} />
                            <Column field="ShippedDate" headerText="Shipped Date" width="150" type="datetime" format={{ type: 'datetime', format: 'M/dd/yyyy hh:mm' }} />
                            <Column field="RequiredDate" headerText="Required Date" width="150" type="date" format={{ type: 'date', format: 'yMd' }} />
                        </Columns>
                    </Grid>
                );
                
                container = result.container;
                
                await waitFor(() => {
                    expect(container.querySelector('.sf-grid')).not.toBeNull();
                    expect(container.querySelector('.sf-spinner')).toBeNull();
                });
            } finally {
                console.error = originalConsoleError;
            }
        });
    });

    describe('Format and Template Tests', () => {
        let gridRef: RefObject<GridRef>;
        let container: HTMLElement;

        const originalConsoleError = console.error;
        beforeEach(async () => {
            console.error = jest.fn(); // Suppress error logs
            gridRef = createRef<GridRef>();

            // Single grid rendering for all format and template tests
            const result = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        {/* Custom number formats */}
                        <Column 
                            field="Freight" 
                            headerText="Freight" 
                            width="100" 
                            format={{ 
                                type: 'number',
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3
                            }} 
                        />
                        <Column 
                            field="Price" 
                            headerText="Price" 
                            width="100" 
                            format={{ 
                                type: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 2
                            }} 
                        />
                        {/* Custom date formats */}
                        <Column 
                            field="OrderDate" 
                            headerText="Order Date" 
                            width="150" 
                            format={{ 
                                type: 'date',
                                skeleton: 'full'
                            }} 
                        />
                        <Column 
                            field="ShippedDate" 
                            headerText="Shipped Date" 
                            width="150" 
                            format={{ 
                                type: 'datetime',
                                skeleton: 'medium'
                            }} 
                        />
                        {/* Template columns */}
                        <Column 
                            field="Freight1" 
                            headerText="Template Freight" 
                            width="100" 
                            type="number" 
                            format="C2"
                            template={({ data }) => (
                                <div data-testid="custom-template">
                                    <span>Value: {data['Freight']}</span>
                                </div>
                            )}
                            headerTemplate={(props) => (
                                <div data-testid="custom-header-template">
                                    <span>Header: {props.column.headerText}</span>
                                </div>
                            )}
                        />
                        <Column 
                            field="Price1" 
                            headerText="String Template" 
                            width="100" 
                            type="number" 
                            format="C2"
                            template="<div>Custom Cell</div>"
                            headerTemplate="<div>Custom Header</div>"
                        />
                    </Columns>
                </Grid>
            );
            
            container = result.container;
            
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
            console.error = originalConsoleError; // Restore original
        });

        it('handles custom format objects for numbers', async () => {
            const cells = container.querySelectorAll('tbody tr:first-child td');
            
            // Freight should have 3 decimal places
            expect(cells[1].textContent).toContain('32.380');
            
            // Price should be formatted as number
            expect(cells[2].textContent).toContain('1,234.56');
        });

        it('handles custom format objects for dates', async () => {
            const cells = container.querySelectorAll('tbody tr:first-child td');
            
            // Check if custom format objects for dates are applied correctly
            expect(cells[3].textContent).not.toBe('');
        });

        it('handles template rendering with formatted values', async () => {
            // Check if template is rendered correctly
            const templateElement = container.querySelector('[data-testid="custom-template"]');
            expect(templateElement).not.toBeNull();
            expect(templateElement.textContent).toContain('Value: 32.38');
        });

        it('handles header template rendering', async () => {
            // Check if header template is rendered correctly
            const headerTemplateElement = container.querySelector('[data-testid="custom-header-template"]');
            expect(headerTemplateElement).not.toBeNull();
            expect(headerTemplateElement.textContent).toContain('Header: Template Freight');
        });

        it('handles string template', async () => {
            // Check if string template is rendered correctly
            const stringCell = container.querySelectorAll('td')[6];
            expect(stringCell.textContent).toBe('<div>Custom Cell</div>');
        });

        it('handles string header template', async () => {
            // Check if string header template is rendered correctly
            const stringHeader = container.querySelectorAll('th')[6];
            expect(stringHeader.textContent).toBe('<div>Custom Header</div>');
        });
    });

    describe('Value Formatter Hook Tests', () => {
        it('verifies formatter functionality and error handling', async () => {
            // Mock console.error to prevent test output pollution
            const originalConsoleError = console.error;
            console.error = jest.fn();

            try {
                const TestComponent = () => {
                    const formatter = useValueFormatter();

                    // Test error cases
                    const errorParser = () => { throw new Error('Parser error'); };
                    const fromViewError = formatter.fromView('test value', errorParser, 'number');
                    
                    const errorFormatter = () => { throw new Error('Formatter error'); };
                    const toViewError = formatter.toView(123.45, errorFormatter);

                    // Test all parser functions
                    const dateParserResult = formatter.getParserFunction({ 
                        type: 'date', 
                        skeleton: 'yMd' 
                    } as DateFormatOptions);
                    
                    const numberParserResult = formatter.getParserFunction({ 
                        format: 'C2' 
                    } as NumberFormatOptions);
                    
                    const invalidParserResult = formatter.getParserFunction({ 
                        type: 'invalid' 
                    } as any);
                    
                    return (
                        <div>
                            <div data-testid="from-view-error">{fromViewError as string}</div>
                            <div data-testid="to-view-error">{toViewError as string}</div>
                            <div data-testid="date-parser">{dateParserResult ? 'Date parser created' : 'Date parser failed'}</div>
                            <div data-testid="number-parser">{numberParserResult ? 'Number parser created' : 'Number parser failed'}</div>
                            <div data-testid="invalid-parser">{invalidParserResult() === '' ? 'Error parser created' : 'Error parser failed'}</div>
                        </div>
                    );
                };
                
                const { getByTestId } = render(<TestComponent />);
                
                // Error handling assertions
                expect(getByTestId('from-view-error').textContent).toBe('test value');
                expect(getByTestId('to-view-error').textContent).toBe('123.45');
                
                // Parser function assertions
                expect(getByTestId('date-parser').textContent).toBe('Date parser created');
                expect(getByTestId('number-parser').textContent).toBe('Number parser created');
                expect(getByTestId('invalid-parser').textContent).toBe('Error parser created');
                
                // Verify console.error was called for error cases
                expect(console.error).toHaveBeenCalled();
            } finally {
                console.error = originalConsoleError;
            }
        });

        it('auto-detects value types when type is not specified', async () => {
            const gridRef = createRef<GridRef>();
            const result = render(
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    height={400}
                    width={800}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        <Column field="Freight" headerText="Freight" width="100" format="N2" />
                        <Column field="OrderDate" headerText="Order Date" width="150" format="yMd" />
                        <Column field="ShippedDate" headerText="Shipped Date" width="150" format={{type: 'date', format: "yMd"}} />
                    </Columns>
                </Grid>
            );

            await waitFor(() => {
                expect(result.container.querySelector('.sf-grid')).not.toBeNull();
                expect(result.container.querySelector('.sf-spinner')).toBeNull();
            });

            const cells = result.container.querySelectorAll('tbody tr:first-child td');
            const fmtr: IValueFormatter = gridRef.current.serviceLocator.getService<IValueFormatter>('valueFormatter');
            
            // Verify auto-detection
            expect(cells[1].textContent).toContain('32.38'); // Number auto-detected
            expect(cells[2].textContent).toContain('7/4/1996'); // Date auto-detected

            // Test auto-detected format parser
            const cols = gridRef.current.getColumns() as ColumnProps[];
            expect(fmtr.fromView('7/16/1996', 
                fmtr.getParserFunction(cols[3].format as DateFormatOptions) as any, 
                'custom'
            )).toBe('7/16/1996');
        });
    });
});

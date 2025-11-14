import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CellClassProps, CellType, Grid, RowType } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { AggregateColumn, AggregateRow, Aggregates, Column, Columns } from '../src/index';
import userEvent from '@testing-library/user-event';

// Mock ResizeObserver for Jest environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));
describe('Grid Aggregate Functionality', () => {
    // Sample data for testing
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, OrderDate: new Date('1996-07-04'), Salary: 1, Cost: 1 },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, OrderDate: new Date('1996-07-05'), Salary: 1, Cost: 1 },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, OrderDate: new Date('1996-07-08'), Salary: 1, Cost: 1 },
        { OrderID: 10251, CustomerID: 'VICTE', Freight: 41.34, OrderDate: new Date('1996-07-08'), Salary: 1, Cost: 1 },
        { OrderID: 10252, CustomerID: 'SUPRD', Freight: 51.30, OrderDate: new Date('1996-07-09'), Salary: 1, Cost: 1 }
    ];

    let gridRef: React.RefObject<GridRef>;

    beforeEach(() => {

        gridRef = React.createRef<GridRef>();

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

    it('basic test', async () => {

        const TestComponent = () => {
            const footerSum = (props) => {
                return (<span>Sum: {props.Sum}</span>);
            };
            const footerSumCustom = (props) => {
                return (<span>{props.Sum}-{props.Custom}</span>);
            };
            const footerMax = (props) => {
                return (<span>Max: {props.Max}</span>);
            };
            const footerMin = (props) => {
                return (<span>Min: {props.Min}</span>);
            };
            const footerAverage = (props) => {
                return (<span>Average: {props.Average}</span>);
            };
            const footerCount = (props) => {
                return (<span>Count: {props.Count}</span>);
            };
            const customAggregateFn = (datas: any): Object => {
                return datas.result.length;
            }
            const footerCustom = (props) => {
                return (<span style={{ color: 'red', fontWeight: 900 }}>Custom: {props.Custom}</span>);
            }
            const aggregateCellClass = React.useCallback((props: CellClassProps) => {
                return props.cellType === CellType.Aggregate ? 'aggregatefunctionclass' : '';
            }, []);

            return (
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    editSettings={React.useMemo(() => ({allowEdit: true}), [])}
                    height={400}
                    width={800}
                    rowClass={(props) => props.rowType === RowType.Aggregate ? 'aggregateRowClass' : ''}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120"/>
                        <Column field="CustomerID" headerText="Customer ID" width="150" />
                        <Column field="Freight" headerText="Freight" width="100" />
                        <Column field="Salary" headerText="Salary" width="100" />
                        <Column field="Cost" headerText="Cost" width="100" />
                    </Columns>
                    <Aggregates>
                        <AggregateRow>
                            <AggregateColumn field='Freight' type={['Sum', 'Custom']} customAggregate={customAggregateFn} footerTemplate={footerSumCustom} format={{ format: 'C2' }} cellClass={(_props) => ''}/>
                            <AggregateColumn field='Salary' type='Max' footerTemplate={footerMax} format='C2' cellClass={''}/>
                            <AggregateColumn field='Cost' type='Min' footerTemplate={footerMin} format={{ format: 'C2' }} cellClass={aggregateCellClass}/>
                            <AggregateColumn field='CustomerID' type='Count' footerTemplate={footerCount} cellClass={(props) => props.cellType === CellType.Aggregate ? 'aggregatestringclass' : ''}/>
                        </AggregateRow>
                        <AggregateRow>
                            <AggregateColumn field='Freight' type='Average' footerTemplate={footerAverage} format={{ format: 'C2' }} />
                            <AggregateColumn field='Salary' type='Count' format='C2' />
                            <AggregateColumn field='Cost' type='Sum' footerTemplate={footerSum} format={{ format: 'C2' }} />
                            <AggregateColumn field='CustomerID' type='Custom' customAggregate='12' footerTemplate={footerCustom} />
                            <AggregateColumn field='OrderID' type='Average' footerTemplate={<span>Average:</span>} format={{ format: 'C2' }} />
                        </AggregateRow>
                    </Aggregates>
                </Grid>
            );
        };

        const { container } = render(<TestComponent />);

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(gridRef.current.getRows().length).toBe(5);
            expect(gridRef.current.element.querySelector('.sf-grid-footer-container')).toBeTruthy();
            expect(gridRef.current.element.querySelector('.sf-grid-summary-content')).toBeTruthy();
            const summaryRow = gridRef.current.element.querySelectorAll('.sf-grid-summary-row');
            expect(summaryRow.length).toBe(2);
            expect((summaryRow[1] as HTMLTableRowElement).cells[3].textContent).toBe('$5.00');
            expect((summaryRow[1] as HTMLTableRowElement).cells[1].textContent).toBe('Custom: 12');
            expect(gridRef.current.getFooterTable()).not.toBeNull();
            expect(gridRef.current.getFooterRows().length).toBe(2);
            expect(gridRef.current.getFooterRowsObject().length).toBe(2);
            expect(Aggregates({} as any)).toBeNull();
            expect(AggregateRow({} as any)).toBeNull();
            expect(AggregateColumn({} as any)).toBeNull();
        });

        await waitFor(() => {
            expect(container.querySelector('.sf-spinner')).toBeNull()
        });

        await act(async() => {
            gridRef.current?.selectRow(1);
            gridRef.current?.editRecord();
        });

        // Wait for edit form to render
        await waitFor(() => {
            const editForm = container.querySelector('.sf-grid-edit-row, .sf-grid-add-row');
            expect(editForm).not.toBeNull();
            const costInput = container.querySelector('[id="grid-edit-Cost"]') as HTMLInputElement;
            expect(costInput).not.toBeNull();
            expect(screen.getByText('Min: $1.00')).toBeInTheDocument();
        });

        const costInput = container.querySelector('[id="grid-edit-Cost"]') as HTMLInputElement;
        await userEvent.click(costInput);
        // Clear the input first
        await userEvent.clear(costInput);
        await act(async() => {
            fireEvent.change(costInput, { target: { value: '' } });
            fireEvent.change(costInput, { target: { value: '0.20' } });
        });
        await waitFor(() => {
            const costInput = container.querySelector('[id="grid-edit-Cost"]') as HTMLInputElement;
            expect(costInput.value).toBe('0.20');
        }, {timeout: 3000});
        await act(async() => {
            gridRef.current?.saveDataChanges();
        });
        await waitFor(() => {
            expect(screen.getByText('Min: $0.20')).toBeInTheDocument();
        });
    }, 5000);

    it('basic test StrictMode', async () => {

        const TestComponent = () => {
            const footerSum = (props) => {
                return (<span>Sum: {props.Sum}</span>);
            };
            const footerSumCustom = (props) => {
                return (<span>{props.Sum}-{props.Custom}</span>);
            };
            const footerMax = (props) => {
                return (<span>Max: {props.Max}</span>);
            };
            const footerMin = (props) => {
                return (<span>Min: {props.Min}</span>);
            };
            const footerAverage = (props) => {
                return (<span>Average: {props.Average}</span>);
            };
            const footerCount = (props) => {
                return (<span>Count: {props.Count}</span>);
            };
            const customAggregateFn = (datas: any): Object => {
                return datas.result.length;
            }
            const footerCustom = (props) => {
                return (<span style={{ color: 'red', fontWeight: 900 }}>Custom: {props.Custom}</span>);
            }
            const aggregateCellClass = React.useCallback((props: CellClassProps) => {
                return props.cellType === CellType.Aggregate ? 'aggregatefunctionclass' : '';
            }, []);

            return (
                <React.StrictMode>
                    <Grid
                        ref={gridRef}
                        dataSource={sampleData}
                        editSettings={React.useMemo(() => ({ allowEdit: true }), [])}
                        height={400}
                        width={800}
                        rowClass={(props) => props.rowType === RowType.Aggregate ? 'aggregateRowClass' : ''}
                    >
                        <Columns>
                            <Column field="OrderID" headerText="Order ID" width="120" />
                            <Column field="CustomerID" headerText="Customer ID" width="150" />
                            <Column field="Freight" headerText="Freight" width="100" />
                            <Column field="Salary" headerText="Salary" width="100" />
                            <Column field="Cost" headerText="Cost" width="100" />
                        </Columns>
                        <Aggregates>
                            <AggregateRow>
                                <AggregateColumn field='Freight' type={['Sum', 'Custom']} customAggregate={customAggregateFn} footerTemplate={footerSumCustom} format={{ format: 'C2' }} cellClass={(_props) => ''} />
                                <AggregateColumn field='Salary' type='Max' footerTemplate={footerMax} format='C2' cellClass={''} />
                                <AggregateColumn field='Cost' type='Min' footerTemplate={footerMin} format={{ format: 'C2' }} cellClass={aggregateCellClass} />
                                <AggregateColumn field='CustomerID' type='Count' footerTemplate={footerCount} cellClass={(props) => props.cellType === CellType.Aggregate ? 'aggregatestringclass' : ''} />
                            </AggregateRow>
                            <AggregateRow>
                                <AggregateColumn field='Freight' type='Average' footerTemplate={footerAverage} format={{ format: 'C2' }} />
                                <AggregateColumn field='Salary' type='Count' format='C2' />
                                <AggregateColumn field='Cost' type='Sum' footerTemplate={footerSum} format={{ format: 'C2' }} />
                                <AggregateColumn field='CustomerID' type='Custom' customAggregate='12' footerTemplate={footerCustom} />
                                <AggregateColumn field='OrderID' type='Average' footerTemplate={<span>Average:</span>} format={{ format: 'C2' }} />
                            </AggregateRow>
                        </Aggregates>
                    </Grid>
                </React.StrictMode>
            );
        };

        let container;
        await act(async () => {
            const renderResult = render(<TestComponent />);
            container = renderResult.container;
        });

        await waitFor(() => {
            expect(container.querySelector('.sf-spinner')).toBeNull();
        });
    }, 5000);
});

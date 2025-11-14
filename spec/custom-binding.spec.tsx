import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid } from '../src/index';
import { DataRequestEvent } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { Column, Columns } from '../src/index';
import { act, useState } from 'react';
import { DataManager, DataResult, Predicate, Query } from '@syncfusion/react-data';

describe('Grid Custom Binding Functionality', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, OrderDate: new Date('1996-07-04') },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, OrderDate: new Date('1996-07-05') },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, OrderDate: new Date('1996-07-08') },
        { OrderID: 10251, CustomerID: 'VICTE', Freight: 41.34, OrderDate: new Date('1996-07-08') },
        { OrderID: 10252, CustomerID: 'SUPRD', Freight: 51.30, OrderDate: new Date('1996-07-09') }
    ];

    let gridRef: React.RefObject<GridRef>;

    beforeEach(() => {
        gridRef = React.createRef<GridRef>();

        // Mock DOM methods
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
    });

    describe('Basic interactions', () => {
        const dataManager = new DataManager(sampleData);
        const TestComponent = () => {
            const [data, setData] = useState({
                result: sampleData,
                count: sampleData.length
            });
            return (
                <Grid
                    ref={gridRef}
                    dataSource={data}
                    height={400}
                    width={800}
                    filterSettings={React.useMemo(() => ({ enabled: true, mode: 'OnEnter' }), [])}
                    sortSettings={React.useMemo(() => ({ enabled: true }), [])}
                    searchSettings={React.useMemo(() => ({ enabled: true }), [])}
                    onDataRequest={React.useCallback((args: DataRequestEvent) => {
                        const query = new Query();
                        if (args.where) {
                            let wherePredicate: Predicate;
                            const where = args.where[0].predicates;
                            for (let i = 0; i < where.length; i++) {
                                if (wherePredicate) {
                                    wherePredicate = wherePredicate.and(new Predicate(
                                        where[i].field, where[i].operator,
                                        where[i].value, where[i].ignoreCase, where[i].ignoreAccent, where[i].matchCase
                                    ));
                                } else {
                                    wherePredicate = new Predicate(
                                        where[i].field, where[i].operator,
                                        where[i].value, where[i].ignoreCase, where[i].ignoreAccent, where[i].matchCase
                                    );
                                }
                            }
                            query.where(wherePredicate);
                        }
                        if (args.search) {
                            const { fields, value } = args.search[0];
                            query.search(value, fields);
                        }
                        if (args.sort) {
                            args.sort.forEach(sort => {
                                query.sortBy(sort.field, sort.direction);
                            });
                        }
                        dataManager.executeQuery(query).then((e) => {
                            setData({
                                result: (e as { result?: { OrderID: number; CustomerID: string; Freight: number; OrderDate: Date; }[] }).result,
                                count: (e as DataResult).count
                            });
                        });
                    }, [])}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        <Column field="CustomerID" headerText="Customer ID" width="150" />
                        <Column field="Freight" headerText="Freight" width="100" />
                    </Columns>
                </Grid>
            );
        };

        it('handles filter, sort, and search interactions correctly', async () => {
            const { container } = render(<TestComponent />);

            // Initial render assertions
            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
                expect(gridRef.current.getRows().length).toBe(5);
            }, { interval: 100, timeout: 10000 });

            // Filter action
            await act(async () => {
                gridRef.current.filterByColumn('CustomerID', 'contains', 'VI', 'and', false, false);
            });
            await waitFor(() => {
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
                expect(gridRef.current.filterSettings.columns[0].field).toBe('CustomerID');
                expect(gridRef.current.filterSettings.columns[0].operator).toBe('contains');
                expect(gridRef.current.filterSettings.columns[0].value).toBe('VI');
            }, { interval: 100, timeout: 10000 });

            // Reset filter
            await act(async () => {
                gridRef.current.clearFilter();
            });

            // Sort action
            await act(async () => {
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
            });
            await waitFor(() => {
                expect(gridRef.current.sortSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns[0].field).toBe('OrderID');
                expect(gridRef.current.sortSettings.columns[0].direction).toBe('Ascending');
            }, { interval: 100, timeout: 10000 });

            // Reset sort
            await act(async () => {
                gridRef.current.clearSort();
            });

            // Search action
            await act(async () => {
                gridRef.current.search('10248');
            });
            await waitFor(() => {
                expect(gridRef.current.searchSettings.value).toBe('10248');
            }, { interval: 100, timeout: 10000 });
        }, 20000);
    });

    describe('Paging interactions', () => {
        const dataManager = new DataManager(sampleData);
        const TestComponent = () => {
            const [data, setData] = useState({
                result: sampleData.slice(0, 3),
                count: sampleData.length
            });
            return (
                <Grid
                    ref={gridRef}
                    dataSource={data}
                    height={400}
                    width={800}
                    filterSettings={React.useMemo(() => ({ enabled: true, mode: 'OnEnter' }), [])}
                    searchSettings={React.useMemo(() => ({ enabled: true }), [])}
                    pageSettings={React.useMemo(() => ({ enabled: true, pageSize: 3 }), [])}
                    sortSettings={React.useMemo(() => ({ enabled: true }), [])}
                    onDataRequest={React.useCallback((args: DataRequestEvent) => {
                        const query = new Query();
                        if (args.where) {
                            let wherePredicate: Predicate;
                            const where = args.where[0].predicates;
                            for (let i = 0; i < where.length; i++) {
                                if (wherePredicate) {
                                    wherePredicate = wherePredicate.and(new Predicate(
                                        where[i].field, where[i].operator,
                                        where[i].value, where[i].ignoreCase, where[i].ignoreAccent, where[i].matchCase
                                    ));
                                } else {
                                    wherePredicate = new Predicate(
                                        where[i].field, where[i].operator,
                                        where[i].value, where[i].ignoreCase, where[i].ignoreAccent, where[i].matchCase
                                    );
                                }
                            }
                            query.where(wherePredicate);
                        }
                        if (args.search) {
                            const { fields, value } = args.search[0];
                            query.search(value, fields);
                        }
                        if (args.sort) {
                            args.sort.forEach(sort => {
                                query.sortBy(sort.field, sort.direction);
                            });
                        }
                        if (args.take && args.skip) {
                            const pageSkip = args.skip / args.take + 1;
                            const pageTake = args.take;
                            query.page(pageSkip, pageTake);
                        } else if (args.skip === 0 && args.take) {
                            query.page(1, args.take);
                        }
                        if (args.requiresCounts) {
                            query.requiresCount();
                        }
                        dataManager.executeQuery(query).then((e) => {
                            setData({
                                result: (e as { result?: { OrderID: number; CustomerID: string; Freight: number; OrderDate: Date; }[] }).result,
                                count: (e as DataResult).count
                            });
                        });
                    }, [])}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width="120" />
                        <Column field="CustomerID" headerText="Customer ID" width="150" />
                        <Column field="Freight" headerText="Freight" width="100" />
                    </Columns>
                </Grid>
            );
        };

        it('handles paging correctly', async () => {
            const { container } = render(<TestComponent />);

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
                expect(container.querySelector('.sf-spinner')).toBeNull();
                expect(gridRef.current.getRows().length).toBe(3);
            }, { interval: 100, timeout: 10000 });

            await act(async () => {
                gridRef.current.goToPage(2);
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
                expect(gridRef.current.getRows().length).toBe(2); // Last page has 2 rows (5 total, pageSize 3)
                expect(container.querySelector('.sf-grid')).not.toBeNull();
            }, { interval: 100, timeout: 10000 });
        }, 20000);
    });
});
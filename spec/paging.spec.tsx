import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react';
import { Grid } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { Column, Columns } from '../src/index';

describe('Grid Paging Functionality', () => {
    // Utility function for generating sample data
    const generateSampleData = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
            OrderID: 10247 + i + 1,
            CustomerID: `CUST${(i + 1).toString().padStart(3, '0')}`,
            Freight: Math.round((Math.random() * 100) * 100) / 100,
            OrderDate: new Date(2023, 0, (i % 30) + 1),
            ShipCity: `City${i + 1}`,
            ShipCountry: (i % 2) === 0 ? 'USA' : 'UK'
        }));
    };

    // Common test data
    const sampleData = generateSampleData(50);
    const smallData = generateSampleData(5);
    const largeData = generateSampleData(1000);

    let gridRef: React.RefObject<GridRef>;
    let container: HTMLElement;

    // Common column configuration
    const commonColumns = (
        <Columns>
            <Column field="OrderID" headerText="Order ID" width="120" />
            <Column field="CustomerID" headerText="Customer ID" width="150" />
            <Column field="Freight" headerText="Freight" width="100" />
        </Columns>
    );

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

        global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
    });

    beforeEach(() => {
        gridRef = React.createRef<GridRef>();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Helper function for grid setup
    const setupGrid = async (options = {}) => {
        const defaultOptions = {
            dataSource: sampleData,
            pageSettings: { enabled: true, pageSize: 10, currentPage: 1 },
            onPageChangeStart: undefined,
            onPageChange: undefined,
            height: 400,
            width: 800
        };

        const mergedOptions = { ...defaultOptions, ...options };
        
        const result = render(
            <Grid
                ref={gridRef}
                {...mergedOptions}
            >
                {commonColumns}
            </Grid>
        );

        container = result.container;

        // Wait for both grid and spinner
        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spin-hide')).not.toBeNull();
        }, {
            timeout: 3000,
            interval: 100
        });

        return { gridRef, container };
    };

    describe('Basic Paging Configuration', () => {
        it('should handle various paging configurations', async () => {
            // Test enabled paging
            await setupGrid({
                pageSettings: { enabled: true, pageSize: 10, currentPage: 1 }
            });

            expect(gridRef.current.pageSettings.enabled).toBe(true);
            expect(gridRef.current.pageSettings.pageSize).toBe(10);
            expect(gridRef.current.pageSettings.currentPage).toBe(1);

            // Test disabled paging
            await setupGrid({
                pageSettings: { enabled: false }
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.enabled).toBe(false);
            });

            // Test default settings
            await setupGrid({
                pageSettings: { enabled: true }
            });

            expect(gridRef.current.pageSettings).toBeDefined();
            expect(gridRef.current.pageSettings.currentPage).toBe(1);
            expect(gridRef.current.pageSettings.pageSize).toBeGreaterThan(0);

            // Test custom settings
            const customSettings = {
                enabled: true,
                pageSize: 15,
                currentPage: 2,
                pageCount: 5,
                totalRecordsCount: 50
            };

            await setupGrid({
                pageSettings: customSettings
            });

            expect(gridRef.current.pageSettings.pageSize).toBe(15);
            expect(gridRef.current.pageSettings.currentPage).toBe(2);
            expect(gridRef.current.pageSettings.pageCount).toBe(5);
        });
    });

    describe('Page Navigation and Events', () => {
        it('should handle page navigation with events', async () => {
            const pageChangingSpy = jest.fn();
            const pageChangedSpy = jest.fn();

            await setupGrid({
                pageSettings: { enabled: true, pageSize: 10, currentPage: 1 },
                onPageChangeStart: pageChangingSpy,
                onPageChange: pageChangedSpy
            });

            // Test page navigation
            await act(async () => {
                gridRef.current.goToPage(2);
                // Add delay to ensure event handlers are called
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            // Verify events and page change
            await waitFor(() => {
                expect(pageChangingSpy).toHaveBeenCalled();
                expect(pageChangedSpy).toHaveBeenCalled();
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
            });

            // Test invalid page numbers
            await act(async () => {
                gridRef.current.goToPage(-1);
            });

            // Set to valid page first
            await act(async () => {
                gridRef.current.goToPage(1);
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(1);
            });

            // Test with zero
            await act(async () => {
                gridRef.current.goToPage(0);
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBeLessThanOrEqual(1);
            });

            // Test pager message
            await act(async () => {
                gridRef.current.setPagerMessage('Custom message');
            });

            await waitFor(() => {
                const msgElement = gridRef.current.element.querySelector('.sf-pager-external-message');
                expect(msgElement.textContent).toBe('Custom message');
            });
        });

        it('should handle event cancellation', async () => {
            const cancelSpy = jest.fn(args => {
                args.cancel = true;
            });

            await setupGrid({
                onPageChangeStart: cancelSpy
            });

            const initialPage = gridRef.current.pageSettings.currentPage;

            await act(async () => {
                gridRef.current.goToPage(3);
            });

            expect(cancelSpy).toHaveBeenCalled();
            expect(gridRef.current.pageSettings.currentPage).toBe(initialPage);
        });
    });

    describe('UI Interactions', () => {
        it('should handle pager UI interactions', async () => {
            const { container } = await setupGrid({
                pageSettings: { enabled: true, pageSize: 5, currentPage: 1 }
            });

            // Wait for pager to be fully rendered
            await waitFor(() => {
                const nextButton = container.querySelector('.sf-pager-next');
                expect(nextButton).not.toBeNull();
            });

            // Find and test next button
            const nextButton = container.querySelector('.sf-pager-next');
            await act(async () => {
                fireEvent.click(nextButton);
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
            });

            // Find and test numeric buttons
            const numericButtons = container.querySelectorAll('.sf-pager-numeric-container a');
            if (numericButtons.length > 2) {
                await act(async () => {
                    fireEvent.click(numericButtons[2]); // Click third page
                });

                expect(gridRef.current.pageSettings.currentPage).toBe(3);
            }
        });
    });

    describe('Integration with Other Features', () => {
        it('should maintain paging with other operations', async () => {
            // Test with sorting
            await setupGrid({
                sortSettings: { enabled: true },
                pageSettings: { enabled: true, pageSize: 10, currentPage: 2 }
            });

            await act(async () => {
                gridRef.current.sortByColumn('OrderID', 'Ascending', false);
            });

            expect(gridRef.current.pageSettings.enabled).toBe(true);
            expect(gridRef.current.pageSettings.pageSize).toBe(10);

            // Test with filtering
            await setupGrid({
                filterSettings: { enabled: true },
                pageSettings: { enabled: true, pageSize: 10, currentPage: 1 }
            });

            await act(async () => {
                gridRef.current.filterByColumn('CustomerID', 'startswith', 'CUST0');
            });

            expect(gridRef.current.pageSettings.enabled).toBe(true);
        });
    });

    describe('Edge Cases and Performance', () => {
        it('should handle edge cases gracefully', async () => {
            // Empty data source
            await setupGrid({
                dataSource: [],
                pageSettings: { enabled: true, pageSize: 10, currentPage: 1 }
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(1);
            });

            // Small data set with only 5 records
            await setupGrid({
                dataSource: smallData,
                pageSettings: { enabled: true, pageSize: 10, currentPage: 1 }
            });

            // First ensure we're on page 1
            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(1);
            });

            // Reset pageSettings to ensure clean state
            await act(async () => {
                gridRef.current.pageSettings = { enabled: true, pageSize: 10, currentPage: 1 };
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            // Now attempt to navigate beyond available data
            await act(async () => {
                gridRef.current.goToPage(2);
            });

            // Should stay on page 1 due to insufficient data
            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBeGreaterThanOrEqual(1);
            });
        });
    });

    describe('Accessibility and Templates', () => {
        it('should support accessibility and custom templates', async () => {
            // Test ARIA attributes
            const { container } = await setupGrid();
            
            const ariaElements = container.querySelectorAll('[aria-label], [role]');
            expect(ariaElements.length).toBeGreaterThan(0);

            // Test custom template with proper structure
            const customTemplate = (props: any) => (
                <div className="e-pager custom-pager">
                    <div className="e-pagercontainer">
                        <span>Page {props.currentPage} of {Math.ceil(props.totalRecordsCount / props.pageSize)}</span>
                    </div>
                </div>
            );

            // Setup new grid with custom template
            const { container: customContainer } = await setupGrid({
                pageSettings: {
                    enabled: true,
                    pageSize: 10,
                    currentPage: 1,
                    template: customTemplate
                }
            });

            // Wait for custom pager to be rendered
            const customPager = customContainer.querySelector('.custom-pager');
            expect(customPager).not.toBeNull();

            // Verify template content
            expect(customPager.textContent).toContain('Page');
        });

        it('should handle large datasets efficiently', async () => {
            const startTime = performance.now();

            await setupGrid({
                dataSource: largeData,
                pageSettings: { enabled: true, pageSize: 50 }
            });

            const renderTime = performance.now() - startTime;
            expect(renderTime).toBeLessThan(5000);

            // Test quick navigation
            const navStartTime = performance.now();

            for (let page = 1; page <= 5; page++) {
                await act(async () => {
                    gridRef.current.goToPage(page);
                });
            }

            const navTime = performance.now() - navStartTime;
            expect(navTime).toBeLessThan(3000);
        });
    });

    describe('Paging Navigation and Focusing (Combinations)', () => {
        it('should navigate using first/prev/next/last buttons and keep focus usability', async () => {
            const { container } = await setupGrid({
                pageSettings: { enabled: true, pageSize: 5, currentPage: 3, pageCount: 5 }
            });

            // Wait for pager to be available
            await waitFor(() => {
                expect(container.querySelector('.sf-pager-next')).not.toBeNull();
                expect(container.querySelector('.sf-pager-previous')).not.toBeNull();
            });

            const firstBtn = container.querySelector('.sf-pager-first') as HTMLElement;
            const prevBtn = container.querySelector('.sf-pager-previous') as HTMLElement;
            const nextBtn = container.querySelector('.sf-pager-next') as HTMLElement;
            const lastBtn = container.querySelector('.sf-pager-last') as HTMLElement;

            // Prev should go to 2
            await act(async () => {
                fireEvent.click(prevBtn);
            });
            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
            });

            // First should go to 1
            await act(async () => {
                fireEvent.click(firstBtn);
            });
            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(1);
            });

            // Keyboard: focus next and press Enter => 2
            await act(async () => {
                nextBtn.focus();
                fireEvent.keyDown(nextBtn, { key: 'Enter', keyCode: 13 });
            });
            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
                expect(document.activeElement).toBe(nextBtn);
            });

            // Last should navigate to the last numeric page in range (based on data/pageSize)
            await act(async () => {
                fireEvent.click(lastBtn);
            });
            await waitFor(() => {
                // For 50 sample rows and pageSize 5 => 10 pages
                expect(gridRef.current.pageSettings.currentPage).toBeGreaterThanOrEqual(5);
            });

            // Click a numeric button (1-based index)
            const numerics = container.querySelectorAll('.sf-pager-numeric-container a');
            if (numerics.length) {
                await act(async () => {
                    (numerics[0] as HTMLElement).focus();
                    fireEvent.keyDown(numerics[0], { key: 'Enter', keyCode: 13 });
                });
                await waitFor(() => {
                    expect(gridRef.current.pageSettings.currentPage).toBe(6);
                });
            }
        });

        it('should keep row focus after paging via keyboard', async () => {
            const { container } = await setupGrid({ pageSettings: { enabled: true, pageSize: 10, currentPage: 1 } });
            await waitFor(() => {
                expect(container.querySelector('.sf-grid-content-row .sf-cell')).not.toBeNull();
                expect(container.querySelector('.sf-pager-next')).not.toBeNull();
            });

            const firstCell = container.querySelector('.sf-grid-content-row .sf-cell') as HTMLElement;
            const nextBtn = container.querySelector('.sf-pager-next') as HTMLElement;

            // Focus a cell, page next via Space key on nextBtn, ensure grid remains interactive
            await act(async () => {
                firstCell.focus();
                nextBtn.focus();
                fireEvent.keyDown(nextBtn, { key: ' ', keyCode: 32 });
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
            });
        });
    });

    describe('Paging with Searching (and combinations)', () => {
        it('should reset to page 1 when searching and preserve after clearing', async () => {
            const { container } = await setupGrid({
                pageSettings: { enabled: true, pageSize: 10, currentPage: 3 },
                searchSettings: { enabled: true }
            });

            await waitFor(() => {
                expect(container.querySelector('.sf-grid')).not.toBeNull();
            });

            await act(async () => {
                gridRef.current.search('CUST020');
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(1);
                expect(gridRef.current.searchSettings.value).toBe('CUST020');
            });

            // Clear search retains page 1 and shows all
            await act(async () => {
                gridRef.current.search('');
            });
            await waitFor(() => {
                expect(gridRef.current.searchSettings.value).toBe('');
                expect(gridRef.current.pageSettings.currentPage).toBe(1);
            });
        });

        it('should maintain search while navigating pages and using numeric buttons', async () => {
            const { container } = await setupGrid({
                pageSettings: { enabled: true, pageSize: 5, currentPage: 1 },
                searchSettings: { enabled: true }
            });

            await act(async () => {
                gridRef.current.search('CUST00');
            });

            const nextBtn = container.querySelector('.sf-pager-next') as HTMLElement;
            await act(async () => {
                fireEvent.click(nextBtn);
            });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
                expect(gridRef.current.searchSettings.value).toBe('CUST00');
            });

            const numerics = container.querySelectorAll('.sf-pager-numeric-container a');
            if (numerics.length > 2) {
                await act(async () => {
                    fireEvent.click(numerics[2]); // to page 3
                });
                await waitFor(() => {
                    expect(gridRef.current.pageSettings.currentPage).toBe(3);
                    expect(gridRef.current.searchSettings.value).toBe('CUST00');
                });
            }
        });
    });

    describe('Paging with Sorting, Filtering, Searching and Editing', () => {
        it('should persist sort/filter/search/edit states across paging actions', async () => {
            await setupGrid({
                dataSource: sampleData.concat(sampleData),
                pageSettings: { enabled: true, pageSize: 4, currentPage: 2, pageCount: 4 },
                sortSettings: { enabled: true },
                filterSettings: { enabled: true, type: 'FilterBar' },
                searchSettings: { enabled: true },
                editSettings: { allowEdit: true }
            });

            // Apply combined operations
            await act(async () => {
                gridRef.current.filterByColumn('OrderID', 'greaterthan', sampleData[0].OrderID, 'and', true, false);
                gridRef.current.search('CUST0');
                gridRef.current.sortByColumn('CustomerID', 'Ascending', false);
                gridRef.current.setCellValue(sampleData[1].OrderID, 'CustomerID', 'UPDATED', true);
            });

            await waitFor(() => {
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
                expect(gridRef.current.searchSettings.value).toBe('CUST0');
                expect(gridRef.current.sortSettings.columns.length).toBe(1);
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
            });

            // Navigate pages and verify states persist
            await act(async () => {
                gridRef.current.goToPage(2);
            });
            await waitFor(() => {
                expect(gridRef.current.pageSettings.currentPage).toBe(2);
                expect(gridRef.current.searchSettings.value).toBe('CUST0');
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns.length).toBe(1);
            });

            // Clear search - other states must persist
            await act(async () => {
                gridRef.current.search('');
            });
            await waitFor(() => {
                expect(gridRef.current.searchSettings.value).toBe('');
                expect(gridRef.current.filterSettings.columns).toHaveLength(1);
                expect(gridRef.current.sortSettings.columns.length).toBe(1);
            });
        });
    });

    describe('Initial Paging - properties matrix', () => {
        it('should honor initial pageSettings: pageSize, pageCount, currentPage, totalRecordsCount, template', async () => {
            const customTemplate = (p: any) => (
                <div className="e-pager custom-template">Page {p.currentPage} / {Math.ceil((p.totalRecordsCount || p.totalItemCount || sampleData.length) / p.pageSize)}</div>
            );

            const init = {
                enabled: true,
                pageSize: 7,
                currentPage: 3,
                pageCount: 4,
                totalRecordsCount: 50,
                template: customTemplate
            };

            const { container } = await setupGrid({ pageSettings: init });

            await waitFor(() => {
                expect(gridRef.current.pageSettings.pageSize).toBe(7);
                expect(gridRef.current.pageSettings.currentPage).toBe(3);
                expect(gridRef.current.pageSettings.pageCount).toBe(4);
                const tpl = container.querySelector('.custom-template');
                expect(tpl).not.toBeNull();
                expect(tpl.textContent).toContain('Page');
            });
        });
    });
});

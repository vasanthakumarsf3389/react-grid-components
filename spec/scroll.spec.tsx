import { createRef } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { Grid } from '../src/index';
import { GridRef } from '../src/grid/types/grid.interfaces';
import { Column } from '../src/index';
import { Columns } from '../src/index';

describe('Grid Scroll Functionality', () => {
    const sampleData = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' }
    ];

    // Common column configuration
    const commonColumns = (
        <Columns>
            <Column field="OrderID" headerText="Order ID" />
            <Column field="ShipName" headerText="ShipName" />
            <Column field="ShipCity" headerText="ShipCity" />
        </Columns>
    );

    let gridRef: React.RefObject<GridRef>;
    let container: HTMLElement;
    let scrollY: number;

    // Move DOM mocks to describe level
    beforeAll(() => {
        // Initial DOM mocks
        Object.defineProperty(window, 'getComputedStyle', {
            value: () => ({
                getPropertyValue: jest.fn(() => ''),
                width: '200px',
                overflowY: 'auto'
            })
        });
    });

    beforeEach(() => {
        gridRef = createRef<GridRef>();
        
        // Reset scrollY for each test
        scrollY = 0;
        Object.defineProperty(window, 'scrollY', {
            get: () => scrollY,
            configurable: true
        });

        // Initial getBoundingClientRect mock
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Helper functions
    const fireScrollEvent = () => {
        window.dispatchEvent(new Event('scroll'));
    };

    const updateScrollPosition = async (position: number, boundingRect: Partial<DOMRect>) => {
        await act(async () => {
            Element.prototype.getBoundingClientRect = jest.fn(() => ({
                width: 120,
                height: 120,
                top: 0,
                left: 0,
                bottom: 0,
                right: 120,
                x: 0,
                y: 0,
                ...boundingRect,
                toJSON: () => {}
            }));

            scrollY = position;
            fireScrollEvent();
        });
    };

    const setupGrid = async (enableSticky: boolean = true) => {
        const renderResult = render(
            <div style={{ marginTop: 100, marginBottom: 500 }}>
                <Grid
                    ref={gridRef}
                    dataSource={sampleData}
                    enableStickyHeader={enableSticky}
                >
                    {commonColumns}
                </Grid>
            </div>
        );

        container = renderResult.container;

        await waitFor(() => {
            expect(container.querySelector('.sf-grid')).not.toBeNull();
            expect(container.querySelector('.sf-spinner')).toBeNull();
        }, {
            timeout: 2000,
            interval: 50
        });

        return container.querySelector('.sf-grid');
    };

    describe('Sticky Header Behavior', () => {
        it('should apply sticky header when scrolling with enableStickyHeader=true', async () => {
            const grid = await setupGrid(true);
            expect(grid).not.toBeNull();

            // Initial state - no sticky header
            expect(grid.querySelector('.sf-grid-header-container').classList.contains('sf-sticky')).toBeFalsy();

            // Scroll down - should show sticky header
            await updateScrollPosition(300, {
                top: -50,
                bottom: 70,
                y: -50
            });
            expect(grid.querySelector('.sf-grid-header-container').classList.contains('sf-sticky')).toBeTruthy();

            // Scroll back to top - should remove sticky header
            await updateScrollPosition(0, {
                top: 100,
                bottom: 500,
                width: 800,
                height: 400,
                y: 100
            });
            expect(grid.querySelector('.sf-grid-header-container').classList.contains('sf-sticky')).toBeFalsy();

            // Small scroll - should not trigger sticky header
            await updateScrollPosition(10, {
                top: 90,
                bottom: 490,
                y: 90
            });
            expect(grid.querySelector('.sf-grid-header-container').classList.contains('sf-sticky')).toBeFalsy();
        });

        it('should not apply sticky header when scrolling with enableStickyHeader=false', async () => {
            const grid = await setupGrid(false);
            expect(grid).not.toBeNull();

            // Initial state - no sticky header
            expect(grid.querySelector('.sf-grid-header-container').classList.contains('sf-sticky')).toBeFalsy();

            // Scroll down - should not show sticky header
            await updateScrollPosition(300, {
                top: -50,
                bottom: 70,
                y: -50
            });
            expect(grid.querySelector('.sf-grid-header-container').classList.contains('sf-sticky')).toBeFalsy();

            // Additional scroll positions
            await updateScrollPosition(500, {
                top: -100,
                bottom: 20,
                y: -100
            });
            expect(grid.querySelector('.sf-grid-header-container').classList.contains('sf-sticky')).toBeFalsy();
        });
    });
});
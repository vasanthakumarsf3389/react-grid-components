import { describe, it, expect, jest, beforeAll, afterEach } from '@jest/globals';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid, WrapMode } from '../src/index';
import { Column } from '../src/index';
import { Columns } from '../src/index';

describe('Grid Text Wrap Functionality', () => {
    // Sample data for all tests
    const sampleData: Object[] = [
        { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38, ShipCountry: 'France' },
        { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61, ShipCountry: 'Germany' },
        { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83, ShipCountry: 'Brazil' }
    ];

    // Common column configuration for all tests
    const commonColumns = (
        <Columns>
            <Column field="OrderID" headerText="Order ID" />
            <Column field="CustomerID" headerText="Customer ID" />
            <Column field="Freight" headerText="Freight" />
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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Text Wrap Modes', () => {
        it('should handle all text wrap modes correctly', () => {
            // Test Both mode
            const { container: bothContainer } = render(
                <Grid
                    dataSource={sampleData}
                    textWrapSettings={{ wrapMode: 'Both', enabled: true }}
                >
                    {commonColumns}
                </Grid>
            );

            const bothGrid = bothContainer.querySelector('.sf-grid');
            expect(bothGrid).not.toBeNull();
            expect(bothGrid?.classList.contains('sf-wrap')).toBeTruthy();
            expect(bothGrid?.querySelector('.sf-grid-header-row').classList.contains('sf-wrap')).toBeFalsy();
            expect(bothGrid?.querySelector('.sf-grid-content-container').classList.contains('sf-wrap')).toBeFalsy();

            // Test Header mode
            const { container: headerContainer } = render(
                <Grid
                    dataSource={sampleData}
                    textWrapSettings={{ wrapMode: WrapMode.Header, enabled: true }}
                >
                    {commonColumns}
                </Grid>
            );

            const headerGrid = headerContainer.querySelector('.sf-grid');
            expect(headerGrid).not.toBeNull();
            expect(headerGrid?.classList.contains('sf-wrap')).toBeFalsy();
            expect(headerGrid?.querySelector('.sf-grid-header-row').classList.contains('sf-wrap')).toBeTruthy();
            expect(headerGrid?.querySelector('.sf-grid-content-container').classList.contains('sf-wrap')).toBeFalsy();

            // Test Content mode
            const { container: contentContainer } = render(
                <Grid
                    dataSource={sampleData}
                    textWrapSettings={{ wrapMode: WrapMode.Content, enabled: true }}
                >
                    {commonColumns}
                </Grid>
            );

            const contentGrid = contentContainer.querySelector('.sf-grid');
            expect(contentGrid).not.toBeNull();
            expect(contentGrid?.classList.contains('sf-wrap')).toBeFalsy();
            expect(contentGrid?.querySelector('.sf-grid-header-row').classList.contains('sf-wrap')).toBeFalsy();
            expect(contentGrid?.querySelector('.sf-grid-content-container').classList.contains('sf-wrap')).toBeTruthy();
        });
    });
});
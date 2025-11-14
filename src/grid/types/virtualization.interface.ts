export interface VirtualizationSettings {
    /**
     * @default true
     */
    enableRow?: boolean; // completed
    /**
     * @default true
     */
    enableColumn?: boolean; // completed
    /**
     * Number of extra rows to render above and below the viewport when virtualization is enabled.
     * Helps smooth scrolling. Similar to AG Grid and MUI DataGrid rowBuffer.
     *
     * @default 5
     */
    rowBuffer?: number;
    /**
     * Number of extra columns to render left and right the viewport when virtualization is enabled.
     * Helps smooth scrolling. Similar to AG Grid and MUI DataGrid columnBuffer.
     *
     * @default 5
     */
    columnBuffer?: number;
    /**
     * @default false
     */
    preventMaxRenderedRows?: boolean;
    enableCache?: boolean;
}
import { useRef, useState } from 'react';
import { Grid, Columns, Column, GridLine, WrapMode } from '../src/index';
import { DropDownList } from '@syncfusion/react-dropdowns';
import { DataManager, ODataV4Adaptor } from '@syncfusion/react-data';
import { data } from '../samples/data';
import { Button, Checkbox } from '@syncfusion/react-buttons';
import { TextBox } from '@syncfusion/react-inputs';
import './sample.css'; // Ensure this contains the styles below

export default function App() {
    const gridRef = useRef(null);
    const orderData: Object[] = data.slice(0, 100);
    const [dataSource, setDataSource] = useState<Object[] | DataManager>(orderData);
    const [sort, setSort] = useState(true);
    const [page, setPage] = useState(true);
    const [filter, setFilter] = useState(true);
    const [textWrap, setTextWrap] = useState(true);
    const [textWrapSettings, setTextWrapSettings] = useState<WrapMode | string>('Both');
    const [htmlEncode, setHtmlEncode] = useState(false);
    const [hover, setHover] = useState(true);
    const [altRow, setAltRow] = useState(true);
    const [rtl, setRtl] = useState(false);
    const [gridLine, setGridLine] = useState<GridLine | string>('Default');
    const [selection, setSelection] = useState(true);
    const [selectionSettings, setSelectionSettings] = useState('Single');
    const [rowHeight, setRowHeight] = useState(null);
    const [selectDirection, setSelectDirection] = useState(null);
    const [multiSort, setMultiSort] = useState(false);
    const [matchCase, setMatchCase] = useState(false);
    const [toggle, setToggle] = useState(false);
    const [newPageSettings, setNewPageSettings] = useState({...gridRef.current?.pageSettings, ...{enabled: page}});
    const [pageNumber, setPageNumber] = useState(1);

    const remoteData = new DataManager({
        url: 'https://services.odata.org/V4/Northwind/Northwind.svc/Orders',
        adaptor: new ODataV4Adaptor()
    });

    const handleDataSourceChange = (args: any) => {
        setDataSource(args.value === 'localData' ? orderData : remoteData);
    };

    const handleTextWrapChange = (args: any) => {
        setTextWrapSettings(args.value);
    };
    const handleGridLineChange = (args: any) => {
        setGridLine(args.value);
    };
    const handleSelectionChange = (args: any) => {
        setSelectionSettings(args.value);
    };
    const handleRowHeightChange = (args: any) => {
        if (args.key === "Enter") {
            setRowHeight(args.target.value);
        }
    }


    const sortColumn = (() => {
        const column = (document.getElementById('column') as HTMLFormElement).value;
        if (gridRef.current) {
            gridRef.current.sortByColumn(column, selectDirection, multiSort);
        }
    })

    const filterColumn = (() => {
        const fieldName = (document.getElementById('field') as HTMLFormElement).value;
        const operator = (document.getElementById('operator') as HTMLFormElement).value;
        const value = (document.getElementById('value') as HTMLFormElement).value;
        const predicate = (document.getElementById('predicate') as HTMLFormElement).value;
        if (gridRef.current) {
            gridRef.current.filterByColumn(fieldName, operator, value, predicate, matchCase);
        }
    })

    const selectRow = (() => {
        const rowIndex = parseInt((document.getElementById('rowIndex') as HTMLFormElement).value, 10);
        if (gridRef.current) {
            gridRef.current.selectRow(rowIndex, toggle);
        }
    })

    const pageSettings = (() => {
        const newSettings = {
            currentPage: parseInt((document.getElementById('currentPage') as HTMLFormElement).value || '1', 10),
            pageCount: parseInt((document.getElementById('pageCount') as HTMLFormElement).value || '8', 10),
            pageSize: parseInt((document.getElementById('pageSize') as HTMLFormElement).value || '12', 10)
        };
        var updatePageSettings = {
            ...gridRef.current.pageSettings,
            ...newSettings
        }
        setNewPageSettings(updatePageSettings);
    })

    const gotoPage = (() => {
        const pageValue = parseInt((document.getElementById('pageNumber') as HTMLFormElement).value, 10);
        setPageNumber(pageValue);
        if (gridRef.current) {
            gridRef.current.goToPage(pageNumber);
        }
    })

    const search = (() => {
        const searchTxt = (document.getElementById('searchTxt') as HTMLFormElement).value;
        if (gridRef.current) {
            gridRef.current.search(searchTxt);
        }
    });

    const appendElement = ((html) => {
        const span = document.createElement('span');
        span.innerHTML = html;
        const log = document.getElementById('EventLog');
        log.insertBefore(span, log.firstChild);
    })
    const clearEvent = (() => {
        document.getElementById('EventLog').innerHTML = '';
    })

    return (
        <div>
            <link href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' rel='stylesheet' />
            {/* Left Panel - Grid */}
            <div className="col-lg-10 control-section">
                <Grid
                    ref={gridRef}
                    dataSource={dataSource}
                    sortSettings={{enabled: sort}}
                    filterSettings={{enabled: filter}}
                    textWrapSettings={{ wrapMode: textWrapSettings, enabled: textWrap }}
                    enableRtl={rtl}
                    enableHover={hover}
                    gridLines={gridLine}
                    selectionSettings={{ mode: selectionSettings }}
                    rowHeight={rowHeight}
                    pageSettings={newPageSettings}
                    height={250}
                    onGridInit={() => { appendElement('Grid <b>create</b> event called<br/>'); }}
                    // onActionBegin={() => { appendElement('Grid <b>actionBegin</b> event called<br/>'); }}
                    // onActionComplete={() => { appendElement('Grid <b>actionComplete</b> event called<br/>'); }}
                    onRowRender={() => { appendElement('Grid <b>rowDataBound</b> event called<br/>'); }}
                    onCellRender={() => { appendElement('Grid <b>queryCellInfo</b> event called<br/>'); }}
                    onHeaderCellRender={() => { appendElement('Grid <b>headerCellInfo</b> event called<br/>'); }}
                    onDataLoad={() => { appendElement('Grid <b>dataBound</b> event called<br/>'); }}
                    onRowSelecting={() => { appendElement('Grid <b>rowSelecting</b> event called<br/>'); }}
                    onRowSelect={() => { appendElement('Grid <b>rowSelected</b> event called<br/>'); }}
                    onRowDeselecting={() => { appendElement('Grid <b>rowDeSelecting</b> event called<br/>'); }}
                    onRowDeselect={() => { appendElement('Grid <b>rowDeSelected</b> event called<br/>'); }}
                >
                    <Columns>
                        <Column field="OrderID" headerText="Order ID" width={120} textAlign='Right' />
                        <Column field="CustomerID" headerText="Customer ID" width={150} />
                        <Column field="OrderDate" headerText="Order Date" width={150} format='yMd' />
                        <Column field="Freight" headerText="Freight" width={100} format='C2' />
                        <Column field="ShipCountry" headerText="Ship Country" width={140} />
                        <Column field="ShipAddress" headerText="Ship Address" width={140} disableHtmlEncode={htmlEncode} />
                    </Columns>
                </Grid>
                <h3><b>Methods</b></h3>
                <div id="Properties" style={{ width: '100%', height: 280, overflow: 'scroll' }} className="container">
                    <table style={{ width: "100%" }}>
                        <tbody>
                            <tr>
                                <td className="e-method">
                                    <h4><b>Sort Column</b></h4>
                                    <div className="method-controls">
                                        <div className="control">
                                            <h5>Field name</h5>
                                            <TextBox id='column' placeholder="Enter field name" width={200} />
                                        </div>
                                        <div className="control">
                                            <h5>Direction</h5>
                                            <DropDownList
                                                width={200}
                                                dataSource={['Ascending', 'Descending']}
                                                fields={{ text: 'text', value: 'value' }}
                                                value={selectDirection}
                                                onChange={(args: any) => setSelectDirection(args.value)}
                                            />
                                        </div>
                                        <div className="control">
                                            <Checkbox
                                                label='isMultiSort'
                                                defaultChecked={multiSort}
                                                onChange={(e) => setMultiSort(e.value)}
                                            />
                                        </div>
                                        <Button id="sort" className="methodbtn" onClick={sortColumn}>Apply Sort</Button>
                                        <Button id="clearSort" className="methodbtn" onClick={() => gridRef.current.clearSort()}>Clear
                                            Sorting</Button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="e-method">
                                    <h4><b>Filter By Column</b></h4>
                                    <div className="method-controls">
                                        <div className="control">
                                            <h5>Field name</h5>
                                            <TextBox id='field' placeholder="Enter field name" width={200} />
                                        </div>
                                        <div className="control">
                                            <h5>Field Operator</h5>
                                            <TextBox id='operator' placeholder="Enter field operator" width={200} />
                                        </div>
                                        <div className="control">
                                            <h5>Filter Value</h5>
                                            <TextBox id='value' placeholder="Enter filter value" width={200} />
                                        </div>
                                        <div className="control">
                                            <h5>Predicate</h5>
                                            <TextBox id='predicate' placeholder="Enter predicate" width={200} />
                                        </div>
                                        <div className="control">
                                            <Checkbox
                                                label='Match case'
                                                defaultChecked={matchCase}
                                                onChange={(e) => setMatchCase(e.value)}
                                            />
                                        </div>
                                        <br />
                                        <Button id="filter" className="methodbtn" onClick={filterColumn}>Apply Filter</Button>
                                        <Button id="clearFilter" className="methodbtn" onClick={() => gridRef.current.clearFilter()}>Clear
                                            Filtering</Button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="e-method">
                                    <h4><b>Select row</b></h4>
                                    <div className="method-controls">
                                        <div className="control">
                                            <h5>Row Index</h5>
                                            <TextBox id='rowIndex' placeholder="Enter row index" width={200} />
                                        </div>
                                        <div className="control">
                                            <Checkbox
                                                label='isToggle'
                                                defaultChecked={toggle}
                                                onChange={(e) => setToggle(e.value)}
                                            />
                                        </div>
                                        <Button id="selectRow" className="methodbtn" onClick={selectRow}>Apply Selection</Button>
                                        <Button id="clearSelect" className="methodbtn" onClick={() => gridRef.current.clearRowSelection()}>Clear
                                            Selection</Button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="e-method">
                                    <h4><b>Page Settings</b></h4>
                                    <div className="method-controls">
                                        <div className="control">
                                            <h5>Current page</h5>
                                            <TextBox id='currentPage' placeholder="Enter current page" width={200} />
                                        </div>
                                        <div className="control">
                                            <h5>Page count</h5>
                                            <TextBox id='pageCount' placeholder="Enter page count" width={200} />
                                        </div>
                                        <div className="control">
                                            <h5>Page size</h5>
                                            <TextBox id='pageSize' placeholder="Enter page size" width={200} />
                                        </div>
                                        <br />
                                        <Button id="pageSettings" className="methodbtn" onClick={pageSettings}>Page Settings</Button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="e-method">
                                    <h4><b>Goto Page</b></h4>
                                    <div className="method-controls">
                                        <div className="control">
                                            <h5>Page number</h5>
                                            <TextBox id='pageNumber' placeholder="Enter page number" width={200} />
                                        </div>
                                        <Button id="page" className="methodbtn" onClick={gotoPage}>Goto Page</Button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="e-method">
                                    <h4><b>Search</b></h4>
                                    <div className="method-controls">
                                        <div className="control">
                                            <h5>Search the text</h5>
                                            <TextBox id='searchTxt' placeholder="Enter the search text" width={200} />
                                        </div>
                                        <Button id="search" className="methodbtn" onClick={search}>Search</Button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="e-method">
                                    <div className="method-controls">
                                        <Button id="refresh" className="methodbtn" onClick={() => { gridRef.current.refresh(); }}>Refresh</Button>
                                        <Button id="showSpinner" className="methodbtn" onClick={() => { gridRef.current.showSpinner(); }}>Show spinner</Button>
                                        <Button id="hideSpinner" className="methodbtn" onClick={() => { gridRef.current.hideSpinner(); }}>Hide spinner</Button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Panel - Controls */}
            <div className="col-lg-2 property-section">
                <div style={{ height: 500, overflow: 'scroll' }}>
                    <span style={{ marginRight: 15, fontSize: 16 }}>Data source</span>
                    <DropDownList
                        width={200}
                        dataSource={['Local Data', 'Remote Data']}
                        fields={{ text: 'text', value: 'value' }}
                        value={dataSource}
                        placeholder='Select the datasource'
                        onChange={handleDataSourceChange}
                    /><br />
                    <Checkbox
                        label='Enable sorting'
                        defaultChecked={sort}
                        onChange={(e) => setSort(e.value)}
                    /><br />
                    <Checkbox
                        label='Enable paging'
                        defaultChecked={page}
                        onChange={(e) => setPage(e.value)}
                    /><br />

                    <Checkbox
                        label='Enable filtering'
                        defaultChecked={filter}
                        onChange={(e) => setFilter(e.value)}
                    /><br />

                    <Checkbox
                        label='Enable textwrap'
                        defaultChecked={textWrap}
                        onChange={(e) => setTextWrap(e.value)}
                    /><br />
                    <p>Text wrap settings</p>
                    <span style={{ marginRight: 15 }}>Wrap Mode</span>
                    <DropDownList
                        width={200}
                        dataSource={[WrapMode.Header, WrapMode.Content, WrapMode.Both]}
                        fields={{ text: 'text', value: 'value' }}
                        value={textWrapSettings}
                        onChange={handleTextWrapChange}
                    /><br />
                    <Checkbox
                        label='Disable Html Encode'
                        defaultChecked={htmlEncode}
                        onChange={(e) => setHtmlEncode(e.value)}
                    /><br />
                    <Checkbox
                        label='Enable hover'
                        defaultChecked={hover}
                        onChange={(e) => setHover(e.value)}
                    /><br />
                    <Checkbox
                        label='Enable altRow'
                        defaultChecked={altRow}
                        onChange={(e) => setAltRow(e.value)}
                    /><br />
                    <Checkbox
                        label='Enable rtl'
                        defaultChecked={rtl}
                        onChange={(e) => setRtl(e.value)}
                    /><br />
                    <span style={{ marginRight: 15 }}>Grid lines</span>
                    <DropDownList
                        width={200}
                        dataSource={['Default', 'None', 'Both', 'Horizontal', 'Vertical']}
                        fields={{ text: 'text', value: 'value' }}
                        value={gridLine}
                        onChange={handleGridLineChange}
                    /><br />
                    <Checkbox
                        label='Enable selection'
                        defaultChecked={selection}
                        onChange={(e) => setSelection(e.value)}
                    /><br />
                    <p>Selection settings</p>
                    <span style={{ marginRight: 15 }}>Type</span>
                    <DropDownList
                        width={200}
                        dataSource={['Single', 'Multiple']}
                        fields={{ text: 'text', value: 'value' }}
                        value={selectionSettings}
                        onChange={handleSelectionChange}
                    /><br />
                    <span style={{ marginRight: 15 }}>Row height</span>
                    <TextBox placeholder="Enter row height" width={200} onKeyDown={handleRowHeightChange} />
                </div>
                <div>
                    <h3><b>Event</b></h3>
                    <table id="property" title="Event Trace" style={{ width: '100%' }}>
                        <tr>
                            <td>
                                <div className="eventarea" style={{ height: 140, overflow: 'auto' }}>
                                    <span className="EventLog" id="EventLog" style={{ wordBreak: "normal" }}></span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="evtbtn" style={{ paddingBottom: 5 }}>
                                    <Button id="clear" className="button" onClick={clearEvent}>Clear</Button>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    );
}
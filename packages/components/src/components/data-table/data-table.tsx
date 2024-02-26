
import { Component, Element, Event, EventEmitter, h, Host, JSX, Prop, State, Watch } from '@stencil/core'; //eslint-disable-line @typescript-eslint/no-unused-vars
import { isNullOrUndefined, isNumber } from '../../utils/utils';

@Component({
    tag: 'mi-data-table',
    styleUrl: 'data-table.scss',
    shadow: true
})
export class DataTable {
    @Element() el: HTMLMiDataTableElement;

    /**
     * Fired when selection of rows is changed.
     * Event detail contains all the selected rows.
     * This event is only relevant if the selectable attribute is present.
     * @event selectionChanged
     */
    @Event() selectionChanged: EventEmitter<object>;

    /**
     * Internal state used to update the component when the selection changes.
     * @private
     * @type {number}
     * @memberof DataTable
     */
    @State() numberOfSelectedRows: number;

    @Watch('numberOfSelectedRows')
    onSelectionChangedHandler(): void {
        this.selectionChanged.emit(this.selected);
    }
    /**
     * Array of objects for each row in the table.
     */
    @Prop() rows: Array<any> = [];

    /**
     * When the rows is set from outside of the components the table sorting is reset and the rows are assigned to the internal tabelRows property.
     */
    @Watch('rows')
    onRowsChangedHandler(): void {
        this.tableRows = Array.from(this.rows);
        this.setHeaderCheckboxState();
    }

    /**
     * The maximum number of rows to be displayed.
     */
    @Prop() maxRows: number;

    /**
     * The page of rows to be displayed.
     * Eg. If the maxRows is set to be less the total number of rows, the page property can specify which chunk of rows to show.
     */
    @Prop() page: number;
    /**
     * When the page is set from outside of the components the table needs to show the newly specified page of rows.
     */
    @Watch('page')
    onPageChangedHandler(): void {
        this.currentPage = this.page;
        this.renderTableContent();
    }

    /**
     * The selectable attribute specifies whether the first column in the table should be checkboxes. The header will be a select all or none checkbox.
     */
    @Prop() selectable: boolean = false;

    /**
     * The selected property contains a Set of all selected rows. This property is only relevant if the selectable attribute is present.
     */
    @Prop() selected: Set<any> = new Set();

    /**
     * Guiding message when presented with a table that has no rows.
     */
    @Prop() emptyPageHeader: string = 'No results found';

    /**
     * Guiding message for actionable steps to be performed in order to render new search results.
     */
    @Prop() emptyPageSubheader: string;

    /**
     * Whether or not the table header should be sticky.
     */
    @Prop({ attribute: 'sticky-header' }) isHeaderSticky = true;

    @State() tableRows = [];

    @State() currentPage = 1;

    /**
     * State to keep track of the table sorting.
     */
    @State() sortByColumn = null;

    private columns: Array<any> = [];
    private selectAllCheckbox: HTMLInputElement;

    connectedCallback(): any {
        const miColumns = this.el.querySelectorAll('mi-column');
        this.columns = Array.from(miColumns).map((miColumn: HTMLMiColumnElement) => {
            const column = {
                alignContent: miColumn.alignContent,
                monospace: miColumn.monospace,
                label: !isNullOrUndefined(miColumn.label) ? miColumn.label : miColumn.binding,
                binding: miColumn.binding || null,
                sortable: miColumn.sortable,
                fitContent: !!miColumn.fitContent,
                /* All HTML comments are removed from the template to avoid the issues with the table not displaying any data in IE11  */
                template: miColumn.innerHTML.replace(/<!--[\s\S]*?-->/g, ''),
                columnElement: miColumn,
                width: miColumn.width
            };

            /* If the mi-column has the sort attribute, then the initial sort state is set. */
            if (miColumn.sort && !this.sortByColumn) {
                this.sortByColumn = { column: column, sortOrder: miColumn.sort === 'asc' ? 'asc' : 'desc' };
            }

            return column;
        });
    }

    /**
     * Column header click handler.
     * If the column is sortable the sort order is reversed.
     *
     * @private
     * @param {MouseEvent} event
     * @param {any} column
     */
    private columnHeaderClickHandler(event: MouseEvent, column: any): void {
        if (!isNullOrUndefined(column.sortable)) {
            let sortOrder = 'asc';
            if (column === this.sortByColumn?.column) {
                // TODO: Use SortOrder enum in MICMS-1353
                sortOrder = this.sortByColumn?.sortOrder === 'asc' ? 'desc' : 'asc';
            }

            /* When a column that is sortable is clicked then the sort state is updated. */
            this.sortByColumn = { column: column, sortOrder: sortOrder };
        }
    }

    /**
     * Sorts table rows.
     *
     * @private
     * @return {Array<any>}
     */
    private sortTableRows(): Array<any> {
        //Check if the table has any rows.
        if (this.tableRows.length > 0 && this.sortByColumn) {
            let sortMethod;
            const sortByColumn = this.sortByColumn?.column;
            const sortOrder = this.sortByColumn?.sortOrder;

            if (sortByColumn && sortOrder) {
                if (sortByColumn.sortable?.toLowerCase() === 'date') {
                    sortMethod = sortOrder === 'desc' ? dateDesc(sortByColumn.binding) : dateAsc(sortByColumn.binding);
                } else {
                    sortMethod = sortOrder === 'desc' ? desc(sortByColumn.binding) : asc(sortByColumn.binding);
                }
                return [...this.tableRows.sort(sortMethod)];
            }
        }

        return this.tableRows;
    }

    /**
     * Replace template variables (eg. "{id}") with the corresponding value from the data.
     *
     * @private
     * @param {string} template
     * @param {object} data
     * @returns {string}
     */
    private replaceVars(template: string, data: object): String {
        return template.replace(/\{(.*?)\}/g, (match, capture) => {
            const path = capture.split('.');

            // Traverse the input object until a given key is found.
            return path.reduce((object, key) => {
                return object ? object[key] : null;
            }, data);

        });
    }

    /**
     * Remove boolean HTML attributes (eg. checked) that will have a false value based on data. This is necessary since
     * the very presence of the attribute will give it a truthy value.
     *
     * @private
     * @param {string} template
     * @param {array} data
     * @returns {string}
     */
    private removeFalseBooleanAttributes(template: string, data: object): String {
        return template.replace(/ (checked|disabled|hidden|selected)="\{(.*?)\}"/, (match, attributeName, binding) => {
            return data[binding] === false ? '' : attributeName;
        });
    }

    /**
     * React to clicks on table rows and emits the internal cellContentClicked event to
     * the column component if clicked on content within a cell.
     *
     * @private
     * @param {MouseEvent} event
     * @param {any} tableRow
     */
    private tableRowClicked(event: MouseEvent, tableRow: any): void {
        const element = event.target as HTMLElement;
        const cellIndex = element.closest('td').cellIndex;
        const columnClickedIndex = this.selectable ? cellIndex - 1 : cellIndex;

        if (element.tagName.toLowerCase() !== 'td' && this.columns[columnClickedIndex]) {
            const eventPayload = { detail: tableRow };
            this.columns[columnClickedIndex]?.columnElement.dispatchEvent(new (CustomEvent as any)('cellContentClicked', eventPayload));
        }
    }

    async componentWillLoad(): Promise<void> {
        if (this.rows.length > 0) {
            this.tableRows = Array.from(this.rows);
        }
    }

    render(): JSX.Element {
        return (
            <Host>
                <table class="table">
                    <thead>
                        <tr>
                            {this.renderSelectHeader()}
                            {this.columns.map(column => {
                                const width = !column.fitContent ? column.width || 'auto' : '';
                                const sortOrder = this.sortByColumn?.column === column ? this.sortByColumn.sortOrder : null;
                                return <th
                                    data-binding={column.binding}
                                    style={{ 'width': width, 'max-width': width, 'min-width': width }}
                                    onClick={(event) => this.columnHeaderClickHandler(event, column)}
                                    class={`table__header-cell ${this.isHeaderSticky ? 'table__header-cell--sticky' : ''} ${isNullOrUndefined(column.sortable) ? 'table__header-cell--no-sort' : ''} ${isNullOrUndefined(sortOrder) ? '' : sortOrder} ${column.fitContent ? 'table__header-cell--fit-content' : ''}`}>
                                    {column.label}
                                </th>;
                            }
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderTableContent()}
                    </tbody>
                </table>

                {this.tableRows.length === 0 ? this.renderEmptyPage() : null}
            </Host>
        );
    }

    /**
     * If the table is selectable then renderSelectHeader will render the th element with the checkbox to check or uncheck all items in the table.
     *
     * @private
     * @returns {JSX.Element}
     */
    private renderSelectHeader(): JSX.Element {
        if (this.selectable) {
            return (
                <th class={`table__header-cell ${this.isHeaderSticky ? 'table__header-cell--sticky' : ''} table__header-cell--fit-content table__header-cell--no-sort table__header-cell--align-center`}>
                    <input
                        type="checkbox"
                        class="mi-input"
                        ref={(el) => this.selectAllCheckbox = el as HTMLInputElement}
                        onChange={() => this.selectHeaderOnChangeHandler()}
                    />
                </th>
            );
        }
    }

    /**
     * If the table is selectable then this method will render the td for each row in the item to select or unselect the row.
     *
     * @private
     * @param {object} row
     * @returns {JSX.Element}
     */
    private renderSelectRow(row): JSX.Element {
        if (this.selectable) {
            return (
                <td class="table__data table__data--align-center">
                    <input
                        class="mi-input"
                        type="checkbox"
                        checked={this.selected.has(row)}
                        onChange={event => this.selectOnChangeHandler(event, row)} />
                </td>
            );
        }
    }

    /**
     * Helper method to render the tables content.
     *
     * @private
     * @returns {[JSX.Element]}
     */
    private renderTableContent(): Array<JSX.Element> {
        let tableRows = this.sortTableRows();

        tableRows = isNumber(this.maxRows) && this.maxRows > 0 ?
            tableRows.slice(
                this.maxRows * (this.currentPage - 1),
                this.maxRows * this.currentPage)
            : tableRows;

        return tableRows.map(row => this.renderTableRow(row));
    }

    /**
     * Helper method to render a table row.
     *
     * @private
     * @param {*} tableRow
     * @returns {JSX.Element}
     */
    private renderTableRow(tableRow): JSX.Element {
        const rowData = [];
        for (const column of this.columns) {
            let template = column.template;
            if (template > '') {
                template = this.removeFalseBooleanAttributes(template, tableRow);
                template = this.replaceVars(template, tableRow);
                rowData.push(template);
            } else {
                rowData.push(tableRow[column.binding]);
            }
        }

        return <tr class="table__row" onClick={e => this.tableRowClicked(e, tableRow)}>
            {this.renderSelectRow(tableRow)}
            {rowData.map((cellContent, cellIndex) => <td class={`table__data ${this.columns[cellIndex].fitContent ? 'table__data--fit-content' : ''} table__data--align-${this.columns[cellIndex].alignContent || 'left'} ${this.columns[cellIndex].monospace ? 'table__data--monospace-font' : ''}`} innerHTML={cellContent}></td>)}
        </tr>;
    }

    /**
     * Renders en empty page with error message when no table rows are available.
     *
     * @private
     * @returns {JSX.Element}
     */
    private renderEmptyPage(): JSX.Element {
        const emptyPage: JSX.Element = (
            <div class="empty-page">
                <p class="empty-page__header">{this.emptyPageHeader}</p>
                <p class="empty-page__subheader">{this.emptyPageSubheader}</p>
            </div>
        );

        return emptyPage;
    }

    /**
     * The event handler for the onchange event for the checkboxes in the selectable column.
     *
     * @private
     * @param {EventData} event
     * @param {object} row
     */
    private selectOnChangeHandler(event, row): void {
        (event.target as HTMLInputElement).checked ? this.selected.add(row) : this.selected.delete(row);
        this.setHeaderCheckboxState();

        //The selectedRows is updated to force a rerendering of the table with the correct state.
        this.numberOfSelectedRows = this.selected.size;
        event.stopPropagation();
    }

    /**
     * Set the state of the checkbox in the table header.
     * The state can be either checked, unchecked or indeterminate.
     */
    private setHeaderCheckboxState(): void {
        if (this.selectAllCheckbox && this.selectable) {
            this.selectAllCheckbox.checked = this.selected.size === this.rows.length;
            this.selectAllCheckbox.indeterminate = this.selected.size > 0 && this.selected.size < this.rows.length;
        }
    }

    /**
     * The event handler for the onchange event for the checkbox in the selectable column header.
     *
     * @private
     * @param {EventData} event
     */
    private selectHeaderOnChangeHandler(): void {
        if (this.selected.size > 0 && this.selected.size <= this.rows.length) {
            this.selected.clear();
            this.selectAllCheckbox.checked = false;
        } else {
            this.rows.forEach(row => this.selected.add(row));
            this.selectAllCheckbox.checked = true;
        }

        this.numberOfSelectedRows = this.selected.size;
    }
}

const asc = (value) => (a, b) => `${a[value] || ''}`
    .localeCompare(`${(b[value] || '')}`.trimStart().toLowerCase(), undefined, { numeric: true });

const desc = (value) => (a, b) => `${b[value] || ''}`
    .localeCompare(`${(a[value] || '')}`.trimStart().toLowerCase(), undefined, { numeric: true });

const dateAsc = (value) => (a, b) => {
    const aAsDate = Date.parse(a[value]);
    const bAsDate = Date.parse(b[value]);
    return aAsDate > bAsDate ? 1 : aAsDate < bAsDate ? -1 : 0;
};

const dateDesc = (value) => (b, a) => {
    const aAsDate = Date.parse(a[value]);
    const bAsDate = Date.parse(b[value]);
    return aAsDate > bAsDate ? 1 : aAsDate < bAsDate ? -1 : 0;
};



import { Component, Element, Event, EventEmitter, h, Host, JSX, Prop, State, Watch, Listen } from '@stencil/core';
import fuzzysort from 'fuzzysort';
import { SortOrder } from '../../enums/sort-order.enum';

enum KeyCode {
    ArrowDown = 'ArrowDown',
    ArrowUp = 'ArrowUp',
    Enter = 'Enter',
    Esc = 'Escape'
}

@Component({
    tag: 'mi-combo-box',
    styleUrl: 'combo-box.scss',
    shadow: true
})
export class ComboBox {
    @Element() hostElement: HTMLElement;

    /**
     * Triggers an event when the selection is changed.
     *
     * @type {EventEmitter}
     */
    @Event({
        eventName: 'change',
        composed: true,
        cancelable: true,
        bubbles: false,
    }) change: EventEmitter;

    /**
     * Gets or sets the state of the dropdown.
     * If the attribute is set to true then the dropdown will be expanded.
     *
     * @type {boolean}
     */
    @Prop() open = false;

    /**
     * Gets or sets the list items.
     *
     * @type {Array<HTMLMiDropdownItemElement>}
     * @returns {void}
     */
    @Prop() items: Array<HTMLMiDropdownItemElement> = [];
    @Watch('items')
    onItemsChanged(items): void {
        if (items.some(item => item.tagName.toLowerCase() !== 'combo-box-item')) {
            throw new Error('Items contains unknown element(s).');
        }

        if (Object.values(SortOrder).includes(this.itemsOrder)) {
            items = this.getSortedItems(items);
        }

        this.currentItems = [...items];

        this.filter();

        if (!this.filterable) {
            const selectedItemIndex = this.currentItems.findIndex(item => item.selected);

            this.currentItemIndex = selectedItemIndex > -1 ? selectedItemIndex : 0;
            this.selectedItemIndex = this.currentItemIndex;
        }

        this.items.forEach((item, itemIndex) => {
            item.dataset.index = itemIndex.toString();
        });

        this.selectFirstMiDropdownItem();
    }

    /**
     * Sort order of items.
     *
     * @type {SortOrder}
     */
    @Prop() itemsOrder: SortOrder;

    /**
     * This attribute indicates that the items can be filtered using the input field present at the top.
     * If it is not specified, the input field will not be visible, and filtering is not possible.
     *
     * @type {boolean}
     */
    @Prop() filterable = false;

    /**
     * Gets the selected items.
     *
     * @type {Array<HTMLMiDropdownItemElement>}
     */
    @Prop() selected: Array<HTMLMiDropdownItemElement> = [];

    /**
     * Guiding message when presented with a content window that has no rows.
     * Default language is English.
     */
    @Prop() noResultsMessage = 'No results found';

    @State() currentItems: Array<HTMLMiDropdownItemElement> = [];
    @Watch('currentItems')
    onCurrentItemsChange(): void {
        this.isFilterSelectionDisabled = this.currentItems.length === 0;
    }

    /**
     * Sets the disabled state for the dropdown.
     */
    @Prop() disabled = false;

    /**
     * Sets the disabled state of the select buttons in the filterable version of the component.
     */
    isFilterSelectionDisabled = false;

    /**
     * Flag to control the mouseover event on the items. The event is disabled when using the arrow keys to navigate the list.
     */
    isMouseOverEventDisabled = false;

    filterElement!: HTMLInputElement;
    clearButtonElement!: HTMLButtonElement;
    listElement!: HTMLElement;

    currentItemIndex = 0;
    selectedItemIndex = 0;
    highlightedItemClassName = 'list__item--highlighted';

    /**
     * Outside the dropdown listener. It will close the dropdown when a click is outside a dropdown and dropdown list.
     *
     * @param {ev} ev
     */
    @Listen('click', { target: 'window' })
    checkForClickOutside(ev) {
        if (!this.hostElement.contains(ev.target) && this.noResultsMessage) {
            this.clearFilter();
            this.filterElement.value = this.selected[0]?.text;
            this.open = false;
        }
    }

    /**
     * When clicked on input button we change it's type to text and highlight value that is inside.
     *
     * @param {Event} event
     */
    onClickExists(event) {
        this.open = true;
        event.target.type = 'text';
        this.filterElement.select();
    }

    /**
     * Mousemove event handler.
     * When the mouse is moved the mouseover event handler is enabled.
     */
    @Listen('mousemove')
    mouseMoveEventHandler(): void {
        this.isMouseOverEventDisabled = false;
    }

    /**
     * Scroll event handler.
     * The dropdown is closed when the scroll event is trigget outside the dropdown.
     */
    @Listen('scroll', { target: 'window', capture: true })
    scrollEventHandler(event): void {
        const target = event.target as Node;
        if (!target || !this.hostElement.contains(target)) {
            this.open = false;
        }
    }

    /**
     * Resize event handler.
     * Recalculate the position of the dropdown when the window is resized.
     */
    @Listen('resize', { target: 'window', capture: true })
    resizeEventHandler(): void {
        this.calculateDropDownPosition();
    }

    /**
     * Component did load.
     */
    componentDidLoad(): void {
        this.createMiDropdownItemsFromDocument();
        this.selectFirstMiDropdownItem();
        this.enableKeyboardNavigationEvents();

        const filterElementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting === true) {
                    this.filterElement.blur();
                }
            });
        });

        if (this.filterElement !== undefined) {
            filterElementObserver.observe(this.filterElement);
            this.filterElement.addEventListener('keydown', (event) => {
                if (event.key === KeyCode.ArrowDown || event.key === KeyCode.ArrowUp) {
                    event.preventDefault();
                }
            });
        }
    }

    /**
     * Component did rener.
     */
    componentDidRender(): void {
        this.calculateDropDownPosition();
        if (!this.filterable) {
            // Makes sure that an item is always highlighted when the content window is open.
            this.highlightItem(this.currentItemIndex, true);
        }
    }

    /**
     * Gets all mi-dropdown-item elements for the mi-dropdown items property.
     */
    createMiDropdownItemsFromDocument(): void {
        const items = this.items && this.items.length > 0 ? this.items : this.hostElement.querySelectorAll('combo-box-item');
        if (items.length > 0) {
            this.items = Array.from(items);
        }
    }

    /**
     * Set the first mi-dropdown-item as the textual content of the button.
     */
    selectFirstMiDropdownItem(): void {
        if (!this.filterable) {
            const selectedIndex = this.items?.findIndex((item) => { return item.selected; });
            this.selected = [this.items[selectedIndex > -1 ? selectedIndex : 0]];
        }
    }

    /**
     * Enables cycling through the items in the content window using arrow up/down keys.
     */
    enableKeyboardNavigationEvents(): void {
        this.hostElement.addEventListener('keydown', event => {
            if (this.open === false && event.key === KeyCode.ArrowDown) {
                this.isMouseOverEventDisabled = true;
                this.toggleContentWindow();
                event.preventDefault();
                return;
            }

            if (this.open === true && !this.filterable) {
                switch (event.key) {
                    case KeyCode.ArrowDown || KeyCode.ArrowUp:
                        this.isMouseOverEventDisabled = true;
                        this.currentItemIndex = (this.currentItemIndex + 1) % this.currentItems.length;
                        this.highlightItem(this.currentItemIndex, true);
                        event.preventDefault();
                        break;
                    case KeyCode.ArrowUp:
                        this.isMouseOverEventDisabled = true;
                        this.currentItemIndex = ((this.currentItemIndex + this.currentItems.length) - 1) % this.currentItems.length;
                        this.highlightItem(this.currentItemIndex, true);
                        event.preventDefault();
                        break;
                    case KeyCode.Enter:
                        if (this.hostElement.shadowRoot.activeElement === this.clearButtonElement) {
                            // When the clear button is focused and Enter is pressed, don't select the
                            // currently highlighted item or close the content window.
                            return;
                        }

                        if (this.currentItems[this.currentItemIndex] !== undefined) {
                            this.onSelect(this.currentItems[this.currentItemIndex]);
                        }
                        event.preventDefault();
                        break;
                }
            }

            // This case must be applied to all types of the dropdown component.
            if (event.key === KeyCode.Esc) {
                if (!this.filterable) {
                    this.currentItemIndex = this.selectedItemIndex;
                    this.highlightItem(this.currentItemIndex);
                }

                this.toggleContentWindow();
                this.clearFilter();
            }
        });
    }

    /**
     * Updates the currently highlighted item in the markup.
     *
     * @param {number} itemIndex
     */
    highlightItem(itemIndex: number, scrollIntoView: boolean = false): void {
        const items = this.hostElement.shadowRoot.querySelectorAll('.list__item');

        items.forEach(item => {
            item.classList.remove(this.highlightedItemClassName);
        });

        items[itemIndex]?.classList.add(this.highlightedItemClassName);

        if (scrollIntoView) {
            items[itemIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    /**
     * Get sorted items.
     * The sorting order is defined by the itemsOrder attribute.
     *
     * @param {HTMLMiDropdownItemElement[]} items
     * @returns {HTMLMiDropdownItemElement[]}
     */
    getSortedItems(items: HTMLMiDropdownItemElement[]): HTMLMiDropdownItemElement[] {
        if (this.itemsOrder === SortOrder.Asc) {
            // Ascending order
            items.sort((a, b) => (a.text || a.innerText)
                .trimStart()
                .toLowerCase()
                .localeCompare((b.text || b.innerText).trimStart().toLowerCase(), undefined, { numeric: true }));
        } else {
            // Descending order
            items.sort((b, a) => (a.text || a.innerText)
                .trimStart()
                .toLowerCase()
                .localeCompare((b.text || b.innerText).trimStart().toLowerCase(), undefined, { numeric: true }));
        }

        return items;
    }

    /**
     * Update and emit list of selected items.
     */
    onChangedHandler(): void {
        this.selected = [...this.items.filter(item => item.selected)];
        this.change.emit(this.selected);
    }

    /**
     * Toggle visibility of content window.
     */
    toggleContentWindow(): void {
        this.open = !this.open;
    }

    /**
     * Select or toggle selection of item.
     *
     * @param {HTMLMiDropdownItemElement} item
     */
    onSelect(item: HTMLMiDropdownItemElement): void {
        if (!this.filterable) {
            this.open = false;
            const items = Array.from(this.items) as Array<HTMLMiDropdownItemElement>;
            items.forEach((item) => {
                item.selected = false;
            });
            this.clearFilter();
        }

        item.selected = !item.selected;

        this.currentItemIndex = Number(item.dataset.index);
        this.selectedItemIndex = this.currentItemIndex;

        this.onChangedHandler();
    }

    /**
     * Highlights the item that the cursor is hovering in the content window.
     *
     * @param {number} filteredItemsIndex
     */
    onMouseOver(filteredItemsIndex: number): void {
        if (!this.isMouseOverEventDisabled && !this.filterable) {
            this.highlightItem(filteredItemsIndex);
            this.currentItemIndex = filteredItemsIndex;
        }
    }

    /**
     * Filter items based on input query.
     *
     * @returns {HTMLMiDropdownItemElement[]}
     */
    filter(): HTMLMiDropdownItemElement[] {
        if (this.filterElement) {
            const inputQuery: string = this.filterElement.value;
            const miDropdownItemTexts: string[] = this.items.map(item => (item.text || item.innerText));
            const numberOfItemsDisplayed = this.currentItems.length;

            if (inputQuery === '') {
                this.currentItemIndex = this.selectedItemIndex;
                return this.currentItems = [...this.items];
            }

            const searchResultsOptions = {
                limit: 50,
                allowTypo: false,
                threshold: -10000
            };
            const fuzzyResults = fuzzysort.go(inputQuery, miDropdownItemTexts, searchResultsOptions);
            const filteredItems = fuzzyResults.map(result => this.items.find(item => (item.text || item.innerText) === result.target));

            this.currentItems = filteredItems;

            if (numberOfItemsDisplayed !== this.currentItems.length) {
                this.currentItemIndex = 0;
            }
        }
    }

    /**
     * Clear filter.
     */
    clearFilter(): void {
        if (this.filterElement) {
            this.filterElement.value = this.selected[0]?.text;
            this.filterElement.blur();
            this.currentItems = this.items;
        }
    }

    /**
     * Render input field - combobox.
     *
     * @returns {Host}
     */
    render(): JSX.Element {
        const listOfItems: JSX.Element = (
            <ul class="list">
                {this.currentItems.map((item, index) => this.renderListItem(item, index, this.filterable))}
            </ul>
        );

        return (
            <Host class={{ 'open': this.open }}>
                <input
                    type="text"
                    class="input"
                    onFocus={(event) => this.onClickExists(event)}
                    ref={(el) => this.filterElement = el as HTMLInputElement}
                    onInput={() => this.filter()}
                    tabIndex={0}
                    value={this.selected[0]?.text}
                >
                </input>
                <svg role='button' class="input__svg" part="icon-down-arrow" width="12" height="6" viewBox="0 0 18 10" xmlns="http://www.w3.org/2000/svg" onClick={() => this.toggleContentWindow()}>
                    <path d="M9.37165 9.58706C9.17303 9.80775 8.82697 9.80775 8.62835 9.58706L0.751035 0.834484C0.46145 0.512722 0.689796 7.73699e-08 1.12268 1.25924e-07L16.8773 1.89302e-06C17.3102 1.94157e-06 17.5386 0.512723 17.249 0.834484L9.37165 9.58706Z" />
                </svg>
                <section ref={(el) => this.listElement = el as HTMLElement} part="dropdown-container" class="content">
                    {this.currentItems.length === 0 ? this.renderNoResultsTemplate() : listOfItems}
                </section>
            </Host>
        );
    }

    /**
     * Helper function to render markup when no items are available to be displayed in the content window.
     *
     * @returns {JSX.Element}
     */
    renderNoResultsTemplate(): JSX.Element {
        const noResultsTemplate = (
            <div class="empty-page">
                <p class="empty-page__header">{this.noResultsMessage}</p>
            </div>
        );

        return noResultsTemplate;
    }

    /**
     * Helper function for rendering list item.
     *
     * @param {HTMLMiDropdownItemElement} item
     * @param {number} index
     * @param {boolean} showCheckBox
     * @returns {JSX.Element}
     */
    renderListItem(item: HTMLMiDropdownItemElement, index: number, showCheckBox: boolean): JSX.Element {
        let itemText: HTMLElement;
        const itemTooltipInfo: string = (item.getAttribute('title') || item.text || item.innerText);

        if (item.innerText.length > 0) {
            itemText = <div class="label__item label__item--from-inner-html" innerHTML={item.innerHTML}></div>;
        } else {
            itemText = <div class="label__item" innerHTML={item.text}></div>;
        }

        return (
            <li class="list__item" title={itemTooltipInfo} onMouseOver={() => { this.onMouseOver(index); }}>
                <label class="mi-label label" tabindex="-1">
                    <input
                        class={{ 'label__checkbox': true, 'label__checkbox--hidden': !showCheckBox, 'mi-input': true }}
                        type="checkbox"
                        value={index}
                        checked={item.selected}
                        onChange={() => this.onSelect(item)}
                    />
                    {itemText}
                </label>
            </li>
        );
    }

    /**
     * Function for calculating the position of the dropdown list element.
     */
    private calculateDropDownPosition(): void {
        this.listElement.style.bottom = null;
        this.listElement.style.left = null;
        this.listElement.style.right = null;
        this.listElement.style.top = null;
        this.listElement.style.maxHeight = null;
        this.listElement.style.minWidth = null;

        const { clientWidth, clientHeight } = document.documentElement;
        const hostElementRect = this.hostElement.getBoundingClientRect();
        const listElementRect = this.listElement.getBoundingClientRect();

        const availableSpaceBelowComponent = clientHeight - hostElementRect.bottom;
        const availableSpaceAboveComponent = hostElementRect.top;

        const MAX_HEIGHT = 580;
        const MARGIN = 12;

        if (clientWidth <= listElementRect.width || (hostElementRect.right - listElementRect.width < 0 && listElementRect.right > clientWidth)) {
            this.listElement.style.right = `${MARGIN}px`;
            this.listElement.style.left = `${MARGIN}px`;
            this.listElement.style.minWidth = 'unset';
        } else if (listElementRect.right > clientWidth) {
            this.listElement.style.left = 'unset';
            this.listElement.style.right = `${clientWidth - hostElementRect.right}px`;
        } else {
            this.listElement.style.left = `${hostElementRect.left}px`;
            this.listElement.style.right = 'unset';
        }

        if (availableSpaceAboveComponent > availableSpaceBelowComponent) {
            this.listElement.style.maxHeight = `${Math.min(availableSpaceAboveComponent, MAX_HEIGHT)}px`;
            this.listElement.style.top = 'unset';
            this.listElement.style.bottom = `${clientHeight - hostElementRect.top}px`;
        } else {
            this.listElement.style.top = `${hostElementRect.bottom}px`;
            this.listElement.style.bottom = 'unset';
            this.listElement.style.maxHeight = `${Math.min(availableSpaceBelowComponent - (MARGIN * 2), MAX_HEIGHT)}px`;
        }
    }
}
import { Component, Element, Event, EventEmitter, Host, JSX, Prop, State, Watch, Listen, h, Method } from '@stencil/core';
import fuzzysort from 'fuzzysort';
import { SortOrder } from '../../enums/sort-order.enum';
import { normalizeText } from 'normalize-text';

enum KeyCode {
    ArrowDown = 'ArrowDown',
    ArrowUp = 'ArrowUp',
    Enter = 'Enter',
    Esc = 'Escape'
}

@Component({
    tag: 'mi-dropdown',
    styleUrl: 'dropdown.scss',
    shadow: true
})
export class Dropdown {
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
     * Emit an event when search field is cleared.
     */
    @Event() cleared: EventEmitter<void>;

    /**
     * Gets or sets the state of the dropdown.
     * If the attribute is set to true then the dropdown will be expanded.
     *
     * @type {boolean}
     */
    @Prop() open: boolean = false;

    /**
     * Gets or sets the list items.
     *
     * @type {Array<HTMLMiDropdownItemElement>}
     */
    @Prop() items: Array<HTMLMiDropdownItemElement> = [];

    /**
     * Watcher for items property.
     */
    @Watch('items')
    onItemsChanged(items): void {
        if (items.some(item => item.tagName.toLowerCase() !== 'mi-dropdown-item')) {
            throw new Error('Items contains unknown element(s).');
        }

        if (Object.values(SortOrder).includes(this.itemsOrder)) {
            items = this.getSortedItems(items);
        }

        this.currentItems = [...items];

        this.filter();

        if (!this.multiple) {
            const selectedItemIndex = this.currentItems.findIndex(item => item.selected);

            this.currentItemIndex = selectedItemIndex > -1 ? selectedItemIndex : 0;
            this.selectedItemIndex = this.currentItemIndex;
        }

        this.items.forEach((item, itemIndex) => {
            item.dataset.index = itemIndex.toString();
            item.dataset.excludefromall = `${item.excludefromall}`;
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
     * The label will be displayed in as the text of the dropdown if the attribute multiple is present.
     * Only required if multiple is present.
     *
     * @type {string}
     */
    @Prop() label!: string;

    /**
     * This attribute indicates that the items can be filtered using the input field present at the top.
     * If it is not specified, the input field will not be visible, and filtering is not possible.
     *
     * @type {boolean}
     */
    @Prop() filterable = false;


    /**
     * If present, it dictates placeholder for an filterable input field in the dropdown. Defaults to 'Type to filter...'.
     *
     * @type {string}
     */
    @Prop() placeholder: string = 'Type to filter...';

    /**
     * This attribute indicates that multiple items can be selected in the list. If it is not specified, then only one item can be selected at a time.
     *
     * @type {boolean}
     */
    @Prop() multiple = false;

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

    /**
     * Sets the icon on the left-hand side of the component.
     */
    @Prop({ attribute: 'icon' }) iconSrc: string;

    /**
     * Sets the alternative text for the icon.
     */
    @Prop() iconAlt: string;

    /**
     * Sets the alignment of the dropdown. The default alignment is 'left'.
     *
     * @type {('right' | 'left')}
     */
    @Prop({ attribute: 'alignment' }) dropdownAlignment: 'right' | 'left' = 'left';

    @State() currentItems: Array<HTMLMiDropdownItemElement> = [];

    /**
     * Watcher for currentItems property.
     */
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
     * Flag to control the visibility of the clear button for filterable components.
     */
    isClearButtonVisible = false;

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
     * Keyboard event listener.
     * When the Tab key is pressed, the focus is set to the filter input field (If present).
     *
     * @param {KeyboardEvent} event
     * @returns {void}
     */
    @Listen('keydown', { target: 'window' })
    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Tab' && this.open) {
            this.filterElement?.focus();
            event.preventDefault();
        }
    }

    /**
     * Outside the dropdown listener. It will close the dropdown when a click is outside a dropdown and dropdown list.
     *
     * @param {Event} event
     */
    @Listen('click', { target: 'window', capture: true })
    checkForClickOutside(event: MouseEvent): void {
        if (!this.hostElement.contains(event.target as HTMLElement)) {
            this.open = false;
        }
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
     * Lifecycle method called when the component is loaded in the DOM.
     */
    componentDidLoad(): void {
        this.createMiDropdownItemsFromDocument();
        this.selectFirstMiDropdownItem();
        this.enableKeyboardNavigationEvents();

        const filterElementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting === true) {
                    this.filterElement.focus();
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
     * Lifecycle method called when the component is updated.
     */
    componentDidRender(): void {
        this.calculateDropDownPosition();
        if (!this.multiple) {
            // Makes sure that an item is always highlighted when the content window is open.
            this.highlightItem(this.currentItemIndex, true);
        }
    }

    /**
     * Gets all mi-dropdown-item elements for the mi-dropdown items property.
     */
    createMiDropdownItemsFromDocument(): void {
        const items = this.items && this.items.length > 0 ? this.items : this.hostElement.querySelectorAll('mi-dropdown-item');
        if (items.length > 0) {
            this.items = Array.from(items);
        }
    }

    /**
     * Set the first mi-dropdown-item as the textual content of the button.
     */
    selectFirstMiDropdownItem(): void {
        if (!this.multiple) {
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

            if (this.open === true && !this.multiple) {
                switch (event.key) {
                    case KeyCode.ArrowDown:
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
                if (!this.multiple) {
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
     * Check all checkboxes.
     */
    selectAll(): void {
        const items = Array.from(this.currentItems) as Array<HTMLMiDropdownItemElement>;

        for (const item of items) {
            item.selected = (`${item.dataset.excludefromall}` === 'true' || item.disabled) ? false : true;
        }

        this.onChangedHandler();
    }

    /**
     * Uncheck all checkboxes.
     */
    selectNone(): void {
        const items = Array.from(this.currentItems) as Array<HTMLMiDropdownItemElement>;

        for (const item of items) {
            item.selected = false;
        }

        this.onChangedHandler();
    }

    /**
     * Select or toggle selection of item.
     *
     * @param {HTMLMiDropdownItemElement} item
     */
    onSelect(item: HTMLMiDropdownItemElement): void {
        if (!this.multiple) {
            this.open = false;
            const items = Array.from(this.items) as Array<HTMLMiDropdownItemElement>;
            items.forEach((item) => { item.selected = false; });
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
        if (!this.isMouseOverEventDisabled && !this.multiple) {
            this.highlightItem(filteredItemsIndex);
            this.currentItemIndex = filteredItemsIndex;
        }
    }

    /**
     * Filter items based on the input query.
     */
    filter(): void {
        if (this.filterElement) {
            const inputQuery: string = this.filterElement.value;
            // Normalize text by trimming whitespace, converting to lowercase, and removing diacritics.
            // This ensures consistent matching/comparison of dropdown items.
            const miDropdownItemTexts: string[] = this.items.map(item => (normalizeText(item.text) || normalizeText(item.innerText)));
            const numberOfItemsDisplayed = this.currentItems.length;

            if (inputQuery === '') {
                this.currentItemIndex = this.selectedItemIndex;
                this.isClearButtonVisible = false;
                this.currentItems = [...this.items];
                return;
            } else {
                this.isClearButtonVisible = true;
            }

            const searchResultsOptions = {
                limit: 50,
                allowTypo: false,
                threshold: -10000
            };

            // Normalize text by trimming whitespace, converting to lowercase, and removing diacritics.
            // This ensures consistent matching/comparison of dropdown items.
            const fuzzyResults = fuzzysort.go(normalizeText(inputQuery), miDropdownItemTexts, searchResultsOptions);
            const filteredItems = fuzzyResults.map(result => this.items.find(item => (normalizeText(item.text) || normalizeText(item.innerText)) === normalizeText(result.target)));

            this.currentItems = filteredItems;

            if (numberOfItemsDisplayed !== this.currentItems.length) {
                this.currentItemIndex = 0;
            }
        }
    }

    /**
     * Clear filter.
     */
    @Method()
    public clearFilter(): void {
        if (this.filterElement) {
            this.filterElement.value = '';
            this.filterElement.focus();
            this.currentItems = this.items;
            this.cleared.emit();
        }

        this.isClearButtonVisible = false;
    }

    /**
     * Render the dropdown component.
     *
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        const filter = this.filterable ? this.renderFiltering() : null;
        const multiple = this.multiple ? this.renderMultipleOptions() : null;
        const leftSideIcon = this.iconSrc ? this.renderLeftSideIcon() : null;
        const listOfItems: JSX.Element = (
            <ul class="list">
                {this.currentItems.map((item, index) => this.renderListItem(item, index, (multiple ? true : false)))}
            </ul>
        );

        return (
            <Host class={{ 'open': this.open }}>
                <button part="button" class="button" disabled={this.disabled || this.items.length === 0} onClick={(): void => this.toggleContentWindow()}>
                    {leftSideIcon}
                    {this.renderButtonLabel()}

                    {/* The ts-ignore below is required, otherwise TS will complain about 'part' not being assignable to type 'SVGElement'. */}
                    { /*
                    // @ts-ignore */}
                    <svg class="arrow" part="icon-down-arrow" width="12" height="6" viewBox="0 0 18 10" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.37165 9.58706C9.17303 9.80775 8.82697 9.80775 8.62835 9.58706L0.751035 0.834484C0.46145 0.512722 0.689796 7.73699e-08 1.12268 1.25924e-07L16.8773 1.89302e-06C17.3102 1.94157e-06 17.5386 0.512723 17.249 0.834484L9.37165 9.58706Z" />
                    </svg>
                </button>
                <section ref={(el): HTMLElement => this.listElement = el} part="dropdown-container" class="content" tab-index="1">
                    {filter}
                    {multiple}
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
     * Helper function to render the button label.
     *
     * @returns {JSX.Element}
     */
    renderButtonLabel(): JSX.Element {
        const label = this.label ?? this.selected?.[0]?.text;

        if (label > '') {
            return (<div part="button-label" class="button__label">{label}</div>);
        } else if (this.selected?.[0]?.innerHTML) {
            return (<div part="button-label" class="button__label button__label--from-inner-html" innerHTML={this.selected[0].innerHTML}></div>);
        } else {
            return (<div part="button-label" class="button__label"></div>);
        }
    }

    /**
     * Helper function to render an icon when an image source is provided.
     *
     * @returns {JSX.Element}
     */
    renderLeftSideIcon(): JSX.Element {
        return (<img part="button-icon" class="button__left-icon" src={this.iconSrc} alt={this.iconAlt ? this.iconAlt : ''} />);
    }

    /**
     * Helper function for rendering the filtering UI.
     *
     * @returns {JSX.Element}
     */
    renderFiltering(): JSX.Element {
        return (
            <div class="filter">
                <input type="text" class="mi-input filter__input"
                    placeholder={this.placeholder}
                    ref={(el): HTMLInputElement => this.filterElement = el}
                    onInput={(): void => { this.filter(); }}
                    tabIndex={this.open ? 0 : -1} />

                <button ref={(el): HTMLButtonElement => this.clearButtonElement = el} tabindex={this.isClearButtonVisible ? 0 : -1} type="button" onClick={(): void => this.clearFilter()} class={`filter__clear ${this.isClearButtonVisible === false ? 'filter__clear--hidden' : ''}`} aria-label="Clear">
                    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
                    </svg>
                </button>
            </div>
        );
    }

    /**
     * Helper function for rendering the multi select options.
     *
     * @returns {JSX.Element}
     */
    renderMultipleOptions(): JSX.Element {
        return (
            <div class="options">
                <button class="options__item" disabled={this.isFilterSelectionDisabled} onClick={(): void => this.selectAll()}>Select all</button>
                <button class="options__item" disabled={this.isFilterSelectionDisabled} onClick={(): void => this.selectNone()}>Select none</button>
            </div>
        );
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
            <li class={{ 'list__item': true, 'list__item--disabled': item.disabled }} title={itemTooltipInfo} onMouseOver={(): void => { this.onMouseOver(index); }}>
                <label class="mi-label label" tabindex="-1">
                    <input
                        class={{ 'label__checkbox': true, 'label__checkbox--hidden': !showCheckBox, 'mi-input': true }}
                        type="checkbox"
                        value={index}
                        checked={item.selected}
                        disabled={item.disabled}
                        data-excludefromall={item.excludefromall}
                        onChange={(): void => this.onSelect(item)}
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
        } else if (listElementRect.right > clientWidth || this.dropdownAlignment === 'right') {
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

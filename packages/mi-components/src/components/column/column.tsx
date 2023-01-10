import { Component, Event, EventEmitter, Listen, Prop } from '@stencil/core';

@Component({
    tag: 'mi-column',
    shadow: true
})
export class Column {
    /**
     * The monospace property sets the font-family to monospace.
     *
     * @type {boolean}
     * @memberof Column
     */
    @Prop() monospace: boolean = false;

    /**
     * The alignContent property sets the alignment of the column's content.
     *
     * @type {('left'|'center'|'right')}
     * @default 'left'
     * @example <mi-column align-content="center"></mi-column>
     * @memberof Column
     */
     @Prop() alignContent: string = 'left';

    /**
     * The label that will be shown in the table header.
     *
     * @type {string}
     * @memberof Column
     */
    @Prop() label: string;

    /**
     * If present, the column will be sortable.
     * *For sorting dates use `sortable="date"`.
     * @type {(''|'date'|'default')}
     * @memberof Column
     */
    @Prop() sortable: string;

    /**
     * If present, the table will be pre-sorted by this column.
     *
     * @type {('asc'|'desc')}
     * @memberof Column
     */
    @Prop() sort: string;

    /**
     * The name of the property on the row object which value will be displayed.
     *
     * @type {string}
     * @memberof Column
     */
    @Prop() binding: string;

    /**
     * If present, the column width is fitted the content.
     *
     * @type {boolean}
     * @memberof Column
     */
    @Prop() fitContent: boolean = false;

    /**
     * The width property sets the column's width. All CSS length units are accepted.
     *
     * @example <mi-column width="100px"></mi-column>
     * @type {string}
     * @default 'auto'
     * @memberof Column
     */
    @Prop() width: string = 'auto';

    /**
     * Fired when clicking on content within a table cell for this column.
     * Event detail contains the row data.
     * @event clicked
     * @type {EventEmitter}
     */
    @Event() clicked: EventEmitter<object>;

    /**
     * Relays the cellContentClicked event from the table component as a clicked event out of the component.
     * @fires clicked
     */
    @Listen('cellContentClicked')
    cellContentClickedHandler(event: CustomEvent): void {
        this.clicked.emit(event.detail);
    }

    render(): void {
        return;
    }
}

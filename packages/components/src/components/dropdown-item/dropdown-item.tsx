import { Component, Element, Prop } from '@stencil/core';

@Component({
    tag: 'mi-dropdown-item',
    shadow: false
})
export class DropdownItem {
    @Element() el: HTMLDivElement;
    @Prop() selected: boolean = false;
    @Prop() disabled: boolean = false;
    @Prop() excludefromall: boolean = false;
    @Prop() value: string;
    @Prop() text: string;
}

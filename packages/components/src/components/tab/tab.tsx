import { Component, Prop } from '@stencil/core';

@Component({
    tag: 'mi-tab',
    shadow: true
})
export class Tab {
    @Prop() label: string;
    @Prop() tabFor: string;

    render() { return; }
}

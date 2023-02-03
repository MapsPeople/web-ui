import { Component, ComponentInterface, Host, h, JSX, Prop } from '@stencil/core';

@Component({
    tag: 'mi-icon',
    styleUrl: 'icon.scss',
    shadow: true
})
export class Icon implements ComponentInterface {

    /**
     * The icon name.
     * A list of supported icons can be found in the documentation.
     *
     * @type {string}
     */
    @Prop() iconName: string;

    render(): JSX.Element {
        return (
            <Host class={`icon-${this.iconName.toLowerCase()}`}></Host>
        );
    }
}

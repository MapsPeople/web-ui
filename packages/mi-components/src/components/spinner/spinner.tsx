import { Component, Host, h, Prop, JSX } from '@stencil/core';

@Component({
    tag: 'mi-spinner',
    styleUrl: 'spinner.scss',
    shadow: true
})
export class Spinner {
    /**
     * The inverse attribute will inverse the color of the spinner.
     *
     * @type {boolean}
     */
    @Prop() inverse: boolean = false;

    render(): JSX.Element {
        return (
            <Host>
                <div class={`spinner ${this.inverse ? 'inverse' : ''}`}>
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div class="bounce3"></div>
                </div>
            </Host>
        );
    }
}

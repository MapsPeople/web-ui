import { Component, Host, Prop, h } from '@stencil/core';

@Component({
    tag: 'mi-my-position',
    styleUrl: 'my-position.scss',
    shadow: true,
})
export class MyComponent {
    @Prop() mapsindoors;

    private positionButtonClicked(): void {
        console.log('positionButtonClicked');
    }

    private compassButtonClicked(): void {
        console.log('compassButtonClicked');
    }

    render() {
        console.log('hello');
        return (
            <Host>
                <button class={'mapsindoors position-control__position-button'} onClick={(): void => this.positionButtonClicked()}>POSITION BUTTON</button>
                <button class={'mapsindoors position-control__compass-button'} onClick={(): void => this.compassButtonClicked()}>COMPASS BUTTON</button>
            </Host>
        );
    }
}
import { Component, h } from '@stencil/core';
import { JSX } from '@stencil/core/internal';

@Component({
    tag: 'mi-card',
    styleUrl: 'card.scss',
    shadow: true
})

export class Card {
    render(): JSX.Element {
        return (
            <slot></slot>
        );
    }
}
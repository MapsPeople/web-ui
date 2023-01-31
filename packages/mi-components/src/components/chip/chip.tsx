import { Component, ComponentInterface, h, Prop } from '@stencil/core';
import { JSX } from '@stencil/core/internal';

@Component({
    tag: 'mi-chip',
    styleUrl: 'chip.scss',
    shadow: false,
})
export class Chip implements ComponentInterface {

  /**
   * The icon source.
   *
   * @type {string}
   */
  @Prop() icon?: string;

  /**
   * The chip content that is displayed in the component.
   *
   * @type {string}
   */

  @Prop() content: string;

  /**
   * Checks if the chip is active and applies different styling to the component.
   *
   * @type {boolean}
   */

  @Prop() active: boolean = false;

  render(): JSX.Element {
      return (
          <div class={`chip ${this.active ? 'active' : ''}`}>
              {this.icon && <img class="chip__icon" src={this.icon}></img>}
              <div class="chip__content">{this.content}</div>
          </div>
      );
  }

}

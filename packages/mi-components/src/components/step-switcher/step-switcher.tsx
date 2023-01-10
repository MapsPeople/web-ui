import { Component, ComponentInterface, Host, h, Prop, Event, EventEmitter } from '@stencil/core';
import { JSX } from '@stencil/core/internal';

@Component({
    tag: 'mi-step-switcher',
    styleUrl: 'step-switcher.scss',
    shadow: true
})
export class StepSwitcher implements ComponentInterface {
    /**
     * Heading to display.
     *
     * @type {string}
     */
    @Prop() heading: string;

    /**
     * Steps to display dots for.
     *
     * @type {any[]}
     */
    @Prop() steps: any[] = [];

    /**
     * Step index to show. Defaults to first step.
     *
     * @type {number}
     */
    @Prop({
        reflect: true
    }) stepIndex: number = 0;
    //

    /**
     * Emits the new step index as a number.
     *
     * @type {EventEmitter}
     */
    @Event() stepIndexChanged: EventEmitter<number>;

    /**
     * Set step index and emit stepIndexChanged event.
     *
     * @param {number} index
     */
    setStepIndex(index: number): void {
        this.stepIndex = index;
        this.stepIndexChanged.emit(this.stepIndex);
    }

    render(): JSX.Element {
        return (
            <Host>
                <button type="button" disabled={this.steps.length === 0 || this.stepIndex === 0} onClick={() => this.setStepIndex(this.stepIndex - 1)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                    </svg>
                </button>

                <div class="steps">
                    {this.heading ? <p part="heading">{this.heading}</p> : null}

                    <div class="steps__dots">
                        {this.steps.map((item, index) => {
                            const isActive = this.stepIndex === index ? true : false;
                            return <span part={isActive ? 'active-dot' : 'dot'} class={{ 'active': isActive }}></span>;
                        })}
                    </div>
                </div>

                <button type="button" disabled={this.steps.length === 0 || this.stepIndex === this.steps.length - 1} onClick={() => this.setStepIndex(this.stepIndex + 1)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                </button>
            </Host>
        );
    }
}
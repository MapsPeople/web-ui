import { Component, Host, h, Prop, State } from '@stencil/core';
import { isNumber, formatNumber } from '../../utils/utils';

@Component({
    tag: 'mi-metric-card',
    styleUrl: 'metric-card.scss',
    shadow: true
})
export class MetricCard {

    @State() showToolTip: boolean = false;
    /**
     * This is the metric title.
     * @type {string}
     * @memberof MetricCard
     */
    @Prop() label: string = '';
    /**
     * This is the metric value.
     * @type {string}
     * @memberof MetricCard
     */
    @Prop() value: string = '';

    /**
     * When present a info icon will be shown in the upper right corner of the card. When the mouse hovers over the icon tooltip will display the tip.
     * @type {string}
     * @memberof MetricCard
     */
    @Prop() tip: string;

    /**
     * When present a loading spinner will be displayed until the value or error attribute is set or the spinner attribute is removed
     * @type {boolean}
     * @memberof MetricCard
     */
    @Prop() spinner: boolean = false;

    /**
     * This can be used for displaying an error message if there are no data to be displayed.
     * @type {string}
     * @memberof MetricCard
     */
    @Prop() error: string;


    render() {
        return (
            <Host>
                <mi-card>
                    {this.renderContent()}

                </mi-card>
            </Host>
        );
    }

    renderToolTip() {
        if (this.tip > '') {
            return <p class={{ 'tool-tip': true, 'visible': this.tip && this.showToolTip }}>{this.tip}</p>

        }
    }

    getInfoIcon() {
        if (this.tip > '') {
            return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92c-.5.51-.86.97-1.04 1.69-.08.32-.13.68-.13 1.14h-2v-.5c0-.46.08-.9.22-1.31.2-.58.53-1.1.95-1.52l1.24-1.26c.46-.44.68-1.1.55-1.8-.13-.72-.69-1.33-1.39-1.53-1.11-.31-2.14.32-2.47 1.27-.12.37-.43.65-.82.65h-.3C8.4 9 8 8.44 8.16 7.88c.43-1.47 1.68-2.59 3.23-2.83 1.52-.24 2.97.55 3.87 1.8 1.18 1.63.83 3.38-.19 4.4z" />
            </svg>
        }
    }

    renderContent() {
        let value;
        if (this.value) {
            value = isNumber(this.value) ? formatNumber(this.value) : this.value;
        } else if (this.error) {
            value = this.error;
        }
        else if (this.spinner) {
            value = <mi-spinner></mi-spinner>
        } else {
            value = ' ';
        }

        return <div class="content">
            <h1 onMouseOver={() => this.showToolTip = true} onMouseOut={() => this.showToolTip = false}>{this.label}  {this.getInfoIcon()}</h1>
            <section>
                {this.renderToolTip()}
                <p class={{ 'error': !!this.error, 'hidden': this.tip && this.showToolTip }}>{value}</p>
            </section>
        </div>
    }
}
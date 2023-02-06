import { Component, ComponentInterface, h, JSX, Prop, State, Watch } from '@stencil/core';

@Component({
    tag: 'mi-time',
    shadow: true
})
export class Time implements ComponentInterface {

    /**
     * Time in seconds.
     *
     * @type {string}
     */
    @Prop() seconds: number;

    /**
     * Object with translation strings as stringified JSON.
     * Default translations {days: 'd', hours: 'h', minutes: 'min'}.
     */
    @Prop() translations: string;
    @Watch('translations')
    setTranslations(): void {
        if (this.translations) {
            this.translationsData = JSON.parse(this.translations);
        } else {
            this.translationsData = { days: 'd', hours: 'h', minutes: 'min' };
        }
    }
    @State() translationsData;

    componentWillLoad(): void {
        this.setTranslations();
    }

    /**
     * Get display string in days, hours, and minutes, eg. "1 d 23 h 4 min".
     * Minimum display value is 1 minute.
     *
     * @param {number} seconds Duration in seconds.
     * @returns {string}
     */
    getDurationDisplayString(seconds: number): string {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor(((seconds % 86400) % 3600) / 60);

        const dDisplay = days > 0 ? `${days} ${this.translationsData.days} ` : '';
        const hDisplay = hours > 0 ? `${hours} ${this.translationsData.hours} ` : '';
        let mDisplay = minutes > 0 ? `${minutes} ${this.translationsData.minutes}` : '';

        // Set minimum value of 1 min.
        if (!dDisplay && !hDisplay && !mDisplay) {
            mDisplay = '1 min';
        }

        return `${dDisplay}${hDisplay}${mDisplay}`.trim();
    }

    render(): JSX.Element {
        return (
            this.seconds >= 0 && this.translationsData ? this.renderDuration() : null
        );
    }

    /**
     * Render formatted duration string.
     *
     * @returns {JSX.Element}
     */
    renderDuration(): JSX.Element {
        return (
            <span>{this.getDurationDisplayString(this.seconds)}</span>
        );
    }
}

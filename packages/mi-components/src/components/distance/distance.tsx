import { Component, ComponentInterface, h, JSX, Prop } from '@stencil/core';
import { UnitSystem } from '../../enums/unit-system.enum';

@Component({
    tag: 'mi-distance',
    shadow: true
})
export class Distance implements ComponentInterface {
    /**
     * Distance in meters.
     *
     * @type {number}
     */
    @Prop() meters: number;

    /**
     * Set imperial or metric as default unit system. Default is Metric unless the browser is running US English. In that case Imperial.
     * @type {UnitSystem}
     */
    @Prop() unit: UnitSystem = navigator.language === 'en-US' ? UnitSystem.Imperial : UnitSystem.Metric;

    /**
     * Get formatted string, eg. 1 km 10 m.
     * Minimum display value is 1 m.
     *
     * @param {number} meters
     * @returns {string}
     */
    getMetricDisplayString(meters: number): string {
        if (Math.abs(meters) < 1000) {
            return Math.round(meters) > 0 ? `${Math.round(meters)} m` : '1 m';
        }
        return `${(meters / 1000).toFixed(1)} km`;
    }

    /**
     * Get formatted string, eg. 1 mi 10 ft.
     * Minimum display values is 1 foot.
     *
     * @param {number} meters
     * @returns {string}
     */
    getImperialDisplayString(meters: number): string {
        const oneMile = 1609.344;
        const oneFoot = 3.28084;
        if (Math.abs(meters) < oneMile) {
            const feet = meters * oneFoot;
            return Math.round(feet) > 0 ? `${Math.round(feet)} ft` : '1 ft';
        }
        return `${(meters / oneMile).toFixed(1)} mi`;
    }

    render(): JSX.Element {
        return (
            this.meters >= 0 ? this.renderDistance() : null
        );
    }

    /**
     * Render readable distance string.
     *
     * @returns {JSX.Element}
     */
    renderDistance(): JSX.Element {
        return (
            <span>
                {this.unit === UnitSystem.Metric ?
                    this.getMetricDisplayString(this.meters) :
                    this.getImperialDisplayString(this.meters)
                }
            </span>
        );
    }
}

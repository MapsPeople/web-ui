import { Component, ComponentInterface, Prop, JSX } from '@stencil/core';
import { getLevelDefault } from '../../utils/levelDefaults';

@Component({
    tag: 'mi-location-info',
    styleUrl: 'location-info.scss',
    shadow: true
})
export class LocationInfo implements ComponentInterface {

    /**
     * @description Location object.
     */
    @Prop() location;

    /**
     * @description The word used for "Level" when showing level info. When not
     * passed, falls back to a localized default resolved from the current
     * MapsIndoors SDK language (e.g. "楼层" for `zh-Hans`, "Etage" for `de`/`da`).
     */
    @Prop() level?: string;

    /**
     * Resolves the effective level word: the explicit `level` prop when provided,
     * otherwise the SDK-language-aware default from `getLevelDefault()`.
     */
    private get effectiveLevel(): string {
        return this.level ?? getLevelDefault();
    }

    /**
     * @description Whether to show the External ID.
     */
    @Prop() showExternalId: boolean = true;

    /**
     * @description Whether to show the floor information. Default is true.
     */
    @Prop() showFloor: boolean = true;

    /**
     * Get locations info as a string.
     *
     * @returns {string}
     */
    getInfoString(): string {
        const details = [];

        // External Id
        if (this.location.properties.externalId && this.showExternalId) {
            details.push(this.location.properties.externalId);
        }
        // Floor name
        if (this.location.properties.floorName && this.showFloor) {
            details.push(`${this.effectiveLevel} ${this.location.properties.floorName}`);
        }
        // Building
        if (this.location.properties.building) {
            if (this.location.properties.venue) {
                // Check that venue and building is not named the same
                if (this.location.properties.venue.toLowerCase() !== this.location.properties.building.toLowerCase()) {
                    details.push(this.location.properties.building);
                }
            } else {
                details.push(this.location.properties.building);
            }
        }
        // Venue
        if (this.location.properties.venue) {
            details.push(this.location.properties.venue);
        }

        // Subtitle
        if (this.location.properties.subtitle) {
            details.push(this.location.properties.subtitle);
        }

        return details.join(' · ');
    }

    /**
     * Renders location list-info.
     *
     * @description Render location list-info.
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return (
            this.location?.properties ? this.getInfoString() : null
        );
    }
}

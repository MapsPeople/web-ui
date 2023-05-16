import { Component, ComponentInterface, Prop, JSX } from '@stencil/core';

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
     * Get locations info as a string.
     * @returns {string}
     */
    getInfoString(): string {
        const details = [];

        // External Id
        if (this.location.properties.externalId) {
            details.push(this.location.properties.externalId);
        }
        // Floor name
        if (this.location.properties.floorName) {
            details.push(`Level ${this.location.properties.floorName}`);
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

    render(): JSX.Element {
        return (
            this.location?.properties ? this.getInfoString() : null
        );
    }
}

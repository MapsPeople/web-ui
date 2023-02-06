import { Component, ComponentInterface, h, Prop, JSX } from '@stencil/core';
import { RouteTravelMode } from '../../enums/route-travel-mode.enum';
import { UnitSystem } from './../../enums/unit-system.enum';

@Component({
    tag: 'mi-route-instructions-heading',
    styleUrl: 'route-instructions-heading.scss',
    shadow: true
})
export class RouteInstructionsHeading implements ComponentInterface {
    /**
     * The origin location name.
     * @type {string}
     */
    @Prop() originName: string;

    /**
     * The destination location name.
     * @type {string}
     */
    @Prop() destinationName: string;

    /**
     * The total travel duration in seconds.
     *
     * @type {number}
     */
    @Prop() totalTravelTime: number;

    /**
     * The total walking distance in meters.
     *
     * @type {number}
     */
    @Prop() totalWalkingDistance: number;

    /**
     * Set preferred travel mode. Defaults to "walking".
     *
     * @type {RouteTravelMode} 'walking', 'bicycling', 'transit', 'driving'.
     */
    @Prop() travelMode: RouteTravelMode = RouteTravelMode.Walking;

    /**
     * Set 'imperial' or 'metric' as default unit system.
     * @type {UnitSystem} 'imperial' or 'metric'
     */
    @Prop() unit: UnitSystem = UnitSystem.Metric;

    @Prop() translations = {
        from: 'From',
        to: 'To',
        avoidStairs: 'Avoid stairs',
        walk: 'Walk',
        walking: 'Walking',
        bike: 'Bike',
        bicycling: 'Bicycling',
        transit: 'Transit',
        car: 'Car',
        driving: 'Driving'
    }

    /**
     * Get travel mode as a string. Eg. "Walking", "Driving", "Transit", "Bicycling".
     *
     * @returns {string}
     */
    getTravelModeString(): string {
        switch (this.travelMode) {
            case RouteTravelMode.Walking: return this.translations.walk;
            case RouteTravelMode.Driving: return this.translations.car;
            case RouteTravelMode.Transit: return this.translations.transit;
            case RouteTravelMode.Bicycling: return this.translations.bike;
            default: return this.translations.walk;
        }
    }

    /**
     * Get icon name for travel mode.
     *
     * @returns {string}
     */
    getTravelModeIconName(): string {
        switch (this.travelMode) {
            case RouteTravelMode.Walking: return 'walk';
            case RouteTravelMode.Driving: return 'car';
            case RouteTravelMode.Transit: return 'transit';
            case RouteTravelMode.Bicycling: return 'bike';
            default: return 'walk';
        }
    }

    render(): JSX.Element {
        return (
            <div class="directions">
                {/* Directions Way Points */}
                {this.originName && this.destinationName ? this.renderWayPoints() : null}

                {/* Direction details and travel mode selector */}
                <div class="directions-details">
                    {this.totalTravelTime >= 0 || this.totalWalkingDistance >= 0 ?
                        <div class="directions-details-numbers">
                            {this.totalTravelTime >= 0 ? <div><mi-time seconds={this.totalTravelTime}></mi-time></div> : null}
                            {this.totalWalkingDistance >= 0 ? <div class="directions-details-numbers-distance"><mi-distance meters={this.totalWalkingDistance}></mi-distance> {this.translations.walking.toLowerCase()}</div> : null}
                        </div> :
                        null}
                    {/* TODO: Add travel mode selector */}
                    <a href="#" class="directions-details-travel-mode-selector">
                        {this.getTravelModeString()}
                        <mi-icon icon-name={this.getTravelModeIconName()}></mi-icon>
                    </a>
                </div>
            </div>
        );
    }

    /**
     * Render direction way points.
     *
     * @returns {JSX.Element}
     */
    renderWayPoints(): JSX.Element {
        return (
            <div class="directions-way-points">
                <span>{this.translations.to} {this.destinationName}</span>
                {/* TODO: Add origin selector */}
                <span>{this.translations.from} <a href="#">{this.originName}</a></span>
            </div>
        );
    }
}
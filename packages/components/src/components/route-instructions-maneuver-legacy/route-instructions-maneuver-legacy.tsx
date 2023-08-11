import { Component, ComponentInterface, Host, Watch, State, Prop, h, JSX } from '@stencil/core';
import { UnitSystem } from '../../enums/unit-system.enum';
import { Maneuver } from '../../types/maneuver.interface';
import { DirectionsTranslations } from '../../types/directions-translations.interface';

@Component({
    tag: 'mi-route-instructions-maneuver-legacy',
    styleUrl: 'route-instructions-maneuver-legacy.scss',
    shadow: true
})
export class RouteInstructionsManeuverLegacy implements ComponentInterface {
    /**
     * Maneuver to display given as stringified JSON.
     *
     * @type {string} - Maneuver/substep object passed as stringified JSON.
     */
    @Prop() maneuver: string;

    @Watch('maneuver')
    parseManeuverProp(): void {
        this.maneuverData = JSON.parse(this.maneuver);
    }

    @State() maneuverData: Maneuver;

    /**
     * Object with translation strings as stringified JSON.
     */
    @Prop() translations: string;
    @Watch('translations')
    parseTranslationsProp(): void {
        this.translationsData = JSON.parse(this.translations);
    }

    @State() translationsData: DirectionsTranslations;

    /**
     * Set imperial or metric as default unit system.
     * @type {UnitSystem} 'imperial' or 'metric'
     */
    @Prop() unit: UnitSystem = UnitSystem.Metric;

    componentWillLoad(): void {
        this.parseManeuverProp();
        this.parseTranslationsProp();
    }

    /**
     * Get maneuver name.
     *
     * @returns {string}
     */
    getManeuverName(maneuver: string): string {
        if (maneuver.includes('straight')) return 'straight';
        if (maneuver.includes('sharp right')) return 'sharp-right';
        if (maneuver.includes('sharp left')) return 'sharp-left';
        if (maneuver.includes('slight right')) return 'slight-right';
        if (maneuver.includes('slight left')) return 'slight-left';
        if (maneuver.includes('right')) return 'right';
        if (maneuver.includes('left')) return 'left';
        if (maneuver.includes('uturn')) return 'u-turn';
        if (maneuver.includes('depart')) return 'straight';
    }

    render(): JSX.Element {
        return (
            this.maneuverData && this.translationsData ? this.renderManeuver() : null
        );
    }

    /**
     * Render step.
     *
     * @returns {JSX.Element}
     */
    renderManeuver(): JSX.Element {
        const maneuverStrings = {
            'straight': this.translationsData.continueStraightAhead,                                        // 'Continue straight ahead',
            'left': `${this.translationsData.goLeft} ${this.translationsData.andContinue}`,                 // 'Go left and continue',
            'sharp-left': `${this.translationsData.goSharpLeft} ${this.translationsData.andContinue}`,      // 'Go sharp left and continue',
            'slight-left': `${this.translationsData.goSlightLeft} ${this.translationsData.andContinue}`,    // 'Go slight left and continue',
            'right': `${this.translationsData.goRight} ${this.translationsData.andContinue}`,               // 'Go right and continue',
            'sharp-right': `${this.translationsData.goSharpRight} ${this.translationsData.andContinue}`,    // 'Go sharp right and continue',
            'slight-right': `${this.translationsData.goSlightRight} ${this.translationsData.andContinue}`,  // 'Go slight right and continue',
            'u-turn': `${this.translationsData.turnAround} ${this.translationsData.andContinue}`,           // 'Turn around and continue'
        };

        const maneuver = this.getManeuverName(this.maneuverData.maneuver.toLowerCase());
        const iconName = `arrow-${maneuver}`;
        // Check if the instructions property has a value otherwise fallback to maneuver property
        const translatedManeuver = this.maneuverData.instructions ? this.maneuverData.instructions : maneuverStrings[maneuver];

        return (
            <Host>
                <div class="icon">
                    {maneuver ? <mi-icon part="maneuver-icon" icon-name={iconName}></mi-icon> : null}
                </div>
                <div class="description">
                    {/* TODO: Render normally when SDK strips instructions properties for HTML */}
                    <p part="maneuver-description">{translatedManeuver}</p>
                    <div class="description__distance">
                        <mi-distance part="maneuver-description-distance" meters={this.maneuverData.distance.value} unit={this.unit}></mi-distance>
                        <span part="maneuver-description-distance-border" class="description__distance-border"></span>
                    </div>
                </div>
            </Host>
        );
    }
}

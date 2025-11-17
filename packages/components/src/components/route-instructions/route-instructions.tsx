import { Component, ComponentInterface, Host, Event, EventEmitter, h, Prop } from '@stencil/core';
import { JSX } from '@stencil/core/internal';
import { Route } from '../../types/route.interface';
import { DirectionsTranslations } from '../../types/directions-translations.interface';
import { Location } from '@mapsindoors/typescript-interfaces';
import { RouteTravelMode } from '../../enums/route-travel-mode.enum';
import { UnitSystem } from './../../enums/unit-system.enum';
import { Step } from '../../types/step.interface';
import { isInternetExplorer } from '../../utils/utils';

@Component({
    tag: 'mi-route-instructions',
    styleUrl: 'route-instructions.scss',
    shadow: true
})
export class RouteInstructions implements ComponentInterface {

    /**
     * Event emitted when clicking on instructions.
     * @event clicked
     * @type {object}
     * @property {number} legIndex
     * @property {number} stepIndex
     * @property {number} maneuverIndex
     */
    @Event() clicked: EventEmitter<object>;

    /**
     * Set active step to populate it with an "active" class. Defaults to legIndex 0 and stepIndex 0.
     * @type {{ legIndex: number, stepIndex: number }}
     */
    @Prop({ mutable: true, reflect: true })
    activeStep: { legIndex: number, stepIndex: number } = {
        legIndex: 0,
        stepIndex: 0
    }

    /**
     * Set imperial or metric as default unit system.
     * @type {UnitSystem} 'imperial' or 'metric'
     */
    @Prop() unit: UnitSystem = UnitSystem.Metric;

    /**
     * A MapsIndoors directions result object given from a getRoute call from DirectionsService.
     * @type {Route}
     */
    @Prop() route: Route;

    /**
     * If indoor substeps/maneuvers should be hidden.
     *
     * @type {boolean}
     */
    @Prop() hideIndoorSubsteps: boolean = false;

    /**
     * Set preferred travel mode. Defaults to "walking".
     *
     * @type {RouteTravelMode} 'walking', 'bicycling', 'transit', 'driving'.
     */
    @Prop() travelMode: RouteTravelMode = RouteTravelMode.Walking

    /**
     * If the origin location is a MapsIndoors location, provide it to have the instructions present it.
     * The originLocation attribute wins over the originName attribute.
     * @type {Location}
     */
    @Prop() originLocation: Location;

    /**
     * If the origin location is a external location, provide a name to have the instructions present it.
     * The origin name will not be rendered when the originLocation attribute is set.
     * @type {string}
     */
    @Prop() originName: string;

    /**
     * If the end location is a MapsIndoors location, provide it to have the instructions present it.
     * The destinationLocation attribute wins over the destinationName attribute.
     * @type {Location}
     */
    @Prop() destinationLocation: Location;

    /**
     * If the end location is a external location, provide a name to have the instructions present it.
     * The destination name will not be rendered when the destinationLocation attribute is set.
     * @type {string}
     */
    @Prop() destinationName: string;

    /**
     * Translations object for translatable labels.
     *
     */
    @Prop() translations: DirectionsTranslations = {
        walk: 'Walk',
        bike: 'Bike',
        transit: 'Transit',
        drive: 'Drive',
        leave: 'Leave',
        from: 'From',
        park: 'Park',
        at: 'at',
        building: 'Building',
        venue: 'Venue',
        takeStaircaseToLevel: 'Take staircase to level',
        takeLadderToLevel: 'Take the ladder to level',
        takeElevatorToLevel: 'Take elevator to level',
        takeEscalatorToLevel: 'Take escalator to level',
        takeWheelchairLiftToLevel: 'Take wheelchair lift to level',
        takeWheelchairRampToLevel: 'Take wheelchair ramp to level',
        exit: 'Exit',
        enter: 'Enter',
        stops: 'stops',
        andContinue: 'and continue',
        continueStraightAhead: 'Continue straight ahead',
        goLeft: 'Go left',
        goSharpLeft: 'Go sharp left',
        goSlightLeft: 'Go slight left',
        goRight: 'Go right',
        goSharpRight: 'Go sharp right',
        goSlightRight: 'Go slight right',
        turnAround: 'Turn around',
        days: 'd',
        hours: 'h',
        minutes: 'min',
        rideTheBus: 'Ride the bus'
    };

    miStepElements: HTMLMiRouteInstructionsStepElement[] = [];

    lastStepRouteContext = null;
    lastStepTravelMode = null;
    lastStepTransitStop = null;

    componentDidRender(): void {
        this.miStepElements.forEach((element: HTMLMiRouteInstructionsStepElement) => {
            element.hideIndoorSubsteps = this.hideIndoorSubsteps;
        });
    }

    /**
     * Transform the step in legs to a flat array of steps.
     *
     * @returns {Step[]}
     */
    getRouteSteps(): Step[] {
        if (!this.route) {
            return [];
        }

        return this.route.legs.reduce((accummulator, leg, legIndex) => {
            for (const stepIndex in leg.steps) {
                const step = leg.steps[stepIndex];
                step.originalLegIndex = legIndex;
                step.originalStepIndex = parseInt(stepIndex);
                accummulator.push(step);
            }

            return accummulator;
        }, []);
    }

    /**
     * Updates the activeStep attribute and emits an object with leg, step and maneuver index information.
     *
     * @param {CustomEvent<any>} event Step object.
     * @param {number} stepIndex step index.
     */
    stepClickedHandler(event: CustomEvent<any>, stepIndex: number): void {
        const originalStep: any = this.getRouteSteps()[stepIndex];

        // Update activeStep attribute
        this.activeStep = {
            legIndex: originalStep.originalLegIndex,
            stepIndex: originalStep.originalStepIndex
        };

        this.clicked.emit({
            legIndex: originalStep.originalLegIndex,
            stepIndex: originalStep.originalStepIndex,
            maneuverIndex: event.detail.maneuverIndex
        });
    }

    /**
     * Check if the step is active.
     *
     * @param {Step} step
     * @returns {boolean}
     */
    isActiveStep(step: Step): boolean {
        // Check that activeStep attribute is set
        if (!this.activeStep) return false;

        // Check that the indexes matches those set at the activeStep attribute
        const isActiveStep = this.activeStep.legIndex === step.originalLegIndex &&
            this.activeStep.stepIndex === step.originalStepIndex;

        return isActiveStep;
    }

    render(): JSX.Element {
        return this.route ? this.renderInstructions() : null;
    }

    /**
     * Render instructions.
     *
     * @returns {JSX.Element}
     */
    renderInstructions(): JSX.Element {
        return (
            <Host>
                {/* Steps */}
                {this.getRouteSteps().map((currentStep: Step, stepIndex: number) => {
                    const originName = this.originLocation?.properties?.name ? this.originLocation.properties.name : this.originName || '';
                    const isFirstRouteStep = currentStep.originalLegIndex === 0 && currentStep.originalStepIndex === 0;
                    const lastStepRouteContext = isFirstRouteStep ? originName : this.lastStepRouteContext;
                    const lastTravelMode = this.lastStepTravelMode;
                    const lastTransitStop = this.lastStepTransitStop;

                    this.lastStepRouteContext = currentStep.route_context;
                    this.lastStepTravelMode = currentStep.travel_mode;
                    this.lastStepTransitStop = currentStep.transit_information?.arrival_stop?.name ? currentStep.transit_information?.arrival_stop.name : null;

                    return <mi-route-instructions-step-legacy
                        ref={(el) => this.miStepElements.push(el as HTMLMiRouteInstructionsStepElement)}
                        from-travel-mode={lastTravelMode}
                        from-route-context={lastStepRouteContext}
                        from-transit-stop={lastTransitStop}
                        step={JSON.stringify(currentStep)}
                        translations={JSON.stringify(this.translations)}
                        unit={this.unit}
                        onStepClicked={(event) => this.stepClickedHandler(event, stepIndex)}
                        class={this.isActiveStep(currentStep) ? 'active' : ''}
                        part={this.isActiveStep(currentStep) ? 'step active' : 'step'}
                        // @ts-ignore
                        exportparts="
                            step-toggle,
                            step-heading,
                            step-description,
                            step-info,
                            step-travel-mode,
                            step-travel-mode-icon,
                            maneuver-icon,
                            maneuver-description,
                            maneuver-description-distance,
                            maneuver-description-distance-border"
                    />;
                })}

                {/* Destination */}
                {this.destinationLocation || this.destinationName ? this.renderDestination() : null}
            </Host>);
    }

    /**
     * Render destination.
     *
     * @returns {JSX.Element}
     */
    renderDestination(): JSX.Element {
        return (
            <div class="instructions-destination">
                <div class="instructions-destination-icon">
                    {isInternetExplorer() ? null :
                        <mi-icon icon-name="marker"></mi-icon>
                    }
                </div>
                <div part="instructions-destination" class="instructions-destination-details">
                    {this.destinationLocation ? this.destinationLocation.properties.name : this.destinationName}
                    {this.destinationLocation ? <mi-location-info part="instructions-destination-info" location={this.destinationLocation}></mi-location-info> : null}
                </div>
            </div>
        );
    }
}

import { Component, ComponentInterface, h, Prop, State, Watch, Event, EventEmitter } from '@stencil/core';
import { JSX, Method } from '@stencil/core/internal';
import { UnitSystem } from '../../enums/unit-system.enum';
import { DirectionsTranslations } from '../../types/directions-translations.interface';
import { Step, StepContext } from '../../types/step.interface';
import { isInternetExplorer } from '../../utils/utils';

@Component({
    tag: 'mi-route-instructions-step',
    styleUrl: 'route-instructions-step.scss',
    shadow: true
})
export class RouteInstructionsStep implements ComponentInterface {

    /**
     * The step data object to render from.
     * Must be passed as stringified JSON.
     */
    @Prop() step: string;

    @Watch('step')
    parseStepProp(): void {
        if (this.step) {
            this.stepData = JSON.parse(this.step);
        }
    }
    /**
     * Holding parsed step data.
     *
     * @type {Step}
     */
    @State() stepData: Step;

    /**
     * If indoor substeps/maneuvers should be hidden.
     *
     * @type {boolean}
     */
    @Prop() hideIndoorSubsteps: boolean = true;

    /**
     * The route context of previous step, if any.
     *
     * @type {string}
     */
    @Prop() fromRouteContext: string = '';

    /**
     * The travel mode of previous step, if any.
     *
     * @type {string}
     */
    @Prop() fromTravelMode: string;

    /**
     * The transit stop of previous step if any.
     *
     * @type {string}
     */
    @Prop() fromTransitStop: string;

    /**
     * Set imperial or metric as default unit system. Default is Metric unless the browser is running US English. In that case Imperial.
     *
     * @type {UnitSystem}
     */
    @Prop() unit: UnitSystem = navigator.language === 'en-US' ? UnitSystem.Imperial : UnitSystem.Metric;

    /**
     * Indicates if it should show the toggle button.
     *
     * @type {boolean}
     */
    @Prop() showToggleButton: boolean = true;

    /**
     * Object with translation strings as stringified JSON.
     */
    @Prop() translations: string;
    @Watch('translations')
    parseTranslationsProp(): void {
        if (this.translations) {
            this.translationsData = JSON.parse(this.translations);
        }
    }
    @State() translationsData: DirectionsTranslations;

    /**
     * Event emitted when clicking on a step (not sub step).
     *
     * @event stepClicked
     * @type {object}
     */
    @Event() stepClicked: EventEmitter<object>;

    /**
     * Signifies wether substeps are open or not.
     */
    @State() substepsAreOpen: boolean = false;

    /**
     * Event emitted when substeps are toggled.
     */
    @Event() substepsToggled: EventEmitter<void>;

    /**
     * Programmatically open the substeps.
     */
    @Method()
    openSubsteps(): void {
        this.substepsAreOpen = true;
    }

    /**
     * Programmatically close the substeps.
     */
    @Method()
    closeSubsteps(): void {
        this.substepsAreOpen = false;
    }

    isInternetExplorer: boolean = isInternetExplorer();

    /**
     * Component will load.
     */
    componentWillLoad(): void {
        this.parseStepProp();
        this.parseTranslationsProp();
    }

    /**
     * Render if there is step data.
     *
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return this.stepData && this.translationsData ? this.renderStep() : null;
    }

    /**
     * Emits stepClicked event (if click target is not related to an action).
     *
     * @param event - Event.
     */
    stepClickHandler(event): void {
        // Don't emit click event if clicked on elements that are actions to other things
        if (Array.from(event.target.classList).includes('icon-toggle')) {
            return;
        }

        let maneuverIndex = null;
        if (event.target.dataset.maneuverIndex !== undefined) {
            maneuverIndex = parseInt(event.target.dataset.maneuverIndex);
        }

        this.stepClicked.emit({ maneuverIndex });
    }

    /**
     * Render step part depending on travel mode.
     *
     * @returns {JSX.Element}
     */
    renderStep(): JSX.Element {
        switch (this.stepData.travel_mode.toUpperCase()) {
            case 'DRIVING':
                return this.renderDrivingStep();
            case 'WALKING':
                return this.renderWalkingStep();
            case 'BICYCLING':
                return this.renderBicyclingStep();
            case 'TRANSIT':
                return this.renderTransitStep();
            default:
                return <div>Unknown travel mode: {this.stepData.travel_mode}</div>;
        }
    }

    /**
     * Render the travel mode indicator and dotted/solid line.
     *
     * @returns {JSX.Element}
     */
    renderTravelMode(): JSX.Element {
        if (this.isInternetExplorer) {
            return null;
        }

        let travelModeIcon;
        switch (this.stepData.travel_mode.toUpperCase()) {
            case 'DRIVING':
                travelModeIcon = 'car';
                break;
            case 'WALKING':
                travelModeIcon = 'walk';
                break;
            case 'BICYCLING':
                travelModeIcon = 'bike';
                break;
            case 'TRANSIT':
                travelModeIcon = this.getTransitVehicleIconName();
                break;
        }

        return (
            <span part="step-travel-mode" class={`step__travel-mode step__travel-mode--${this.stepData.travel_mode.toUpperCase() === 'TRANSIT' ? 'solid' : 'dotted'}`}>
                <span class="step__travel-mode-icon">
                    <mi-icon part="step-travel-mode-icon" icon-name={travelModeIcon}></mi-icon>
                </span>
            </span>
        );
    }

    /**
     * Get icon name for transit vehicle.
     *
     * @returns {string}
     */
    getTransitVehicleIconName(): string {
        const stepTransitVehicleType = this.stepData.transit_information?.line.vehicle?.type.toLowerCase();
        const transitVehicleTypes = ['boat', 'bus', 'railway', 'train', 'subway']; // Supported Transit Vehicles

        return stepTransitVehicleType && transitVehicleTypes.some(type => type === stepTransitVehicleType) ? stepTransitVehicleType : 'transit';
    }

    /**
     * Toggles visibility of sub steps (steps in steps).
     */
    toggleSubsteps(): void {
        this.substepsToggled.emit();
        this.substepsAreOpen = !this.substepsAreOpen;
    }

    /**
     * Render substeps if they should be visible.
     *
     * @returns {JSX.Element}
     */
    renderSubsteps(): JSX.Element {
        return this.substepsAreOpen === true ? <div class="step__substeps">
            {this.stepData.steps?.map((maneuver, index) => {
                return <mi-route-instructions-maneuver
                    data-maneuver-index={index}
                    maneuver={JSON.stringify(maneuver)}
                    translations={this.translations}
                    unit={this.unit}
                    // @ts-ignore
                    exportparts="
                        maneuver-icon,
                        maneuver-description,
                        maneuver-description-distance,
                        maneuver-description-distance-border"
                />;
            })}
        </div> : null;
    }

    /**
     * Render the toggle button for the sub step expander.
     *
     * @returns {JSX.Element}
     */
    renderToggleButton(): JSX.Element {
        // Return null if none substeps/maneuvers is provided,
        // or if the showToggleButton is set to false.
        if (this.stepData.steps?.length <= 0 || !this.showToggleButton) {
            return null;
        }

        return (
            <span class='step__toggle' onClick={(): void => this.toggleSubsteps()}>
                {this.substepsAreOpen ?
                    <mi-icon part="step-toggle" icon-name="chevron-up"></mi-icon>
                    :
                    <mi-icon part="step-toggle" icon-name="chevron-down"></mi-icon>
                }
            </span>
        );
    }

    /**
     * Render distance part.
     *
     * @returns {JSX.Element}
     */
    renderDistance(): JSX.Element {
        return <span part="step-info" class="step__distance-duration">
            <mi-distance
                meters={this.stepData.distance.value}
                unit={this.unit}>
            </mi-distance><br />
        </span>;
    }

    /**
     * Render toggle and substeps.
     *
     * @returns {JSX.Element}
     */
    showSubsteps(): JSX.Element {
        return <div class="step__details">
            {this.renderSubsteps()}
        </div>;
    }

    /**
     * Render a driving step.
     *
     * @returns {JSX.Element}
     */
    renderDrivingStep(): JSX.Element {
        return <div class="step" onClick={(e): void => this.stepClickHandler(e)}>
            <div class="step__info">
                <div part="step-heading" class="step__heading">{this.getStepHeading()}</div>
                {this.renderToggleButton()}
            </div>
            {this.showSubsteps()}
        </div>;
    }

    /**
     * Get display heading.
     *
     * @returns {string}
     */
    getStepHeading(): string {
        const defaultHeadings = {
            'driving': this.translationsData.drive,
            'walking': this.translationsData.walk,
            'bicycling': this.translationsData.bike,
        };

        return this.stepData.steps[0]?.instructions ?
            this.stepData.steps[0].instructions :
            defaultHeadings[this.stepData.travel_mode.toLowerCase()];
    }

    /**
     * Render a walking step.
     *
     *
     * @returns {JSX.Element}
     */
    renderWalkingStep(): JSX.Element {
        let heading: string;

        /*
         * Determine action heading:
         */
        if (this.stepData.parking === true) {
            // Park your vehicle
            heading = `${this.translationsData.park} ${this.stepData.label ? ` ${this.translationsData.at} ` + this.stepData.label : ''}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'STEPS') { // TODO: SDK, why is highway not always set?
            // Take stairs
            heading = `${this.translationsData.takeStaircaseToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'LADDER') {
            // Take a laddder
            heading = `${this.translationsData.takeLadderToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'ESCALATOR') {
            // Take an escalator
            heading = `${this.translationsData.takeEscalatorToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'WHEELCHAIRRAMP') {
            // Take wheel chair ramp
            heading = `${this.translationsData.takeWheelchairRampToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'WHEELCHAIRLIFT') {
            // Take wheel chair lift
            heading = `${this.translationsData.takeWheelchairLiftToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'ELEVATOR') {
            // Take elevator
            heading = `${this.translationsData.takeElevatorToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.fromRouteContext === 'InsideBuilding' && this.stepData.route_context === 'Outside') {
            // Exit from inside to outside
            heading = this.addStepContextNameToHeading(this.translationsData.exit, this.stepData.start_context);
        } else if (this.fromRouteContext === 'InsideBuilding' && this.stepData.route_context === 'InsideBuilding') {
            heading = this.getStepHeading();
        } else if (this.fromRouteContext === 'Outside' && this.stepData.route_context === 'Outside' && this.fromTravelMode.toUpperCase() === 'TRANSIT') {
            // Switching between public transportation
            heading = this.fromTransitStop;
        } else if (this.fromRouteContext === 'Outside' && this.stepData.route_context === 'Outside') {
            heading = this.getStepHeading();
        } else if (this.fromRouteContext === 'Outside' && this.stepData.route_context === 'InsideBuilding') {
            // Enter from outside to inside
            heading = this.addStepContextNameToHeading(this.translationsData.enter, this.stepData.end_context);
        } else {
            // Origin Location name or empty
            heading = this.fromRouteContext === 'InsideBuilding' ? 'Inside Building' : this.fromRouteContext;
        }

        return <div class="step" onClick={(e): void => this.stepClickHandler(e)}>
            <div class="step__info">
                <div part="step-heading" class="step__heading">{heading}</div>
                {this.renderToggleButton()}
            </div>
            {this.showSubsteps()}
        </div>;
    }

    /**
     * Add building or venue name to the step heading.
     *
     * @param {string} heading
     * @param {StepContext} stepContext
     * @returns {string}
     */
    addStepContextNameToHeading(heading: string, stepContext: StepContext): string {
        if (stepContext) {
            if (stepContext.building) {
                heading += ` ${stepContext.building.buildingInfo.name} ${this.translationsData.building}`;
            } else if (stepContext.venue) {
                heading += ` ${stepContext.venue.venueInfo.name} ${this.translationsData.venue}`;
            }
        }
        return heading;
    }

    /**
     * Render a bicycling step.
     *
     * @returns {JSX.Element}
     */
    renderBicyclingStep(): JSX.Element {
        return <div class="step" onClick={(e): void => this.stepClickHandler(e)}>
            <div class="step__info">
                <div part="step-heading" class="step__heading">{this.getStepHeading()}</div>
                {this.renderToggleButton()}
            </div>
            {this.showSubsteps()}
        </div>;
    }

    /**
     * Render a transit step. Inclusing BUSWAY instruction.
     *
     * @returns {JSX.Element}
     */
    renderTransitStep(): JSX.Element {
        return <div class="step" onClick={(e): void => this.stepClickHandler(e)}>
            <div class="step__info">
                <h3 part="step-heading" class="step__heading">{this.stepData.travel_mode === 'TRANSIT' ? `${this.translationsData.rideTheBus}` : this.stepData?.instructions}</h3>
                {this.renderToggleButton()}
            </div>
            {this.renderTravelMode()}
            <div part="step-description" class="step__description">
                {this.stepData?.transit_information?.line?.short_name ?
                    <span class="step__short-name" style={{
                        backgroundColor: this.stepData?.transit_information?.line?.color ? this.stepData?.transit_information?.line?.color : null,
                        color: this.stepData?.transit_information?.line?.text_color ? this.stepData?.transit_information?.line?.text_color : null
                    }}>
                        {this.stepData?.transit_information?.line?.short_name}
                    </span> :
                    null
                }
                {this.stepData?.transit_information?.headsign ? this.stepData?.transit_information?.headsign : null}<br />
                <span part="step-info" class="step__distance-duration">
                    <mi-time
                        seconds={this.stepData?.duration?.value}
                        translations={`{"days":"${this.translationsData.days}","hours":"${this.translationsData.hours}","minutes":"${this.translationsData.minutes}"}`}>
                    </mi-time>
                    &nbsp;&middot;&nbsp;
                    {this.stepData?.transit_information?.num_stops ? this.stepData?.transit_information?.num_stops : null} {this.translationsData.stops ? this.translationsData.stops : null}
                </span>
            </div>
            {this.showSubsteps()}
        </div>;
    }
}

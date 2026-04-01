import { Component, ComponentInterface, Event, EventEmitter, h, Method, Prop, State, Watch } from '@stencil/core';
import { JSX } from '@stencil/core/internal';
import { DirectionsTranslations } from '../../types/directions-translations.interface';
import { Step, StepContext } from '../../types/step.interface';

@Component({
    tag: 'mi-route-instructions-step-header',
    styleUrl: 'route-instructions-step-header.scss',
    scoped: true,
    shadow: false
})
export class RouteInstructionsStepHeader implements ComponentInterface {
    @Prop() step: string;

    @Watch('step')
    parseStepProp(): void {
        if (this.step) {
            this.stepData = JSON.parse(this.step);
        }
    }

    @State() stepData: Step;

    @Prop() fromRouteContext: string = '';

    @Prop() fromTravelMode: string;

    @Prop() fromTransitStop: string;

    @Prop() showToggleButton: boolean = true;

    @Prop() translations: string;

    @Watch('translations')
    parseTranslationsProp(): void {
        if (this.translations) {
            this.translationsData = JSON.parse(this.translations);
        }
    }

    @State() translationsData: DirectionsTranslations;

    @State() substepsAreOpen: boolean = false;

    @Event() substepsToggled: EventEmitter<void>;

    @Method()
    async openSubsteps(): Promise<void> {
        this.substepsAreOpen = true;
    }

    @Method()
    async closeSubsteps(): Promise<void> {
        this.substepsAreOpen = false;
    }

    componentWillLoad(): void {
        this.parseStepProp();
        this.parseTranslationsProp();
    }

    toggleSubsteps(): void {
        this.substepsToggled.emit();
        this.substepsAreOpen = !this.substepsAreOpen;
    }

    renderToggleButton(): JSX.Element {
        if (this.stepData?.steps?.length <= 0 || !this.showToggleButton) {
            return null;
        }

        const toggleIcon = this.substepsAreOpen ? 'chevron-down' : 'chevron-up';

        return (
            <span class='step-header__toggle' onClick={(): void => this.toggleSubsteps()}>
                <mi-icon
                    part="step-toggle"
                    icon-name={toggleIcon}>
                </mi-icon>
            </span>
        );
    }

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

    getStepHeading(): string {
        const defaultHeadings = {
            'driving': this.translationsData.drive,
            'walking': this.translationsData.walk,
            'bicycling': this.translationsData.bike,
        };

        return this.stepData.steps?.[0]?.instructions ?
            this.stepData.steps[0].instructions :
            defaultHeadings[this.stepData.travel_mode.toLowerCase()];
    }

    getHeading(): string {
        if (!this.stepData || !this.translationsData) {
            return '';
        }

        if (this.stepData.travel_mode?.toUpperCase() === 'TRANSIT') {
            return this.translationsData.rideTheBus;
        }

        if (this.stepData.travel_mode?.toUpperCase() !== 'WALKING') {
            return this.getStepHeading();
        }

        if (this.stepData.parking === true) {
            return `${this.translationsData.park} ${this.stepData.label ? ` ${this.translationsData.at} ` + this.stepData.label : ''}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'STEPS') {
            return `${this.translationsData.takeStaircaseToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'LADDER') {
            return `${this.translationsData.takeLadderToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'ESCALATOR') {
            return `${this.translationsData.takeEscalatorToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'WHEELCHAIRRAMP') {
            return `${this.translationsData.takeWheelchairRampToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'WHEELCHAIRLIFT') {
            return `${this.translationsData.takeWheelchairLiftToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.stepData.highway && this.stepData.highway.toUpperCase() === 'ELEVATOR') {
            return `${this.translationsData.takeElevatorToLevel} ${this.stepData.end_location.floor_name}`;
        } else if (this.fromRouteContext === 'InsideBuilding' && this.stepData.route_context === 'Outside') {
            return this.addStepContextNameToHeading(this.translationsData.exit, this.stepData.start_context);
        } else if (this.fromRouteContext === 'InsideBuilding' && this.stepData.route_context === 'InsideBuilding') {
            return this.getStepHeading();
        } else if (this.fromRouteContext === 'Outside' && this.stepData.route_context === 'Outside' && this.fromTravelMode?.toUpperCase() === 'TRANSIT') {
            return this.fromTransitStop;
        } else if (this.fromRouteContext === 'Outside' && this.stepData.route_context === 'Outside') {
            return this.getStepHeading();
        } else if (this.fromRouteContext === 'Outside' && this.stepData.route_context === 'InsideBuilding') {
            return this.addStepContextNameToHeading(this.translationsData.enter, this.stepData.end_context);
        }

        return this.fromRouteContext === 'InsideBuilding' ? 'Inside Building' : this.fromRouteContext;
    }

    render(): JSX.Element {
        if (!this.stepData || !this.translationsData) {
            return null;
        }

        return <div class="step-header__info">
            <div part="step-heading" class="step-header__heading">{this.getHeading()}</div>
            {this.renderToggleButton()}
        </div>;
    }
}

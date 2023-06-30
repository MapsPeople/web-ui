import { Component, Host, JSX, Prop, h, Event, EventEmitter, State } from '@stencil/core';
import { UAParser } from 'ua-parser-js';
import merge from 'deepmerge';
import midtColors from '@mapsindoors/midt/tokens/color.json';
import midtOpacity from '@mapsindoors/midt/tokens/opacity.json';

enum PositionStateTypes {
    POSITION_UNKNOWN = 'POSITION_UNKNOWN',
    POSITION_REQUESTING = 'POSITION_REQUESTING',
    POSITION_INACCURATE = 'POSITION_INACCURATE',
    POSITION_KNOWN = 'POSITION_KNOWN',
    POSITION_CENTERED = 'POSITION_CENTERED',
    POSITION_TRACKED = 'POSITION_TRACKED',
    POSITION_UNTRACKED = 'POSITION_UNTRACKED'
}

enum DeviceType {
    Phone = 'mobile',
    Tablet = 'tablet'
}

@Component({
    tag: 'mi-my-position',
    styleUrl: 'my-position.scss',
    shadow: true,
})
export class MyPositionComponent {
    @Event({ eventName: 'position_error' }) position_error: EventEmitter<object>;
    @Event({ eventName: 'position_received' }) position_received: EventEmitter<object>;

    @Prop() mapsindoors;
    @Prop() myPositionOptions?;

    /**
     * The current state of device positioning.
     */
    @State() positionState: PositionStateTypes;

    private mapView;
    private options;
    private compassButton: HTMLButtonElement;

    /**
     * Wether the MyPositionComponent is a Web Componenet or not.
     */
    private readonly isWebComponent: boolean = true;

    /**
     * The current position of the device if received ({@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition GeolocationPosition}).
     */
    private currentPosition: GeolocationPosition;

    /**
     * Wether the currently known position is accurate enough to show on the map.
     */
    private positionIsAccurate: boolean;

    /**
     * Wether the currently used device's position can be tracked.
     */
    private canBeTracked: boolean;

    /**
     * The device orientation/rotation.
     */
    private orientation: number;

    /**
     * Removes the event listener for the device's orientation and resets the position button.
     */
    private resetPositionState(): void {
        window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
        if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
            this.setPositionState(PositionStateTypes.POSITION_UNTRACKED);
        } else if (this.positionState === PositionStateTypes.POSITION_CENTERED) {
            this.setPositionState(PositionStateTypes.POSITION_KNOWN);
            this.mapView.tilt(0);
        }
    }

    /**
     * Returns if position is known and accurate.
     *
     * @returns {boolean}
     */
    private hasValidPosition(): boolean {
        return [PositionStateTypes.POSITION_KNOWN, PositionStateTypes.POSITION_CENTERED, PositionStateTypes.POSITION_INACCURATE, PositionStateTypes.POSITION_TRACKED, PositionStateTypes.POSITION_UNTRACKED].includes(this.positionState);
    }

    /**
     * Sets position to unknown and emits error about it.
     *
     * @param {object} error
     */
    private setPositionUnknown(error: object): void {
        this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
        this.position_error.emit(error);
    }

    /**
     * Sets the PositionControl as PositionProvider on the MapView.
     */
    private setPositionProviderOnMapView(): void {
        if (this.mapView.isReady) {
            this.mapView.setPositionProvider(this);
        } else {
            this.mapView.once('ready', () => {
                this.mapView.setPositionProvider(this);
            });
        }
    }

    /**
     * Pan map to center on the current position.
     */
    private panToCurrentPosition(): void {
        if (!this.hasValidPosition()) {
            return;
        }

        // Whenever the map viewport changes again, set position state from centered to known.
        // The outer event listener catches idle caused by the panTo.
        // The inner event listeners catch any subsequent viewport changes caused by user interactions.
        this.mapView.once('idle', () => {
            this.mapView.on('user_interaction', () => this.resetPositionState());
        });

        this.mapView.panTo({ lat: this.currentPosition.coords.latitude, lng: this.currentPosition.coords.longitude });

        if (this.positionState !== PositionStateTypes.POSITION_TRACKED) {
            this.setPositionState(PositionStateTypes.POSITION_CENTERED);
        }

        if (!this.canBeTracked) return;

        if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
            window.addEventListener('deviceorientation', this.handleDeviceOrientation);
        } else {
            window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
        }
    }

    /**
     * Rotates and tilts the map.
     *
     * @param {any} e
     */
    private handleDeviceOrientation(e: any): void {
        if (!this.orientation || this.orientation - (360 - e.alpha) > 1 || this.orientation - (360 - e.alpha) < -1) {
            this.orientation = 360 - e.alpha;
            this.mapView.easeTo({
                center: [this.currentPosition.coords.longitude, this.currentPosition.coords.latitude],
                rotation: this.orientation,
                tilt: 60,
                easing: (t: number) => t * (2 - t)
            });
        }
    }

    /**
     * Rotates the compass button using the transform CSS property.
     *
     * @param {number} bearing
     */
    private setBearingState(bearing: number): void {
        this.compassButton.style.transform = `rotate(${bearing}deg)`;
    }

    /**
     * Request for current position, emit events and show position on map based on result.
     *
     * @param {boolean} [selfInvoked=false] - Used to track if call was invoked by clicking on position control or not.
     */
    private watchPosition(selfInvoked = false): void {
        if (!navigator.geolocation) {
            return;
        }

        this.setPositionState(PositionStateTypes.POSITION_REQUESTING);

        this.setPositionProviderOnMapView();

        const requestTime = Date.now();

        navigator.geolocation.watchPosition(
            position => {
                // If position is the same as before, don't set or emit
                if (
                    this.currentPosition
                    && position.coords.accuracy === this.currentPosition.coords.accuracy
                    && position.coords.latitude === this.currentPosition.coords.latitude
                    && position.coords.longitude === this.currentPosition.coords.longitude
                ) {
                    return;
                }

                this.currentPosition = position;

                this.positionIsAccurate = this.currentPosition.coords.accuracy <= this.options.maxAccuracy;

                if (!this.positionIsAccurate) {
                    this.setPositionState(PositionStateTypes.POSITION_INACCURATE);
                    this.position_error.emit({ code: 11, message: 'Inaccurate position: ' + position.coords.accuracy });
                } else {
                    if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
                        this.setPositionState(PositionStateTypes.POSITION_UNTRACKED);
                    }
                    this.setPositionState(PositionStateTypes.POSITION_KNOWN);
                    window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
                    this.mapView.tilt(0);
                }

                this.position_received.emit({
                    position: this.currentPosition,
                    selfInvoked,
                    accurate: this.positionIsAccurate
                });
            },
            error => {
                // Firefox may throw both success and a timeout error (https://bugzilla.mozilla.org/show_bug.cgi?id=1283563).
                // We mitigate this by not passing on error if a correct position has been given since asking for it.
                if (error.code !== 3 || !this.currentPosition || this.currentPosition.timestamp <= requestTime) {
                    this.setPositionUnknown(error);
                }
            },
            this.options.positionOptions
        );
    }
    /**
     * Sets position button state.
     *
     * @param {PositionStateTypes} state
     */
    private setPositionState(state: PositionStateTypes): void {
        this.positionState = state;
    }

    /**
     * Helper function to retreive nested value from object.
     *
     * @param {Array} pathArray - Array of nested properties, eg. ['user', 'name'] for object { user: { name: 'Peter' } }.
     * @param {object} obj - Object to get value from.
     * @returns {any}
     */
    private getNestedValue(pathArray: Array<any>, obj: object): any {
        return pathArray.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj);
    }

    /**
     * Handle click on the compass button.
     */
    private onCompassButtonClicked(): void {
        this.setBearingState(0);
        this.mapView.rotate(0);
        this.mapView.tilt(0);
        window.removeEventListener('deviceorientation', this.handleDeviceOrientation);

        if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
            this.setPositionState(PositionStateTypes.POSITION_CENTERED);
        } else if (this.positionState === PositionStateTypes.POSITION_UNTRACKED) {
            this.setPositionState(PositionStateTypes.POSITION_KNOWN);
        }
    }

    /**
     * Handle click on position button.
     * Stops propagation to avoid any map click listeners to fire.
     *
     * @param {Event} event
     */
    private onPositionButtonClicked(event: Event): void {
        event.stopPropagation();
        switch (this.positionState) {
            case PositionStateTypes.POSITION_UNKNOWN:
                this.mapView.tilt(0);
                this.watchPosition(true);
                break;
            case PositionStateTypes.POSITION_KNOWN:
                this.mapView.tilt(0);
                this.panToCurrentPosition();
                break;
            case PositionStateTypes.POSITION_CENTERED:
                if (this.canBeTracked) {
                    this.setPositionState(PositionStateTypes.POSITION_TRACKED);
                }
                this.panToCurrentPosition();
                break;
            case PositionStateTypes.POSITION_TRACKED:
                this.mapView.tilt(0);
                this.mapView.rotate(0);
                this.setBearingState(0);
                this.setPositionState(PositionStateTypes.POSITION_CENTERED);
                this.panToCurrentPosition();
                break;
            case PositionStateTypes.POSITION_UNTRACKED:
                this.setPositionState(PositionStateTypes.POSITION_TRACKED);
                this.panToCurrentPosition();
                break;
        }
    }

    /**
     * Called every time the component is connected to the DOM.
     */
    connectedCallback(): void {
        if (!navigator.geolocation) {
            this.position_error.emit({ code: 10, message: 'Geolocation not available' });
            return;
        }

        this.mapView = this.mapsindoors.getMapView();
        this.options = merge({
            maxAccuracy: 200,
            positionOptions: {
                timeout: 30000,
                enableHighAccuracy: true,
                maximumAge: 0
            },
            positionMarkerStyles: {
                radius: '12px',
                strokeWeight: '2px',
                strokeColor: this.getNestedValue(['color', 'white', 'white', 'value'], midtColors) || 'white',
                fillColor: this.getNestedValue(['color', 'blue', '60', 'value'], midtColors) || '#4169E1',
                fillOpacity: 1
            },
            accuracyCircleStyles: {
                fillColor: this.getNestedValue(['color', 'blue', '60', 'value'], midtColors) || '#4169E1',
                fillOpacity: this.getNestedValue(['opacity', 'small', 'value'], midtOpacity) || 0.16
            }
        }, this.myPositionOptions ?? {});

        // Check if user has already granted permission to use the position.
        // In that case, show position right away.
        // Note that this feature only works in modern browsers due to using the Permissions API (https://caniuse.com/#feat=permissions-api),
        if ('permissions' in navigator === false || 'query' in navigator.permissions === false) {
            this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
        } else {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'granted') {
                    this.watchPosition();
                } else {
                    this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
                }
            });
        }

        this.mapView.on('rotateend', () => {
            this.setBearingState(this.mapView.getBearing());
        });

        const parser = new UAParser();
        const deviceType: DeviceType = parser.getDevice();
        this.canBeTracked = (
            typeof window.DeviceOrientationEvent === 'function' &&
            (deviceType === DeviceType.Phone || deviceType === DeviceType.Tablet) &&
            this.mapView.getRotatable() &&
            this.mapView.getTiltable())
            ? true : false;

    }

    /**
     * Renders the floor selector.
     *
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return (
            <Host>
                <div class='mi-my-position'>
                    <button
                        class={`mi-my-position__position-button 
                            ${this.positionState === PositionStateTypes.POSITION_UNKNOWN || this.positionState === PositionStateTypes.POSITION_INACCURATE ? 'mi-my-position__position-button--unknown' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_REQUESTING ? 'mi-my-position__position-button--requesting' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_KNOWN ? 'mi-my-position__position-button--known' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_CENTERED ? 'mi-my-position__position-button--centered' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_TRACKED ? 'mi-my-position__position-button--tracked' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_UNTRACKED ? 'mi-my-position__position-button--untracked' : ''}`}
                        onClick={(event): void => this.onPositionButtonClicked(event)}></button>
                    <button
                        ref={(el): HTMLButtonElement => this.compassButton = el as HTMLButtonElement}
                        class={'mi-my-position__compass-button'}
                        onClick={(): void => this.onCompassButtonClicked()}></button>
                </div>
            </Host>
        );
    }
}
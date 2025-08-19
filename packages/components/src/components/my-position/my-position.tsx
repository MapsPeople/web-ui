import { Component, Host, JSX, Prop, Event, EventEmitter, State, h, Method } from '@stencil/core';
import { UAParser, IDevice } from 'ua-parser-js';
import merge from 'deepmerge';
import { GeoLocationProvider as PositionProvider } from './GeoLocationProvider';

enum PositionStateTypes {
    POSITION_UNKNOWN = 'POSITION_UNKNOWN',
    POSITION_REQUESTING = 'POSITION_REQUESTING',
    POSITION_INACCURATE = 'POSITION_INACCURATE',
    POSITION_KNOWN = 'POSITION_KNOWN',
    POSITION_CENTERED = 'POSITION_CENTERED',
    POSITION_TRACKED = 'POSITION_TRACKED',
    POSITION_UNTRACKED = 'POSITION_UNTRACKED'
}

@Component({
    tag: 'mi-my-position',
    styleUrl: 'my-position.scss',
    shadow: false
})
export class MyPositionComponent {
    @Event({ eventName: 'position_error' }) position_error: EventEmitter<object>;
    @Event({ eventName: 'position_received' }) position_received: EventEmitter<object>;

    /**
     * MapsIndoors instance.
     */
    @Prop() mapsindoors;

    /**
     * Reference: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/PositionControlOptions.html.
     */
    @Prop() myPositionOptions?;

    /**
     * The current state of device positioning.
     */
    @State() positionState: PositionStateTypes;

    private mapView;
    private options;
    private compassButton: HTMLButtonElement;

    /**
     * New UAParser instance.
     */
    private parser = new UAParser();

    /**
     * The current position of the device if received.
     * We use the format for GeoLocationPosition ({@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition GeolocationPosition}).
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
     * Reference to the handleDeviceOrientation function.
     */
    private handleDeviceOrientationReference = this.handleDeviceOrientation.bind(this);

    /**
     * Default options.
     */
    private defaultOptions = {
        maxAccuracy: 200,
        positionOptions: {
            timeout: 30000,
            enableHighAccuracy: true,
            maximumAge: 0
        },
        positionMarkerStyles: {
            radius: '12px',
            strokeWeight: '2px',
            strokeColor: 'white',
            fillColor: '#4169E1',
            fillOpacity: 1
        },
        accuracyCircleStyles: {
            fillColor: '#4169E1',
            fillOpacity: 0.16
        }
    };

    /**
     * Removes the event listener for the device's orientation and resets the position button.
     */
    private resetPositionState(): void {
        window.removeEventListener('deviceorientation', this.handleDeviceOrientationReference);
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

        if ((DeviceOrientationEvent as any).requestPermission) {
            (DeviceOrientationEvent as any).requestPermission()
                .then(permissionStatus => {
                    if (permissionStatus === 'granted' && this.positionState === PositionStateTypes.POSITION_TRACKED) {
                        window.addEventListener('deviceorientation', this.handleDeviceOrientationReference);
                    } else {
                        window.removeEventListener('deviceorientation', this.handleDeviceOrientationReference);
                    }
                });
        } else {
            if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
                window.addEventListener('deviceorientation', this.handleDeviceOrientationReference);
            } else {
                window.removeEventListener('deviceorientation', this.handleDeviceOrientationReference);
            }
        }
    }

    /**
     * Rotates and tilts the map.
     *
     * @param {DeviceOrientationEvent} e
     */
    private handleDeviceOrientation(e: DeviceOrientationEvent): void {
        // Only rotate the map if:
        // 1. No rotation has been applied before.
        // 2. The new rotation would differ by more than on degree from the current rotation
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
    private setCompassStyle(bearing: number): void {
        this.compassButton.style.transform = `rotate(${bearing}deg)`;
    }

    /**
     * Method for requesting the current position, emitting events and showing position on map based on result.
     *
     * @param {boolean} [selfInvoked=false] - Used to track if call was invoked by clicking on position control or not.
     */
    @Method()
    public watchPosition(selfInvoked = false): void {
        this.setPositionProviderOnMapView();

        PositionProvider.listenForPosition(
            this.options.maxAccuracy,

            // Position error callback
            error => {
                this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
                this.position_error.emit(error);
            },

            // Position inaccurate callback
            accuracy => {
                this.setPositionState(PositionStateTypes.POSITION_INACCURATE);
                this.position_error.emit({ code: 11, message: 'Inaccurate position: ' + accuracy });
            },

            // Position requesting callback
            () => {
                this.setPositionState(PositionStateTypes.POSITION_REQUESTING);
            },

            // Position received callback
            position => {
                this.currentPosition = position;
                this.positionIsAccurate = this.currentPosition.coords.accuracy <= this.options.maxAccuracy;

                if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
                    this.setPositionState(PositionStateTypes.POSITION_UNTRACKED);
                } else if (this.positionState !== PositionStateTypes.POSITION_UNTRACKED) {
                    this.setPositionState(PositionStateTypes.POSITION_KNOWN);
                }
                window.removeEventListener('deviceorientation', this.handleDeviceOrientationReference);

                this.position_received.emit({
                    position: this.currentPosition,
                    selfInvoked,
                    accurate: this.positionIsAccurate
                });
            }
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
     * Handle click on the compass button.
     */
    private onCompassButtonClicked(): void {
        this.setCompassStyle(0);
        this.mapView.rotate(0);
        this.mapView.tilt(0);
        window.removeEventListener('deviceorientation', this.handleDeviceOrientationReference);

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
                this.setCompassStyle(0);
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
     * Called every time the component has connected to the DOM.
     * 1. Assigning the mapView and options attributes.
     * 2. Checking for the navigator's state.
     * 3. Determining whether the device can be tracked.
     * 4. Asking for permission to track the device.
     * 5. Styling the compass button.
     */
    connectedCallback(): void {
        this.mapView = this.mapsindoors.getMapView();
        this.options = merge(this.defaultOptions, this.myPositionOptions ?? {});

        if (PositionProvider.isAvailable() === false) {
            this.position_error.emit({ code: 10, message: 'Location not available' });
            return;
        }

        const deviceType: IDevice['type'] = this.parser.getDevice().type;
        this.canBeTracked = (
            typeof window.DeviceOrientationEvent === 'function' &&
            (deviceType === UAParser.DEVICE.MOBILE || deviceType === UAParser.DEVICE.TABLET) &&
            this.mapView.rotatable &&
            this.mapView.tiltable)
            ? true : false;

        // Check if user has already granted permission to use the position.
        // In that case, show position right away.
        // Note that this feature only works in modern browsers due to using the Permissions API (https://caniuse.com/#feat=permissions-api),
        PositionProvider.isAlreadyGranted().then(granted => {
            if (granted) {
                this.watchPosition();
            } else {
                this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
            }
        });

        this.mapView.on('rotateend', () => {
            this.setCompassStyle(this.mapView.getBearing());
        });
    }

    componentDidRender(): void {
        this.setCompassStyle(this.mapView.getBearing());
    }

    /**
     * Stops listening for position updates.
     */
    disconnectedCallback(): void {
        PositionProvider.stopListeningForPosition();
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
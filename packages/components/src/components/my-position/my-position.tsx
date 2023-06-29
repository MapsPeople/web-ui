import { Component, Host, JSX, Prop, h, Event, EventEmitter, State } from '@stencil/core';
import merge from 'deepmerge';
import midtColors from '@mapsindoors/midt/tokens/color.json';
import midtOpacity from '@mapsindoors/midt/tokens/opacity.json';

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

    private map;
    private options;
    private canBeTracked: boolean;
    private orientation: number;
    private compassButton: HTMLButtonElement;
    private readonly isWebComponent: boolean = true;

    /**
     * The current state of device positioning. One of {@link PositionState}.
     */
    @State() positionState;

    /**
     * The current position of the device if received ({@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition GeolocationPosition}).
     */
    private currentPosition: GeolocationPosition;

    /**
     * Wether the currently known position is accurate enough to show on the map.
     */
    private positionIsAccurate: boolean;

    private PositionStateTypes = Object.freeze({
        POSITION_UNKNOWN: 'POSITION_UNKNOWN',
        POSITION_REQUESTING: 'POSITION_REQUESTING',
        POSITION_INACCURATE: 'POSITION_INACCURATE',
        POSITION_KNOWN: 'POSITION_KNOWN',
        POSITION_CENTERED: 'POSITION_CENTERED',
        POSITION_TRACKED: 'POSITION_TRACKED',
        POSITION_UNTRACKED: 'POSITION_UNTRACKED'
    });

    /**
     * Removes the event listener for the device's orientation and resets the position button.
     */
    private resetPositionState(): void {
        window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
        if (this.positionState === this.PositionStateTypes.POSITION_TRACKED) {
            this.setPositionState(this.PositionStateTypes.POSITION_UNTRACKED);
        } else if (this.positionState === this.PositionStateTypes.POSITION_CENTERED) {
            this.setPositionState(this.PositionStateTypes.POSITION_KNOWN);
            this.map.tilt(0);
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
        this.map.once('idle', () => {
            this.map.on('user_interaction', () => this.resetPositionState());
        });

        this.map.panTo({ lat: this.currentPosition.coords.latitude, lng: this.currentPosition.coords.longitude });

        if (this.positionState !== this.PositionStateTypes.POSITION_TRACKED) {
            this.setPositionState(this.PositionStateTypes.POSITION_CENTERED);
        }

        if (!this.canBeTracked) return;

        if (this.positionState === this.PositionStateTypes.POSITION_TRACKED) {
            window.addEventListener('deviceorientation', this.handleDeviceOrientation);
        } else {
            window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
        }
    }

    private positionButtonClicked(event): void {
        event.stopPropagation();
        switch (this.positionState) {
            case this.PositionStateTypes.POSITION_UNKNOWN:
                this.map.tilt(0);
                this.watchPosition(true);
                break;
            case this.PositionStateTypes.POSITION_KNOWN:
                this.map.tilt(0);
                this.panToCurrentPosition();
                break;
            case this.PositionStateTypes.POSITION_CENTERED:
                if (this.canBeTracked) {
                    this.setPositionState(this.PositionStateTypes.POSITION_TRACKED);
                }
                this.panToCurrentPosition();
                break;
            case this.PositionStateTypes.POSITION_TRACKED:
                this.map.tilt(0);
                this.map.rotate(0);
                this.setBearingState(0);
                this.setPositionState(this.PositionStateTypes.POSITION_CENTERED);
                this.panToCurrentPosition();
                break;
            case this.PositionStateTypes.POSITION_UNTRACKED:
                this.setPositionState(this.PositionStateTypes.POSITION_TRACKED);
                this.panToCurrentPosition();
                break;
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

    private compassButtonClicked(): void {
        console.log('compassButtonClicked');
    }

    /**
     * Returns if position is known and accurate.
     *
     * @returns {boolean}
     */
    private hasValidPosition(): boolean {
        return [this.PositionStateTypes.POSITION_KNOWN, this.PositionStateTypes.POSITION_CENTERED, this.PositionStateTypes.POSITION_INACCURATE, this.PositionStateTypes.POSITION_TRACKED, this.PositionStateTypes.POSITION_UNTRACKED].includes(this.positionState);
    }

    /**
     * Sets the PositionControl as PositionProvider on the MapView.
     */
    private setPositionProviderOnMapView(): void {
        if (this.map.isReady) {
            this.map.setPositionProvider(this);
        } else {
            this.map.once('ready', () => {
                this.map.setPositionProvider(this);
            });
        }
    }

    private setPositionState(state: string): void {
        this.positionState = state;
    }

    /**
     * Sets position to unknown and emits error about it.
     *
     * @param {object} error
     */
    private setPositionUnknown(error: object): void {
        this.setPositionState(this.PositionStateTypes.POSITION_UNKNOWN);
        this.position_error.emit(error);
    }

    private handleDeviceOrientation(e): void {
        if (!this.orientation || this.orientation - (360 - e.alpha) > 1 || orientation - (360 - e.alpha) < -1) {
            this.orientation = 360 - e.alpha;
            this.map.easeTo({
                center: [this.currentPosition.coords.longitude, this.currentPosition.coords.latitude],
                rotation: this.orientation,
                tilt: 60,
                easing: t => t * (2 - t)
            });
        }
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

        this.setPositionState(this.PositionStateTypes.POSITION_REQUESTING);

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
                    this.setPositionState(this.PositionStateTypes.POSITION_INACCURATE);
                    this.position_error.emit({ code: 11, message: 'Inaccurate position: ' + position.coords.accuracy });
                } else {
                    if (this.positionState === this.PositionStateTypes.POSITION_TRACKED) {
                        this.setPositionState(this.PositionStateTypes.POSITION_UNTRACKED);
                    }
                    this.setPositionState(this.PositionStateTypes.POSITION_KNOWN);
                    window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
                    this.map.tilt(0);
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

    private getNestedValue(pathArray, obj) {
        return pathArray.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj);
    }

    /**
     * Called every time the component is connected to the DOM.
     */
    connectedCallback(): void {
        if (!navigator.geolocation) {
            this.position_error.emit({ code: 10, message: 'Geolocation not available' });
            return;
        }

        this.map = this.mapsindoors.getMapView();
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

        // TODO isTrackableDevice
        const isTrackableDevice = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Tablet|iPad/i.test(navigator.userAgent);
        this.canBeTracked = (
            typeof window.DeviceOrientationEvent === 'function' &&
            isTrackableDevice &&
            this.map.getRotatable() &&
            this.map.getTiltable())
            ? true : false;

        // Check if user has already granted permission to use the position.
        // In that case, show position right away.
        // Note that this feature only works in modern browsers due to using the Permissions API (https://caniuse.com/#feat=permissions-api),
        if ('permissions' in navigator === false || 'query' in navigator.permissions === false) {
            this.setPositionState(this.PositionStateTypes.POSITION_UNKNOWN);
        } else {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'granted') {
                    this.watchPosition();
                } else {
                    this.setPositionState(this.PositionStateTypes.POSITION_UNKNOWN);
                }
            });
        }
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
                            ${this.positionState === this.PositionStateTypes.POSITION_UNKNOWN || this.positionState === this.PositionStateTypes.POSITION_INACCURATE ? 'mi-my-position__position-button--unknown' : ''}
                            ${this.positionState === this.PositionStateTypes.POSITION_REQUESTING ? 'mi-my-position__position-button--requesting' : ''}
                            ${this.positionState === this.PositionStateTypes.POSITION_KNOWN ? 'mi-my-position__position-button--known' : ''}
                            ${this.positionState === this.PositionStateTypes.POSITION_CENTERED ? 'mi-my-position__position-button--centered' : ''}
                            ${this.positionState === this.PositionStateTypes.POSITION_TRACKED ? 'mi-my-position__position-button--tracked' : ''}
                            ${this.positionState === this.PositionStateTypes.POSITION_UNTRACKED ? 'mi-my-position__position-button--untracked' : ''}`}
                        onClick={(event): void => this.positionButtonClicked(event)}></button>
                    <button
                        ref={(el): HTMLButtonElement => this.compassButton = el as HTMLButtonElement}
                        class={'mi-my-position__compass-button'}
                        onClick={(): void => this.compassButtonClicked()}></button>
                </div>
            </Host>
        );
    }
}
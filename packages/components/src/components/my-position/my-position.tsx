import { Component, Host, JSX, Prop, Event, EventEmitter, State, h, Method } from '@stencil/core';
import { UAParser, IDevice } from 'ua-parser-js';
import merge from 'deepmerge';
import { GeoLocationProvider as PositionProvider } from './GeoLocationProvider';
import { IPositionProvider, MapsIndoorsPosition } from '../../types/position-provider.interface';
import { VenueBuilding } from '../../types/venue-building.interface';

enum PositionStateTypes {
    POSITION_UNKNOWN = 'POSITION_UNKNOWN',
    POSITION_REQUESTING = 'POSITION_REQUESTING',
    POSITION_INACCURATE = 'POSITION_INACCURATE',
    POSITION_KNOWN = 'POSITION_KNOWN',
    POSITION_CENTERED = 'POSITION_CENTERED',
    POSITION_TRACKED = 'POSITION_TRACKED',
    POSITION_UNTRACKED = 'POSITION_UNTRACKED',
    POSITION_FOLLOW = 'POSITION_FOLLOW'
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
     * Accepts a custom position provider instance (supports both legacy and modern interfaces).
     * This is the external API - what users pass to the component.
     * It's optional and may be undefined or invalid.
     */
    @Prop() customPositionProvider?: IPositionProvider;

    /**
     * The current state of device positioning.
     * Default is 'POSITION_UNKNOWN'.
     */
    @State() positionState: PositionStateTypes = PositionStateTypes.POSITION_UNKNOWN;

    private mapView;
    private options;
    private compassButton: HTMLButtonElement;

    /**
     * New UAParser instance.
     */
    private parser = new UAParser();

    /**
     * The current position of the device if received.
     * We use the format for MapsIndoorsPosition which extends GeolocationPosition with floorIndex support.
     */
    private currentPosition: MapsIndoorsPosition;

    /**
     * Whether the currently known position is accurate enough to show on the map.
     */
    private positionIsAccurate: boolean;

    /**
     * Whether the currently used device's position can be tracked.
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
     * Cached current building for validation.
     * Cached to avoid repeated lookups on every position update.
     */
    private cachedBuilding: VenueBuilding | null = null;

    /**
     * Reference to the modern provider's onPositionReceived event handler.
     * Stored to enable proper cleanup when component disconnects or provider changes.
     */
    private onPositionReceivedHandler: ((event: { position: MapsIndoorsPosition }) => void) | null = null;

    /**
     * Reference to the modern provider's onPositionError event handler.
     * Stored to enable proper cleanup when component disconnects or provider changes.
     */
    private onPositionErrorHandler: ((error?: any) => void) | null = null;

    /**
     * The position provider instance to use internally.
     * This is the resolved, validated provider that the component actually uses.
     * It's either the customPositionProvider (if valid) or the default GeoLocationProvider.
     * All internal methods use this instead of customPositionProvider to ensure consistency.
     */
    private positionProvider: IPositionProvider;

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
     * Cleans up modern position provider event listeners.
     * Removes registered event handlers and nulls the stored references to prevent memory leaks.
     */
    private cleanupModernProviderListeners(): void {
        if (!this.isModernProvider(this.positionProvider)) {
            return;
        }

        const modernProvider = this.positionProvider;

        // Remove event listeners if they exist
        if (this.onPositionReceivedHandler) {
            modernProvider.off('position_received', this.onPositionReceivedHandler);
            this.onPositionReceivedHandler = null;
        }

        if (this.onPositionErrorHandler) {
            modernProvider.off('position_error', this.onPositionErrorHandler);
            this.onPositionErrorHandler = null;
        }
    }

    /**
     * Sets up event listeners for modern position providers.
     * This ensures that position updates are handled immediately when setPosition() is called.
     *
     * Note: We use this.positionProvider (not this.customPositionProvider) because:
     * - this.positionProvider is the resolved, validated provider
     * - It's guaranteed to exist and be valid
     * - It handles both custom and default providers consistently
     * - All other methods in the component use this.positionProvider for consistency.
     */
    private setupModernProviderListeners(): void {
        if (!this.isModernProvider(this.positionProvider)) {
            return;
        }

        // Clean up any existing listeners first
        this.cleanupModernProviderListeners();

        const modernProvider = this.positionProvider;

        // Create and store event handler references
        this.onPositionReceivedHandler = ({ position }: { position: MapsIndoorsPosition }): void => {
            this.currentPosition = position;
            this.positionIsAccurate = position.coords.accuracy <= this.options.maxAccuracy;

            // Ensure the position provider is set on the MapView so the dot appears
            this.setPositionProviderOnMapView();

            // Handle FOLLOW mode - automatically pan and change floors
            if (this.positionState === PositionStateTypes.POSITION_FOLLOW) {
                this.handleFollowModePosition(position);
                // Stay in FOLLOW state, don't transition
            } else if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
                this.setPositionState(PositionStateTypes.POSITION_UNTRACKED);
            } else if (this.positionState !== PositionStateTypes.POSITION_UNTRACKED) {
                this.setPositionState(PositionStateTypes.POSITION_KNOWN);
            }
            window.removeEventListener('deviceorientation', this.handleDeviceOrientationReference);

            this.position_received.emit({
                position: this.currentPosition,
                selfInvoked: false,
                accurate: this.positionIsAccurate
            });
        };

        this.onPositionErrorHandler = (error?: any): void => {
            this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
            this.position_error.emit(error);
        };

        // Register the event listeners
        modernProvider.on('position_received', this.onPositionReceivedHandler);
        modernProvider.on('position_error', this.onPositionErrorHandler);
    }

    /**
     * Sets a custom position. Works with any provider that implements setPosition.
     * Uses this.positionProvider (the resolved provider) instead of this.customPositionProvider
     * to ensure we're working with the validated, active provider.
     */
    @Method()
    public async setPosition(position: MapsIndoorsPosition): Promise<void> {
        if (this.positionProvider?.setPosition) {
            this.positionProvider.setPosition(position);
        }
    }

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
        // Don't reset FOLLOW state - it should persist until user clicks to exit
    }

    /**
     * Returns if position is known and accurate.
     *
     * @returns {boolean}
     */
    private hasValidPosition(): boolean {
        return [PositionStateTypes.POSITION_KNOWN, PositionStateTypes.POSITION_CENTERED, PositionStateTypes.POSITION_INACCURATE, PositionStateTypes.POSITION_TRACKED, PositionStateTypes.POSITION_UNTRACKED, PositionStateTypes.POSITION_FOLLOW].includes(this.positionState);
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

        if (this.positionState !== PositionStateTypes.POSITION_TRACKED && this.positionState !== PositionStateTypes.POSITION_FOLLOW) {
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
     * Handles position updates in FOLLOW mode.
     * Automatically pans the map and changes floors without user interaction listeners.
     * Device orientation is handled by the existing handleDeviceOrientation method.
     */
    private handleFollowModePosition(position: MapsIndoorsPosition): void {
        if (!this.hasValidPosition()) {
            return;
        }

        // Pan to new position - device orientation will be handled by handleDeviceOrientation
        this.mapView.panTo({ lat: position.coords.latitude, lng: position.coords.longitude });

        // Check for floor changes if floorIndex is provided
        if (position.floorIndex !== undefined && position.floorIndex !== null && this.mapsindoors) {
            const currentFloor = this.mapsindoors.getFloor();
            const newFloor = position.floorIndex.toString();

            // Only change floor if it's different and valid for the current building
            if (newFloor !== currentFloor && this.isValidFloorForCurrentBuilding(newFloor)) {
                this.mapsindoors.setFloor(newFloor);
            }
        }
    }

    /**
     * Validates if a floor index exists in the current building.
     * Checks the current building's floors to ensure the floor index is valid.
     * Uses caching to avoid repeated lookups on every position update.
     *
     * @param {string} floorIndex - The floor index to validate.
     * @returns {boolean} - True if the floor exists in the current building.
     */
    private isValidFloorForCurrentBuilding(floorIndex: string): boolean {
        if (!this.mapsindoors) {
            return false;
        }

        try {
            // Get the current building directly from MapsIndoors SDK
            const currentBuilding = this.mapsindoors.getBuilding();
            if (!currentBuilding || !currentBuilding.floors) {
                // Clear cache if building is invalid
                this.clearBuildingFloorsCache();
                return false;
            }

            // Verify cache is still valid by checking building ID
            // If building changed or cache is empty, refresh cache
            // This avoids repeated property access on every position update
            if (!this.cachedBuilding || this.cachedBuilding.id !== currentBuilding.id) {
                this.cachedBuilding = currentBuilding;
            }

            // Check if the floor index exists in the building's floors
            // Floors object has keys like "0", "10", "20", "30", etc. representing floorIndexes
            // Use 'in' operator which is slightly faster than hasOwnProperty for this use case
            const floorExists = floorIndex in this.cachedBuilding.floors;

            return floorExists;
        } catch (error) {
            // If there's an error getting building data, allow the floor change
            // This prevents blocking floor changes due to API issues
            // Clear cache on error
            this.clearBuildingFloorsCache();
            return true;
        }
    }

    /**
     * Clears the cached building.
     * Should be called when the building changes to ensure fresh validation.
     */
    private clearBuildingFloorsCache(): void {
        this.cachedBuilding = null;
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

        if (this.isLegacyProvider(this.positionProvider)) {
            // Use legacy callback-based interface
            this.positionProvider.listenForPosition!(
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
                    // Don't override FOLLOW state
                    if (this.positionState !== PositionStateTypes.POSITION_FOLLOW) {
                        this.setPositionState(PositionStateTypes.POSITION_REQUESTING);
                    }
                },

                // Position received callback
                position => {
                    this.currentPosition = position;
                    this.positionIsAccurate = this.currentPosition.coords.accuracy <= this.options.maxAccuracy;

                    // Don't override FOLLOW state - let the event handler manage it
                    if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
                        this.setPositionState(PositionStateTypes.POSITION_UNTRACKED);
                    } else if (this.positionState !== PositionStateTypes.POSITION_UNTRACKED && this.positionState !== PositionStateTypes.POSITION_FOLLOW) {
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
        } else {
            // Use modern event-based interface
            const modernProvider = this.positionProvider;

            // Event listeners are already set up in setupModernProviderListeners()
            // Just check if provider already has a valid position
            if (modernProvider.hasValidPosition && modernProvider.hasValidPosition()) {
                // Manually trigger the position received logic
                this.currentPosition = modernProvider.currentPosition!;
                this.positionIsAccurate = this.currentPosition.coords.accuracy <= this.options.maxAccuracy;

                // Don't override FOLLOW state - let the event handler manage it
                if (this.positionState === PositionStateTypes.POSITION_TRACKED) {
                    this.setPositionState(PositionStateTypes.POSITION_UNTRACKED);
                } else if (this.positionState !== PositionStateTypes.POSITION_UNTRACKED && this.positionState !== PositionStateTypes.POSITION_FOLLOW) {
                    this.setPositionState(PositionStateTypes.POSITION_KNOWN);
                }
                window.removeEventListener('deviceorientation', this.handleDeviceOrientationReference);

                this.position_received.emit({
                    position: this.currentPosition,
                    selfInvoked,
                    accurate: this.positionIsAccurate
                });
            } else {
                // Check if this is an empty object case vs a provider that lost position
                // If currentPosition is null, it's likely an empty object case - stay unknown
                // If currentPosition exists but is invalid, it's a provider that lost position - request position
                // Don't override FOLLOW state
                if (this.positionState !== PositionStateTypes.POSITION_FOLLOW) {
                    if (modernProvider.currentPosition === null) {
                        // Provider was never given position data (empty object case) - stay unknown
                        this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
                    } else {
                        // Provider had position data but it's now invalid - request position
                        this.setPositionState(PositionStateTypes.POSITION_REQUESTING);
                    }
                }
            }
        }
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
                // Check if we have a customPositionProvider to enable FOLLOW mode
                if (this.customPositionProvider && this.isValidPositionProvider(this.customPositionProvider)) {
                    this.setPositionState(PositionStateTypes.POSITION_FOLLOW);
                } else if (this.canBeTracked) {
                    this.setPositionState(PositionStateTypes.POSITION_TRACKED);
                }
                this.panToCurrentPosition();
                break;
            case PositionStateTypes.POSITION_FOLLOW:
                // Exit FOLLOW mode and return to KNOWN state
                this.setPositionState(PositionStateTypes.POSITION_KNOWN);
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

        // Clean up any existing position provider listeners before assigning a new one
        // Only clean up if there's an existing position provider
        if (this.positionProvider) {
            this.cleanupModernProviderListeners();
        }

        // Provider Resolution Logic:
        // 1. Check if user provided a customPositionProvider and it's valid
        // 2. If yes, use it as this.positionProvider (our internal resolved provider)
        // 3. If no, fallback to default GeoLocationProvider
        // This pattern ensures this.positionProvider is always valid and ready to use
        if (this.customPositionProvider && this.isValidPositionProvider(this.customPositionProvider)) {
            // Use the custom provider - assign it to our internal resolved provider
            this.positionProvider = this.customPositionProvider;

            // If using a modern provider with options, merge them with the component's options
            if (this.isModernProvider(this.positionProvider) && this.positionProvider.options) {
                this.options = merge(this.options, this.positionProvider.options);
            }

            // Set up event listeners for modern providers immediately
            // This ensures setPosition() calls are handled without requiring user clicks
            this.setupModernProviderListeners();
        } else {
            // Fallback to default provider
            this.positionProvider = new PositionProvider();
        }

        // Check availability based on the interface type
        const isAvailable = this.isLegacyProvider(this.positionProvider)
            ? this.positionProvider.isAvailable()
            : true; // Modern providers are always considered available

        if (isAvailable === false) {
            this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
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
        // Note that this feature only works in modern browsers due to using the Permissions API (https://caniuse.com/#feat=permissions-api),
        if (this.isLegacyProvider(this.positionProvider)) {
            this.positionProvider.isAlreadyGranted().then(granted => {
                if (granted) {
                    this.watchPosition();
                } else {
                    this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
                }
            });
        } else {
            // Modern providers: check if they have a valid position immediately
            if (this.positionProvider.hasValidPosition && this.positionProvider.hasValidPosition()) {
                this.currentPosition = this.positionProvider.currentPosition!;
                this.setPositionState(PositionStateTypes.POSITION_KNOWN);
                this.position_received.emit({
                    position: this.currentPosition,
                    selfInvoked: false,
                    accurate: true
                });
            } else {
                this.setPositionState(PositionStateTypes.POSITION_UNKNOWN);
            }
        }

        this.mapView.on('rotateend', () => {
            this.setCompassStyle(this.mapView.getBearing());
        });
    }

    /**
     * Checks if the provider is a valid position provider (either legacy or modern).
     *
     * @param {any} provider - The provider to check.
     * @returns {boolean} True if the provider is valid.
     */
    private isValidPositionProvider(provider: any): boolean {
        if (!provider) {
            return false;
        }

        // Check for legacy interface
        if (typeof provider.isAvailable === 'function' &&
            typeof provider.listenForPosition === 'function') {
            return provider.isAvailable();
        }

        // Check for modern interface
        if (typeof provider.hasValidPosition === 'function' &&
            typeof provider.on === 'function' &&
            typeof provider.off === 'function') {
            return true;
        }

        return false;
    }

    /**
     * Checks if the provider uses the legacy callback-based interface.
     *
     * @param {IPositionProvider} provider - The provider to check.
     * @returns {boolean} True if the provider uses the legacy interface.
     */
    private isLegacyProvider(provider: IPositionProvider): boolean {
        return provider &&
            typeof provider.isAvailable === 'function' &&
            typeof provider.listenForPosition === 'function';
    }

    /**
     * Checks if the provider uses the modern event-based interface.
     *
     * @param {IPositionProvider} provider - The provider to check.
     * @returns {boolean} True if the provider uses the modern interface.
     */
    private isModernProvider(provider: IPositionProvider): boolean {
        return provider &&
            typeof provider.hasValidPosition === 'function' &&
            typeof provider.on === 'function' &&
            typeof provider.off === 'function';
    }

    /**
     * Component render callback.
     */
    componentDidRender(): void {
        this.setCompassStyle(this.mapView.getBearing());
    }

    /**
     * Stops listening for position updates.
     */
    disconnectedCallback(): void {
        if (!this.positionProvider) {
            return;
        }

        if (this.isLegacyProvider(this.positionProvider)) {
            // Guard the legacy call with an existence check before invoking stopListeningForPosition
            if (this.positionProvider.stopListeningForPosition) {
                this.positionProvider.stopListeningForPosition();
            }
        } else {
            // Clean up modern provider event listeners
            this.cleanupModernProviderListeners();
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
                            ${this.positionState === PositionStateTypes.POSITION_UNKNOWN || this.positionState === PositionStateTypes.POSITION_INACCURATE ? 'mi-my-position__position-button--unknown' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_REQUESTING ? 'mi-my-position__position-button--requesting' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_KNOWN ? 'mi-my-position__position-button--known' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_CENTERED ? 'mi-my-position__position-button--centered' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_TRACKED ? 'mi-my-position__position-button--tracked' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_UNTRACKED ? 'mi-my-position__position-button--untracked' : ''}
                            ${this.positionState === PositionStateTypes.POSITION_FOLLOW ? 'mi-my-position__position-button--follow' : ''}`}
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
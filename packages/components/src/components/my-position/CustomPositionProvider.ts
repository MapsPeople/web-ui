import { IPositionProvider } from "../../types/position-provider.interface";

/**
 * CustomPositionProvider allows manual position setting instead of using the GeoLocation API.
 * Follows the MapsIndoors custom position provider pattern.
 */
export class CustomPositionProvider implements IPositionProvider {
    private static currentPosition: GeolocationPosition | null = null;
    private static callbacks: {
        positionError?: (error?: GeolocationPositionError) => void;
        positionInaccurate?: (accuracy: number) => void;
        positionRequesting?: () => void;
        positionReceived?: (position: GeolocationPosition) => void;
    } = {};
    /**
     * Similar accuracy to the one declared in the my-position component.
     */
    private static maxAccuracy: number = 200;

    /**
     * Check if the custom postion provider is availlable (always true).
     *
     * @returns {boolean} Always returns true for this custom provider example.
     */
    public isAvailable(): boolean {
        // This might need to be adjusted based on the specific provider
        // For this example, we assume the custom position provider is always available
        return true;
    }

    /**
     * Check if persmiion is granted for the custom position provider (always true for this custom provider example).
     */
    public async isAlreadyGranted(): Promise<boolean> {
        // This also needs to be adjusted based on the specific provider
        // For this example, we assume permission is always granted
        return Promise.resolve(true);
    }

    /**
     * Set up callbacks for position updates.
     */
    public listenForPosition(maxAccuracy: number, positionError: (error?: GeolocationPositionError) => void, positionInaccurate: (accuracy: number) => void, positionRequesting: () => void, positionReceived: (position: GeolocationPosition) => void): void {

        CustomPositionProvider.maxAccuracy = maxAccuracy;
        CustomPositionProvider.callbacks = { positionError, positionInaccurate, positionRequesting, positionReceived };

        // If we already have a position, emit it immediately
        if (CustomPositionProvider.currentPosition) {
            this.emitCurrentPosition();
        }
    }

    /**
     * Stop listening for position updates.
     */
    public stopListeningForPosition(): void {
        CustomPositionProvider.callbacks = {};
        CustomPositionProvider.currentPosition = null;
    }

    /**
     * Manually set a position. This will trigger the appropriate callbacks.
     * @param position - Position object following MapsIndoors custom position format
     */
    public static setPosition(position: {
        coords: {
            latitude: number;
            longitude: number;
            accuracy: number;
        };
        timestamp: number;
    }): void {
        // Convert to GeolocationPosition format
        const geolocationPosition: GeolocationPosition = {
            coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            },
            timestamp: position.timestamp
        };

        CustomPositionProvider.currentPosition = geolocationPosition;

        // Emit the position if callbacks are set up
        if (Object.keys(CustomPositionProvider.callbacks).length > 0) {
            const provider = new CustomPositionProvider();
            provider.emitCurrentPosition();
        }
    }

    /**
     * Emite the current position through the appropriate callback.
     */
    private emitCurrentPosition(): void {
        if (!CustomPositionProvider.currentPosition || !CustomPositionProvider.callbacks.positionReceived) {
            return;
        }

        const position = CustomPositionProvider.currentPosition;

        if (position.coords.accuracy <= CustomPositionProvider.maxAccuracy) {
            CustomPositionProvider.callbacks.positionReceived(position);
        } else {
            CustomPositionProvider.callbacks.positionInaccurate?.(position.coords.accuracy);
        }
    }
}

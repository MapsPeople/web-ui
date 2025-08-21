import { BasePositionProvider } from './BasePositionProvider';

/**
 * CustomPositionProvider allows manual position setting instead of using the GeoLocation API.
 * This servers as an example implementation showing how to extend BasePositionProvider
 * This pattern can be used to create custom position providers for different use cases.
 */
export class CustomPositionProviderExample extends BasePositionProvider {
    private static currentPosition: GeolocationPosition | null = null;
    private static activeInstances: CustomPositionProviderExample[] = [];

    /**
     * Check if the custom position provider is available (always true in this example).
     *
     * @returns {boolean} Always returns true for this example provider.
     */
    public isAvailable(): boolean {
        return true;
    }

    /**
     * Check if permission is already granted (always true for this example provider).
     * 
     * @returns {Promise<boolean>} Always resolves to true in this example.
     */
    public async isAlreadyGranted(): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     * Starrt listening for position updates from the custom provider.
     * This implementation tracks active instances so the static setPosition method can notify all active providers when a new position is set.
     */
    protected startListening(): void {
        // Track this instance so we can emit positions to it later
        CustomPositionProviderExample.activeInstances.push(this);

        // If we already have a position, emit it immediately
        if (CustomPositionProviderExample.currentPosition) {
            this.emitPosition({
                coords: {
                    latitude: CustomPositionProviderExample.currentPosition.coords.latitude,
                    longitude: CustomPositionProviderExample.currentPosition.coords.longitude,
                    accuracy: CustomPositionProviderExample.currentPosition.coords.accuracy,
                },
                timestamp: CustomPositionProviderExample.currentPosition.timestamp
            } as GeolocationPosition);
        }
    }

    /**
     * Stop listening for position updates from the custom provider.
     * Removes this instance from the active instances list.
     */
    protected stopListening(): void {
        // Remove this instance from the active instances
        const index = CustomPositionProviderExample.activeInstances.indexOf(this);

        if (index > -1) {
            CustomPositionProviderExample.activeInstances.splice(index, 1);
        }

        // Clear position if no more active instances
        if (CustomPositionProviderExample.activeInstances.length === 0) {
            CustomPositionProviderExample.currentPosition = null;
        }
    }

    /**
     * Instance method for setting position.
     */
    public setPosition(position: {
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
        } as GeolocationPosition;

        CustomPositionProviderExample.currentPosition = geolocationPosition;

        // Emit position to all active instances
        CustomPositionProviderExample.activeInstances.forEach(instance => {
            instance.emitPosition(position as GeolocationPosition);
        });
    }

    /**
     * Static method for setting the current position and notifying all active instances.
     *
     * @param {GeolocationPosition} position - The new position to set.
     */
    // Keep the static method for backward compatibility
    public static setPosition(position: GeolocationPosition): void {
        CustomPositionProviderExample.currentPosition = position;

        // Notify all active instances with the new position
        CustomPositionProviderExample.activeInstances.forEach(instance => {
            instance.emitPosition(position);
        });
    }
}
import { IPositionProvider } from '../../types/position-provider.interface';

/**
 * GeoLocationProvider provides methods to access the device's location via the GeoLocation API ({@link https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API GeoLocation API}).
 */
export class GeoLocationProvider implements IPositionProvider {

    /**
     * The current position of the device if received.
     *
     * @type {GeolocationPosition | null}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition}
     */
    private static currentPosition: GeolocationPosition | null = null;

    /**
     * The ID of the position watch set by the GeoLocation API.
     * This is used to clear the watch when no longer needed.
     */
    private static positionWatchId: number | null = null;

    /**
     * Check if it is possible to get the position of the device using the GeoLocation API.
     *
     * @returns {boolean} True if the GeoLocation API is available in the browser, false otherwise.
     */
    public isAvailable(): boolean {
        return 'geolocation' in navigator;
    }

    /**
     * Check if the user has already granted permission to access the device's location.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if permission is granted, false otherwise.
     */
    public async isAlreadyGranted(): Promise<boolean> {
        if ('permissions' in navigator === false || 'query' in navigator.permissions === false) {
            return Promise.resolve(false);
        } else {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            return result.state === 'granted';
        }
    }

    /**
     * Listen for position updates from the GeoLocation API.
     *
     * @param {number} maxAccuracy - The maximum accuracy of the position to accept.
     * @param {Function} positionError - Callback function to call when an error occurs while getting the position.
     * @param {Function} positionInaccurate - Callback function to call when the position is inaccurate.
     * @param {Function} positionRequesting - Callback function to call when the position is being requested.
     * @param {Function} positionReceived - Callback function to call when a position is received.
     */
    public listenForPosition(
        maxAccuracy: number,
        positionError: (error?: GeolocationPositionError) => void,
        positionInaccurate: (accuracy: number) => void,
        positionRequesting: () => void,
        positionReceived: (position: GeolocationPosition) => void
    ): void {
        if ('permissions' in navigator === false || 'query' in navigator.permissions === false) {
            positionError();
            return;
        }

        positionRequesting();
        const requestTime = Date.now();
        GeoLocationProvider.positionWatchId = navigator.geolocation.watchPosition(
            position => {
                // If position is the same as before, don't do anything.
                if (
                    GeoLocationProvider.currentPosition
                    && position.coords.accuracy === GeoLocationProvider.currentPosition.coords.accuracy
                    && position.coords.latitude === GeoLocationProvider.currentPosition.coords.latitude
                    && position.coords.longitude === GeoLocationProvider.currentPosition.coords.longitude
                ) {
                    return;
                }

                GeoLocationProvider.currentPosition = position;

                if (!(GeoLocationProvider.currentPosition.coords.accuracy <= maxAccuracy)) {
                    positionInaccurate(position.coords.accuracy);
                } else {
                    positionReceived(position);
                }
            },
            error => {
                // Firefox may throw both success and a timeout error (https://bugzilla.mozilla.org/show_bug.cgi?id=1283563).
                // We mitigate this by not passing on error if a correct position has been given since asking for it.
                if (error.code !== 3 || !GeoLocationProvider.currentPosition || GeoLocationProvider.currentPosition.timestamp <= requestTime) {
                    positionError(error);
                }
            }
        );
    }

    /**
     * Stop listening for position updates from the GeoLocation API.
     * This will clear the watch set by `listenForPosition` and reset the current position.
     *
     * @returns {void}
     */
    public stopListeningForPosition(): void {
        if (GeoLocationProvider.positionWatchId !== null) {
            navigator.geolocation.clearWatch(GeoLocationProvider.positionWatchId);
            GeoLocationProvider.positionWatchId = null;
        }
        GeoLocationProvider.currentPosition = null;
    }
}

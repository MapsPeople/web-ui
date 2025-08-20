/**
 * Interface for position providers that can supply device location data.
 */
export interface IPositionProvider {
    /**
     * Check if the position provider is available.
     *
     * @returns {boolean} True if the provider is available, false otherwise.
     */

    isAvailable(): boolean;

    /**
     * Check if permission is already granted for position access.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if permission is granted, false otherwise.
     */
    isAlreadyGranted(): Promise<boolean>;

    /**
     * Listen for position updates
     * @param {number} maxAccuracy - The maximum accuracy of the position to accept.
     * @param {Function} positionError - Callback function to call when the position is innacurate.
     * @param {Function} positionInaccurate - Callback function to call when the position is innacurate.
     * @param {Function} positionRequesting - Callback function to call when the position is being requested.
     * @param {Function} positionReceived - Callback function to call when the position is successfully received.
     */
    listenForPosition(
        maxAccuracy: number,
        positionError: (error?: GeolocationPositionError) => void,
        positionInaccurate: (accuracy: number) => void,
        positionRequesting: () => void,
        positionReceived: (position: GeolocationPosition) => void
    ): void;

    /**
     * Stop listening for position updates.
     *
     * @returns {void}
     */
    stopListeningForPosition(): void;
}
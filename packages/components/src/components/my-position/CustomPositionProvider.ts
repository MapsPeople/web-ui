import { IPositionProvider, PositionProviderOptions } from '../../types/position-provider.interface';

/**
 * CustomPositionProvider
 *
 * Example/reference implementation of the modern event-style position provider.
 *
 * IMPORTANT:
 * - This file is provided as an example and reference only. It demonstrates the
 *   modern documentation-style position provider interface.
 * - The example is not required by the application at runtime; use it as a
 *   template when implementing your own provider.
 *
 * Documentation:
 * https://docs.mapsindoors.com/~/changes/452/sdks-and-frameworks/web/other-guides/user-positioning/custom-positionprovider#required-properties
 *
 * Notes:
 * - The provider exposes `currentPosition`, `on`/`off` events and an
 *   optional `setPosition(GeolocationPosition)` method following the modern interface.
 */

/**
 * CustomPositionProvider allows manual position setting and follows the modern documentation interface.
 * This serves as an example implementation showing how to implement the modern event-based interface.
 */
export class CustomPositionProvider implements IPositionProvider {
    private _currentPosition: GeolocationPosition | null = null;
    private _maxAccuracy: number;
    private _listeners = new Map<string, Function[]>();

    /**
     * Creates an instance of the CustomPositionProvider.
     *
     * @param {PositionProviderOptions} options - The options for the position provider.
     */
    constructor(options?: PositionProviderOptions) {
        // Store only the maxAccuracy value we actually use
        const { maxAccuracy = 20 } = options ?? {};
        this._maxAccuracy = maxAccuracy;
    }

    /**
     * Gets the current position.
     *
     * @returns {object | null} The current position or null if no position is available.
     */
    get currentPosition(): GeolocationPosition | null {
        return this._currentPosition;
    }

    /**
     * Checks if the current position is valid based on accuracy requirements.
     *
     * @returns {boolean} True if the current position is valid and accurate enough.
     */
    hasValidPosition(): boolean {
        const maxAccuracy = this._maxAccuracy;
        return this._currentPosition !== null &&
            this._currentPosition.coords &&
            this._currentPosition.coords.accuracy >= 0 &&
            this._currentPosition.coords.accuracy <= maxAccuracy;
    }

    /**
     * Adds an event listener for the specified event.
     *
     * @param {string} eventName - The event name to listen for.
     * @param {Function} callback - The callback function to execute.
     */
    on(eventName: 'position_error' | 'position_received', callback: Function): void {
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName, []);
        }
        this._listeners.get(eventName)!.push(callback);
    }

    /**
     * Removes an event listener for the specified event.
     *
     * @param {string} eventName - The event name to remove the listener from.
     * @param {Function} callback - The callback function to remove.
     */
    off(eventName: 'position_error' | 'position_received', callback: Function): void {
        const callbacks = this._listeners.get(eventName);
        if (callbacks) {
            this._listeners.set(eventName, callbacks.filter(cb => cb !== callback));
        }
    }

    /**
     * Sets a custom position and emits the position_received event.
     *
     * @param {object} position - The GeolocationPosition object to set.
     */
    setPosition(position: GeolocationPosition): void {
        this._currentPosition = position;

        // Emit position_received event
        const callbacks = this._listeners.get('position_received') || [];
        callbacks.forEach(callback => {
            callback.call(null, { position });
        });
    }

    /**
     * Emits a position error event.
     *
     * @param {any} error - Optional error object.
     */
    emitError(error?: any): void {
        this._currentPosition = null;
        const callbacks = this._listeners.get('position_error') || [];
        callbacks.forEach(callback => {
            callback.call(null, error);
        });
    }
}
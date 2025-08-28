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
 * Usage example:
 * const provider = new CustomPositionProvider({
 *   positionMarkerStyles: { fillColor: '#6eec00', strokeColor: '#fff' },
 *   accuracyCircleStyles: { fillColor: '#f30000' }
 * });
 * myMyPositionElement.customPositionProvider = provider;
 *
 * Notes:
 * - The provider exposes `currentPosition`, `options`, `on`/`off` events and an
 *   optional `setPosition(GeolocationPosition)` method following the modern interface.
 */

/**
 * Default options for the CustomPositionProvider, matching the documentation.
 */
const DEFAULT_OPTIONS: PositionProviderOptions = {
    maxAccuracy: 20,
    positionMarkerStyles: {
        radius: '6px',
        strokeWeight: '2px',
        strokeColor: '#fff',
        fillColor: '#4169E1',
        fillOpacity: 1
    },
    accuracyCircleStyles: {
        fillColor: '#4169E1',
        fillOpacity: 0.16
    }
};

/**
 * CustomPositionProvider allows manual position setting and follows the modern documentation interface.
 * This serves as an example implementation showing how to implement the modern event-based interface.
 */
export class CustomPositionProvider implements IPositionProvider {
    private _currentPosition: GeolocationPosition | null = null;
    private _options: PositionProviderOptions;
    private _listeners = new Map<string, Function[]>();

    /**
     * Creates an instance of the CustomPositionProvider.
     *
     * @param {PositionProviderOptions} options - The options for the position provider.
     */
    constructor(options?: PositionProviderOptions) {
        this._options = { ...DEFAULT_OPTIONS, ...options };
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
     * Gets the position provider options.
     *
     * @returns {object} The position provider configuration options.
     */
    get options(): PositionProviderOptions {
        return this._options;
    }

    /**
     * Checks if the current position is valid based on accuracy requirements.
     *
     * @returns {boolean} True if the current position is valid and accurate enough.
     */
    hasValidPosition(): boolean {
        const maxAccuracy = this._options?.maxAccuracy ?? DEFAULT_OPTIONS.maxAccuracy;
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

    /* Alternative implementation for handling simplified position objects:
    setPosition(position: { coords: { latitude: number; longitude: number; accuracy: number; }; timestamp: number }): void {
        // Convert simplified position object to GeolocationPosition format
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

        this._currentPosition = geolocationPosition;

        // Emit position_received event
        const callbacks = this._listeners.get('position_received') || [];
        callbacks.forEach(callback => {
            callback.call(null, { position: geolocationPosition });
        });
    }
    */

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
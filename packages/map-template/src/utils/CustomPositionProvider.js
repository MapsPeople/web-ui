

/**
 * CustomPositionProvider allows manual position setting and follows the modern documentation interface.
 * This serves as an example implementation for JavaScript projects.
 */
class CustomPositionProvider {
    constructor(options = {}) {
        this._currentPosition = null;
        this._listeners = new Map();

        // Store only the maxAccuracy value we actually use
        const { maxAccuracy = 100 } = options;
        this._maxAccuracy = maxAccuracy;
    }

    /**
     * Gets the current position.
     */
    get currentPosition() {
        return this._currentPosition;
    }

    /**
     * Checks if the current position is valid based on accuracy requirements.
     * This method is called by the mi-my-position web component to determine
     * whether to show the blue dot and if the position data is reliable.
     */
    hasValidPosition() {
        const maxAccuracy = this._maxAccuracy;
        return this._currentPosition !== null &&
            this._currentPosition.coords &&
            this._currentPosition.coords.accuracy >= 0 &&
            this._currentPosition.coords.accuracy <= maxAccuracy;
    }

    /**
     * Adds an event listener for the specified event.
     */
    on(eventName, callback) {
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName, []);
        }
        this._listeners.get(eventName).push(callback);
    }

    /**
     * Removes an event listener for the specified event.
     */
    off(eventName, callback) {
        const callbacks = this._listeners.get(eventName);
        if (callbacks) {
            this._listeners.set(eventName, callbacks.filter(cb => cb !== callback));
        }
    }

    /**
     * Sets a custom position and emits the position_received event.
     *
     * @param {GeolocationPosition} position - The GeolocationPosition object to set.
     * @returns {boolean} True if the position was successfully set, false otherwise.
     */
    setPosition(position) {
        // Handle both GeolocationPosition and simplified position objects
        let geolocationPosition;

        if (position.coords && position.timestamp) {
            // Already a GeolocationPosition or compatible object
            geolocationPosition = {
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude ?? null,
                    altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
                    heading: position.coords.heading ?? null,
                    speed: position.coords.speed ?? null
                },
                timestamp: position.timestamp,
                floorIndex: position.floorIndex ?? null
            };
        } else {
            const error = {
                message: '[CustomPositionProvider] Invalid position object received. The object must be at minimum: { coords: { latitude: number, longitude: number, accuracy: number }, timestamp: number }.',
                received: position
            };
            this.emitError(error);
            return false;
        }

        // Drop positions with accuracy exceeding maxAccuracy
        if (geolocationPosition.coords.accuracy > this._maxAccuracy) {
            // Log the rejection but don't emit position_error event
            // This prevents the my-position component from going to POSITION_UNKNOWN state
            console.warn(`[CustomPositionProvider] Position accuracy (${geolocationPosition.coords.accuracy}m) exceeds maxAccuracy (${this._maxAccuracy}m). Position dropped, keeping previous position.`);
            return false;
        }

        this._currentPosition = geolocationPosition;

        // Emit position_received event
        const callbacks = this._listeners.get('position_received') || [];
        callbacks.forEach(callback => {
            callback.call(null, { position: geolocationPosition });
        });

        return true;
    }

    /**
     * Emits a position error event.
     */
    emitError(error) {
        this._currentPosition = null;
        // Always log the error for debugging
        console.warn('[CustomPositionProvider] position_error:', error);
        const callbacks = this._listeners.get('position_error') || [];
        callbacks.forEach(callback => {
            callback.call(null, error);
        });
    }
}

export default CustomPositionProvider;

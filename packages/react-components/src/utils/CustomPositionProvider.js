/**
 * Default options for the CustomPositionProvider, matching the documentation.
 */
const DEFAULT_OPTIONS = {
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
 * CustomPositionProvider allows manual position setting and follows the documentation interface.
 * This serves as an example implementation for JavaScript projects.
 */
class CustomPositionProvider {
    constructor(options = {}) {
        this._currentPosition = null;
        this._options = { ...DEFAULT_OPTIONS, ...options };
        this._listeners = new Map();
    }

    /**
     * Gets the current position.
     */
    get currentPosition() {
        return this._currentPosition;
    }

    /**
     * Gets the position provider options.
     */
    get options() {
        return this._options;
    }

    /**
     * Checks if the current position is valid based on accuracy requirements.
     */
    hasValidPosition() {
        const maxAccuracy = this._options?.maxAccuracy ?? DEFAULT_OPTIONS.maxAccuracy;
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
                    altitude: position.coords.altitude || null,
                    altitudeAccuracy: position.coords.altitudeAccuracy || null,
                    heading: position.coords.heading || null,
                    speed: position.coords.speed || null
                },
                timestamp: position.timestamp
            };
        } else {
            throw new Error('Invalid position object: must have coords and timestamp properties');
        }

        this._currentPosition = geolocationPosition;

        // Emit position_received event
        const callbacks = this._listeners.get('position_received') || [];
        callbacks.forEach(callback => {
            callback.call(null, { position: geolocationPosition });
        });
    }

    /**
     * Emits a position error event.
     */
    emitError(error) {
        this._currentPosition = null;
        const callbacks = this._listeners.get('position_error') || [];
        callbacks.forEach(callback => {
            callback.call(null, error);
        });
    }

    // Legacy interface support for backward compatibility
    isAvailable() {
        return true;
    }

    async isAlreadyGranted() {
        return true;
    }

    listenForPosition(maxAccuracy, positionError, positionInaccurate, positionRequesting, positionReceived) {
        // Store the legacy callbacks and convert them to modern event listeners
        this.on('position_error', positionError);
        this.on('position_received', ({ position }) => {
            if (position.coords.accuracy <= maxAccuracy) {
                positionReceived(position);
            } else {
                positionInaccurate(position.coords.accuracy);
            }
        });

        // If we already have a position, emit it
        if (this._currentPosition) {
            if (this._currentPosition.coords.accuracy <= maxAccuracy) {
                positionReceived(this._currentPosition);
            } else {
                positionInaccurate(this._currentPosition.coords.accuracy);
            }
        }
    }

    stopListeningForPosition() {
        this._listeners.clear();
    }
}

export default CustomPositionProvider;

import { IPositionProvider } from '../../types/position-provider.interface';

/**
 * Abstract base class for custom position providers.
 * Clients should extend this class and implement the abstract methods to provide custom position logic.
 */
export abstract class BasePositionProvider implements IPositionProvider {
    protected callbacks: {
        positionError?: (error?: GeolocationPositionError) => void;
        positionInaccurate?: (accuracy: number) => void;
        positionRequesting?: () => void;
        positionReceived?: (position: GeolocationPosition) => void;
    } = {};

    protected maxAccuracy: number = 200;

    /**
     * Check if the position provider is available.
     * Override this method to implement specific availability checks.
     */
    public abstract isAvailable(): boolean;

    /**
     * Check if permission is already granted for position access.
     * Override this method to implement provider-specific permission checks.
     */
    public abstract isAlreadyGranted(): Promise<boolean>;

    /**
     * Set up callbacks for position updates.
     */
    public listenForPosition(maxAccuracy: number,
        positionError: (error?: GeolocationPositionError) => void,
        positionInaccurate: (accuracy: number) => void,
        positionRequesting: () => void,
        positionReceived: (position: GeolocationPosition) => void): void {

        this.maxAccuracy = maxAccuracy;
        this.callbacks = { positionError, positionInaccurate, positionRequesting, positionReceived };

        // Start listening for position from the specific provider
        this.startListening();
    }

    /**
     * Stop listening for position updates.
     */
    public stopListeningForPosition(): void {
        this.callbacks = {};
        this.stopListening();
    }

    /**
     * Start listening for position updates from the provider.
     * Override this method to implement provider-specific listening logic.
     */
    protected abstract startListening(): void;

    /**
     * Stop listening for position updates from the provider.
     * Override this method to implement provider-specific stop logic.
     */
    protected abstract stopListening(): void;

    /**
     * Helper method to emit a position update.
     * Call this method when you have a new position to report.
     */
    protected emitPosition(position: GeolocationPosition): void {
        if (position.coords.accuracy <= this.maxAccuracy) {
            this.callbacks.positionReceived?.(position);
        } else {
            this.callbacks.positionInaccurate?.(position.coords.accuracy);
        }
    }

    /**
     * Helper method to emit a position error.
     */
    protected emitError(error?: GeolocationPositionError): void {
        this.callbacks.positionError?.(error);
    }

    /**
     * Helper method to emit a position requesting state.
     */
    protected emitRequesting(): void {
        this.callbacks.positionRequesting?.();
    }
}

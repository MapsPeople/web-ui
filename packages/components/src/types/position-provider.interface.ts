/**
 * Extended GeolocationPosition interface that includes MapsIndoors-specific floor index property.
 */
export interface MapsIndoorsPosition extends GeolocationPosition {
    /**
     * Floor index for MapsIndoors buildings.
     * This property is added by custom position providers to support floor change tracking.
     */
    floorIndex?: number | string | null;
}

/**
 * Position provider options interface matching the documentation.
 */
export interface PositionProviderOptions {
    maxAccuracy?: number;
    positionMarkerStyles?: {
        radius?: string;
        strokeWeight?: string;
        strokeColor?: string;
        fillColor?: string;
        fillOpacity?: number;
    };
    accuracyCircleStyles?: {
        fillColor?: string;
        fillOpacity?: number;
    };
}

/**
 * Interface for position providers that can supply device location data.
 * Supports both legacy callback-style and modern event-style providers.
 */
export interface IPositionProvider {
    // Legacy callback-style interface (for backward compatibility)
    isAvailable?(): boolean;
    isAlreadyGranted?(): Promise<boolean>;
    listenForPosition?(
        maxAccuracy: number,
        positionError: (error?: GeolocationPositionError) => void,
        positionInaccurate: (accuracy: number) => void,
        positionRequesting: () => void,
        positionReceived: (position: GeolocationPosition) => void
    ): void;
    stopListeningForPosition?(): void;

    // Modern event-style interface (matches documentation)
    currentPosition?: MapsIndoorsPosition | null;
    options?: PositionProviderOptions;
    hasValidPosition?(): boolean;
    on?(eventName: 'position_error' | 'position_received', callback: Function): void;
    off?(eventName: 'position_error' | 'position_received', callback: Function): void;

    // Helper method for manual position setting (optional)
    setPosition?(position: MapsIndoorsPosition): void;
}
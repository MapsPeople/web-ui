import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'mapboxPlacesSessionToken';

const fallbackStore = { token: undefined };

const listeners = new Set();

/**
 * Generate a UUID v4 string.
 *
 * @returns {string}
 */
function generateToken() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    const hasGetRandomValues = typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';
    const randomNibble = () => hasGetRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] & 15 : Math.floor(Math.random() * 16);

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
        const nibble = randomNibble();
        return (character === 'x' ? nibble : (nibble & 3) | 8).toString(16);
    });
}

/**
 * Read the stored token, or undefined if sessionStorage is unavailable.
 *
 * @returns {string | null | undefined}
 */
function readStoredToken() {
    try {
        return sessionStorage.getItem(STORAGE_KEY);
    } catch (error) {
        return undefined;
    }
}

function storeToken(token) {
    try {
        sessionStorage.setItem(STORAGE_KEY, token);
        fallbackStore.token = undefined;
    } catch (error) {
        fallbackStore.token = token;
    }
}

/**
 * Get the Mapbox Places session token for this browser session, creating and storing one if missing.
 *
 * @returns {string}
 */
function getMapboxPlacesSessionToken() {
    const existingToken = readStoredToken();
    if (existingToken) {
        return existingToken;
    }

    const token = fallbackStore.token || generateToken();
    storeToken(token);

    return token;
}

/**
 * Subscribe to session token resets.
 *
 * @param {() => void} listener
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeToMapboxPlacesSessionToken(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * Replace the Mapbox Places session token with a new one so the next search starts a new session, and notify subscribers.
 */
export function resetMapboxPlacesSessionToken() {
    fallbackStore.token = undefined;
    storeToken(generateToken());
    Array.from(listeners, listener => listener());
}

/**
 * React hook returning the current Mapbox Places session token, re-rendering when it is reset.
 *
 * @returns {string}
 */
export function useMapboxPlacesSessionToken() {
    return useSyncExternalStore(subscribeToMapboxPlacesSessionToken, getMapboxPlacesSessionToken);
}

export default getMapboxPlacesSessionToken;

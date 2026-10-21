const STORAGE_KEY = 'mapboxPlacesSessionToken';

const fallbackStore = { token: undefined };

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

    try {
        sessionStorage.setItem(STORAGE_KEY, token);
        fallbackStore.token = undefined;
    } catch (error) {
        fallbackStore.token = token;
    }

    return token;
}

/**
 * Remove the stored Mapbox Places session token so the next search starts a new session.
 */
export function resetMapboxPlacesSessionToken() {
    fallbackStore.token = undefined;

    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        return;
    }
}

export default getMapboxPlacesSessionToken;

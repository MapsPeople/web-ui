import { useState, useEffect, useCallback, useRef } from 'react';
import {
    AuthorizationRequest,
    AuthorizationNotifier,
    BaseTokenRequestHandler,
    RedirectRequestHandler,
    AuthorizationServiceConfiguration,
    FetchRequestor,
    TokenRequest,
    GRANT_TYPE_AUTHORIZATION_CODE
} from '@openid/appauth';
import { setFlag } from '@openid/appauth/built/flags';

const OIDC_STATE_STORAGE_KEY = 'mapsindoors_oidc_state';
const OIDC_URL_STORAGE_KEY = 'mapsindoors_oidc_url';

/**
 * Generate random state string for OIDC authentication
 */
function generateSecureState() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    // Convert to base64 and make URL-safe
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Validate that a URL is safe for redirection (relative path only)
 */
function isValidRedirectUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('/') &&
        !url.startsWith('//') &&
        !url.match(/^https?:/i);
}

function normalizeStateParam(value) {
    if (!value) return null;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

/**
 * Custom hook for MapsIndoors OIDC Authentication
 * 
 * This hook manages the OpenID Connect authentication flow required by MapsIndoors.
 * It handles the auth flow, URL restoration, and provides state that components can react to.
 * 
 * @returns {Object} Auth state and utilities
 * @returns {boolean} isAuthenticated - Whether authentication has completed
 * @returns {boolean} isAuthenticating - Whether authentication is in progress
 * @returns {string} currentUrl - Current URL path and search params (updates after auth)
 * @returns {Error} authError - Any authentication error that occurred
 */
export function useMapsIndoorsAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(() => {
        // Initialize with current URL
        return `${window.location.pathname}${window.location.search}`;
    });
    const [authError, setAuthError] = useState(null);

    const requestorRef = useRef(new FetchRequestor());
    const authorizationNotifierRef = useRef(new AuthorizationNotifier());
    const authorizationHandlerRef = useRef(new RedirectRequestHandler());
    const storedStateRef = useRef(null);
    const isInitializedRef = useRef(false);

    const clearStoredState = useCallback(() => {
        storedStateRef.current = null;
        try {
            window.sessionStorage?.removeItem(OIDC_STATE_STORAGE_KEY);
            window.sessionStorage?.removeItem(OIDC_URL_STORAGE_KEY);
        } catch {
            // ignore
        }
    }, []);

    // Silence @openid/appauth internal logging (auth codes/state only; no tokens logged)
    useEffect(() => {
        setFlag('IS_LOG', false);
    }, []);

    /**
     * Get the redirect URI for the current application
     */
    const getRedirectUri = useCallback(() => {
        return `${window.location.origin}${window.location.pathname}`;
    }, []);

    /**
     * Get the current URL including path and search parameters
     */
    const getCurrentUrl = useCallback(() => {
        return `${window.location.pathname}${window.location.search}`;
    }, []);

    /**
     * Check if the current page load is a return from authentication
     */
    const isReturningFromAuth = useCallback(() => {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        return hashParams.has('code') && hashParams.has('state');
    }, []);

    /**
     * Restore the URL from the state parameter after authentication
     */
    const restoreUrlFromState = useCallback((receivedState) => {
        try {
            if (!receivedState) {
                clearStoredState();
                return;
            }

            const expectedState =
                storedStateRef.current || window.sessionStorage?.getItem(OIDC_STATE_STORAGE_KEY) || null;

            const normalizedReceivedState = normalizeStateParam(receivedState);

            // CRITICAL: Validate state matches to prevent CSRF attacks
            if (!expectedState || normalizedReceivedState !== expectedState) {
                const error = new Error('State validation failed - possible CSRF attack');
                setAuthError(error);
                clearStoredState();
                throw error;
            }

            // Retrieve the stored URL separately
            const storedUrl = window.sessionStorage?.getItem(OIDC_URL_STORAGE_KEY);

            // Validate the URL is safe before restoring
            if (storedUrl && isValidRedirectUrl(storedUrl)) {
                // Restore the original URL (this removes the hash fragment)
                window.history.replaceState(
                    null,
                    '',
                    `${window.location.origin}${storedUrl}`
                );

                // Explicitly clear the hash to ensure it's removed
                if (window.location.hash) {
                    window.location.hash = '';
                }

                // Update the currentUrl state to trigger re-renders
                // This will cause MapsIndoorsMap to re-read URL parameters
                setCurrentUrl(storedUrl);
            }

            // Clear the stored state after successful validation/restoration
            clearStoredState();
        } catch (error) {
            setAuthError(error);
            clearStoredState();
            throw error;
        }
    }, [clearStoredState]);

    /**
     * Handle the authentication callback when returning from the auth provider
     */
    const handleAuthCallback = useCallback(async (config) => {
        setIsAuthenticating(true);
        setAuthError(null);

        authorizationHandlerRef.current.setAuthorizationNotifier(authorizationNotifierRef.current);

        return new Promise((resolve, reject) => {
            authorizationNotifierRef.current.setAuthorizationListener(async (request, response, error) => {
                if (error) {
                    setAuthError(error);
                    setIsAuthenticating(false);
                    reject(error);
                    return;
                }

                if (response) {
                    try {
                        // Extract and restore the stored URL from state parameter
                        restoreUrlFromState(response.state);

                        const tokenHandler = new BaseTokenRequestHandler(requestorRef.current);
                        const tokenRequest = new TokenRequest({
                            client_id: request.clientId,
                            redirect_uri: getRedirectUri(),
                            grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
                            code: response.code,
                            extras: { code_verifier: request?.internal?.code_verifier }
                        });

                        const tokenResponse = await tokenHandler.performTokenRequest(config, tokenRequest);
                        window.mapsindoors.MapsIndoors.setAuthToken(tokenResponse.accessToken);

                        setIsAuthenticated(true);
                        setIsAuthenticating(false);

                        // URL is already restored by restoreUrlFromState above
                        // Just ensure any remaining hash is cleaned up
                        if (window.location.hash) {
                            window.history.replaceState(
                                null,
                                '',
                                `${window.location.origin}${window.location.pathname}${window.location.search}`
                            );
                        }

                        resolve(tokenResponse);
                    } catch (tokenError) {
                        setAuthError(tokenError);
                        setIsAuthenticating(false);
                        reject(tokenError);
                    }
                }
            });

            authorizationHandlerRef.current.completeAuthorizationRequestIfPossible();
        });
    }, [restoreUrlFromState, getRedirectUri]);

    /**
     * Initiate the authentication flow by redirecting to the auth provider
     */
    const initiateAuthFlow = useCallback(async (config, authClients) => {
        if (!authClients.length) {
            throw new Error('No auth clients provided');
        }

        setIsAuthenticating(true);
        setAuthError(null);

        const authClient = authClients[0];
        const preferredIDP = authClient.preferredIDPs && authClient.preferredIDPs.length > 0
            ? authClient.preferredIDPs[0]
            : '';

        // Generate cryptographically secure random state for CSRF protection
        const stateString = generateSecureState();

        // Store the current URL separately from the state
        const currentUrlValue = getCurrentUrl();

        // Store state and URL in session storage
        storedStateRef.current = stateString;
        try {
            window.sessionStorage?.setItem(OIDC_STATE_STORAGE_KEY, stateString);
            window.sessionStorage?.setItem(OIDC_URL_STORAGE_KEY, currentUrlValue);
        } catch (error) {
            console.warn('Failed to store auth state:', error);
            // Continue anyway - we have it in memory via storedStateRef
        }

        const request = new AuthorizationRequest({
            client_id: authClient.clientId,
            redirect_uri: getRedirectUri(),
            scope: 'openid profile account client-apis',
            response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
            state: stateString,
            extras: {
                'acr_values': `idp:${preferredIDP}`,
                'response_mode': 'fragment'
            }
        });

        await authorizationHandlerRef.current.performAuthorizationRequest(config, request);
    }, [getCurrentUrl, getRedirectUri]);

    /**
     * Initialize authentication handler for MapsIndoors
     * This method sets up the auth required callback for the MapsIndoors SDK
     */
    const initializeAuthHandler = useCallback(() => {
        if (!window.mapsindoors?.MapsIndoors) {
            throw new Error('MapsIndoors SDK must be loaded before initializing auth handler');
        }

        if (isInitializedRef.current) {
            return; // Already initialized
        }

        window.mapsindoors.MapsIndoors.onAuthRequired = async ({ authClients = [], authIssuer = '' }) => {
            try {
                const config = await AuthorizationServiceConfiguration.fetchFromIssuer(authIssuer, requestorRef.current);

                if (isReturningFromAuth()) {
                    await handleAuthCallback(config);
                    // URL restoration is handled inside handleAuthCallback
                } else {
                    await initiateAuthFlow(config, authClients);
                }
            } catch (error) {
                setAuthError(error);
                setIsAuthenticating(false);
                throw error;
            }
        };

        isInitializedRef.current = true;
    }, [isReturningFromAuth, handleAuthCallback, initiateAuthFlow]);

    // If we land on the page with a code/state hash, prime currentUrl from stored URL
    useEffect(() => {
        if (!isReturningFromAuth()) return;

        try {
            const storedUrl = window.sessionStorage?.getItem(OIDC_URL_STORAGE_KEY);
            if (storedUrl && isValidRedirectUrl(storedUrl)) {
                setCurrentUrl(storedUrl);
            }
        } catch (error) {
            setAuthError(error);
        }
    }, [isReturningFromAuth]);

    // If deep-link navigation is reintroduced, re-enable this listener.
    // useEffect(() => {
    //     const updateUrl = () => {
    //         setCurrentUrl(getCurrentUrl());
    //     };
    //
    //     window.addEventListener('popstate', updateUrl);
    //
    //     return () => {
    //         window.removeEventListener('popstate', updateUrl);
    //     };
    // }, [getCurrentUrl]);

    return {
        isAuthenticated,
        isAuthenticating,
        currentUrl,
        authError,
        initializeAuthHandler
    };
}


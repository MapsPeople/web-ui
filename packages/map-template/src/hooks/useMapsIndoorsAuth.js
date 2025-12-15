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
        return window.location.hash.includes('code') && window.location.hash.includes('state');
    }, []);

    /**
     * Parse hash params from the current URL
     */
    const getHashParams = useCallback(() => {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        return new URLSearchParams(hash);
    }, []);

    /**
     * Restore the URL from the state parameter after authentication
     */
    const restoreUrlFromState = useCallback((receivedState) => {
        if (!receivedState) {
            return;
        }

        try {
            // The @openid/appauth library should decode the state from the URL hash,
            // but we'll handle both encoded and decoded cases
            let decodedState = receivedState;
            try {
                // Try URL decoding (safe - decodeURIComponent is idempotent for non-encoded strings)
                decodedState = decodeURIComponent(receivedState);
            } catch (e) {
                // If it fails, use the original (might already be decoded)
                decodedState = receivedState;
            }
            
            // Also decode the stored state for comparison
            let storedStateDecoded = storedStateRef.current;
            if (storedStateDecoded) {
                try {
                    storedStateDecoded = decodeURIComponent(storedStateRef.current);
                } catch (e) {
                    // Already decoded
                }
            }

            // Compare with stored state
            if (decodedState !== storedStateDecoded) {
                // Don't return - try to restore anyway if we can decode the state
            }

            // Decode the base64 state and restore the URL
            const stateData = JSON.parse(atob(decodedState));
            
            if (stateData.url) {
                // Restore the original URL (this removes the hash fragment)
                window.history.replaceState(
                    null,
                    '',
                    `${window.location.origin}${stateData.url}`
                );
                
                // Explicitly clear the hash to ensure it's removed
                if (window.location.hash) {
                    window.location.hash = '';
                }
                
                // Update the currentUrl state to trigger re-renders
                // This will cause MapsIndoorsMap to re-read URL parameters
                setCurrentUrl(stateData.url);
            }

            // Clear the stored state after successful validation
            storedStateRef.current = null;
        } catch (error) {
            setAuthError(error);
        }
    }, []);

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

        // Store the current URL in the state parameter
        const currentUrlValue = getCurrentUrl();
        const stateData = {
            url: currentUrlValue,
            timestamp: Date.now()
        };

        // Generate and store the state
        const stateString = btoa(JSON.stringify(stateData));
        storedStateRef.current = stateString;

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

    // If we land on the page with a code/state hash, prime currentUrl from state
    useEffect(() => {
        if (!isReturningFromAuth()) return;

        const hashParams = getHashParams();
        const stateParam = hashParams.get('state');

        if (!stateParam) return;

        try {
            const decodedState = JSON.parse(atob(stateParam));
            if (decodedState?.url) {
                setCurrentUrl(decodedState.url);
            }
        } catch (error) {
            setAuthError(error);
        }
    }, [getHashParams, isReturningFromAuth]);

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


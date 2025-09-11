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

/**
 * OIDC Authentication Handler for MapsIndoors
 * This module handles the OpenID Connect authentication flow required by MapsIndoors
 */
export class MapsIndoorsAuthHandler {
    constructor() {
        this.requestor = new FetchRequestor();
        this.authorizationNotifier = new AuthorizationNotifier();
        this.authorizationHandler = new RedirectRequestHandler();
    }

    /**
     * Initialize authentication handler for MapsIndoors
     * This method sets up the auth required callback for the MapsIndoors SDK
     */
    initializeAuthHandler() {
        if (!window.mapsindoors?.MapsIndoors) {
            throw new Error('MapsIndoors SDK must be loaded before initializing auth handler');
        }

        window.mapsindoors.MapsIndoors.onAuthRequired = async ({ authClients = [], authIssuer = '' }) => {
            try {
                const config = await AuthorizationServiceConfiguration.fetchFromIssuer(authIssuer, this.requestor);

                if (this.isReturningFromAuth()) {
                    await this.handleAuthCallback(config);
                } else {
                    await this.initiateAuthFlow(config, authClients);
                }

                // Clean up the URL after authentication
                this.cleanupUrl();
            } catch (error) {
                console.error('Authentication error:', error);
                throw error;
            }
        };
    }

    /**
     * Check if the current page load is a return from authentication
     */
    isReturningFromAuth() {
        return window.location.hash.includes('code') && window.location.hash.includes('state');
    }

    /**
     * Handle the authentication callback when returning from the auth provider
     */
    async handleAuthCallback(config) {
        this.authorizationHandler.setAuthorizationNotifier(this.authorizationNotifier);

        return new Promise((resolve, reject) => {
            this.authorizationNotifier.setAuthorizationListener(async (request, response, error) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (response) {
                    try {
                        const tokenHandler = new BaseTokenRequestHandler(this.requestor);
                        const tokenRequest = new TokenRequest({
                            client_id: request.clientId,
                            redirect_uri: this.getRedirectUri(),
                            grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
                            code: response.code,
                            extras: { code_verifier: request?.internal?.code_verifier }
                        });

                        const tokenResponse = await tokenHandler.performTokenRequest(config, tokenRequest);
                        window.mapsindoors.MapsIndoors.setAuthToken(tokenResponse.accessToken);
                        resolve(tokenResponse);
                    } catch (tokenError) {
                        reject(tokenError);
                    }
                }
            });

            this.authorizationHandler.completeAuthorizationRequestIfPossible();
        });
    }

    /**
     * Initiate the authentication flow by redirecting to the auth provider
     */
    async initiateAuthFlow(config, authClients) {
        if (!authClients.length) {
            throw new Error('No auth clients provided');
        }

        const authClient = authClients[0];
        const preferredIDP = authClient.preferredIDPs && authClient.preferredIDPs.length > 0
            ? authClient.preferredIDPs[0]
            : '';

        const request = new AuthorizationRequest({
            client_id: authClient.clientId,
            redirect_uri: this.getRedirectUri(),
            scope: 'openid profile account client-apis',
            response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
            extras: {
                'acr_values': `idp:${preferredIDP}`,
                'response_mode': 'fragment'
            }
        });

        await this.authorizationHandler.performAuthorizationRequest(config, request);
    }

    /**
     * Get the redirect URI for the current application
     */
    getRedirectUri() {
        return `${window.location.origin}${window.location.pathname}${window.location.search}`;
    }

    /**
     * Clean up the URL after authentication to remove auth parameters
     */
    cleanupUrl() {
        if (window.history && window.history.replaceState) {
            window.history.replaceState(
                null,
                '',
                `${window.location.origin}${window.location.pathname}${window.location.search}`
            );
        }
    }
}

// Export a singleton instance
export const authHandler = new MapsIndoorsAuthHandler();

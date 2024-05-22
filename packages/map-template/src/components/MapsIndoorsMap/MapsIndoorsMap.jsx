import * as Sentry from "@sentry/react";
import React, { useEffect, useState } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import MapTemplate from '../MapTemplate/MapTemplate.jsx';

/**
 *
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map. Can also be set in the MapsIndoors App Config as "gmKey" under "appSettings".
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map. Can also be set in the MapsIndoors App Config "mapboxAccessToken" under "appSettings".
 * @param {string} [props.venue] - If you want the map to show a specific Venue, provide the Venue name here.
 * @param {string} [props.locationId] - If you want the map to show a specific Location, provide the Location ID here.
 * @param {string} [props.primaryColor] - If you want the splash screen to have a custom primary color, provide the value here.
 * @param {string} [props.logo] - If you want the splash screen to have a custom logo, provide the image path or address here.
 * @param {array} [props.appUserRoles] - If you want the map to behave differently for specific users, set one or more app user roles here.
 * @param {string} [props.directionsFrom] - If you want to show directions instantly, provide a MapsIndoors Location ID or the string "USER_POSITION" here to be used as the origin.
 * @param {string} [props.directionsTo] - If you want to show directions instantly, provide a MapsIndoors Location ID or the string "USER_POSITION" here to be used as the destination.
 * @param {array} [props.externalIDs] - Filter locations shown on the map based on the external IDs.
 * @param {string} [props.tileStyle] - Tile style name to change the interface of the map.
 * @param {number} [props.startZoomLevel] - The initial zoom level of the map.
 * @param {number} [props.pitch] - The pitch of the map as a number. Not recommended for Google Maps with 2D Models.
 * @param {number} [props.bearing] - The bearing of the map as a number. Not recommended for Google Maps with 2D Models.
 * @param {boolean} [props.supportsUrlParameters] - If you want to support URL Parameters to configure the Map Template.
 * @param {string} [props.gmMapId] - The Google Maps Map ID associated with a specific map style or feature.
 * @param {boolean} [props.useMapProviderModule] - Set to true if the Map Template should take MapsIndoors solution modules into consideration when determining what map type to use.
 * @param {string} [props.kioskOriginLocationId] - If running the Map Template as a kiosk (upcoming feature), provide the Location ID that represents the location of the kiosk.
 * @param {number} [props.timeout] - If you want the Map Template to reset map position and UI elements to the initial state after some time of inactivity, use this to specify the number of seconds of inactivity before resetting.
 * @param {string} [props.language] - The language to show textual content in. Supported values are "en" for English, "da" for Danish, "de" for German and "fr" for French. If the prop is not set, the language of the browser will be used (if it is one of the four supported languages - otherwise it will default to English).
 * @param {boolean} [props.useKeyboard] - If running the Map Template as a kiosk, set this prop to true and it will prompt a keyboard. 
 * @param {number} [props.miTransitionLevel] - The zoom level on which to transition from Mapbox to MapsIndoors data. Default value is 17. This feature is only available for Mapbox.
 * @param {string} [props.category] - If you want to indicate an active category on the map. The value should be the Key (Administrative ID).
 * @param {boolean} [props.searchAllVenues] - If you want to perform search across all venues in the solution.
 * @param {boolean} [props.hideNonMatches] - Determine whether the locations on the map should be filtered or highlighted. If set to true, the locations will be filtered.
 */
function MapsIndoorsMap(props) {

    const [mapTemplateProps, setMapTemplateProps] = useState();

    /*
     * Listening for all props.
     * Will use query parameters to pass to the child component is the supportsUrlParameters prop is set to true.
     * Applies default values for some props if needed.
     */
    useEffect(() => {
        const queryString = window.location.search;
        const queryStringParams = new URLSearchParams(queryString);

        const defaultProps = {
            apiKey: 'mapspeople3d',
            venue: 'AUSTINOFFICE',
            logo: 'https://app.mapsindoors.com/mapsindoors/gfx/mapspeople-logo/mapspeople-pin.svg',
            primaryColor: '#005655', // --brand-colors-dark-pine-100 from MIDT
            useMapProviderModule: false,
            useKeyboard: false, 
            searchAllVenues: false,
            hideNonMatches: false
        };

        const apiKeyQueryParameter = queryStringParams.get('apiKey');
        const venueQueryParameter = queryStringParams.get('venue');
        const locationIdQueryParameter = queryStringParams.get('locationId');
        const logoQueryParameter = queryStringParams.get('logo');
        const directionsFromQueryParameter = queryStringParams.get('directionsFrom');
        const directionsToQueryParameter = queryStringParams.get('directionsTo');
        const tileStyleQueryParameter = queryStringParams.get('tileStyle');
        const startZoomLevelQueryParameter = queryStringParams.get('startZoomLevel');
        const pitchQueryParameter = queryStringParams.get('pitch');
        const bearingQueryParameter = queryStringParams.get('bearing');
        const gmApiKeyQueryParameter = queryStringParams.get('gmApiKey');
        const mapboxAccessTokenQueryParameter = queryStringParams.get('mapboxAccessToken');
        const primaryColorQueryParameter = queryStringParams.get('primaryColor'); // use without '#'. It will be prepended.
        const appUserRolesQueryParameter = queryStringParams.get('appUserRoles')?.split(',');
        const externalIDsQueryParameter = queryStringParams.get('externalIDs')?.split(',');
        const gmMapIdQueryParameter = queryStringParams.get('gmMapId');
        const useMapProviderModuleParameter = getBooleanQueryParameter(queryStringParams.get('useMapProviderModule'));
        const kioskOriginLocationIdQueryParameter = queryStringParams.get('kioskOriginLocationId');
        const timeoutQueryParameter = queryStringParams.get('timeout');
        const languageQueryParameter = queryStringParams.get('language');
        const useKeyboardQueryParameter = getBooleanQueryParameter(queryStringParams.get('useKeyboard'));
        const miTransitionLevelQueryParameter = queryStringParams.get('miTransitionLevel');
		const categoryQueryParameter = queryStringParams.get('category');
		const searchAllVenuesParameter = getBooleanQueryParameter(queryStringParams.get('searchAllVenues'));
		const hideNonMatchesQueryParameter = getBooleanQueryParameter(queryStringParams.get('hideNonMatches'));

        setMapTemplateProps({
            apiKey: props.supportsUrlParameters && apiKeyQueryParameter ? apiKeyQueryParameter : (props.apiKey || defaultProps.apiKey),
            venue: props.supportsUrlParameters && venueQueryParameter ? venueQueryParameter : (props.venue || defaultProps.venue),
            locationId: props.supportsUrlParameters && locationIdQueryParameter ? locationIdQueryParameter : props.locationId,
            logo: props.supportsUrlParameters && logoQueryParameter ? logoQueryParameter : (props.logo || defaultProps.logo),
            directionsFrom: props.supportsUrlParameters && directionsFromQueryParameter ? directionsFromQueryParameter : props.directionsFrom,
            directionsTo: props.supportsUrlParameters && directionsToQueryParameter ? directionsToQueryParameter : props.directionsTo,
            tileStyle: props.supportsUrlParameters && tileStyleQueryParameter ? tileStyleQueryParameter : props.tileStyle,
            startZoomLevel: props.supportsUrlParameters && startZoomLevelQueryParameter ? startZoomLevelQueryParameter : props.startZoomLevel,
            pitch: props.supportsUrlParameters && pitchQueryParameter ? pitchQueryParameter : props.pitch,
            bearing: props.supportsUrlParameters && bearingQueryParameter ? bearingQueryParameter : props.bearing,
            gmApiKey: props.supportsUrlParameters && gmApiKeyQueryParameter ? gmApiKeyQueryParameter : props.gmApiKey,
            mapboxAccessToken: props.supportsUrlParameters && mapboxAccessTokenQueryParameter ? mapboxAccessTokenQueryParameter : props.mapboxAccessToken,
            primaryColor: props.supportsUrlParameters && primaryColorQueryParameter ? '#' + primaryColorQueryParameter : (props.primaryColor || defaultProps.primaryColor),
            appUserRoles: props.supportsUrlParameters && appUserRolesQueryParameter ? appUserRolesQueryParameter : props.appUserRoles,
            externalIDs: props.supportsUrlParameters && externalIDsQueryParameter ? externalIDsQueryParameter : props.externalIDs,
            gmMapId: props.supportsUrlParameters && gmMapIdQueryParameter ? gmMapIdQueryParameter : props.gmMapId,
            useMapProviderModule: props.supportsUrlParameters && useMapProviderModuleParameter ? useMapProviderModuleParameter : (props.useMapProviderModule || defaultProps.useMapProviderModule),
            kioskOriginLocationId: props.supportsUrlParameters && kioskOriginLocationIdQueryParameter ? kioskOriginLocationIdQueryParameter : props.kioskOriginLocationId,
            timeout: props.supportsUrlParameters && timeoutQueryParameter ? timeoutQueryParameter : props.timeout,
            language: props.supportsUrlParameters && languageQueryParameter ? languageQueryParameter : props.language,
            supportsUrlParameters: props.supportsUrlParameters,
            useKeyboard: props.supportsUrlParameters && useKeyboardQueryParameter ? useKeyboardQueryParameter : (props.useKeyboard || defaultProps.useKeyboard),
            miTransitionLevel: props.supportsUrlParameters && miTransitionLevelQueryParameter ? miTransitionLevelQueryParameter : props.miTransitionLevel,
			category: props.supportsUrlParameters && categoryQueryParameter ? categoryQueryParameter : props.category,
            searchAllVenues: props.supportsUrlParameters && searchAllVenuesParameter ? searchAllVenuesParameter : (props.searchAllVenues || defaultProps.searchAllVenues),
            hideNonMatches: props.supportsUrlParameters && hideNonMatchesQueryParameter ? hideNonMatchesQueryParameter : (props.hideNonMatches || defaultProps.hideNonMatches),
        });
    }, [props]);

    return (
        <RecoilRoot>
            {mapTemplateProps && <MapTemplate {...mapTemplateProps}></MapTemplate>}
        </RecoilRoot>
    )
}

Sentry.init({
    dsn: "https://0ee7fa162023d958c96db25e99c8ff6c@o351128.ingest.sentry.io/4506851619831808",
    // Set environment to localhost if the url includes it. Otherwise, set to production.
    environment: window.location.hostname === 'localhost' ? 'localhost' : 'production',
    integrations: [
        // See docs for support of different versions of variation of react router
        // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
        // Note: While we don't use React Router in the Map Template project, this is needed to instrument
        // the `/` route properly. Without this, Sentry will not log anything on the main page of this app.
        Sentry.reactRouterV6BrowserTracingIntegration({
            useEffect: React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
        }),
        Sentry.replayIntegration()
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: 1.0,

    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/api\.mapsindoors\.com/],

    // Disable capture Replay for sessions.
    // Set to 100% of sessions with an error
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
});

export default MapsIndoorsMap;

/**
 * Convert query parameter value (which is always a string) into a boolean.
 * It will only accept the string 'true' as a boolean true. Anything else will return false.
 *
 * @param {string} queryParameterValue
 * @return {boolean}
 */
function getBooleanQueryParameter(queryParameterValue) {
    return queryParameterValue === 'true';
}

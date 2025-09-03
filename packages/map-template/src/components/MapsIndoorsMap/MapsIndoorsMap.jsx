import { useEffect, useState } from 'react';
import { RecoilRoot } from 'recoil';
import MapTemplate from '../MapTemplate/MapTemplate.jsx';
import getBooleanValue from '../../helpers/GetBooleanValue.js';
import PropTypes from 'prop-types';

MapsIndoorsMap.propTypes = {
    apiKey: PropTypes.string,
    gmApiKey: PropTypes.string,
    mapboxAccessToken: PropTypes.string,
    venue: PropTypes.string,
    locationId: PropTypes.string,
    primaryColor: PropTypes.string,
    logo: PropTypes.string,
    appUserRoles: PropTypes.arrayOf(PropTypes.string),
    directionsFrom: PropTypes.string,
    directionsTo: PropTypes.string,
    externalIDs: PropTypes.arrayOf(PropTypes.string),
    tileStyle: PropTypes.string,
    startZoomLevel: PropTypes.number,
    pitch: PropTypes.number,
    bearing: PropTypes.number,
    supportsUrlParameters: PropTypes.bool,
    gmMapId: PropTypes.string,
    useMapProviderModule: PropTypes.bool,
    kioskOriginLocationId: PropTypes.string,
    timeout: PropTypes.number,
    language: PropTypes.string,
    useKeyboard: PropTypes.bool,
    miTransitionLevel: PropTypes.number,
    category: PropTypes.string,
    searchAllVenues: PropTypes.bool,
    hideNonMatches: PropTypes.bool,
    showExternalIDs: PropTypes.bool,
    showRoadNames: PropTypes.bool,
    searchExternalLocations: PropTypes.bool,
    center: PropTypes.string,
    useAppTitle: PropTypes.bool,
    showMapMarkers: PropTypes.bool,
    mapboxMapStyle: PropTypes.string,
    devicePosition: PropTypes.object
};

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
 * @param {string} [props.language] - The language to show textual content in. Supported values are "en" for English, "da" for Danish, "de" for German, "fr" for French, "it" for Italian, "es" for Spanish, "nl" for Dutch and "zh" for Chinese. If the prop is not set, the language of the browser will be used (if it is one of the supported languages - otherwise it will default to English).
 * @param {boolean} [props.useKeyboard] - If running the Map Template as a kiosk, set this prop to true and it will prompt a keyboard.
 * @param {number} [props.miTransitionLevel] - The zoom level on which to transition from Mapbox to MapsIndoors data. Default value is 17. This feature is only available for Mapbox.
 * @param {string} [props.category] - If you want to indicate an active category on the map. The value should be the Key (Administrative ID).
 * @param {boolean} [props.searchAllVenues] - If you want to perform search across all venues in the solution.
 * @param {boolean} [props.hideNonMatches] - Determine whether the locations on the map should be filtered (only show the matched locations and hide the rest) or highlighted (show all locations and highlight the matched ones with a red dot by default). If set to true, the locations will be filtered.|
 * @param {boolean} [props.showExternalIDs] - Determine whether the location details on the map should have an external ID visible. The default value is set to false.
 * @param {boolean} [props.showRoadNames] - A boolean parameter that dictates whether Mapbox road names should be shown. By default, Mapbox road names are hidden when MapsIndoors data is shown. It is dictated by `mi-transition-level` which default value is 17.
 * @param {boolean} [props.searchExternalLocations] - If you want to perform search for external results in the Wayfinding mode. If set to true, Mapbox/Google places will be displayed depending on the Map Provider you are using. If set to false, the results returned will only be MapsIndoors results. The default is true.
 * @param {string} [props.center] - Specifies the coordinates where the map should load, represented as longitude and latitude values separated by a comma. If the specified coordinates intersect with a Venue, that Venue will be set as the current Venue.
 * @param {boolean} [props.useAppTitle] - Specifies if the Map Template should set the document title as defined in the App Config. The default value is set to false.
 * @param {boolean} [props.showMapMarkers] - Specifies if the Map Template should show the Map Markers. The default value is set to true.
 * @param {string} [props.mapboxMapStyle] - Specifies the Mapbox Map Style to use. The default value is set to "mapbox://styles/mapbox/standard".
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
            useMapProviderModule: false,
            useKeyboard: false,
            searchAllVenues: false,
            searchExternalLocations: true,
            showExternalIDs: false,
            hideNonMatches: false,
            useAppTitle: false
        };

        const apiKeyQueryParameter = queryStringParams.get('apiKey');
        const venueQueryParameter = queryStringParams.get('venue');
        const locationIdQueryParameter = queryStringParams.get('locationId');
        const logoQueryParameter = queryStringParams.get('logo');
        const directionsFromQueryParameter = queryStringParams.get('directionsFrom');
        const directionsToQueryParameter = queryStringParams.get('directionsTo');
        const tileStyleQueryParameter = queryStringParams.get('tileStyle');
        const startZoomLevelQueryParameter = Number(queryStringParams.get('startZoomLevel'));
        const pitchQueryParameter = Number(queryStringParams.get('pitch'));
        const bearingQueryParameter = Number(queryStringParams.get('bearing'));
        const gmApiKeyQueryParameter = queryStringParams.get('gmApiKey');
        const mapboxAccessTokenQueryParameter = queryStringParams.get('mapboxAccessToken');
        const primaryColorQueryParameter = queryStringParams.get('primaryColor'); // use without '#'. It will be prepended.
        const appUserRolesQueryParameter = queryStringParams.get('appUserRoles')?.split(',');
        const externalIDsQueryParameter = queryStringParams.get('externalIDs')?.split(',');
        const gmMapIdQueryParameter = queryStringParams.get('gmMapId');
        const kioskOriginLocationIdQueryParameter = queryStringParams.get('kioskOriginLocationId');
        const timeoutQueryParameter = Number(queryStringParams.get('timeout'));
        const languageQueryParameter = queryStringParams.get('language');
        const miTransitionLevelQueryParameter = Number(queryStringParams.get('miTransitionLevel'));
        const categoryQueryParameter = queryStringParams.get('category');
        // Boolean query parameters
        const useMapProviderModuleQueryParameter = queryStringParams.get('useMapProviderModule');
        const useKeyboardQueryParameter = queryStringParams.get('useKeyboard');
        const searchAllVenuesQueryParameter = queryStringParams.get('searchAllVenues');
        const hideNonMatchesQueryParameter = queryStringParams.get('hideNonMatches');
        const showExternalIDsQueryParameter = queryStringParams.get('showExternalIDs');
        const showRoadNamesQueryParameter = queryStringParams.get('showRoadNames');
        const searchExternalLocationsQueryParameter = queryStringParams.get('searchExternalLocations');
        const centerQueryParameter = queryStringParams.get('center');
        const useAppTitleQueryParameter = queryStringParams.get('useAppTitle');
        const showMapMarkersQueryParameter = queryStringParams.get('showMapMarkers');
        const mapboxMapStyleQueryParameter = queryStringParams.get('mapboxMapStyle');
        // Set the initial props on the Map Template component.

        // For the apiKey and venue, set the venue to "AUSTINOFFICE" if the apiKey is "mapspeople3d" and no venue is provided. We want this as the default venue for the "mapspeople3d" apiKey.
        const apiKey = props.supportsUrlParameters && apiKeyQueryParameter ? apiKeyQueryParameter : (props.apiKey || defaultProps.apiKey);
        let venue = props.supportsUrlParameters && venueQueryParameter ? venueQueryParameter : (props.venue || defaultProps.venue);
        if (apiKey === 'mapspeople3d' && !venue) {
            venue = 'AUSTINOFFICE';
        }

        setMapTemplateProps({
            apiKey,
            venue,
            locationId: props.supportsUrlParameters && locationIdQueryParameter ? locationIdQueryParameter : props.locationId,
            logo: props.supportsUrlParameters && logoQueryParameter ? logoQueryParameter : props.logo,
            directionsFrom: props.supportsUrlParameters && directionsFromQueryParameter ? directionsFromQueryParameter : props.directionsFrom,
            directionsTo: props.supportsUrlParameters && directionsToQueryParameter ? directionsToQueryParameter : props.directionsTo,
            tileStyle: props.supportsUrlParameters && tileStyleQueryParameter ? tileStyleQueryParameter : props.tileStyle,
            startZoomLevel: props.supportsUrlParameters && startZoomLevelQueryParameter ? startZoomLevelQueryParameter : props.startZoomLevel,
            pitch: props.supportsUrlParameters && pitchQueryParameter ? pitchQueryParameter : props.pitch,
            bearing: props.supportsUrlParameters && bearingQueryParameter ? bearingQueryParameter : props.bearing,
            gmApiKey: props.supportsUrlParameters && gmApiKeyQueryParameter ? gmApiKeyQueryParameter : props.gmApiKey,
            mapboxAccessToken: props.supportsUrlParameters && mapboxAccessTokenQueryParameter ? mapboxAccessTokenQueryParameter : props.mapboxAccessToken,
            primaryColor: props.supportsUrlParameters && primaryColorQueryParameter ? '#' + primaryColorQueryParameter : props.primaryColor,
            appUserRoles: props.supportsUrlParameters && appUserRolesQueryParameter ? appUserRolesQueryParameter : props.appUserRoles,
            externalIDs: props.supportsUrlParameters && externalIDsQueryParameter ? externalIDsQueryParameter : props.externalIDs,
            gmMapId: props.supportsUrlParameters && gmMapIdQueryParameter ? gmMapIdQueryParameter : props.gmMapId,
            kioskOriginLocationId: props.supportsUrlParameters && kioskOriginLocationIdQueryParameter ? kioskOriginLocationIdQueryParameter : props.kioskOriginLocationId,
            timeout: props.supportsUrlParameters && timeoutQueryParameter ? timeoutQueryParameter : props.timeout,
            language: props.supportsUrlParameters && languageQueryParameter ? languageQueryParameter : props.language,
            miTransitionLevel: props.supportsUrlParameters && miTransitionLevelQueryParameter ? miTransitionLevelQueryParameter : props.miTransitionLevel,
            category: props.supportsUrlParameters && categoryQueryParameter ? categoryQueryParameter : props.category,
            center: props.supportsUrlParameters && centerQueryParameter ? centerQueryParameter : props.center,
            devicePosition: props.devicePosition,
            // Handle boolean values
            useKeyboard: getBooleanValue(props.supportsUrlParameters, defaultProps.useKeyboard, props.useKeyboard, useKeyboardQueryParameter),
            useMapProviderModule: getBooleanValue(props.supportsUrlParameters, defaultProps.useMapProviderModule, props.useMapProviderModule, useMapProviderModuleQueryParameter),
            searchAllVenues: getBooleanValue(props.supportsUrlParameters, defaultProps.searchAllVenues, props.searchAllVenues, searchAllVenuesQueryParameter),
            hideNonMatches: getBooleanValue(props.supportsUrlParameters, defaultProps.hideNonMatches, props.hideNonMatches, hideNonMatchesQueryParameter),
            showRoadNames: getBooleanValue(props.supportsUrlParameters, defaultProps.showRoadNames, props.showRoadNames, showRoadNamesQueryParameter),
            showExternalIDs: getBooleanValue(props.supportsUrlParameters, defaultProps.showExternalIDs, props.showExternalIDs, showExternalIDsQueryParameter),
            searchExternalLocations: getBooleanValue(props.supportsUrlParameters, defaultProps.searchExternalLocations, props.searchExternalLocations, searchExternalLocationsQueryParameter),
            supportsUrlParameters: props.supportsUrlParameters,
            useAppTitle: getBooleanValue(props.supportsUrlParameters, defaultProps.useAppTitle, props.useAppTitle, useAppTitleQueryParameter),
            showMapMarkers: getBooleanValue(props.supportsUrlParameters, defaultProps.showMapMarkers, props.showMapMarkers, showMapMarkersQueryParameter),
            mapboxMapStyle: props.supportsUrlParameters && mapboxMapStyleQueryParameter ? mapboxMapStyleQueryParameter : props.mapboxMapStyle,
        });

    }, [props]);

    return (
        <RecoilRoot>
            {mapTemplateProps && <MapTemplate {...mapTemplateProps}></MapTemplate>}
        </RecoilRoot>
    )
}

export default MapsIndoorsMap;
import { useEffect, useState } from 'react';
import { RecoilRoot } from 'recoil';
import MapTemplate from '../MapTemplate/MapTemplate.jsx';
import defaultLogo from "../../assets/logo.svg";
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
            apiKey: '3ddemo',
            venue: 'WEWORK',
            logo: defaultLogo,
            primaryColor: '#005655' // --brand-colors-dark-pine-100 from MIDT
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
            gmMapId: props.supportsUrlParameters && gmMapIdQueryParameter ? gmMapIdQueryParameter : props.gmMapId
        });
    }, [props]);

    return (
        <RecoilRoot>
            {mapTemplateProps && <MapTemplate {...mapTemplateProps}></MapTemplate>}
        </RecoilRoot>
    )
}

export default MapsIndoorsMap;

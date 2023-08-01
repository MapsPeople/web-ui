import { useEffect, useState } from 'react';
import { RecoilRoot } from 'recoil';
import MapTemplate from '../MapTemplate/MapTemplate.jsx';
import defaultLogo from "../../assets/logo.svg";

/**
 *
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map.
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
 * @param {boolean} [props.hasURLParameters] - If you want to support URL Parameters to configure the Map Template.
 */
function MapsIndoorsMap(props) {

    const [mapTemplateProps, setMapTemplateProps] = useState();

    /*
     * Listening for all props.
     * Will use query parameters to pass to the child component is the hasURLParameters prop is set to true.
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
        const gmApiKeyQueryParameter = queryStringParams.get('gmApiKey');
        const mapboxAccessTokenQueryParameter = queryStringParams.get('mapboxAccessToken');
        const primaryColorQueryParameter = queryStringParams.get('primaryColor'); // use without '#'. It will be prepended.

        setMapTemplateProps({
            apiKey: props.hasURLParameters && apiKeyQueryParameter ? apiKeyQueryParameter : (props.apiKey || defaultProps.apiKey),
            venue: props.hasURLParameters && venueQueryParameter ? venueQueryParameter : (props.venue || defaultProps.venue),
            locationId: props.hasURLParameters && locationIdQueryParameter ? locationIdQueryParameter : props.locationId,
            logo: props.hasURLParameters && logoQueryParameter ? logoQueryParameter : (props.logo || defaultProps.logo),
            directionsFrom: props.hasURLParameters && directionsFromQueryParameter ? directionsFromQueryParameter : props.directionsFrom,
            directionsTo: props.hasURLParameters && directionsToQueryParameter ? directionsToQueryParameter : props.directionsTo,
            tileStyle: props.hasURLParameters && tileStyleQueryParameter ? tileStyleQueryParameter : props.tileStyle,
            startZoomLevel: props.hasURLParameters && startZoomLevelQueryParameter ? startZoomLevelQueryParameter : props.startZoomLevel,
            gmApiKey: props.hasURLParameters && gmApiKeyQueryParameter ? gmApiKeyQueryParameter : (props.gmApiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY),
            mapboxAccessToken: props.hasURLParameters && mapboxAccessTokenQueryParameter ? mapboxAccessTokenQueryParameter : (props.mapboxAccessToken || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN),
            primaryColor: props.hasURLParameters && primaryColorQueryParameter ? '#' + primaryColorQueryParameter : (props.primaryColor || defaultProps.primaryColor)
        });
    }, [props]);

    return (
        <RecoilRoot>
            {mapTemplateProps && <MapTemplate {...mapTemplateProps}></MapTemplate>}
        </RecoilRoot>
    )
}

export default MapsIndoorsMap;

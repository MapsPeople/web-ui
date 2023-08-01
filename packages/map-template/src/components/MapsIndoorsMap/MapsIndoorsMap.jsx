import { useEffect, useState } from 'react';
import { RecoilRoot } from 'recoil';
import MapTemplate from '../MapTemplate/MapTemplate.jsx';

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

    useEffect(() => {
        const queryString = window.location.search;
        const queryStringParams = new URLSearchParams(queryString);

        const defaultProps = {
            apiKey: '3ddemo',
            venue: 'WEWORK'
        };

        const apiKeyQueryParameter = queryStringParams.get('apiKey');
        const venueQueryParameter = queryStringParams.get('venue');

        setMapTemplateProps({
            apiKey: props.hasURLParameters && apiKeyQueryParameter ? apiKeyQueryParameter : (props.apiKey || defaultProps.apiKey),
            venue: props.hasURLParameters && venueQueryParameter ? venueQueryParameter : (props.venue || defaultProps.venue)
        });
    }, [props]);

    return (
        <RecoilRoot>
            {mapTemplateProps && <MapTemplate {...mapTemplateProps}></MapTemplate>}
        </RecoilRoot>
    )
}

export default MapsIndoorsMap;

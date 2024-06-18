import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import MapsIndoorsMap from '../src/components/MapsIndoorsMap/MapsIndoorsMap';

/*
 * Exports the MapsIndoorsMap React component as a Web Component.
 */

MapsIndoorsMap.propTypes = {
    apiKey: PropTypes.string.isRequired,
    gmApiKey: PropTypes.string,
    mapboxAccessToken: PropTypes.string,
    venue: PropTypes.string,
    locationId: PropTypes.string,
    primaryColor: PropTypes.string,
    logo: PropTypes.string,
    appUserRoles: PropTypes.string,
    directionsFrom: PropTypes.string,
    directionsTo: PropTypes.string,
    externalIDs: PropTypes.array,
    tileStyle: PropTypes.string,
    startZoomLevel: PropTypes.number,
    gmMapId: PropTypes.string,
    supportsUrlParameters: PropTypes.bool,
    bearing: PropTypes.number,
    pitch: PropTypes.number,
    kioskOriginLocationId: PropTypes.string,
    useMapProviderModule: PropTypes.bool,
    timeout: PropTypes.number,
    miTransitionLevel: PropTypes.number,
    category: PropTypes.string,
    language: PropTypes.string,
    searchAllVenues: PropTypes.bool,
    useKeyboard: PropTypes.bool,
    hideNonMatches: PropTypes.bool,
    skipGo: PropTypes.bool,
    accessibility: PropTypes.bool
};

const WebMapsIndoorsMap = reactToWebComponent(MapsIndoorsMap, React, ReactDOM);
window.customElements.define('mapsindoors-map', WebMapsIndoorsMap);
export default WebMapsIndoorsMap;

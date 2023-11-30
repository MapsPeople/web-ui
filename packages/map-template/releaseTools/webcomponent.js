import React from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import PropTypes from 'prop-types';
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
    kioskOriginLocationId: PropTypes.string
};

const WebMapsIndoorsMap = reactToWebComponent(MapsIndoorsMap, React, ReactDOM);

export default WebMapsIndoorsMap;

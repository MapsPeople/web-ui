import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import MiMap from './src/components/Map/Map';

MiMap.propTypes = {
    apiKey: PropTypes.string.isRequired,
    gmApiKey: PropTypes.string,
    mapboxAccessToken: PropTypes.string,
    venue: PropTypes.string,
    onMapReady: PropTypes.func,
    onLocationClick: PropTypes.func
};

const WebMap = reactToWebComponent(MiMap, React, ReactDOM);
window.customElements.define('mi-map', WebMap);
export default WebMap;

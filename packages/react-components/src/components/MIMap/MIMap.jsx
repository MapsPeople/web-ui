import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MapboxMap from './MapboxMap/MapboxMap';
import GoogleMapsMap from './GoogleMapsMap/GoogleMapsMap';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import './MIMap.scss';

// Define the Custom Elements from our components package.
defineCustomElements();

const mapTypes = {
    Google: 'google',
    Mapbox: 'mapbox'
};

MIMap.propTypes = {
    apiKey: PropTypes.string.isRequired,
    gmApiKey: PropTypes.string,
    mapboxAccessToken: PropTypes.string,
    center: PropTypes.object,
    zoom: PropTypes.number
}

/**
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} props.gmApiKey - Google Maps API key if you want to show a Google Maps map.
 * @param {string} props.mapboxAccessToken - Mapbox Access Token if you want to show a Mapbox map.
 * @param {Object} props.center - Object with latitude and longitude on which the map will center. Example: { lat: 55, lng: 10 }
 * @param {number} props.zoom - Zoom level for the map.
 * @returns
 */
function MIMap({ apiKey, gmApiKey, mapboxAccessToken, center, zoom }) {

    const [mapType, setMapType] = useState();
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();

    useEffect(() => {
        if (apiKey) {
            window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);
        }
    }, [apiKey]);

    const onMapViewInitialized = (mapView) => {
        // Instantiate MapsIndoors instance
        const mi = new window.mapsindoors.MapsIndoors({
            mapView
        });

        // Detect when the mouse hovers over a location and store the hovered location
        // If the location is non-selectable, remove the hovering by calling the unhoverLocation() method.
        mi.on('mouseenter', () => {
            const hoveredLocation = mi.getHoveredLocation()

            if (hoveredLocation?.properties.locationSettings?.selectable === false) {
                mi.unhoverLocation();
            }
        });

         // TODO: Turn off visibility for building outline for demo purposes until the SDK supports Display Rules for Buildings too.
         mi.setDisplayRule(['MI_BUILDING_OUTLINE'], { visible: false });

         setMapsIndoorsInstance(mi);
    }

    /*
     * Determine map type based on the given map provider tokens.
     */
    useEffect(() => {
        if (mapboxAccessToken) {
            setMapType(mapTypes.Mapbox);
        } else {
            setMapType(mapTypes.Google);
        }
    }, [gmApiKey, mapboxAccessToken]);

    return <>
        {mapType === mapTypes.Google && <GoogleMapsMap mapsIndoorsInstance={mapsIndoorsInstance} apiKey={gmApiKey} onInitialized={onMapViewInitialized} center={center} zoom={zoom} />}
        {mapType === mapTypes.Mapbox && <MapboxMap mapsIndoorsInstance={mapsIndoorsInstance} accessToken={mapboxAccessToken} onInitialized={onMapViewInitialized} center={center} zoom={zoom} />}
    </>
}

export default MIMap;

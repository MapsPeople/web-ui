import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Make the global MapsIndoors JavaScript SDK available here
const mapsindoors = window.mapsindoors;

/**
 * Takes care of instantiating a MapsIndoors Mapbox MapView.
 *
 * @param {object} props
 * @param {string} props.mapboxAccessToken - A Mapbox Access Token required for showing the map.
 * @param {function} props.onMapView - A function that is called when the MapView is constructed.
 */
function MapboxMap({ mapboxAccessToken, onMapView }) {

    useEffect(() => {
        // Initialize MapboxView MapView
        window.mapboxgl = mapboxgl;
        const mapViewOptions = {
            accessToken: mapboxAccessToken,
            element: document.getElementById('map')
        };

        const mapViewInstance = new mapsindoors.mapView.MapboxView(mapViewOptions);
        onMapView(mapViewInstance);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because onMapView should never change runtime and changing Mapbox Access Token runtime will give other problems.

    return <div className="map-container" id="map"></div>
}

export default MapboxMap;

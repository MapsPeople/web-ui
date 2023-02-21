import { useEffect } from 'react';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';

// Make the global MapsIndoors JavaScript SDK available here
const mapsindoors = window.mapsindoors;

/**
 * Takes care of instantiating a MapsIndoors Google Maps MapView.
 *
 * @param {object} props
 * @param {string} props.gmApiKey - A Google Maps JS API key required for loading the Google Maps JS API.
 * @param {function} props.onMapView - A function that is called when the MapView is constructed.
 */
function GoogleMapsMap({ gmApiKey, onMapView}) {
    useEffect(() => {

        const loader = new GoogleMapsApiLoader({
            apiKey: gmApiKey,
            version: 'quarterly',
            libraries: ['geometry']
        });

        loader.load().then(google => {
            // Initialize Google Maps MapView
            const mapViewOptions = {
                element: document.getElementById('map'),
                disableDefaultUI: true // Disable Map Type control, Street view control and Zoom controls.
            };

            const mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);
            onMapView(mapViewInstance)
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because onMapView should never change runtime and changing Google Maps API key runtime will give other problems.

    return <div className="map-container" id="map"></div>
}

export default GoogleMapsMap;

import { useEffect, useState } from 'react';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';

// Make the global MapsIndoors JavaScript SDK available here
const mapsindoors = window.mapsindoors;

/**
 * Takes care of instantiating a MapsIndoors Google Maps MapView.
 *
 * @param {object} props
 * @param {string} props.gmApiKey - A Google Maps JS API key required for loading the Google Maps JS API.
 * @param {function} props.onMapView - A function that is called when the MapView is constructed.
 * @param {object} props.mapsIndoorsInstance - Instance of the mapsindoors.MapsIndoors
 */
function GoogleMapsMap({ gmApiKey, onMapView, mapsIndoorsInstance }) {

    const [google, setGoogle] = useState();
    const [mapView, setMapView] = useState();
    const [hasFloorSelector, setHasFloorSelector] = useState(false);

    useEffect(() => {
        const loader = new GoogleMapsApiLoader({
            apiKey: gmApiKey,
            version: 'quarterly',
            libraries: ['geometry']
        });

        loader.load().then(loadedGoogle => {
            setGoogle(loadedGoogle);

            // Initialize Google Maps MapView
            const mapViewOptions = {
                element: document.getElementById('map'),
                disableDefaultUI: true // Disable Map Type control, Street view control and Zoom controls.
            };

            const mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);
            setMapView(mapViewInstance);
            onMapView(mapViewInstance);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because onMapView should never change runtime and changing Google Maps API key runtime will give other problems.

    // Add Floor Selector to the Map when ready.
    useEffect(() => {
        if (mapsIndoorsInstance && mapView && google && !hasFloorSelector) {
            const floorSelectorDiv = document.createElement('div');
            new mapsindoors.FloorSelector(floorSelectorDiv, mapsIndoorsInstance);
            mapView.getMap().controls[google.maps.ControlPosition.RIGHT_TOP].push(floorSelectorDiv);
            setHasFloorSelector(true);
        }
    }, [mapsIndoorsInstance, mapView, google, hasFloorSelector])

    return <div className="map-container" id="map"></div>
}

export default GoogleMapsMap;

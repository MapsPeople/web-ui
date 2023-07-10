import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';
import gmApiKeyState from '../../../atoms/gmApiKeyState';

/**
 * Takes care of instantiating a MapsIndoors Google Maps MapView.
 *
 * @param {object} props
 * @param {function} props.onMapView - A function that is called when the MapView is constructed. Sends the MapView instance and External Directions Provider as payload.
 * @param {function} props.onPositionControl - A function that is called when the MapsIndoors PositionControl is contructed. Will send the PositionControl instance as payload.
 */
function GoogleMapsMap({ onMapView, onPositionControl }) {

    const gmApiKey = useRecoilValue(gmApiKeyState);
    const [google, setGoogle] = useState();
    const [mapView, setMapView] = useState();
    const [hasFloorSelector, setHasFloorSelector] = useState(false);
    const [hasPositionControl, setHasPositionControl] = useState(false);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    useEffect(() => {
        const loader = new GoogleMapsApiLoader({
            apiKey: gmApiKey,
            version: 'quarterly',
            libraries: ['geometry', 'places']
        });

        loader.load().then(loadedGoogle => {
            setGoogle(loadedGoogle);

            // Initialize Google Maps MapView
            const mapViewOptions = {
                element: document.getElementById('map'),
                disableDefaultUI: true, // Disable Map Type control, Street view control and Zoom controls.
                // Always set a center so the map so the bounds or center can be read from the start.
                center: { lat: 0, lng: 0 },
                // Set a large zoom so we prevent a "zoom 0 glitch" (showing the whole globe temporarily)
                zoom: 21
            };

            const mapViewInstance = new window.mapsindoors.mapView.GoogleMapsView(mapViewOptions);
            setMapView(mapViewInstance);

            // Setup an external directions provider that will be used to calculate directions
            // outside MapsIndoors venues.
            const externalDirectionsProvider = new window.mapsindoors.directions.GoogleMapsProvider();

            onMapView(mapViewInstance, externalDirectionsProvider);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because onMapView should never change runtime and changing Google Maps API key runtime will give other problems.

    // Add Floor Selector to the Map when ready.
    useEffect(() => {
        if (mapsIndoorsInstance && mapView && google && !hasFloorSelector) {
            const floorSelectorDiv = document.createElement('div');
            new window.mapsindoors.FloorSelector(floorSelectorDiv, mapsIndoorsInstance);
            mapView.getMap().controls[google.maps.ControlPosition.RIGHT_TOP].push(floorSelectorDiv);
            setHasFloorSelector(true);
        }

        if (mapsIndoorsInstance && mapView && google && !hasPositionControl) {
            const positionControlDiv = document.createElement('div');
            const positionControl = new window.mapsindoors.PositionControl(positionControlDiv, { mapsIndoors: mapsIndoorsInstance });
            mapView.getMap().controls[google.maps.ControlPosition.RIGHT_TOP].push(positionControlDiv);
            setHasPositionControl(true);
            onPositionControl(positionControl);
        }

    }, [mapsIndoorsInstance, mapView, google, hasFloorSelector, hasPositionControl])

    return <div className="map-container" id="map"></div>
}

export default GoogleMapsMap;

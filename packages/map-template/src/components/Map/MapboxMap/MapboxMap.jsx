import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useState } from 'react';

// Make the global MapsIndoors JavaScript SDK available here
const mapsindoors = window.mapsindoors;

/**
 * Takes care of instantiating a MapsIndoors Mapbox MapView.
 *
 * @param {object} props
 * @param {string} props.mapboxAccessToken - A Mapbox Access Token required for showing the map.
 * @param {function} props.onMapView - A function that is called when the MapView is constructed. Sends the MapView instance and External Directions Provider as payload.
 * @param {function} props.onPositionControl - A function that is called when the MapsIndoors PositionControl is contructed. Will send the PositionControl instance as payload.
 * @param {object} props.mapsIndoorsInstance - Instance of the mapsindoors.MapsIndoors
 */
function MapboxMap({ mapboxAccessToken, onMapView, onPositionControl, mapsIndoorsInstance }) {

    const [mapView, setMapView] = useState();
    const [hasFloorSelector, setHasFloorSelector] = useState(false);
    const [hasPositionControl, setHasPositionControl] = useState(false);

    useEffect(() => {
        // Initialize MapboxView MapView
        window.mapboxgl = mapboxgl;
        const mapViewOptions = {
            accessToken: mapboxAccessToken,
            element: document.getElementById('map')
        };

        const mapViewInstance = new mapsindoors.mapView.MapboxView(mapViewOptions);
        setMapView(mapViewInstance);

        // Setup an external directions provider that will be used to calculate directions
        // outside MapsIndoors venues.
        const externalDirectionsProvider = new mapsindoors.directions.MapboxProvider(mapboxAccessToken);

        onMapView(mapViewInstance, externalDirectionsProvider);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because onMapView should never change runtime and changing Mapbox Access Token runtime will give other problems.

    // Add Floor Selector to the Map when ready.
    useEffect(() => {
        if (mapsIndoorsInstance && mapView && !hasFloorSelector) {
            const floorSelectorDiv = document.createElement('div');
            new mapsindoors.FloorSelector(floorSelectorDiv, mapsIndoorsInstance);
            mapView.getMap().addControl({
                onAdd: () => floorSelectorDiv,
                onRemove: () => {
                    floorSelectorDiv.parentNode.removeChild(floorSelectorDiv);
                }
            }, 'top-right');
            setHasFloorSelector(true);
        }

        if (mapsIndoorsInstance && mapView && !hasPositionControl) {
            const positionControlDiv = document.createElement('div');
            const positionControl = new mapsindoors.PositionControl(positionControlDiv, { mapsIndoors: mapsIndoorsInstance });
            mapView.getMap().addControl({
                onAdd: () => positionControlDiv,
                onRemove: () => {
                    positionControlDiv.parentNode.removeChild(positionControlDiv);
                }
            }, 'top-right');
            setHasPositionControl(true);
            onPositionControl(positionControl);
        }
    }, [mapsIndoorsInstance, mapView, hasFloorSelector, hasPositionControl]);

    return <div className="map-container" id="map"></div>
}

export default MapboxMap;
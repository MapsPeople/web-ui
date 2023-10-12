import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import bearingState from '../../../atoms/bearingState';
import mapboxAccessTokenState from '../../../atoms/mapboxAccessTokenState';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import pitchState from '../../../atoms/pitchState';
import primaryColorState from '../../../atoms/primaryColorState';

/**
 * Takes care of instantiating a MapsIndoors Mapbox MapView.
 *
 * @param {object} props
 * @param {function} props.onMapView - A function that is called when the MapView is constructed. Sends the MapView instance and External Directions Provider as payload.
 * @param {function} props.onPositionControl - A function that is called when the MapsIndoors PositionControl is contructed. Will send the PositionControl instance as payload.
 */
function MapboxMap({ onMapView, onPositionControl }) {

    const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);
    const [mapView, setMapView] = useState();
    const [hasFloorSelector, setHasFloorSelector] = useState(false);
    const [hasPositionControl, setHasPositionControl] = useState(false);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const primaryColor = useRecoilValue(primaryColorState);
    const bearing = useRecoilValue(bearingState);
    const pitch = useRecoilValue(pitchState);

    useEffect(() => {
        // Initialize MapboxView MapView
        window.mapboxgl = mapboxgl;
        const mapViewOptions = {
            accessToken: mapboxAccessToken,
            element: document.getElementById('map'),
            bearing: !isNaN(parseInt(bearing)) ? parseInt(bearing) : 0,
            pitch: !isNaN(parseInt(pitch)) ? parseInt(pitch) : 0,
        };

        const mapViewInstance = new window.mapsindoors.mapView.MapboxV3View(mapViewOptions);
        setMapView(mapViewInstance);

        // Setup an external directions provider that will be used to calculate directions
        // outside MapsIndoors venues.
        const externalDirectionsProvider = new window.mapsindoors.directions.MapboxProvider(mapboxAccessToken);

        onMapView(mapViewInstance, externalDirectionsProvider);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because onMapView should never change runtime and changing Mapbox Access Token runtime will give other problems.

    // Add Floor Selector to the Map when ready.
    useEffect(() => {
        if (mapsIndoorsInstance && mapView && !hasPositionControl) {
            const myPositionButtonElement = document.createElement('mi-my-position');
            myPositionButtonElement.mapsindoors = mapsIndoorsInstance;

            mapView.getMap().addControl({
                onAdd: () => myPositionButtonElement,
                onRemove: function () { }
            }, 'top-right');
            setHasPositionControl(true);
            onPositionControl(myPositionButtonElement);
        }

        if (mapsIndoorsInstance && mapView && !hasFloorSelector) {
            const floorSelectorElement = document.createElement('mi-floor-selector');
            floorSelectorElement.mapsindoors = mapsIndoorsInstance;
            floorSelectorElement.primaryColor = primaryColor;

            mapView.getMap().addControl({
                onAdd: () => floorSelectorElement,
                onRemove: function () { floorSelectorElement.parentNode.removeChild(floorSelectorElement); }
            }, 'top-right');

            setHasFloorSelector(true);
        }
    }, [mapsIndoorsInstance, mapView, hasFloorSelector, hasPositionControl]);

    return <div className="map-container" id="map"></div>
}


export default MapboxMap;

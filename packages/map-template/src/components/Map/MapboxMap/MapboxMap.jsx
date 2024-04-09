import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapboxMap.scss';
import mapboxAccessTokenState from '../../../atoms/mapboxAccessTokenState';
import primaryColorState from '../../../atoms/primaryColorState';
import bearingState from '../../../atoms/bearingState';
import pitchState from '../../../atoms/pitchState';
import { v4 as uuidv4 } from 'uuid';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import miTransitionLevelState from '../../../atoms/miTransitionLevelState';
import is3DToggledState from '../../../atoms/is3DToggledState';
import isMapReadyState from '../../../atoms/isMapReadyState';
import VisibilitySwitch from '../../VisibilitySwitch/VisibilitySwitch';
import solutionState from '../../../atoms/solutionState';

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
    const [hasZoomControl, setHasZoomControl] = useState(false);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const primaryColor = useRecoilValue(primaryColorState);
    const bearing = useRecoilValue(bearingState);
    const [pitch, setPitch] = useRecoilState(pitchState);
    const isDesktop = useIsDesktop();
    const miTransitionLevel = useRecoilValue(miTransitionLevelState);
    const is3DToggled = useRecoilValue(is3DToggledState);
    const isMapReady = useRecoilValue(isMapReadyState);
    const solution = useRecoilValue(solutionState);
    const [showVisibilitySwitch, setShowVisibilitySwitch] = useState(false);

    useEffect(() => {
        // Initialize MapboxV3View MapView
        window.mapboxgl = mapboxgl;
        const mapViewOptions = {
            accessToken: mapboxAccessToken,
            element: document.getElementById('map'),
            bearing: !isNaN(parseInt(bearing)) ? parseInt(bearing) : 0,
            pitch: !isNaN(parseInt(pitch)) ? parseInt(pitch) : 0,
        };

        // If miTransitionLevel exists and it's a number, set it in the mapViewOptions
        if (miTransitionLevel && !isNaN(parseInt(miTransitionLevel))) {
            mapViewOptions.mapsIndoorsTransitionLevel = parseInt(miTransitionLevel);
        }

        const mapViewInstance = new window.mapsindoors.mapView.MapboxV3View(mapViewOptions);
        setMapView(mapViewInstance);

        // Setup an external directions provider that will be used to calculate directions
        // outside MapsIndoors venues.
        const externalDirectionsProvider = new window.mapsindoors.directions.MapboxProvider(mapboxAccessToken);

        onMapView(mapViewInstance, externalDirectionsProvider);

        // Generate a UUIDv4 and set the Session Token for searching for Mapbox places.
        const uuid = uuidv4();
        sessionStorage.setItem('mapboxPlacesSessionToken', uuid);

    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because onMapView should never change runtime and changing Mapbox Access Token runtime will give other problems.

    // If the map is ready, check if the 3D features are toggled 
    useEffect(() => {
        if (mapView && mapView.isReady && isMapReady) {
            // Check if the 3D features are switched on
            // Conditionally render either 2D or 3D features depending on the value of is3DToggled
            // Tilt the map to 45 degrees when the 3D features are switched on, and to 0 degrees when the 2D features are switched on.
            if (is3DToggled) {
                mapView.hideFeatures([mapView.MapboxFeatures.MODEL2D, mapView.MapboxFeatures.WALLS2D])

                // If pitch is undefined, set the recoil value to 45 degrees and call the "tilt" method
                if (pitch === undefined) {
                    mapView.tilt(45, 2000);
                    setPitch(45);
                } else
                // Else set the recoil value based on the pitch property and call the "tilt" method
                {
                    mapView.tilt(pitch, 2000);
                    setPitch(pitch);
                }
            } else {
                mapView.hideFeatures([mapView.MapboxFeatures.MODEL3D, mapView.MapboxFeatures.WALLS3D, mapView.MapboxFeatures.EXTRUSION3D, mapView.MapboxFeatures.EXTRUDEDBUILDINGS])
                mapView.tilt(0, 2000);
            }
        }
    }, [mapView, is3DToggled, isMapReady, mapView?.isReady, pitch]);

    /*
     * React on changes to the solution.
     * Decide whether to show the VisibilitySwitch component depending on the modules enabled on the solution.
     */
    useEffect(() => {
        if (solution) {
            const isMapboxModuleEnabled = solution.modules.map(module => module.toLowerCase()).includes('mapbox');
            const is3DWallsModuleEnabled = solution.modules.map(module => module.toLowerCase()).includes('3dwalls');
            // The module floorplan refers to 2D Walls 
            const is2DWallsModuleEnabled = solution.modules.map(module => module.toLowerCase()).includes('floorplan');

            if (isMapboxModuleEnabled && is3DWallsModuleEnabled && is2DWallsModuleEnabled) {
                setShowVisibilitySwitch(true);
            }
        }
    }, [solution]);


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

        if (mapsIndoorsInstance && mapView && !hasZoomControl && isDesktop) {
            mapView
                .getMap()
                .addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

            setHasZoomControl(true);
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
    }, [mapsIndoorsInstance, mapView, hasFloorSelector, hasPositionControl, hasZoomControl]);

    return <>
        <div className="map-container" id="map"></div>
        {showVisibilitySwitch && <VisibilitySwitch />}
    </>
}


export default MapboxMap;

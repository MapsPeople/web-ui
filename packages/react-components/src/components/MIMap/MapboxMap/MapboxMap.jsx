import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapboxMap.scss';
import ViewModeSwitch from './ViewmodeSwitch/ViewModeSwitch';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import isNullOrUndefined from '../../../../../map-template/src/helpers/isNullOrUndefined';

MapboxMap.propTypes = {
    accessToken: PropTypes.string.isRequired,
    onInitialized: PropTypes.func.isRequired,
    onPositionControl: PropTypes.func.isRequired,
    center: PropTypes.object,
    zoom: PropTypes.number,
    bounds: PropTypes.object,
    bearing: PropTypes.number,
    pitch: PropTypes.number,
    resetViewMode: PropTypes.bool,
    mapsIndoorsInstance: PropTypes.object,
    solution: PropTypes.object,
    mapOptions: PropTypes.object
}

/**
 * @param {Object} props
 * @param {string} props.accessToken -  Mapbox Access Token.
 * @param {function} props.onInitialized - Function that is called when the map view is initialized.
 * @param {function} props.onPositionControl - Callback called when the position control is initialized. Payload is the position control.
 * @param {Object} [props.center] - Object with latitude and longitude on which the map will center. Example: { lat: 55, lng: 10 }
 * @param {number} [props.zoom] - Zoom level for the map.
 * @param {object} [props.bounds] - Map bounds. Will win over center+zoom if set. Use the format { south: number, west: number, north: number, east: number }
 * @param {number} [props.bearing] - The bearing of the map (rotation from north) as a number.
 * @param {number} [props.pitch] - The pitch of the map as a number.
 * @param {boolean} [props.resetViewMode] - Set to true to reset the view mode to initial 3D mode.
 * @param {Object} [props.mapsIndoorsInstance] - Instance of MapsIndoors class: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.MapsIndoors.html
 * @param {Object} [props.solution] - The Solution data corresponding to the API key.
 * @param {Object} [props.mapOptions] - Options for instantiating and styling the map.
 */
function MapboxMap({ accessToken, onInitialized, onPositionControl, center, zoom, bounds, bearing, pitch, resetViewMode, mapsIndoorsInstance, solution, mapOptions }) {

    const [mapViewInstance, setMapViewInstance] = useState();
    const [hasFloorSelector, setHasFloorSelector] = useState(false);
    const [hasPositionControl, setHasPositionControl] = useState(false);
    const [hasZoomControl, setHasZoomControl] = useState(false);
    const isDesktop = useIsDesktop();

    /*
     * React on any props that are used to control the position of the map.
     *
     * If the bounds prop is set, it will win over center+zoom.
     */
    useEffect(() => {
        if (!mapViewInstance) return;

        if (!isNullOrUndefined(bounds)) {
            // Bounds will allways win over center+zoom.
            // And we need to take bearing and pitch into the account on the same Mapbox function call.
            mapViewInstance.getMap().fitBounds([bounds.west, bounds.south, bounds.east, bounds.north], {
                pitch: pitch || 0,
                bearing: bearing || 0,
                animate: false,
                padding: mapOptions?.fitBoundsPadding
            });
        } else {
            if (!isNullOrUndefined(center)) {
                mapViewInstance.getMap().setCenter(center);
            }

            if (!isNullOrUndefined(zoom)) {
                mapViewInstance.getMap().setZoom(zoom);
            }

            if (!isNullOrUndefined(bearing)) {
                mapViewInstance.getMap().setBearing(bearing);
            }

            if (!isNullOrUndefined(pitch)) {
                mapViewInstance.getMap().setPitch(pitch);
            }
        }
    }, [mapViewInstance, center, zoom, bearing, pitch, bounds, mapOptions]);


    // Add map controls to the map when ready
    useEffect(() => {
        if (mapsIndoorsInstance && mapViewInstance && !hasPositionControl) {
            const myPositionButtonElement = document.createElement('mi-my-position');
            myPositionButtonElement.mapsindoors = mapsIndoorsInstance;

            mapViewInstance.getMap().addControl({
                onAdd: () => myPositionButtonElement,
                onRemove: function () { }
            }, 'top-right');
            setHasPositionControl(true);
            onPositionControl(myPositionButtonElement);
        }

        if (mapsIndoorsInstance && mapViewInstance && !hasZoomControl && isDesktop) {
            mapViewInstance
                .getMap()
                .addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

            setHasZoomControl(true);
        }

        if (mapsIndoorsInstance && mapViewInstance && !hasFloorSelector) {
            const floorSelectorElement = document.createElement('mi-floor-selector');
            floorSelectorElement.mapsindoors = mapsIndoorsInstance;
            if (mapOptions?.brandingColor) {
                floorSelectorElement.primaryColor = mapOptions.brandingColor;
            }

            mapViewInstance.getMap().addControl({
                onAdd: () => floorSelectorElement,
                onRemove: function () { floorSelectorElement.parentNode.removeChild(floorSelectorElement); }
            }, 'top-right');

            setHasFloorSelector(true);
        }
    }, [mapsIndoorsInstance, mapViewInstance, hasFloorSelector, hasPositionControl, hasZoomControl]);

    useEffect(() => {
        // Initialize MapboxV3View MapView
        window.mapboxgl = mapboxgl;
        const mapViewOptions = {
            accessToken: accessToken,
            element: document.getElementById('map'),
            center: center ?? { lat: 0, lng: 0 }, // The MapsIndoors SDK needs a starting point and a zoom level to avoid timing issues when setting a venue.
            zoom: zoom ?? 15,
            bounds: bounds ? [bounds.west, bounds.south, bounds.east, bounds.north] : undefined,
            bearing: bearing ?? 0,
            pitch: pitch ?? 0,
            ...mapOptions
        };

        const mapView = new window.mapsindoors.mapView.MapboxV3View(mapViewOptions);

        setMapViewInstance(mapView);

        onInitialized(mapView);
    }, []);

    return <div className="mapsindoors-map mapbox-map-container" id="map">
        <ViewModeSwitch reset={resetViewMode} mapView={mapViewInstance} pitch={pitch} activeColor={mapOptions?.brandingColor} solution={solution} />
    </div>
}

export default MapboxMap;

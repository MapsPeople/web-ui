import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapboxMap.scss';
import ViewModeSwitch from './ViewModeSwitch/ViewModeSwitch';
import isNullOrUndefined from '../../../../../map-template/src/helpers/isNullOrUndefined';

MapboxMap.propTypes = {
    accessToken: PropTypes.string.isRequired,
    onInitialized: PropTypes.func.isRequired,
    center: PropTypes.object,
    zoom: PropTypes.number,
    bounds: PropTypes.object,
    bearing: PropTypes.number,
    pitch: PropTypes.number,
    resetViewMode: PropTypes.number,
    mapsIndoorsInstance: PropTypes.object,
    viewModeSwitchVisible: PropTypes.bool,
    mapOptions: PropTypes.object,
    appConfig: PropTypes.object
}

/**
 * @param {Object} props
 * @param {string} props.accessToken -  Mapbox Access Token.
 * @param {function} props.onInitialized - Function that is called when the map view is initialized.
 * @param {Object} [props.center] - Object with latitude and longitude on which the map will center. Example: { lat: 55, lng: 10 }
 * @param {number} [props.zoom] - Zoom level for the map.
 * @param {object} [props.bounds] - Map bounds. Will win over center+zoom if set. Use the format { south: number, west: number, north: number, east: number }
 * @param {number} [props.bearing] - The bearing of the map (rotation from north) as a number.
 * @param {number} [props.pitch] - The pitch of the map as a number.
 * @param {number} [props.resetViewMode] - Increase number to reset the view mode to initial 3D mode.
 * @param {Object} [props.mapsIndoorsInstance] - Instance of MapsIndoors class: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.MapsIndoors.html
 * @param {Object} [props.viewModeSwitchVisible] - Set to true to show the view mode switch.
 * @param {Object} [props.mapOptions] - Options for instantiating and styling the map as well as UI elements.
 * @param {Object} [props.appConfig] - Object that contains app config.
 */
function MapboxMap({ accessToken, onInitialized, center, zoom, bounds, bearing, pitch, resetViewMode, viewModeSwitchVisible, mapOptions, appConfig }) {

    const [mapViewInstance, setMapViewInstance] = useState();

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
            useMapsIndoorsMapboxStyle: mapOptions?.mapboxMapStyle ? false : true,
            ...mapOptions
        };

        // If miTransitionLevel exists and it's a number, set it in the mapViewOptions
        if (mapOptions?.miTransitionLevel && !isNaN(parseInt(mapOptions?.miTransitionLevel))) {
            mapViewOptions.mapsIndoorsTransitionLevel = parseInt(mapOptions.miTransitionLevel);
        }

        // If showRoadNames is not null or undefined, set it as showRoadNames in the mapViewOptions. Comment.
        if (!isNullOrUndefined(mapOptions?.showRoadNames)) {
            mapViewOptions.showRoadNameLabels = mapOptions.showRoadNames;
        }

        // If showMapMarkers is not null or undefined, set it as showMapMarkers in the mapViewOptions.
        if (!isNullOrUndefined(mapOptions?.showMapMarkers)) {
            mapViewOptions.showMapMarkers = mapOptions.showMapMarkers;
        }
        
        const mapView = new window.mapsindoors.mapView.MapboxV3View(mapViewOptions);

        setMapViewInstance(mapView);

        // If mapboxMapStyle is not null or undefined and useMapsIndoorsMapboxStyle is false, set it as mapboxMapStyle in the mapView.
        if (!isNullOrUndefined(mapOptions?.mapboxMapStyle) && !mapViewOptions.useMapsIndoorsMapboxStyle) {
            mapView.getMap().setStyle(mapOptions.mapboxMapStyle);
        }

        onInitialized(mapView);
    }, []);

    return <div className="mapsindoors-map mapbox-map-container" id="map">
        {viewModeSwitchVisible && <ViewModeSwitch reset={resetViewMode} mapView={mapViewInstance} pitch={pitch} activeColor={mapOptions?.brandingColor} show2DModelsIn3D={appConfig?.appSettings?.show2DModelsIn3D} />}
    </div>
}

export default MapboxMap;

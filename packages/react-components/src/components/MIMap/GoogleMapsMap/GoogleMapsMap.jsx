import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';
import './GoogleMapsMap.scss';
import isNullOrUndefined from '../../../../../map-template/src/helpers/isNullOrUndefined';

GoogleMapsMap.propTypes = {
    apiKey: PropTypes.string.isRequired,
    onInitialized: PropTypes.func.isRequired,
    center: PropTypes.object,
    zoom: PropTypes.number,
    bounds: PropTypes.object,
    heading: PropTypes.number,
    tilt: PropTypes.number,
    mapsIndoorsInstance: PropTypes.object,
    mapOptions: PropTypes.object,
    gmMapId: PropTypes.string
}
/**
 * @param {Object} props
 * @param {string} props.apiKey - Google Maps API key.
 * @param {function} props.onInitialized - Function that is called when the map view is initialized.
 * @param {Object} [props.center] - Object with latitude and longitude on which the map will center. Example: { lat: 55, lng: 10 }
 * @param {number} [props.zoom] - Zoom level for the map.
 * @param {object} [props.bounds] - Map bounds. Will win over center+zoom if set. Use the format { south: number, west: number, north: number, east: number }
 * @param {number} [props.heading] - The heading of the map (rotation from north) as a number. Not recommended for maps with 2D Models.
 * @param {number} [props.tilt] - The tilt of the map as a number. Not recommended for maps with 2D Models.
 * @param {Object} [props.mapsIndoorsInstance] - Instance of MapsIndoors class: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.MapsIndoors.html
 * @param {Object} [props.mapOptions] - Options for instantiating and styling the map as well as UI elements.
 * @param {string} [props.gmMapId] - The Google Maps Map ID for custom styling.
 */
function GoogleMapsMap({ apiKey, onInitialized, center, zoom, bounds, heading, tilt, mapsIndoorsInstance, mapOptions, gmMapId }) {

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
            mapsIndoorsInstance.getMapView().fitBounds(bounds, mapOptions?.fitBoundsPadding);
        }

        if (!isNullOrUndefined(center) && isNullOrUndefined(bounds)) {
            mapViewInstance.getMap().setCenter(center);
        }

        if (!isNullOrUndefined(zoom) && isNullOrUndefined(bounds)) {
            mapViewInstance.getMap().setZoom(zoom);
        }

        if (!isNullOrUndefined(heading)) {
            mapViewInstance.getMap().setHeading(heading);
        }

        if (!isNullOrUndefined(tilt)) {
            mapViewInstance.getMap().setTilt(tilt);
        }
    }, [mapViewInstance, center, zoom, heading, tilt, bounds, mapOptions]);

    useEffect(() => {
        const loader = new GoogleMapsApiLoader({
            apiKey: apiKey,
            version: 'quarterly',
            libraries: ['geometry', 'places']
        });

        loader.load().then(() => {

            // Initialize Google Maps MapView
            const mapViewOptions = {
                element: document.getElementById('map'),
                disableDefaultUI: true, // Disable Map Type control, Street view control and Zoom controls.
                center: center ?? { lat: 0, lng: 0 }, // The MapsIndoors SDK needs a starting point and a zoom level to avoid timing issues when setting a venue.
                zoom: zoom ?? 21,
                heading: heading ?? 0,
                tilt: tilt ?? 0,
                mapId: gmMapId,
                gestureHandling: 'greedy',
                ...mapOptions
            };

            // If showMapMarkers is not null or undefined, set it as showMapMarkers in the mapViewOptions.
            if (!isNullOrUndefined(mapOptions?.showMapMarkers)) {
                mapViewOptions.showMapMarkers = mapOptions.showMapMarkers;
            }

            const mapView = new window.mapsindoors.mapView.GoogleMapsView(mapViewOptions);
            setMapViewInstance(mapView);

            onInitialized(mapView);
        });
    }, []);

    return <div className="mapsindoors-map google-maps-map-container" id="map"></div>
}

export default GoogleMapsMap;

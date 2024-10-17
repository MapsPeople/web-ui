import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';
import 'mapbox-gl/dist/mapbox-gl.css';
import './GoogleMapsMap.scss';

GoogleMapsMap.propTypes = {
    apiKey: PropTypes.string.isRequired,
    onInitialized: PropTypes.func.isRequired,
    center: PropTypes.object,
    zoom: PropTypes.number,
    mapsIndoorsInstance: PropTypes.object
}
/**
 * @param {Object} props
 * @param {string} props.apiKey - Google Maps API key.
 * @param {function} props.onInitialized - Function that is called when the map view is initialized.
 * @param {Object} props.center - Object with latitude and longitude on which the map will center. Example: { lat: 55, lng: 10 }
 * @param {number} props.zoom - Zoom level for the map.
 * @param {Object} props.mapsIndoorsInstance - Instance of MapsIndoors class: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.MapsIndoors.html
 */
function GoogleMapsMap({ apiKey, onInitialized, center, zoom, mapsIndoorsInstance }) {

    const [google, setGoogle] = useState();
    const [mapViewInstance, setMapViewInstance] = useState();
    const [hasFloorSelector, setHasFloorSelector] = useState(false);
    const [hasPositionControl, setHasPositionControl] = useState(false);
    const [hasZoomControl, setHasZoomControl] = useState(false);

    useEffect(() => {
        if (!mapViewInstance) return;
        if (center) {
            mapViewInstance.getMap().setCenter(center);
        }
    }, [center]);

    useEffect(() => {
        if (!mapViewInstance) return;
        if (zoom) {
            mapViewInstance.getMap().setZoom(zoom);
        }
    }, [zoom]);

    // Add map controls to the map when ready.
    useEffect(() => {
        if (mapsIndoorsInstance && mapViewInstance && google && !hasPositionControl) {
            const myPositionButtonElement = document.createElement('mi-my-position');
            myPositionButtonElement.mapsindoors = mapsIndoorsInstance;
            mapViewInstance.getMap().controls[google.maps.ControlPosition.RIGHT_TOP].push(myPositionButtonElement);
            setHasPositionControl(true);
            // TODO onPositionControl(myPositionButtonElement);
        }

        if (mapsIndoorsInstance && mapViewInstance && google && !hasFloorSelector) {
            console.log('make floor selector');
            const floorSelectorElement = document.createElement('mi-floor-selector');
            floorSelectorElement.mapsindoors = mapsIndoorsInstance;
            // TODO: Part of mapOptions? floorSelectorElement.primaryColor = primaryColor;

            mapViewInstance.getMap().controls[google.maps.ControlPosition.RIGHT_TOP].push(floorSelectorElement);
            setHasFloorSelector(true);
        }

        if (mapsIndoorsInstance && mapViewInstance && google && !hasZoomControl /* && isDesktop */) {
            // Enable only the Zoom control
            mapViewInstance.getMap().setOptions({
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.DEFAULT,
                    position: google.maps.ControlPosition.RIGHT_TOP,
                }
            });
            setHasZoomControl(true);
        }

    }, [mapsIndoorsInstance, mapViewInstance, google, hasFloorSelector, hasPositionControl])

    useEffect(() => {
        const loader = new GoogleMapsApiLoader({
            apiKey: apiKey,
            version: 'quarterly',
            libraries: ['geometry', 'places']
        });

        loader.load().then(loadedGoogle => {
            setGoogle(loadedGoogle);

            // Initialize Google Maps MapView
            const mapViewOptions = {
                element: document.getElementById('map'),
                disableDefaultUI: true, // Disable Map Type control, Street view control and Zoom controls.
                center: center ?? { lat: 0, lng: 0 }, // The MapsIndoors SDK needs a starting point and a zoom level to avoid timing issues when setting a venue.
                zoom: zoom ?? 21
            };

            const mapView = new window.mapsindoors.mapView.GoogleMapsView(mapViewOptions);

            setMapViewInstance(mapView);

            onInitialized(mapView);
        });
    }, []);

    return <div className="mapsindoors-map google-maps-map-container" id="map"></div>
}

export default GoogleMapsMap;

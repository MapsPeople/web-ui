import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';
import 'mapbox-gl/dist/mapbox-gl.css';
import './GoogleMapsMap.scss';

GoogleMapsMap.propTypes = {
    apiKey: PropTypes.string.isRequired,
    onInitialized: PropTypes.func.isRequired,
    center: PropTypes.object,
    zoom: PropTypes.number
}

function GoogleMapsMap({ apiKey, onInitialized, center, zoom }) {

    const [mapViewInstance, setMapViewInstance] = useState();

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
                zoom: zoom ?? 21
            };

            const mv = new window.mapsindoors.mapView.GoogleMapsView(mapViewOptions);

            setMapViewInstance(mv);

            onInitialized(mv);
        });
    }, []);

    return <div className="google-maps-map-container" id="map"></div>
}

export default GoogleMapsMap;

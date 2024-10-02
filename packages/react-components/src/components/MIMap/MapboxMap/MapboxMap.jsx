import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapboxMap.scss';

MapboxMap.propTypes = {
    accessToken: PropTypes.string.isRequired,
    onInitialized: PropTypes.func.isRequired,
    center: PropTypes.object,
    zoom: PropTypes.number
}

function MapboxMap({ accessToken, onInitialized, center, zoom }) {

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
        // Initialize MapboxV3View MapView
        window.mapboxgl = mapboxgl;
        const mapViewOptions = {
            accessToken: accessToken,
            element: document.getElementById('map'),
            center: center ?? { lat: 0, lng: 0 }, // The MapsIndoors SDK needs a starting point and a zoom level to avoid timing issues when setting a venue.
            zoom: zoom ?? 15
        };

        const mv = new window.mapsindoors.mapView.MapboxV3View(mapViewOptions);

        setMapViewInstance(mv);

        onInitialized(mv);
    }, []);

    return <div className="mapbox-map-container" id="map"></div>
}

export default MapboxMap;

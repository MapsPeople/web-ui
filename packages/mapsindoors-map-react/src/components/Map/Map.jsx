import { useEffect, useState } from "react";
import GoogleMapsMap from "./GoogleMapsMap/GoogleMapsMap";
import MapboxMap from "./MapboxMap/MapboxMap";

const mapsindoors = window.mapsindoors;

const MAP_TYPES = {
    GOOGLE: 'google',
    MAPBOX: 'mapbox'
};

/**
 *
 * @param {Object} props
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map.
 * @param {function} [props.onReady] - Function that will be run when the map is ready
 * @returns
 */
function Map({ gmApiKey, mapboxAccessToken, onReady }) {
    const [mapType, setMapType] = useState();

    useEffect(() => {
        if (mapboxAccessToken) {
            setMapType(MAP_TYPES.MAPBOX);
        } else {
            // A Google Maps map will have precedense if no keys or keys for both providers are set.
            setMapType(MAP_TYPES.GOOGLE);
        }
    }, [gmApiKey, mapboxAccessToken]);

    const onMapView = (mapView) => {
        // Instantiate MapsIndoors instance
        const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
            mapView
        });

        mapsIndoorsInstance.on('ready', onReady);
    };

    return (<div className="full">
        {mapType === MAP_TYPES.GOOGLE && <GoogleMapsMap gmApiKey={gmApiKey} onMapView={onMapView} />}
        {mapType === MAP_TYPES.MAPBOX && <MapboxMap mapboxAccessToken={mapboxAccessToken} onMapView={onMapView} />}
    </div>)
}

export default Map;
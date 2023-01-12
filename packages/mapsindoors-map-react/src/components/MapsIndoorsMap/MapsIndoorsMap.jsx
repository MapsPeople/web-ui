import { useEffect } from 'react';
import { useState } from 'react';
import Map from "../Map/Map";

const mapsindoors = window.mapsindoors;

/**
 *
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Google Maps map.
 */
function MapsIndoorsMap({ apiKey, gmApiKey, mapboxAccessToken }) {

    useEffect(() => {
        mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);
    }, [apiKey]);

    const [isMapReady, setMapReady] = useState(false);

    function onMapReady() {
        setMapReady(true);
    }

    return (<div className="full">
        {/* Splash screen, bottoms sheets, venue selector etc. can be here */}
        <Map apiKey={apiKey} gmApiKey={gmApiKey} mapboxAccessToken={mapboxAccessToken} onReady={onMapReady} />
    </div>)
}

export default MapsIndoorsMap;

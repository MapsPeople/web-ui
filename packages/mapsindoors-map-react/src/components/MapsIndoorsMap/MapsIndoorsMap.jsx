import { useState } from 'react';
import Map from "../Map/Map";
import SplashScreen from '../SplashScreen/SplashScreen';

/**
 *
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Google Maps map.
 * @returns
 */
function MapsIndoorsMap({ apiKey, gmApiKey, mapboxAccessToken }) {

    const [isMapReady, setMapReady] = useState(false);

    function onMapReady() {
        setMapReady(true);
    }

    return (<div>
        {/* Splash screen, bottoms sheets, venue selector etc. can be here */}
        {!isMapReady && <SplashScreen />}
        <Map apiKey={apiKey} gmApiKey={gmApiKey} mapboxAccessToken={mapboxAccessToken} onReady={onMapReady} />
    </div>)
}

export default MapsIndoorsMap;

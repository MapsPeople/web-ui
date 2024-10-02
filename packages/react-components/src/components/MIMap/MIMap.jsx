import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const mapTypes = {
    Google: 'google',
    Mapbox: 'mapbox'
};

MIMap.propTypes = {
    apiKey: PropTypes.string.isRequired,
    gmApiKey: PropTypes.string,
    mapboxAccessToken: PropTypes.string
}

function MIMap({ apiKey, gmApiKey, mapboxAccessToken }) {

    const [mapType, setMapType] = useState();

    useEffect(() => {
        if (apiKey) {
            window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);
        }
    }, [apiKey]);

    /*
     * Determine map type based on the given map provider tokens.
     */
    useEffect(() => {
        if (mapboxAccessToken) {
            setMapType(mapTypes.Mapbox);
        } else {
            setMapType(mapTypes.Google);
        }
    }, [gmApiKey, mapboxAccessToken]);

    return <>
        {mapType === mapTypes.Google && <p>Google Maps</p>}
        {mapType === mapTypes.Mapbox && <p>Mapbox</p>}
    </>
}

export default MIMap;

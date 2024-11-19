import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MapboxMap from './MapboxMap/MapboxMap';
import GoogleMapsMap from './GoogleMapsMap/GoogleMapsMap';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import './MIMap.scss';

const mapTypes = {
    Google: 'google',
    Mapbox: 'mapbox'
};

MIMap.propTypes = {
    apiKey: PropTypes.string.isRequired,
    gmApiKey: PropTypes.string,
    mapboxAccessToken: PropTypes.string,
    center: PropTypes.object,
    zoom: PropTypes.number,
    bounds: PropTypes.object,
    bearing: PropTypes.number,
    pitch: PropTypes.number,
    resetViewMode: PropTypes.bool,
    mapOptions: PropTypes.object,
    onInitialized: PropTypes.func
}

/**
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map.
 * @param {Object} [props.center] - Object with latitude and longitude on which the map will center. Example: { lat: 55, lng: 10 }
 * @param {number} [props.zoom] - Zoom level for the map.
 * @param {object} [props.bounds] - Map bounds. Will win over center+zoom if set. Use the format { south: number, west: number, north: number, east: number }
 * @param {number} [props.bearing] - The bearing of the map (rotation from north) as a number. Not recommended for Google Maps with 2D Models.
 * @param {number} [props.pitch] - The pitch of the map as a number. Not recommended for Google Maps with 2D Models.
 * @param {string} [props.resetViewMode] - For Mapbox only: Reset the view mode to 3D when set to true.
 * @param {Object} [props.mapOptions] - Options for instantiating and styling the map. In addition to map specific options, it can also contain a brandingColor prop (hex string) and a fitBoundsPadding object ({top: number, right: number, bottom: number, left: number }).
 * @param {function} [props.onInitialized] - Callback for when the MapsIndoors instance (https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.MapsIndoors.html) and position control is ready. The instance and position control is given as payload.
 * @returns
 */
function MIMap({ apiKey, gmApiKey, mapboxAccessToken, center, zoom, bounds, bearing, pitch, resetViewMode, mapOptions, onInitialized }) {

    const [mapType, setMapType] = useState();
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();
    const [positionControl, setPositionControl] = useState();
    const [solution, setSolution] = useState();

    useEffect(() => {
        // Make sure to define the MI Components custom elements if they are not already defined.
        // Best way for now is to check that is to check for the existance of one of them in the custom elements registry.
        if (!window.customElements.get('mi-floor-selector')) {
            defineCustomElements();
        }
    }, []);

    useEffect(() => {
        if (apiKey) {
            // Set the MapsIndoors API key in order to load the data for your Solution.
            window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);

            // Load solution config in order to check if the 2D/3D switch should be shown. This is only needed if the map is a Mapbox map.
            if (mapType === mapTypes.Mapbox) {
                window.mapsindoors.services.SolutionsService.getSolution().then(solutionResult => {
                    setSolution(solutionResult);
                });
            }
        }
    }, [apiKey, mapType]);

    const onMapViewInitialized = (mapView) => {
        // Instantiate MapsIndoors instance
        const mi = new window.mapsindoors.MapsIndoors({
            mapView
        });

        // Detect when the mouse hovers over a location and store the hovered location
        // If the location is non-selectable, remove the hovering by calling the unhoverLocation() method.
        mi.on('mouseenter', () => {
            const hoveredLocation = mi.getHoveredLocation()

            if (hoveredLocation?.properties.locationSettings?.selectable === false) {
                mi.unhoverLocation();
            }
        });

        // TODO: Turn off visibility for building outline for demo purposes until the SDK supports Display Rules for Buildings too.
        mi.setDisplayRule(['MI_BUILDING_OUTLINE'], { visible: false });

        setMapsIndoorsInstance(mi);
    }

    /*
     * Execute the onInitialized callback when both the MapsIndoors instance and the position control is ready.
     */
    useEffect(() => {
        if (typeof onInitialized === 'function' && mapsIndoorsInstance && positionControl) {
            onInitialized(mapsIndoorsInstance, positionControl);
        }
    }, [mapsIndoorsInstance, positionControl]);

    /*
     * Determine map type based on the given map provider tokens.
     */
    useEffect(() => {
        if (mapboxAccessToken) {
            setMapType(mapTypes.Mapbox);
        } else if (gmApiKey) {
            setMapType(mapTypes.Google);
        }
    }, [gmApiKey, mapboxAccessToken]);

    return <>
        {mapType === mapTypes.Google && <GoogleMapsMap mapsIndoorsInstance={mapsIndoorsInstance} apiKey={gmApiKey} onInitialized={onMapViewInitialized} onPositionControl={setPositionControl} center={center} zoom={zoom} mapOptions={mapOptions} heading={bearing} tilt={pitch} bounds={bounds} />}
        {mapType === mapTypes.Mapbox && <MapboxMap mapsIndoorsInstance={mapsIndoorsInstance} accessToken={mapboxAccessToken} onInitialized={onMapViewInitialized} onPositionControl={setPositionControl} center={center} zoom={zoom} mapOptions={mapOptions} bearing={bearing} pitch={pitch} bounds={bounds} solution={solution} resetViewMode={resetViewMode} />}
    </>
}

export default MIMap;
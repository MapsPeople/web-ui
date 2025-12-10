import { useEffect, useState, Suspense, lazy, useMemo } from 'react';
import PropTypes from 'prop-types';
import MapControls from './MapControls/MapControls';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import './MIMap.scss';

// Lazy load Mapbox and Google Maps components
const MapboxMap = lazy(() => import('./MapboxMap/MapboxMap'));
const GoogleMapsMap = lazy(() => import('./GoogleMapsMap/GoogleMapsMap'));

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
    resetUICounter: PropTypes.number,
    mapOptions: PropTypes.object,
    onInitialized: PropTypes.func,
    gmMapId: PropTypes.string,
    devicePosition: PropTypes.object,
    isKiosk: PropTypes.bool
}

/**
 * MIMap component: Renders a MapsIndoors map. The map can be either a Google Maps map or a Mapbox map based on the given map provider tokens.
 *
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map.
 * @param {Object} [props.center] - Object with latitude and longitude on which the map will center. Example: { lat: 55, lng: 10 }
 * @param {number} [props.zoom] - Zoom level for the map.
 * @param {object} [props.bounds] - Map bounds. Will win over center+zoom if set. Use the format { south: number, west: number, north: number, east: number }
 * @param {number} [props.bearing] - The bearing of the map (rotation from north) as a number. Not recommended for Google Maps with 2D Models.
 * @param {number} [props.pitch] - The pitch of the map as a number. Not recommended for Google Maps with 2D Models.
 * @param {number} [props.resetUICounter] - Re-render prop. Change value in order (for Mapbox only) to reset the view mode to 3D.
 * @param {Object} [props.mapOptions] - Options for instantiating and styling the map. In addition to map specific options, it can also contain a brandingColor prop (hex string) and a fitBoundsPadding object ({top: number, right: number, bottom: number, left: number }).
 * @param {function} [props.onInitialized] - Callback for when the MapsIndoors instance (https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.MapsIndoors.html)
 *    and position control and knowledge of the View mode switch is ready. The instance, position control and boolean for if the view mode switch is active is given as payload.
 * @param {string} [props.gmMapId] - The Google Maps Map ID for custom styling.
 * @param {object} [props.devicePosition] - Device position object with coords and timestamp for custom positioning.
 * @param {boolean} [props.isKiosk] - Set to true to enable kiosk layout
 */
function MIMap({ apiKey, gmApiKey, mapboxAccessToken, center, zoom, bounds, bearing, pitch, resetUICounter, mapOptions, onInitialized, gmMapId, devicePosition, isKiosk }) {

    const [mapType, setMapType] = useState();
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();
    const [positionControl, setPositionControl] = useState();
    const [viewModeSwitchVisible, setViewModeSwitchVisible] = useState();
    const [solution, setSolution] = useState();
    const [appConfig, setAppConfig] = useState();
    const [mapViewInstance, setMapViewInstance] = useState();

    // Memoize excludedElements to prevent unnecessary re-renders of MapControls
    const excludedElements = useMemo(() => {
        return appConfig?.appSettings?.excludeFromUI || '';
    }, [appConfig?.appSettings?.excludeFromUI]);

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
                // Fetch the App Config
                window.mapsindoors.services.AppConfigService.getConfig()
                    .then(appConfigResult => {
                        setAppConfig(appConfigResult);
                    });
            }
        }
    }, [apiKey, mapType]);

    const onMapViewInitialized = (mapView) => {
        // Set mapViewInstance first so MapControls can use it
        setMapViewInstance(mapView);

        // Instantiate MapsIndoors instance
        const mi = new window.mapsindoors.MapsIndoors({
            mapView
        });

        // Set the venue based on the first building change if the current venue is different than the given building.
        // This is a workaround for the SDK not setting the venue automatically, thus not loading 2D geometry.
        mi.once('building_changed', (building) => {
            const venue = mi.getVenue();
            if (building && venue && building.venueId !== venue.id) {
                mi.setVenue(building.venueId);
            }
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
        if (typeof onInitialized === 'function' && mapsIndoorsInstance && positionControl && typeof viewModeSwitchVisible === 'boolean') {
            onInitialized(mapsIndoorsInstance, positionControl, viewModeSwitchVisible);
        }
    }, [mapsIndoorsInstance, positionControl, viewModeSwitchVisible]);

    /*
     * For Mapbox maps, determine if the View Mode switch should be shown based on the Solution.
     */
    useEffect(() => {
        // If the required modules are enabled, show the Visibility Switch and set the View Mode
        if (solution && mapType === mapTypes.Mapbox && ['mapbox', '3dwalls', 'floorplan'].every(requiredModule => solution.modules.map(module => module.toLowerCase()).includes(requiredModule))) {
            setViewModeSwitchVisible(true);
        } else {
            setViewModeSwitchVisible(false);
        }
    }, [solution, mapType]);

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
        {mapType === mapTypes.Google && (
            <Suspense>
                <GoogleMapsMap
                    mapsIndoorsInstance={mapsIndoorsInstance}
                    apiKey={gmApiKey}
                    onInitialized={onMapViewInitialized}
                    center={center}
                    zoom={zoom}
                    mapOptions={mapOptions}
                    heading={bearing}
                    tilt={pitch}
                    bounds={bounds}
                    gmMapId={gmMapId}
                />
            </Suspense>
        )}
        {mapType === mapTypes.Mapbox && (
            <Suspense>
                <MapboxMap
                    mapsIndoorsInstance={mapsIndoorsInstance}
                    accessToken={mapboxAccessToken}
                    onInitialized={onMapViewInitialized}
                    center={center}
                    zoom={zoom}
                    mapOptions={mapOptions}
                    bearing={bearing}
                    pitch={pitch}
                    bounds={bounds}
                    resetViewMode={resetUICounter}
                    viewModeSwitchVisible={viewModeSwitchVisible}
                    appConfig={appConfig}
                />
            </Suspense>
        )}
        {mapsIndoorsInstance && mapViewInstance && mapType && (
            <MapControls
                mapType={mapType}
                mapsIndoorsInstance={mapsIndoorsInstance}
                mapInstance={mapViewInstance}
                onPositionControl={setPositionControl}
                brandingColor={mapOptions?.brandingColor}
                devicePosition={devicePosition}
                excludedElements={excludedElements}
                isKiosk={isKiosk}
                enableAccessibilityKioskControls={!!appConfig?.appSettings?.enableAccessibilityKioskControls}
            />
        )}
    </>
}

export default MIMap;

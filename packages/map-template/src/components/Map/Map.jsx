import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { mapTypes } from "../../constants/mapTypes";
import useLiveData from '../../hooks/useLivedata';
import GoogleMapsMap from "./GoogleMapsMap/GoogleMapsMap";
import MapboxMap from "./MapboxMap/MapboxMap";
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import userPositionState from '../../atoms/userPositionState';
import directionsServiceState from '../../atoms/directionsServiceState';
import mapTypeState from '../../atoms/mapTypeState';
import apiKeyState from '../../atoms/apiKeyState';
import gmApiKeyState from '../../atoms/gmApiKeyState';
import mapboxAccessTokenState from '../../atoms/mapboxAccessTokenState';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import tileStyleState from '../../atoms/tileStyleState';
import positionControlState from '../../atoms/positionControlState';
import bearingState from '../../atoms/bearingState';
import pitchState from '../../atoms/pitchState';
import solutionState from '../../atoms/solutionState';
import notificationMessageState from '../../atoms/notificationMessageState';
import useMapBoundsDeterminer from '../../hooks/useMapBoundsDeterminer';
import currentVenueNameState from "../../atoms/currentVenueNameState";
import hideNonMatchesState from "../../atoms/hideNonMatchesState";

/**
 * Private variable used for storing the tile style.
 * Implemented due to the impossibility to use the React useState hook.
 */
let _tileStyle;

/**
 * Shows a map.
 *
 * @param {Object} props
 * @param {function} [props.onLocationClick] - Function that is run when a MapsIndoors Location is clicked. the Location will be sent along as first argument.
 * @param {function} props.onVenueChangedOnMap - Function that is run when the map bounds was changed due to fitting to a venue.
 * @param {boolean} props.useMapProviderModule - If you want to use the Map Provider set on your solution in the MapsIndoors CMS, set this to true.
 * @param {function} onMapPositionKnown - Function that is run when the map position is known.
 * @returns
 */
function Map({ onLocationClick, onVenueChangedOnMap, useMapProviderModule, onMapPositionKnown }) {
    const apiKey = useRecoilValue(apiKeyState);
    const gmApiKey = useRecoilValue(gmApiKeyState);
    const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);
    const [mapType, setMapType] = useRecoilState(mapTypeState);
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useRecoilState(mapsIndoorsInstanceState);
    const [, setUserPosition] = useRecoilState(userPositionState);
    const [, setDirectionsService] = useRecoilState(directionsServiceState);
    const filteredLocations = useRecoilValue(filteredLocationsState);
    const filteredLocationsByExternalIDs = useRecoilValue(filteredLocationsByExternalIDState);
    const tileStyle = useRecoilValue(tileStyleState);
    const bearing = useRecoilValue(bearingState);
    const pitch = useRecoilValue(pitchState);
    const [, setPositionControl] = useRecoilState(positionControlState);
    const solution = useRecoilValue(solutionState);
    const [, setErrorMessage] = useRecoilState(notificationMessageState);
    const [, setCurrentVenueName] = useRecoilState(currentVenueNameState);
    const hideNonMatches = useRecoilValue(hideNonMatchesState);

    useLiveData(apiKey);

    const [mapPositionKnown, venueOnMap] = useMapBoundsDeterminer();

    useEffect(() => {
        if (!solution || (gmApiKey === null && mapboxAccessToken === null)) return;

        /*
        Which map type to load (Mapbox or Google Maps) is determined here, based on following decision table:
        (note that some combinations can result in no map being loaded at all)

        -----------------------------------------------------------------------------------------------------------------
        useMapProviderModule     Mapbox module enabled      Mapbox Access Token      Google Maps API key      Map to load
        prop value               on solution                is available             is available
        -----------------------------------------------------------------------------------------------------------------
        true                     ✅                         ✅                       ✅                      Mapbox
        true                     ✅                         ✅                       ❌                      Mapbox
        true                     ✅                         ❌                       ✅                      None
        true                     ✅                         ❌                       ❌                      None
        true                     ❌                         ✅                       ✅                      Google Maps
        true                     ❌                         ✅                       ❌                      None
        true                     ❌                         ❌                       ✅                      Google Maps
        true                     ❌                         ❌                       ❌                      None
        false                    ✅                         ✅                       ✅                      Mapbox
        false                    ✅                         ✅                       ❌                      Mapbox
        false                    ✅                         ❌                       ✅                      Google Maps
        false                    ✅                         ❌                       ❌                      Google Maps
        false                    ❌                         ✅                       ✅                      Mapbox
        false                    ❌                         ✅                       ❌                      Mapbox
        false                    ❌                         ❌                       ✅                      Google Maps
        false                    ❌                         ❌                       ❌                      Google Maps
         */

        let mapTypeToUse;
        const isMapboxModuleEnabled = solution.modules.map(module => module.toLowerCase()).includes('mapbox');

        if (useMapProviderModule) {
            if (isMapboxModuleEnabled) {
                if (mapboxAccessToken) {
                    mapTypeToUse = mapTypes.Mapbox;
                }
            } else {
                if (gmApiKey) {
                    mapTypeToUse = mapTypes.Google;
                }
            }
        } else {
            if (mapboxAccessToken) {
                mapTypeToUse = mapTypes.Mapbox;
            } else {
                mapTypeToUse = mapTypes.Google;
            }
        }

        if (mapTypeToUse) {
            setMapType(mapTypeToUse);
        } else {
            // A good candidate for map type could not be determined.
            setErrorMessage({ text: 'Please provide a Mapbox Access Token or Google Maps API key to show a map.', type: 'error' });
            setMapType(undefined);
        }
    }, [gmApiKey, mapboxAccessToken, solution]);

    /*
     * When map position is known, run callback.
     */
    useEffect(() => {
        if (mapPositionKnown) {
            onMapPositionKnown();
        }
    }, [mapPositionKnown]);

    /*
     * When venue is changed on the map, run callback.
     * Set the current venue name whenever the venue is changed on the map.
     */
    useEffect(() => {
        if (venueOnMap) {
            setCurrentVenueName(venueOnMap.name);
            onVenueChangedOnMap(venueOnMap);
        }
    }, [venueOnMap]);

    /*
     * Dynamically filter or highlight location based on the "filteredLocations", "filteredLocationsByExternalIDs" and "hideNonMatches" property.
     */
    useEffect(() => {
        if (!mapsIndoorsInstance) return;

        // Determine which set of locations to work with
        // If none of the locations are available, return the function
        const locations = filteredLocations || filteredLocationsByExternalIDs;
        if (!locations) return;

        const locationIds = locations.map(location => location.id);

        // Check if the hideNonMatches prop or highlight method in the SDK exists 
        if (hideNonMatches || !mapsIndoorsInstance.highlight) {
            mapsIndoorsInstance.filter(locationIds);
        } else {
            mapsIndoorsInstance.highlight(locationIds);
        }
    }, [filteredLocations, filteredLocationsByExternalIDs, mapsIndoorsInstance, hideNonMatches]);

    /*
     * React to changes in bearing and pitch props and set them on the map if mapsIndoorsInstance exists.
     */
    useEffect(() => {
        if (mapsIndoorsInstance) {
            if (!isNaN(parseInt(pitch))) {
                mapsIndoorsInstance.getMapView().tilt(parseInt(pitch));
            }
            if (!isNaN(parseInt(bearing))) {
                mapsIndoorsInstance.getMapView().rotate(parseInt(bearing));
            }
        }
    }, [bearing, pitch, mapsIndoorsInstance]);

    /**
     * Handle the tile style changes and the locationId property.
     *
     * @param {object} miInstance
     */
    const onBuildingChanged = (miInstance) => {
        onTileStyleChanged(miInstance);
    }

    /**
     * Replace the default tile URL style to the incoming tile style.
     *
     * @param {object} miInstance
     */
    const onTileStyleChanged = (miInstance) => {
        if (miInstance && _tileStyle) {
            let tileURL = miInstance.getTileURL();
            if (tileURL) {
                tileURL = miInstance.getTileURL().replace('default', _tileStyle);

                // Replace the floor placeholder with the actual floor and set the tile URL on the MapView.
                const tileStyleWithFloor = tileURL?.replace('{floor}', miInstance.getFloor());
                miInstance.getMapView().setMapsIndoorsTileURL(tileStyleWithFloor);
            }
        }
    }

    const onMapView = async (mapView, externalDirectionsProvider) => {
        // Instantiate MapsIndoors instance
        const miInstance = new window.mapsindoors.MapsIndoors({
            mapView
        });

        // Detect when the mouse hovers over a location and store the hovered location
        // If the location is non-selectable, remove the hovering by calling the unhoverLocation() method.
        miInstance.on('mouseenter', () => {
            const hoveredLocation = miInstance.getHoveredLocation()

            if (hoveredLocation?.properties.locationSettings?.selectable === false) {
                miInstance.unhoverLocation();
            }
        });

        // TODO: Turn off visibility for building outline for demo purposes until the SDK supports Display Rules for Buildings too.
        miInstance.setDisplayRule(['MI_BUILDING_OUTLINE'], { visible: false });

        miInstance.on('click', location => onLocationClick(location));
        miInstance.once('building_changed', () => onBuildingChanged(miInstance))
        miInstance.on('floor_changed', () => onTileStyleChanged(miInstance));

        setMapsIndoorsInstance(miInstance);

        // Initialize a Directions Service
        const directionsService = new window.mapsindoors.services.DirectionsService(externalDirectionsProvider);
        setDirectionsService(directionsService);
    };

    /**
     * Listen for changes in user position and update state for it.
     *
     * @param {object} positionControl - MapsIndoors PositionControl instance.
     */
    const onPositionControlCreated = positionControl => {
        if (positionControl.nodeName === 'MI-MY-POSITION') {
            // The Web Component needs to set up the listener with addEventListener
            positionControl.addEventListener('position_received', positionInfo => {
                if (positionInfo.detail.accurate === true) {
                    setUserPosition(positionInfo.detail.position);
                }
            });
        } else {
            positionControl.on('position_received', positionInfo => {
                if (positionInfo.accurate === true) {
                    setUserPosition(positionInfo.position);
                }
            });
        }
        setPositionControl(positionControl);
    }

    /*
     * React on changes in the tile style prop.
     */
    useEffect(() => {
        _tileStyle = tileStyle || 'default';
        onTileStyleChanged(mapsIndoorsInstance);
    }, [tileStyle]);

    return (<>
        {mapType === mapTypes.Google && <GoogleMapsMap onMapView={onMapView} onPositionControl={onPositionControlCreated} />}
        {mapType === mapTypes.Mapbox && <MapboxMap onMapView={onMapView} onPositionControl={onPositionControlCreated} />}
    </>)
}

export default Map;

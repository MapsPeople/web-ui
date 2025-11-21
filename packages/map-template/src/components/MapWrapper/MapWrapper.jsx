import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import MIMap from '@mapsindoors/react-components/src/components/MIMap/MIMap';
import { mapTypes } from '../../constants/mapTypes';
import useLiveData from '../../hooks/useLivedata';
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
import hideNonMatchesState from '../../atoms/hideNonMatchesState';
import PropTypes from 'prop-types';
import ViewSelector from '../ViewSelector/ViewSelector';
import LanguageSelector from '../LanguageSelector/LanguageSelector.jsx';
import appConfigState from '../../atoms/appConfigState';
import isNullOrUndefined from '../../helpers/isNullOrUndefined';
import ResetKioskViewButton from '../ResetKioskViewButton/ResetKioskViewButton.jsx';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';

MapWrapper.propTypes = {
    onLocationClick: PropTypes.func,
    onMapPositionKnown: PropTypes.func.isRequired,
    useMapProviderModule: PropTypes.bool.isRequired,
    onMapPositionInvestigating: PropTypes.func.isRequired,
    onViewModeSwitchKnown: PropTypes.func.isRequired,
    resetCount: PropTypes.number.isRequired,
    mapOptions: PropTypes.object,
    gmMapId: PropTypes.string,
    isWayfindingOrDirections: PropTypes.bool,
    currentLanguage: PropTypes.string,
    setLanguage: PropTypes.func,
    devicePosition: PropTypes.object
};

/**
 * Private variable used for storing the tile style.
 * Implemented due to the impossibility to use the React useState hook.
 */
let _tileStyle;

/**
 * A wrapper component around the MIMap component.
 * Contains logic for determining map provider (Google, Mapbox), map options, device position handling and setting up a directions service to use for showing directions.
 *
 * @param {Object} props
 * @param {function} [props.onLocationClick] - Function that is run when a MapsIndoors Location is clicked. the Location will be sent along as first argument.
 * @param {function} props.onMapPositionKnown - Function that is run when the map bounds was changed due to fitting to a Venue or Location.
 * @param {boolean} props.useMapProviderModule - If you want to use the Map Provider set on your solution in the MapsIndoors CMS, set this to true.
 * @param {function} onMapPositionInvestigating - Function that is run when the map position is being determined.
 * @param {function} onViewModeSwitchKnown - Function that is run when the view mode switch is known (if it is to be shown of not).
 * @param {number} resetCount - A counter that is incremented when the map should be reset.
 * @param {object} props.mapOptions - Options for instantiating and styling the map as well as UI elements.
 * @param {string} props.gmMapId - Google Maps Map ID for custom styling.
 * @param {boolean} props.isWayfindingOrDirections - Whether wayfinding or directions is active or not.
 * @param {string} props.currentLanguage - The currently selected language code.
 * @param {function} props.setLanguage - Function to set the selected language.
 * @param {object} [props.devicePosition] - Device position object with coords and timestamp for custom positioning.
 * @returns
 */
function MapWrapper({ onLocationClick, onMapPositionKnown, useMapProviderModule, onMapPositionInvestigating, onViewModeSwitchKnown, resetCount, mapOptions, gmMapId, isWayfindingOrDirections, currentLanguage, setLanguage, devicePosition }) {
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
    const hideNonMatches = useRecoilValue(hideNonMatchesState);
    const appConfig = useRecoilValue(appConfigState);
    const [isViewSelectorVisible, setIsViewSelectorVisible] = useState(false);
    const [isLanguageSelectorVisible, setIsLanguageSelectorVisible] = useState(false);
    const isKiosk = useIsKioskContext();
    useLiveData(apiKey);

    const [mapPositionInvestigating, mapPositionKnown] = useMapBoundsDeterminer();

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
     * When map position is investigating, run callback.
     */
    useEffect(() => {
        if (mapPositionInvestigating) {
            onMapPositionInvestigating();
        }
    }, [mapPositionInvestigating]);

    /*
     * When map position is known, run callback.
     */
    useEffect(() => {
        if (mapPositionKnown) {
            onMapPositionKnown();
        }
    }, [mapPositionKnown]);


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

    /**
     * React when MapsIndoors instance and position control is ready, and setup necessary objects.
     *
     * @param {object} miInstance
     * @param {object} positionControl
     */
    const onInitialized = (miInstance, positionControl, viewModeSwitchVisible) => {
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

        // Assign the miInstance to the mapsIndoorsInstance on the window interface.
        window.mapsIndoorsInstance = miInstance;

        // Create a custom event that is dispatched from the window interface.
        const event = new CustomEvent('mapsIndoorsInstanceAvailable');
        window.dispatchEvent(event);

        // Initialize a Directions Service
        let externalDirectionsProvider;
        if (mapType === mapTypes.Google) {
            externalDirectionsProvider = new window.mapsindoors.directions.GoogleMapsProvider();
        } else if (mapType === mapTypes.Mapbox) {
            externalDirectionsProvider = new window.mapsindoors.directions.MapboxProvider(mapboxAccessToken);
        }
        const directionsService = new window.mapsindoors.services.DirectionsService(externalDirectionsProvider);
        setDirectionsService(directionsService);

        setMapsIndoorsInstance(miInstance);

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

        onViewModeSwitchKnown(viewModeSwitchVisible);
    }

    /*
     * React on changes in the tile style prop.
     */
    useEffect(() => {
        _tileStyle = tileStyle || 'default';
        onTileStyleChanged(mapsIndoorsInstance);
    }, [tileStyle]);

    /**
     * React on changes in appConfig and sets visibility of View Selector and visibility of Language Selector.
     */
    useEffect(() => {
        if (appConfig) {
            if (isNullOrUndefined(appConfig?.appSettings?.viewSelector)) {
                setIsViewSelectorVisible(false);
            } else {
                // Boolean from the App Config comes as a string. We need to return clean boolean value based on that.
                setIsViewSelectorVisible(appConfig?.appSettings?.viewSelector.trim().toLowerCase() === 'true');
            }


            if (isNullOrUndefined(appConfig?.appSettings?.languageSelector)) {
                setIsLanguageSelectorVisible(false);
            } else {
                // Boolean from the App Config comes as a string. We need to return clean boolean value based on that.
                setIsLanguageSelectorVisible(appConfig?.appSettings?.languageSelector.trim().toLowerCase() === 'true');
            }
        }
    }, [appConfig])

    return (<>
        {apiKey && <MIMap
            apiKey={apiKey}
            mapboxAccessToken={mapType === mapTypes.Mapbox ? mapboxAccessToken : undefined}
            gmApiKey={mapType === mapTypes.Google ? gmApiKey : undefined}
            onInitialized={onInitialized}
            resetUICounter={resetCount}
            mapOptions={mapOptions}
            gmMapId={gmMapId}
            devicePosition={devicePosition}
            isKiosk={isKiosk}
        />}
        {/* Pass isWayfindingOrDirections prop to ViewSelector to disable interactions while wayfinding or directions is active*/}
        {apiKey && <>
            <ViewSelector isViewSelectorVisible={isViewSelectorVisible} isViewSelectorDisabled={isWayfindingOrDirections} />
            <LanguageSelector currentLanguage={currentLanguage} setLanguage={setLanguage} isVisible={isLanguageSelectorVisible} />
            <ResetKioskViewButton />
        </>}
    </>)
}

export default MapWrapper;

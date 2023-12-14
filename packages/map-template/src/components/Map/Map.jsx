import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { mapTypes } from "../../constants/mapTypes";
import useLiveData from '../../hooks/useLivedata';
import venuesState from '../../atoms/venuesState';
import GoogleMapsMap from "./GoogleMapsMap/GoogleMapsMap";
import MapboxMap from "./MapboxMap/MapboxMap";
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import userPositionState from '../../atoms/userPositionState';
import directionsServiceState from '../../atoms/directionsServiceState';
import mapTypeState from '../../atoms/mapTypeState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import apiKeyState from '../../atoms/apiKeyState';
import gmApiKeyState from '../../atoms/gmApiKeyState';
import mapboxAccessTokenState from '../../atoms/mapboxAccessTokenState';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import tileStyleState from '../../atoms/tileStyleState';
import startZoomLevelState from '../../atoms/startZoomLevelState';
import positionControlState from '../../atoms/positionControlState';
import locationIdState from '../../atoms/locationIdState';
import bearingState from '../../atoms/bearingState';
import pitchState from '../../atoms/pitchState';
import isLocationClickedState from "../../atoms/isLocationClickedState";
import fitBoundsLocation from "../../helpers/fitBoundsLocation";
import useMediaQuery from "../../hooks/useMediaQuery";
import isMapReadyState from "../../atoms/isMapReadyState";
import getDesktopPaddingLeft from "../../helpers/GetDesktopPaddingLeft";
import getDesktopPaddingBottom from "../../helpers/GetDesktopPaddingBottom";
import getMobilePaddingBottom from "../../helpers/GetMobilePaddingBottom";
import solutionState from '../../atoms/solutionState';
import notificationMessageState from '../../atoms/notificationMessageState';
import kioskLocationState from "../../atoms/kioskLocationState";

const localStorageKeyForVenue = 'MI-MAP-TEMPLATE-LAST-VENUE';

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
 * @returns
 */
function Map({ onLocationClick, onVenueChangedOnMap, useMapProviderModule }) {
    const apiKey = useRecoilValue(apiKeyState);
    const gmApiKey = useRecoilValue(gmApiKeyState);
    const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);
    const [mapType, setMapType] = useRecoilState(mapTypeState);
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useRecoilState(mapsIndoorsInstanceState);
    const [, setUserPosition] = useRecoilState(userPositionState);
    const [, setDirectionsService] = useRecoilState(directionsServiceState);
    const venues = useRecoilValue(venuesState);
    const venueName = useRecoilValue(currentVenueNameState);
    const filteredLocations = useRecoilValue(filteredLocationsState);
    const filteredLocationsByExternalIDs = useRecoilValue(filteredLocationsByExternalIDState);
    const tileStyle = useRecoilValue(tileStyleState);
    const startZoomLevel = useRecoilValue(startZoomLevelState);
    const bearing = useRecoilValue(bearingState);
    const pitch = useRecoilValue(pitchState);
    const [, setPositionControl] = useRecoilState(positionControlState);
    const solution = useRecoilValue(solutionState);
    const locationId = useRecoilValue(locationIdState);
    const isLocationClicked = useRecoilValue(isLocationClickedState);
    const [, setErrorMessage] = useRecoilState(notificationMessageState);
    const kioskLocation = useRecoilValue(kioskLocationState);

    const isMapReady = useRecoilValue(isMapReadyState);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    useLiveData(apiKey);

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
     * React to changes in the venue prop.
     */
    useEffect(() => {
        if (mapsIndoorsInstance) {
            window.localStorage.removeItem(localStorageKeyForVenue);
            const venueToShow = getVenueToShow(venueName, venues);
            if (venueToShow && !isLocationClicked && !locationId && !kioskLocation) {
                setVenue(venueToShow, mapsIndoorsInstance).then(() => {
                    onVenueChangedOnMap(venueToShow);
                });
            } else if (venueToShow && !isLocationClicked && !locationId && kioskLocation && !isDesktop) {
                setVenue(venueToShow, mapsIndoorsInstance).then(() => {
                    onVenueChangedOnMap(venueToShow);
                });
            } else if (venueToShow) {
                onVenueChangedOnMap(venueToShow);
            }
        }
    }, [venueName, venues, startZoomLevel]); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because mapsIndoorsInstance should never change runtime anyway.

    /*
     * Show the filtered locations on the map based on their IDs or external IDs if present.
     * Check if the highlight or filter methods exist.
     */
    useEffect(() => {
        if (mapsIndoorsInstance) {
            if (filteredLocations) {
                if (mapsIndoorsInstance.highlight) {
                    mapsIndoorsInstance.highlight(filteredLocations.map(location => location.id));
                } else if (mapsIndoorsInstance.filter) {
                    mapsIndoorsInstance.filter(filteredLocations.map(location => location.id));
                }
            } else if (filteredLocationsByExternalIDs) {
                if (mapsIndoorsInstance.highlight) {
                    mapsIndoorsInstance.highlight(filteredLocationsByExternalIDs.map(location => location.id));
                } else if (mapsIndoorsInstance.filter) {
                    mapsIndoorsInstance.filter(filteredLocationsByExternalIDs.map(location => location.id));
                }
            }
        }
    }, [filteredLocations, filteredLocationsByExternalIDs, mapsIndoorsInstance]);

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
     * Set the venue to show on the map.
     *
     * @param {object} venue
     * @param {object} mapsIndoorsInstance
     */
    const setVenue = (venue, mapsIndoorsInstance) => {
        window.localStorage.setItem(localStorageKeyForVenue, venue.name);
        return mapsIndoorsInstance.fitVenue(venue).then(() => {
            // Set the map zoom level if the property is provided.
            if (startZoomLevel) {
                mapsIndoorsInstance.setZoom(parseInt(startZoomLevel));
            }
            // Set the map pitch if the property is provided.
            if (!isNaN(parseInt(pitch))) {
                mapsIndoorsInstance.getMapView().tilt(parseInt(pitch));
            }
            // Set the map bearing if the property is provided.
            if (!isNaN(parseInt(bearing))) {
                mapsIndoorsInstance.getMapView().rotate(parseInt(bearing));
            }
        });
    }

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

        // TODO: Turn off visibility for building outline for demo purposes until the SDK supports Display Rules for Buildings too.
        miInstance.setDisplayRule(['MI_BUILDING_OUTLINE'], { visible: false });

        miInstance.on('click', location => onLocationClick(location));
        miInstance.once('building_changed', () => onBuildingChanged(miInstance))
        miInstance.on('floor_changed', () => onTileStyleChanged(miInstance));

        setMapsIndoorsInstance(miInstance);

        // Initialize a Directions Service
        const directionsService = new window.mapsindoors.services.DirectionsService(externalDirectionsProvider);
        setDirectionsService(directionsService);

        const venueToShow = getVenueToShow(venueName, venues);
        if (venueToShow && !locationId && !kioskLocation) {
            setVenue(venueToShow, miInstance);
        } else if (venueToShow && !locationId && kioskLocation && !isDesktop) {
            setVenue(venueToShow, miInstance);
        }
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

    /*
     * React on changes in the kioskLocation and locationId.
     */
    useEffect(() => {
        if (isMapReady && mapsIndoorsInstance) {
            // If kioskLocation prop is present, set the display rule for the kiosk location.
            // Set the icon size representing the kiosk to be double the size.
            // Set the floor based on the floor that the kiosk is located on.
            // Fit the map to the kiosk location bounds and add the padding calculated based on the modal.
            if (kioskLocation && isDesktop) {
                const displayRule = mapsIndoorsInstance.getDisplayRule(kioskLocation);

                displayRule.visible = true;
                displayRule.iconSize = { width: displayRule.iconSize.width * 2, height: displayRule.iconSize.height * 2 };
                displayRule.iconVisible = true;
                displayRule.zoomFrom = 0;
                displayRule.zoomTo = 999;
                displayRule.clickable = false;
                mapsIndoorsInstance.setDisplayRule(kioskLocation.id, displayRule);

                const locationFloor = kioskLocation.properties.floor;
                mapsIndoorsInstance.setFloor(locationFloor);

                fitBoundsLocation(kioskLocation, mapsIndoorsInstance, getDesktopPaddingBottom(), 0, startZoomLevel, pitch, bearing);
            } else if (locationId) {
                window.mapsindoors.services.LocationsService.getLocation(locationId).then(location => {
                    if (location) {
                        // Set the floor to the one that the location belongs to.
                        const locationFloor = location.properties.floor;
                        mapsIndoorsInstance.setFloor(locationFloor);

                        // Fit the map to the location bounds and add the padding calculated based on the modal.
                        fitBoundsLocation(location, mapsIndoorsInstance, isDesktop ? 0 : getMobilePaddingBottom(), isDesktop ? getDesktopPaddingLeft() : 0, startZoomLevel, pitch, bearing);
                    }
                });
            }
        }
    }, [kioskLocation, locationId, isMapReady, startZoomLevel, pitch, bearing]);

    return (<>
        {mapType === mapTypes.Google && <GoogleMapsMap onMapView={onMapView} onPositionControl={onPositionControlCreated} />}
        {mapType === mapTypes.Mapbox && <MapboxMap onMapView={onMapView} onPositionControl={onPositionControlCreated} />}
    </>)
}

export default Map;

/**
 * Get the venue to show initally on the map.
 *
 * @param {string} preferredVenueName
 * @param {array} venues
 * @returns {object} - venue
 */
function getVenueToShow(preferredVenueName, venues) {
    if (venues.length === 0) return;

    // If there's only one venue, early return with that.
    if (venues.length === 1) {
        return venues[0];
    }

    // If last selected venue is set in localStorage, use that.
    const lastSetVenue = window.localStorage.getItem(localStorageKeyForVenue);
    if (lastSetVenue) {
        const venue = venues.find(v => v.name === lastSetVenue);
        if (venue) {
            return venue;
        }
    }

    // If venue parameter is set on the component, use that.
    if (preferredVenueName) {
        const venue = venues.find(v => v.name === preferredVenueName);
        if (venue) {
            return venue;
        }
    }

    // Else take first venue sorted alphabetically
    return [...venues].sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); })[0];
}
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
import useSetMaxZoomLevel from '../../hooks/useSetMaxZoomLevel';
import bearingState from '../../atoms/bearingState';
import pitchState from '../../atoms/pitchState';
import isLocationClickedState from "../../atoms/isLocationClickedState";

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
 * @returns
 */
function Map({ onLocationClick, onVenueChangedOnMap }) {
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
    const locationId = useRecoilValue(locationIdState);
    const isLocationClicked = useRecoilValue(isLocationClickedState);

    const setMaxZoomLevel = useSetMaxZoomLevel();

    useLiveData(apiKey);

    useEffect(() => {
        if (gmApiKey === null && mapboxAccessToken === null) return;

        if (mapboxAccessToken) {
            setMapType(mapTypes.Mapbox);
        } else {
            // A Google Maps map will have precedense if no keys or keys for both providers are set.
            setMapType(mapTypes.Google);
        }
    }, [gmApiKey, mapboxAccessToken]);

    /*
     * React to changes in the venue prop.
     */
    useEffect(() => {
        if (mapsIndoorsInstance) {
            window.localStorage.removeItem(localStorageKeyForVenue);
            const venueToShow = getVenueToShow(venueName, venues);
            if (venueToShow && !locationId && !isLocationClicked) {
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
        onLocationIdChanged(miInstance)
    }

    /**
     * If the locationId property is present, set the correct floor, center and zoom the map.
     *
     * @param {object} miInstance
     */
    const onLocationIdChanged = (miInstance) => {
        if (locationId && miInstance) {
            window.mapsindoors.services.LocationsService.getLocation(locationId).then(location => {
                if (location) {
                    // Set the floor to the one that the location belongs to.
                    const locationFloor = location.properties.floor;
                    miInstance.setFloor(locationFloor);

                    // Center the map to the location coordinates.
                    const locationGeometry = location.geometry.type === 'Point' ? location.geometry.coordinates : location.properties.anchor.coordinates;
                    miInstance.getMapView().setCenter({ lat: locationGeometry[1], lng: locationGeometry[0] });

                    // If there is a startZoomLevel, set the map zoom to that
                    // Else call the function to check the max zoom level supported on the solution
                    if (startZoomLevel) {
                        miInstance?.setZoom(startZoomLevel);
                    } else {
                        setMaxZoomLevel();
                    }
                }
            });
        }
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
        if (venueToShow && !locationId) {
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
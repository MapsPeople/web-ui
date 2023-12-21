import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { calculateBounds } from '../helpers/CalculateBounds';
import getDesktopPaddingBottom from '../helpers/GetDesktopPaddingBottom';
import { mapTypes } from '../constants/mapTypes';

// Recoil atoms
import bearingState from '../atoms/bearingState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import kioskOriginLocationIdState from '../atoms/kioskOriginLocationIdState';
import locationIdState from '../atoms/locationIdState';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import mapTypeState from '../atoms/mapTypeState';
import pitchState from '../atoms/pitchState';
import startZoomLevelState from '../atoms/startZoomLevelState';
import venuesState from '../atoms/venuesState';
import useMediaQuery from './useMediaQuery';
import getMobilePaddingBottom from '../helpers/GetMobilePaddingBottom';
import getDesktopPaddingLeft from '../helpers/GetDesktopPaddingLeft';

import { useInactive } from './useInactive';

/**
 * TODO: Describe
 */
const useMapPositionDeterminer = () => {
    const [mapAlmostReady, setMapAlmostReady] = useState(false);
    const [venueOnMap, setVenueOnMap] = useState();

    const isDesktop = useMediaQuery('(min-width: 992px)');
    const isInactive = useInactive();

    const bearing = useRecoilValue(bearingState);
    const kioskOriginLocationId = useRecoilValue(kioskOriginLocationIdState);
    const locationId = useRecoilValue(locationIdState);
    const mapType = useRecoilValue(mapTypeState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const pitch = useRecoilValue(pitchState);
    const startZoomLevel = useRecoilValue(startZoomLevelState);
    const venueName = useRecoilValue(currentVenueNameState);
    const venues = useRecoilValue(venuesState);

    useEffect(() => {
        if (isInactive) {
            console.log('Please reset the map position');
            // TODO: Reset map position. My vision is that when this changes to false, the big useEffect shall run. But how?
        }
    }, [isInactive]);

    /*
     * Based on the combination of the states for venueName, locationId & kioskOriginLocationId,
    * determine where to make the pan go to.
     */
    useEffect(() =>  {
        if (mapsIndoorsInstance && venues.length) {
            if (kioskOriginLocationId && isDesktop) {
                const venueToShow = getVenueToShow(venueName, venues);
                setMapAlmostReady(true);

                window.mapsindoors.services.LocationsService.getLocation(kioskOriginLocationId).then(kioskLocation => {
                    if (kioskLocation) {
                        // Set the floor to the one that the Location belongs to.
                        const locationFloor = kioskLocation.properties.floor;
                        mapsIndoorsInstance.setFloor(locationFloor);
                        setKioskDisplayRule(kioskLocation);

                        getDesktopPaddingBottom().then(desktopPaddingBottom => {
                            setVenueOnMap(venueToShow);
                            // TODO: Determine map type and implement a googleMapsPanner
                            // TODO: What about mobile?
                            goTo(mapType, kioskLocation.geometry, mapsIndoorsInstance, desktopPaddingBottom, 0, startZoomLevel, pitch, bearing);
                        });
                    }
                });
            } else if (locationId) {
                const venueToShow = getVenueToShow(venueName, venues);
                setMapAlmostReady(true);
                window.mapsindoors.services.LocationsService.getLocation(locationId).then(location => {
                    if (location) {
                        // Set the floor to the one that the Location belongs to.
                        const locationFloor = location.properties.floor;
                        mapsIndoorsInstance.setFloor(locationFloor);

                        getDesktopPaddingLeft().then(desktopPaddingLeft => {
                            setVenueOnMap(venueToShow);
                            // TODO: Determine map type and implement a googleMapsPanner
                            // TODO: What about mobile?
                            goTo(mapType, location.geometry, mapsIndoorsInstance, isDesktop ? 0 : getMobilePaddingBottom(), isDesktop ? desktopPaddingLeft : 0, startZoomLevel, pitch, bearing);
                        });


                    }
                });
            } else if (venueName) {
                const venueToShow = getVenueToShow(venueName, venues);
                setMapAlmostReady(true);
                getDesktopPaddingBottom().then(desktopPaddingBottom => {
                    setVenueOnMap(venueToShow);
                    // TODO: Determine map type and implement a googleMapsPanner
                    // TODO: What about mobile?
                    goTo(mapType, venueToShow.geometry, mapsIndoorsInstance, desktopPaddingBottom, 0, startZoomLevel, pitch, bearing);
                });
            }

            function setKioskDisplayRule(kioskLocation) {
                const displayRule = mapsIndoorsInstance.getDisplayRule(kioskLocation);

                displayRule.visible = true;
                displayRule.iconSize = { width: displayRule.iconSize.width * 2, height: displayRule.iconSize.height * 2 }; // TODO: The icon is doubled every time the useeffect runs. Fix that.
                displayRule.iconVisible = true;
                displayRule.zoomFrom = 0;
                displayRule.zoomTo = 999;
                displayRule.clickable = false;
                mapsIndoorsInstance.setDisplayRule(kioskLocation.id, displayRule);
            }
        }
    }, [mapsIndoorsInstance, venueName, venues, locationId, kioskOriginLocationId, pitch, bearing, startZoomLevel])

    return [mapAlmostReady, venueOnMap];
};

export default useMapPositionDeterminer;

const localStorageKeyForVenue = 'MI-MAP-TEMPLATE-LAST-VENUE';


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

function goTo(mapType, geometry, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing) {
    if (mapType === mapTypes.Google) {
        googleMapsGoTo(geometry, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing)
    } else if (mapType === mapTypes.Mapbox) {
        mapboxGoto(geometry, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing);
    }
}


/**
 *
 * @param {GeoJSON.Geometry} geometry
 * @param {object} mapsIndoorsInstance
 * @param {number} paddingBottom
 * @param {number} paddingLeft
 * @param {number|undefined} zoomLevel
 * @param {number|undefined} pitch
 * @param {number|undefined} bearing
 */
function mapboxGoto(geometry, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing) {
    const mapboxMap = mapsIndoorsInstance.getMap();
    const bounds = calculateBounds(geometry);

    // We use the Mapbox fitBounds instead of MapsIndoors MapView fitBounds since we
    // need to be able to use pitch and bearing in one go,
    // and we want to turn of panning animation.
    mapboxMap.fitBounds(bounds, {
        pitch: pitch || 0,
        bearing: bearing || 0,
        animate: false,
        padding: { top: 0, right: 0, bottom: paddingBottom, left: paddingLeft }
    });

    if (zoomLevel) {
        mapsIndoorsInstance.setZoom(zoomLevel);
    }
};

function googleMapsGoTo(geometry, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing) {
    const locationBbox = calculateBounds(geometry)
    let coordinates = { west: locationBbox[0], south: locationBbox[1], east: locationBbox[2], north: locationBbox[3] }
    // Fit map to the bounds of the location coordinates, and add padding.
    // There is no way to combine this call with bearing and pitch, so those will be called consecutively.
    mapsIndoorsInstance.getMapView().fitBounds(coordinates, { top: 0, right: 0, bottom: paddingBottom, left: paddingLeft });

    // Set the map zoom level if the property is provided.
    if (zoomLevel) {
        mapsIndoorsInstance.setZoom(parseInt(zoomLevel));
    }

    // Set the map pitch if the property is provided.
    if (!isNaN(parseInt(pitch))) {
        mapsIndoorsInstance.getMapView().tilt(parseInt(pitch));
    }

    // Set the map bearing if the property is provided.
    if (!isNaN(parseInt(bearing))) {
        mapsIndoorsInstance.getMapView().rotate(parseInt(bearing));
    }
}

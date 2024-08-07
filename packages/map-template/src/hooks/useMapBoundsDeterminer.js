import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { calculateBounds } from '../helpers/CalculateBounds';
import getDesktopPaddingBottom from '../helpers/GetDesktopPaddingBottom';
import { mapTypes } from '../constants/mapTypes';

// Recoil atoms
import bearingState from '../atoms/bearingState';
import categoriesState from '../atoms/categoriesState';
import kioskOriginLocationIdState from '../atoms/kioskOriginLocationIdState';
import locationIdState from '../atoms/locationIdState';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import mapTypeState from '../atoms/mapTypeState';
import pitchState from '../atoms/pitchState';
import startZoomLevelState from '../atoms/startZoomLevelState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import venueWasSelectedState from '../atoms/venueWasSelectedState';

// Hooks
import getMobilePaddingBottom from '../helpers/GetMobilePaddingBottom';
import getDesktopPaddingLeft from '../helpers/GetDesktopPaddingLeft';
import { useInactive } from './useInactive';
import { useIsDesktop } from './useIsDesktop';

// Selectors
import currentPitchSelector from '../selectors/currentPitch';

/**
 * Determine where in the world to pan the map, based on the combination of venueName, locationId and kioskOriginLocationId.
 *
 * Returns two state variables:
 * - mapPositionInvestigating is set to true when map position is investigating. This is used to instruct the Map Template to start showing UI elements.
 * - mapPositionKnown is set to instruct the Map Template that the map is now ready to be shown to the user.
 */
const useMapBoundsDeterminer = () => {
    const [mapPositionInvestigating, setMapPositionInvestigating] = useState(false);
    const [mapPositionKnown, setMapPositionKnown] = useState(false);

    const isDesktop = useIsDesktop();
    const isInactive = useInactive();

    const bearing = useRecoilValue(bearingState);
    const categories = useRecoilValue(categoriesState);
    const kioskOriginLocationId = useRecoilValue(kioskOriginLocationIdState);
    const locationId = useRecoilValue(locationIdState);
    const mapType = useRecoilValue(mapTypeState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const pitch = useRecoilValue(pitchState);
    const startZoomLevel = useRecoilValue(startZoomLevelState);
    const currentVenueName = useRecoilValue(currentVenueNameState);
    const venuesInSolution = useRecoilValue(venuesInSolutionState);
    const currentPitch = useRecoilValue(currentPitchSelector);
    const venueWasSelected = useRecoilValue(venueWasSelectedState);
    const [kioskLocationDisplayRuleWasChanged, setKioskLocationDisplayRuleWasChanged] = useState(false);

    /**
     * If the app is inactive, run code to reset to initial map position.
     */
    useEffect(() => {
        if (isInactive) {
            determineMapBounds();
        }
    }, [isInactive]);

    /*
     * When relevant state changes, run code to go to a location in the world.
     */
    useEffect(() =>  {
        determineMapBounds();
    }, [mapsIndoorsInstance, currentVenueName, locationId, kioskOriginLocationId, pitch, bearing, startZoomLevel, categories]);

    /**
     * Based on the combination of the states for venueName, locationId & kioskOriginLocationId,
     * determine where to make the map go to.
     */
    function determineMapBounds() {
        const currentVenue = venuesInSolution.find(venue => venue.name.toLowerCase() === currentVenueName.toLowerCase());
        if (mapsIndoorsInstance && currentVenue) {
            setMapPositionInvestigating(true);

            if (kioskOriginLocationId && isDesktop) {
                // When in Kiosk mode (which can only happen on desktop), the map is fitted to the bounds of the given Location with some bottom padding to accommodate
                // for the bottom-centered modal.
                window.mapsindoors.services.LocationsService.getLocation(kioskOriginLocationId).then(kioskLocation => {
                    if (kioskLocation) {
                        // Set the floor to the one that the Location belongs to.
                        const locationFloor = kioskLocation.properties.floor;
                        mapsIndoorsInstance.setFloor(locationFloor);
                        setKioskDisplayRule(kioskLocation);

                        getDesktopPaddingBottom().then(desktopPaddingBottom => {
                            setMapPositionKnown(kioskLocation.geometry);
                            goToGeometry(mapType, kioskLocation.geometry, mapsIndoorsInstance, desktopPaddingBottom, 0, startZoomLevel, currentPitch, bearing);
                        });
                    }
                });
            } else if (locationId && !venueWasSelected) {
                // When a LocationID is set, the map is centered fitted to the bounds of the given Location with some padding,
                // either bottom (on mobile to accommodate for the bottom sheet) or to the left (on desktop to accommodate for the modal).
                window.mapsindoors.services.LocationsService.getLocation(locationId).then(location => {
                    if (location) {
                        // Set the floor to the one that the Location belongs to.
                        const locationFloor = location.properties.floor;
                        mapsIndoorsInstance.setFloor(locationFloor);

                        if (isDesktop) {
                            getDesktopPaddingLeft().then(desktopPaddingLeft => {
                                setMapPositionKnown(location.geometry);
                                goToGeometry(mapType, location.geometry, mapsIndoorsInstance, 0, desktopPaddingLeft, startZoomLevel, currentPitch, bearing);
                            });
                        } else {
                            getMobilePaddingBottom().then(mobilePaddingBottom => {
                                setMapPositionKnown(location.geometry);
                                goToGeometry(mapType, location.geometry, mapsIndoorsInstance, mobilePaddingBottom, 0, startZoomLevel, currentPitch, bearing);
                            });
                        }
                    }
                });
            } else if (currentVenue) {
                // When showing a venue, the map is fitted to the bounds of the Venue with no padding.
                setMapPositionKnown(currentVenue.geometry);
                goToGeometry(mapType, currentVenue.geometry, mapsIndoorsInstance, 0, 0, startZoomLevel, currentPitch, bearing);
            }
        }
    }

    /**
     * Override Display Rule for the Kiosk Location for better visibility.
     *
     * @param {object} kioskLocation
     */
    function setKioskDisplayRule(kioskLocation) {
        if (kioskLocationDisplayRuleWasChanged) return; // Don't set Display Rule more than once.

        const displayRule = mapsIndoorsInstance.getDisplayRule(kioskLocation);

        displayRule.visible = true;
        displayRule.iconSize = { width: displayRule.iconSize.width * 2, height: displayRule.iconSize.height * 2 };
        displayRule.iconVisible = true;
        displayRule.zoomFrom = 0;
        displayRule.zoomTo = 999;
        displayRule.clickable = false;
        mapsIndoorsInstance.setDisplayRule(kioskLocation.id, displayRule);

        setKioskLocationDisplayRuleWasChanged(true);
    }

    return [mapPositionInvestigating, mapPositionKnown];
};

export default useMapBoundsDeterminer;


/**
 * Make the map go to specified geometry with optional padding, zoom level, pitch and bearing.
 *
 * @param {string} mapType
 * @param {object} geometry
 * @param {object} mapsIndoorsInstance
 * @param {number} paddingBottom
 * @param {number} paddingLeft
 * @param {number} zoomLevel
 * @param {number} pitch
 * @param {number} bearing
 */
function goToGeometry(mapType, geometry, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing) {
    // Make sure that the given geometry is converted into a bbox.
    let bbox;
    if (geometry.coordinates && geometry.type) {
        // This looks like GeoJSON.
        bbox = calculateBounds(geometry);
    } else if (geometry.west && geometry.south) {
        // This looks like bounds.
        bbox = [geometry.west, geometry.south, geometry.east, geometry.north];
    }

    if (mapType === mapTypes.Google) {
        googleMapsGoToBBox(bbox, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing)
    } else if (mapType === mapTypes.Mapbox) {
        mapboxGotoBBox(bbox, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing);
    }
}

/**
 * Make Mapbox map go to specific place in the world.
 *
 * @param {bbox} bbox
 * @param {object} mapsIndoorsInstance
 * @param {number} paddingBottom
 * @param {number} paddingLeft
 * @param {number|undefined} zoomLevel
 * @param {number|undefined} pitch
 * @param {number|undefined} bearing
 */
function mapboxGotoBBox(bbox, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing) {
    const mapboxMap = mapsIndoorsInstance.getMap();

    // We use the Mapbox fitBounds instead of MapsIndoors MapView fitBounds since we
    // need to be able to use pitch and bearing in one go,
    // and we want to turn of panning animation.
    mapboxMap.fitBounds(bbox, {
        pitch: pitch || 0,
        bearing: bearing || 0,
        animate: false,
        padding: { top: 0, right: 0, bottom: paddingBottom, left: paddingLeft }
    });

    if (zoomLevel) {
        mapsIndoorsInstance.setZoom(zoomLevel);
    }
};

/**
 * Make Google Maps map go to specific place in the world.
 *
 * @param {bbox} bbox
 * @param {object} mapsIndoorsInstance
 * @param {number} paddingBottom
 * @param {number} paddingLeft
 * @param {number|undefined} zoomLevel
 * @param {number|undefined} pitch
 * @param {number|undefined} bearing
 */
function googleMapsGoToBBox(bbox, mapsIndoorsInstance, paddingBottom, paddingLeft, zoomLevel, pitch, bearing) {
    let coordinates = { west: bbox[0], south: bbox[1], east: bbox[2], north: bbox[3] }
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

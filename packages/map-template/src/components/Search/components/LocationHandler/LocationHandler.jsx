import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import mapsIndoorsInstanceState from '../../../../atoms/mapsIndoorsInstanceState';
import currentLocationState from '../../../../atoms/currentLocationState';
import isLocationClickedState from '../../../../atoms/isLocationClickedState';
import currentVenueNameState from '../../../../atoms/currentVenueNameState';
import kioskLocationState from '../../../../atoms/kioskLocationState';
import getDesktopPaddingLeft from '../../../../helpers/GetDesktopPaddingLeft';
import getDesktopPaddingBottom from '../../../../helpers/GetDesktopPaddingBottom';
import { useIsDesktop } from '../../../../hooks/useIsDesktop';
import PropTypes from 'prop-types';

/**
 * LocationHandler component that manages location interactions including
 * clicking, hovering, and map positioning functionality.
 */
const LocationHandler = forwardRef(({ onHoverLocation }, ref) => {
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const [, setCurrentLocation] = useRecoilState(currentLocationState);
    const [, setIsLocationClicked] = useRecoilState(isLocationClickedState);
    const [currentVenueName, setCurrentVenueName] = useRecoilState(currentVenueNameState);
    const kioskLocation = useRecoilValue(kioskLocationState);
    const isDesktop = useIsDesktop();

    /**
     * Handle hovering over location.
     *
     * @param {object} location
     */
    function onMouseEnter(location) {
        if (onHoverLocation) {
            onHoverLocation(location);
        }
    }

    /**
     * Handle locations clicked on the map.
     *
     * @param {object} location
     */
    function onLocationClicked(location) {
        setCurrentLocation(location);

        // Set the current venue to be the selected location venue.
        if (location.properties.venueId.toLowerCase() !== currentVenueName.toLowerCase()) {
            setCurrentVenueName(location.properties.venueId);
            setIsLocationClicked(true);
        }

        const currentFloor = mapsIndoorsInstance.getFloor();
        const locationFloor = location.properties.floor;

        // Set the floor to the one that the location belongs to.
        if (locationFloor !== currentFloor) {
            mapsIndoorsInstance.setFloor(locationFloor);
        }

        Promise.all([getBottomPadding(), getLeftPadding()]).then(([bottomPadding, leftPadding]) => {
            mapsIndoorsInstance.goTo(location, {
                maxZoom: 22,
                padding: { bottom: bottomPadding, left: leftPadding, top: 0, right: 0 }
            });
        });
    }

    /**
     * Get bottom padding when selecting a location.
     * Calculate all cases depending on the kioskLocation id prop as well.
     */
    function getBottomPadding() {
        return new Promise((resolve) => {
            if (isDesktop) {
                if (kioskLocation) {
                    getDesktopPaddingBottom().then(padding => resolve(padding));
                } else {
                    resolve(0);
                }
            } else {
                resolve(200);
            }
        });
    }

    /**
     * Get left padding when selecting a location.
     * Calculate all cases depending on the kioskLocation id prop as well.
     */
    function getLeftPadding() {
        return new Promise((resolve) => {
            if (isDesktop) {
                if (kioskLocation) {
                    resolve(0);
                } else {
                    getDesktopPaddingLeft().then(padding => resolve(padding));
                }
            } else {
                resolve(0);
            }
        });
    }

    /**
     * Adjusts the map view to fit the bounds of the provided locations.
     * It will filter out Locations that are not on the current floor or not part of the current venue.
     *
     * @param {Array} locations - An array of Location objects to fit within the map bounds.
     */
    function fitMapBoundsToLocations(locations) {
        if (!mapsIndoorsInstance.goTo) return; // Early exit to prevent crashes if using an older version of the MapsIndoors JS SDK. The goTo method was introduced in version 4.38.0.

        const currentFloorIndex = mapsIndoorsInstance.getFloor();

        // Create a GeoJSON FeatureCollection from the locations that can be used as input to the goTo method.
        const featureCollection = {
            type: 'FeatureCollection',
            features: locations
                // Filter out locations that are not on the current floor. If those were included, it could result in a wrong fit since they are not visible on the map anyway.
                .filter(location => parseInt(location.properties.floor, 10) === parseInt(currentFloorIndex, 10))

                // Filter out locations that are not part of the current venue. Including those when fitting to bounds could cause the map to zoom out too much.
                .filter(location => location.properties.venueId.toLowerCase() === currentVenueName.toLowerCase())

                // Map the locations to GeoJSON features.
                .map(location => ({
                    type: 'Feature',
                    geometry: location.geometry,
                    properties: location.properties
                }))
        };

        if (featureCollection.features.length > 0) {
            Promise.all([getBottomPadding(), getLeftPadding()]).then(([bottomPadding, leftPadding]) => {
                mapsIndoorsInstance.goTo(featureCollection, {
                    maxZoom: 22,
                    padding: { bottom: bottomPadding, left: leftPadding, top: 0, right: 0 }
                });
            });
        }
    }

    // Expose functions to parent component through ref
    useImperativeHandle(ref, () => ({
        onLocationClicked,
        onMouseEnter,
        fitMapBoundsToLocations
    }));

    /*
     * Handle location hover.
     */
    useEffect(() => {
        mapsIndoorsInstance?.on('mouseenter', onMouseEnter);
        return () => {
            mapsIndoorsInstance?.off('mouseenter', onMouseEnter);
        }
    }, [mapsIndoorsInstance, onMouseEnter]);

    // This component doesn't render anything visible
    return null;
});

LocationHandler.displayName = 'LocationHandler';

LocationHandler.propTypes = {
    onHoverLocation: PropTypes.func
};

export default LocationHandler;

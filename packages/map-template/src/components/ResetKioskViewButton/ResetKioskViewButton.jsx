import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { ReactComponent as ResetKioskViewIcon } from '../../assets/reset-kiosk-view.svg';
import './ResetKioskViewButton.scss';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import kioskOriginLocationIdState from '../../atoms/kioskOriginLocationIdState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import kioskLocationState from '../../atoms/kioskLocationState';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useRecoilValue } from 'recoil';
import getDesktopPaddingBottom from '../../helpers/GetDesktopPaddingBottom';
import getDesktopPaddingLeft from '../../helpers/GetDesktopPaddingLeft';

/**
 * ResetKioskViewButton component - A button that resets the map to initial view
 * Positioned above zoom controls using portal system
 */
function ResetKioskViewButton() {
    const [portalContainer, setPortalContainer] = useState(null);
    const resetButtonMountPoint = '.reset-view-portal';
    const isKiosk = useIsKioskContext();
    const kioskOriginLocationId = useRecoilValue(kioskOriginLocationIdState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const currentVenueName = useRecoilValue(currentVenueNameState);
    const kioskLocation = useRecoilValue(kioskLocationState);
    const isDesktop = useIsDesktop();

    /**
     * Resets the map position to the kiosk origin location.
     */
    function resetMapPosition() {
        window.mapsindoors.services.LocationsService.getLocation(kioskOriginLocationId)
            .then(kioskLocation => {
                if (kioskLocation) {
                    fitMapBoundsToLocations([kioskLocation]);
                }
            })
            .catch(error => {
                console.error('Error resetting map position:', error);
        });
    }

    /**
     * Adjusts the map view to fit the bounds of the provided locations.
     * It will filter out Locations that are not on the current floor or not part of the current venue.
     * If the kiosk location is included, it will set the floor to match the kiosk location's floor first.
     *
     * @param {Array} locations - An array of Location objects to fit within the map bounds.
     */
    function fitMapBoundsToLocations(locations) {
        if (!mapsIndoorsInstance.goTo) return; // Early exit to prevent crashes if using an older version of the MapsIndoors JS SDK. The goTo method was introduced in version 4.38.0.

        // If the kiosk location is in the list, set the floor to match it first.
        // This ensures the floor changes before we filter, so the kiosk location won't be filtered out.
        const kioskLocationInList = locations.find(location => location.id === kioskOriginLocationId);
        if (kioskLocationInList) {
            const locationFloor = kioskLocationInList.properties.floor;
            mapsIndoorsInstance.setFloor(locationFloor);
        }

        const currentFloorIndex = mapsIndoorsInstance.getFloor();

        // Create a GeoJSON FeatureCollection from the locations that can be used as input to the goTo method.
        const featureCollection = {
            type: 'FeatureCollection',
            features: locations
                // Filter out locations that are not on the current floor. If those were included, it could result in a wrong fit since they are not visible on the map anyway.
                .filter(location => parseInt(location.properties.floor, 10) === parseInt(currentFloorIndex, 10))

                // Filter out locations that are not part of the current venue. Including those when fitting to bounds could cause the map to zoom out too much.
                .filter(location => currentVenueName && location.properties.venueId.toLowerCase() === currentVenueName.toLowerCase())

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

    // Find portal target
    useEffect(() => {
        let portalTargetMountPoint = document.querySelector(resetButtonMountPoint);
        if (portalTargetMountPoint) {
            setPortalContainer(portalTargetMountPoint);
            return;
        }
        
        const observer = new MutationObserver(() => {
            portalTargetMountPoint = document.querySelector(resetButtonMountPoint);
            if (portalTargetMountPoint) {
                setPortalContainer(portalTargetMountPoint);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    // Early return if not visible
    if (!isKiosk) {
        return null;
    }

    if (!portalContainer) return null;

    return createPortal(
        <button 
            className="reset-kiosk-view-button"
            onClick={resetMapPosition}
            title="Reset to initial kiosk view"
            aria-label="Reset to initial kiosk view"
        >
            <ResetKioskViewIcon />
        </button>,
        portalContainer
    );
}

ResetKioskViewButton.propTypes = {
    onReset: PropTypes.func,
    isVisible: PropTypes.bool
};

export default ResetKioskViewButton;
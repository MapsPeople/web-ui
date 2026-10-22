import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import ResetKioskViewIcon from '../../assets/reset-kiosk-view.svg?react';
import './ResetKioskViewButton.scss';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import { usePortalTarget } from '../../hooks/usePortalTarget';
import kioskOriginLocationIdState from '../../atoms/kioskOriginLocationIdState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import startZoomLevelState from '../../atoms/startZoomLevelState';
import bearingState from '../../atoms/bearingState';
import currentPitchSelector from '../../selectors/currentPitch';
import mapTypeState from '../../atoms/mapTypeState';
import { mapTypes } from '../../constants/mapTypes';
import { goTo } from '../../hooks/useMapBoundsDeterminer';
import * as turf from '@turf/turf';
import { useRecoilValue } from 'recoil';
import getDesktopPaddingBottom from '../../helpers/GetDesktopPaddingBottom';

/**
 * ResetKioskViewButton component - A button that resets the map to initial view
 * Positioned above zoom controls using portal system
 */
function ResetKioskViewButton() {
    const portalContainer = usePortalTarget('.reset-view-portal');
    const isKiosk = useIsKioskContext();
    const kioskOriginLocationId = useRecoilValue(kioskOriginLocationIdState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const startZoomLevel = useRecoilValue(startZoomLevelState);
    const bearing = useRecoilValue(bearingState);
    const currentPitch = useRecoilValue(currentPitchSelector);
    const mapType = useRecoilValue(mapTypeState);
    const { t } = useTranslation();

    /**
     * Animates the Mapbox map to the kiosk location.
     *
     * @param {object} kioskLocation - The kiosk origin Location.
     * @param {number} paddingBottom - Padding that should be applied to the bottom of the map.
     */
    function easeMapboxToKiosk(kioskLocation, paddingBottom) {
        const map = mapsIndoorsInstance.getMap();
        const center = turf.center(kioskLocation.geometry).geometry.coordinates;
        const numericBearing = Number(bearing) || 0;
        const numericPitch = Number(currentPitch) || 0;
        const padding = { top: 0, right: 0, bottom: paddingBottom, left: 0 };
        const camera = startZoomLevel
            ? { center, zoom: Number(startZoomLevel) }
            : map.cameraForBounds(turf.bbox(kioskLocation.geometry), { padding, bearing: numericBearing, pitch: numericPitch, maxZoom: 22 });

        if (!camera) {
            goTo(kioskLocation.geometry, mapsIndoorsInstance, paddingBottom, 0, undefined, currentPitch, bearing);
            return;
        }

        map.easeTo({ center: camera.center, zoom: camera.zoom, bearing: numericBearing, pitch: numericPitch, duration: 1000 });
    }

    /**
     * Moves the Google Maps map to the kiosk location.
     *
     * @param {object} kioskLocation - The kiosk origin Location.
     * @param {number} paddingBottom - Padding that should be applied to the bottom of the map.
     */
    function moveGoogleToKiosk(kioskLocation, paddingBottom) {
        if (!startZoomLevel) {
            goTo(kioskLocation.geometry, mapsIndoorsInstance, paddingBottom, 0, undefined, currentPitch, bearing);
            return;
        }

        const map = mapsIndoorsInstance.getMap();
        const center = turf.center(kioskLocation.geometry).geometry.coordinates;

        map.panTo({ lat: center[1], lng: center[0] });
        mapsIndoorsInstance.getMapView().tilt(Number(currentPitch) || 0);
        mapsIndoorsInstance.getMapView().rotate(Number(bearing) || 0);
        mapsIndoorsInstance.setZoom(Number(startZoomLevel));
    }

    /**
     * Resets the map position to the same view as on startup: kiosk origin location, start zoom level, pitch and bearing.
     */
    function resetMapPosition() {
        window.mapsindoors.services.LocationsService.getLocation(kioskOriginLocationId)
            .then(kioskLocation => {
                if (kioskLocation) {
                    mapsIndoorsInstance.setFloor(kioskLocation.properties.floor);
                    return getDesktopPaddingBottom().then(paddingBottom => {
                        if (mapType === mapTypes.Mapbox) {
                            easeMapboxToKiosk(kioskLocation, paddingBottom);
                        } else if (mapType === mapTypes.Google) {
                            moveGoogleToKiosk(kioskLocation, paddingBottom);
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error resetting map position:', error);
            });
    }

    // Early return if not visible
    if (!isKiosk) {
        return null;
    }

    if (!portalContainer) return null;

    return createPortal(
        <button 
            className="reset-kiosk-view-button"
            onClick={resetMapPosition}
            title={t('Reset to initial kiosk view')}
            aria-label={t('Reset to initial kiosk view')}
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
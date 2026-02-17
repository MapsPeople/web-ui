import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import { ReactComponent as PlusIcon } from '../../../assets/plus.svg';
import { ReactComponent as MinusIcon } from '../../../assets/minus.svg';
import './MapZoomControl.scss';

MapZoomControl.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapInstance: PropTypes.object.isRequired
};

/**
 * MapZoomControl component provides zoom in/out controls for both Mapbox and Google Maps.
 * It renders custom buttons that call the native map zoom methods, maintaining the same
 * functionality as the native controls while integrating with the MapControls layout system.
 * 
 * @param {Object} props - Component properties
 * @param {'google'|'mapbox'} props.mapType - The type of map being used
 * @param {Object} props.mapInstance - Map instance (Google Maps or Mapbox MapView)
 */
function MapZoomControl({ mapType, mapInstance }) {
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();

    const handleZoomIn = useCallback(() => {
        const map = mapInstance?.getMap();
        if (!map) return;

        switch (mapType) {
            case 'mapbox':
                map.zoomIn();
                break;
            case 'google': {
                const currentZoom = map.getZoom();
                map.setZoom(currentZoom + 1);
                break;
            }
            default:
                break;
        }
    }, [mapType, mapInstance]);

    const handleZoomOut = useCallback(() => {
        const map = mapInstance?.getMap();
        if (!map) return;

        switch (mapType) {
            case 'mapbox':
                map.zoomOut();
                break;
            case 'google': {
                const currentZoom = map.getZoom();
                map.setZoom(currentZoom - 1);
                break;
            }
            default:
                break;
        }
    }, [mapType, mapInstance]);

    // Early return if not used in desktop layout, not needed in mobile layout
    if (!isDesktop) {
        return null;
    }

    return (
        <div className="map-zoom-control">
            <button
                type="button"
                className="map-zoom-control__button"
                onClick={handleZoomIn}
                aria-label={t('Zoom in')}
            >
                <PlusIcon />
            </button>
            <button
                type="button"
                className="map-zoom-control__button"
                onClick={handleZoomOut}
                aria-label={t('Zoom out')}
            >
                <MinusIcon />
            </button>
        </div>
    );
}

export default MapZoomControl;


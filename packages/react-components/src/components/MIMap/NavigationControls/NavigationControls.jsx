import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './NavigationControls.scss';

NavigationControls.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapInstance: PropTypes.object.isRequired
};

/**
 * NavigationControls component provides navigation controls for panning, rotating, and tilting the map.
 * It renders buttons for directional movement (up, down, left, right), rotation (rotate left, rotate right),
 * and tilt (tilt up, tilt down).
 * 
 * @param {Object} props - Component properties
 * @param {'google'|'mapbox'} props.mapType - The type of map being used
 * @param {Object} props.mapInstance - Map instance (Google Maps or Mapbox MapView)
 */
function NavigationControls({ mapType, mapInstance }) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const PAN_DISTANCE = 100; // pixels to pan
    const ROTATION_ANGLE = 15; // degrees to rotate
    const TILT_ANGLE = 10; // degrees to tilt

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const handlePan = useCallback((direction) => {
        const map = mapInstance?.getMap();
        if (!map) return;

        switch (mapType) {
            case 'mapbox': {
                let panX = 0;
                let panY = 0;
                
                switch (direction) {
                    case 'up':
                        panY = -PAN_DISTANCE; // Negative Y moves up in screen coordinates
                        break;
                    case 'down':
                        panY = PAN_DISTANCE; // Positive Y moves down in screen coordinates
                        break;
                    case 'left':
                        panX = -PAN_DISTANCE; // Negative X moves left in screen coordinates
                        break;
                    case 'right':
                        panX = PAN_DISTANCE; // Positive X moves right in screen coordinates
                        break;
                    default:
                        return;
                }
                
                map.panBy([panX, panY], { duration: 200 });
                break;
            }
            case 'google':
                // Google Maps implementation will be added later
                break;
            default:
                break;
        }
    }, [mapType, mapInstance]);

    const handleRotate = useCallback((direction) => {
        const map = mapInstance?.getMap();
        if (!map) return;

        switch (mapType) {
            case 'mapbox': {
                const currentBearing = map.getBearing();
                const newBearing = direction === 'left' 
                    ? currentBearing - ROTATION_ANGLE 
                    : currentBearing + ROTATION_ANGLE;
                map.rotateTo(newBearing, { duration: 200 });
                break;
            }
            case 'google':
                // Google Maps implementation will be added later
                break;
            default:
                break;
        }
    }, [mapType, mapInstance]);

    const handleTilt = useCallback((direction) => {
        const map = mapInstance?.getMap();
        if (!map) return;

        switch (mapType) {
            case 'mapbox': {
                const currentPitch = map.getPitch();
                const minPitch = 0;
                const maxPitch = 85; // Mapbox maximum pitch (0-85 degrees)
                let newPitch;
                
                if (direction === 'up') {
                    newPitch = Math.min(currentPitch + TILT_ANGLE, maxPitch);
                } else {
                    newPitch = Math.max(currentPitch - TILT_ANGLE, minPitch);
                }
                
                // Use easeTo for animated pitch transitions
                map.easeTo({ pitch: newPitch, duration: 200 });
                break;
            }
            case 'google':
                // Google Maps implementation will be added later
                break;
            default:
                break;
        }
    }, [mapType, mapInstance]);

    // Arrow icon components
    const ArrowUp = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4L10 16M10 4L4 10M10 4L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const ArrowDown = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 16L10 4M10 16L4 10M10 16L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const ArrowLeft = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 10L4 10M16 10L10 4M16 10L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const ArrowRight = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10L16 10M4 10L10 4M4 10L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const RotateLeft = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 3L7 6L10 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const RotateRight = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 3L13 6L10 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const TiltUp = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4L10 16M10 4L4 10M10 4L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 16L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );

    const TiltDown = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 16L10 4M10 16L4 10M10 16L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 4L16 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );

    const NavigationIcon = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    return (
        <div className={`navigation-controls ${isExpanded ? 'navigation-controls--expanded' : ''}`}>
            {isExpanded && (
                <div className="navigation-controls__content">
                    <div className="navigation-controls__row">
                        <button
                            type="button"
                            className="navigation-controls__button"
                            onClick={() => handleRotate('left')}
                            aria-label={t('Rotate left')}
                        >
                            <RotateLeft />
                        </button>
                        <button
                            type="button"
                            className="navigation-controls__button"
                            onClick={() => handlePan('up')}
                            aria-label={t('Pan up')}
                        >
                            <ArrowUp />
                        </button>
                        <button
                            type="button"
                            className="navigation-controls__button"
                            onClick={() => handleRotate('right')}
                            aria-label={t('Rotate right')}
                        >
                            <RotateRight />
                        </button>
                    </div>
                    <div className="navigation-controls__row">
                        <button
                            type="button"
                            className="navigation-controls__button"
                            onClick={() => handlePan('left')}
                            aria-label={t('Pan left')}
                        >
                            <ArrowLeft />
                        </button>
                        <button
                            type="button"
                            className="navigation-controls__button"
                            onClick={() => handlePan('down')}
                            aria-label={t('Pan down')}
                        >
                            <ArrowDown />
                        </button>
                        <button
                            type="button"
                            className="navigation-controls__button"
                            onClick={() => handlePan('right')}
                            aria-label={t('Pan right')}
                        >
                            <ArrowRight />
                        </button>
                    </div>
                    <div className="navigation-controls__row">
                        <button
                            type="button"
                            className="navigation-controls__button"
                            onClick={() => handleTilt('down')}
                            aria-label={t('Tilt down')}
                        >
                            <TiltDown />
                        </button>
                        <div className="navigation-controls__button navigation-controls__button--spacer"></div>
                        <button
                            type="button"
                            className="navigation-controls__button"
                            onClick={() => handleTilt('up')}
                            aria-label={t('Tilt up')}
                        >
                            <TiltUp />
                        </button>
                    </div>
                </div>
            )}
            <button
                type="button"
                className="navigation-controls__toggle"
                onClick={toggleExpanded}
                aria-label={isExpanded ? t('Collapse navigation controls') : t('Expand navigation controls')}
                aria-expanded={isExpanded}
            >
                <NavigationIcon />
            </button>
        </div>
    );
}

export default NavigationControls;


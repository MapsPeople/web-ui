import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import FullscreenIcon from '../../../assets/fullscreen.svg?react';
import FullscreenExitIcon from '../../../assets/fullscreen-exit.svg?react';
import './FullScreenButton.scss';

FullScreenButton.propTypes = {
    fullscreenTarget: PropTypes.object
};

/**
 * FullScreenButton component toggles fullscreen mode for the map.
 * Uses the Fullscreen API to enter/exit fullscreen on the provided target element.
 *
 * @param {Object} props - Component properties
 * @param {HTMLElement} [props.fullscreenTarget] - The element to make fullscreen. Defaults to document.documentElement.
 */
function FullScreenButton({ fullscreenTarget }) {
    const { t } = useTranslation();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const target = fullscreenTarget || document.documentElement;

    const updateFullscreenState = useCallback(() => {
        setIsFullscreen(!!document.fullscreenElement);
    }, []);

    useEffect(() => {
        document.addEventListener('fullscreenchange', updateFullscreenState);
        return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
    }, [updateFullscreenState]);

    const toggleFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await target.requestFullscreen();
            }
        } catch (err) {
            console.warn('Fullscreen request failed:', err);
        }
    }, [target]);

    return (
        <button
            type="button"
            className="fullscreen-button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? t('Exit fullscreen') : t('Enter fullscreen')}
            title={isFullscreen ? t('Exit fullscreen') : t('Enter fullscreen')}
        >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </button>
    );
}

export default FullScreenButton;

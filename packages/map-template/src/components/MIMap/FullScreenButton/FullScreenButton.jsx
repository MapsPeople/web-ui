import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FullscreenIcon from '../../../assets/fullscreen.svg?react';
import FullscreenExitIcon from '../../../assets/fullscreen-exit.svg?react';
import './FullScreenButton.scss';

/**
 * FullScreenButton component toggles fullscreen mode for the map.
 * Uses the Fullscreen API. Targets the map template container (.map-template) when present,
 * otherwise falls back to full page (document.documentElement).
 */
function FullScreenButton() {
    const { t } = useTranslation();
    const [isFullscreen, setIsFullscreen] = useState(false);

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
                const target = document.querySelector('.map-template') || document.documentElement;
                await target.requestFullscreen();
            }
        } catch (err) {
            console.warn('Fullscreen request failed:', err);
        }
    }, []);

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

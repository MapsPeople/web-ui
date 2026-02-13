import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import { ReactComponent as TextSizeIcon } from '../../../assets/icon-text-size.svg';
import './TextSizeButton.scss';

TextSizeButton.propTypes = {
    mapsIndoorsInstance: PropTypes.object.isRequired
}

/**
 * TextSizeButton component provides a button to toggle text size between default (100%) and large (200%).
 * This is an accessibility feature that increases text size across the application.
 */
function TextSizeButton({ mapsIndoorsInstance }) {
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();
    const [isLargeText, setIsLargeText] = useState(false);

    const applyTextSize = useCallback((large) => {
        if (large) {
            // Set the font size for MapTemplate content to 200%
            document.documentElement.style.fontSize = '200%';
            // Set the font size for MapsIndoors content to 200%
            mapsIndoorsInstance?.getMapView()?.setLabelTextSizeMultiplier(2.0);
        } else {
            // Reset the font size for MapTemplate content to default
            document.documentElement.style.fontSize = '';
            // Reset the font size for MapsIndoors content to default
            mapsIndoorsInstance?.getMapView()?.resetLabelTextSize();
        }
    }, [mapsIndoorsInstance]);

    // Reset multiplier to 1.0 on mount to ensure clean state and avoid stray multipliers
    // Keep global font size and MapsIndoors label size in sync with state, and clean up on unmount
    useEffect(() => {
        applyTextSize(isLargeText);

        return () => {
            // Ensure we don't leave the document or map view in a "large text" state
            applyTextSize(false);
        };
    }, [isLargeText, applyTextSize]);

    const handleToggle = useCallback(() => {
        const newState = !isLargeText;
        setIsLargeText(newState);
        applyTextSize(newState);
    }, [isLargeText, applyTextSize]);

    // Early return if not used in desktop layout
    if (!isDesktop) {
        return null;
    }

    return (
        <button
            type="button"
            className={`text-size-button ${isLargeText ? 'text-size-button--active' : ''}`}
            onClick={handleToggle}
            aria-label={isLargeText ? t('Decrease text size to 100%') : t('Increase text size to 200%')}
            aria-pressed={isLargeText}
        >
            <TextSizeIcon />
        </button>
    );
}

export default TextSizeButton;


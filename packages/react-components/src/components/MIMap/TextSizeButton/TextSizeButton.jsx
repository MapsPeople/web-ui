import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import { ReactComponent as TextSizeIcon } from '../../../assets/icon-text-size.svg';
import './TextSizeButton.scss';

/**
 * TextSizeButton component provides a button to toggle text size between default (100%) and large (200%).
 * This is an accessibility feature that increases text size across the application.
 * 
 * @param {Object} props - Component properties
 */
function TextSizeButton() {
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();
    const [isLargeText, setIsLargeText] = useState(false);

    const applyTextSize = useCallback((large) => {
        if (large) {
            document.documentElement.style.fontSize = '200%';
        } else {
            document.documentElement.style.fontSize = '';
        }
    }, []);

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


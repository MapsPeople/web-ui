import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { supportedLanguages } from '../../i18n/initialize.js';
import { ReactComponent as LanguageSelectorIcon } from '../../assets/language-selector.svg';
import './LanguageSelector.scss';

/**
 * LanguageSelector component allows users to select a language from a list of supported languages.
 * 
 * Features:
 * - Renders a language selection button and dropdown (desktop) or overlay (mobile).
 * - Uses a portal to render the selector in a specific DOM node.
 * - Supports both desktop and mobile layouts.
 * 
 * Props:
 * @param {Object} props
 * @param {string} props.currentLanguage - The currently selected language code.
 * @param {function} props.setLanguage - Callback to set the selected language.
 * @param {boolean} [props.isVisible] - Controls visibility of the language selector.
 * 
 * @returns {JSX.Element|null} The rendered LanguageSelector component or null if not visible.
 */
function LanguageSelector({ currentLanguage, setLanguage, isVisible }) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const dropdownRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const [portalContainer, setPortalContainer] = useState(null);
    const isDesktop = useIsDesktop();
    const languageSelectorMountPoint = '.language-selector-portal';

    // Find portal target
    useEffect(() => {
        let target = document.querySelector(languageSelectorMountPoint);
        if (target) {
            setPortalContainer(target);
            return;
        }
        const observer = new MutationObserver(() => {
            target = document.querySelector(languageSelectorMountPoint);
            if (target) {
                setPortalContainer(target);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    // Click outside to close (desktop only)
    useEffect(() => {
        if (!(isExpanded && isDesktop)) return;
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                toggleButtonRef.current &&
                !toggleButtonRef.current.contains(event.target)
            ) {
                setIsExpanded(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, isDesktop]);

    // Early return if not visible
    if (!isVisible) {
        return null;
    }

    // Toggle button
    const ToggleButton = () => (
        <button ref={toggleButtonRef} className="language-selector__toggle-button" onClick={() => setIsExpanded(!isExpanded)} aria-haspopup="listbox" aria-expanded={isExpanded} aria-label="Select language">
            <LanguageSelectorIcon />
        </button>
    );

    // Language list
    const LanguageList = () => (
        <div className="language-selector__list">
            {supportedLanguages.map(lang => (
                <button
                    key={lang.code}
                    className={`language-selector__item${currentLanguage === lang.code ? ' language-selector__item--selected' : ''}`}
                    onClick={() => {
                        setLanguage(lang.code);
                        setIsExpanded(false);
                    }}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );

    if (!portalContainer) return null;

    return createPortal(
        isDesktop ? (
            <div className="language-selector__button-container language-selector__button-container--desktop" style={{ position: 'relative', display: 'inline-block' }}>
                {isExpanded && (
                    <div
                        ref={dropdownRef}
                        className="language-selector__container language-selector__container--desktop"
                    >
                        <LanguageList />
                    </div>
                )}
                <ToggleButton />
            </div>
        ) : (
            <>
                <ToggleButton />
                {isExpanded && (
                    <div className="language-selector-overlay">
                        <div className="language-selector-overlay__backdrop" onClick={() => setIsExpanded(false)}></div>
                        <div className="language-selector__container language-selector__container--mobile">
                            <div className="language-selector-overlay__header">
                                <button className="language-selector-overlay__exit-button" onClick={() => setIsExpanded(false)} aria-label="Close language selector">
                                    ×
                                </button>
                                <span>{t('Select language')}</span>
                            </div>
                            <LanguageList />
                        </div>
                    </div>
                )}
            </>
        ),
        portalContainer
    );
}

LanguageSelector.propTypes = {
    currentLanguage: PropTypes.string,
    setLanguage: PropTypes.func.isRequired,
    isVisible: PropTypes.bool
};

export default LanguageSelector;

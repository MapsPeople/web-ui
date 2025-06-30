/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { supportedLanguages } from '../../i18n/initialize.js';
import { ReactComponent as LanguageSelectorIcon } from '../../assets/language-selector.svg';
import './LanguageSelector.scss';

/**
 * ToggleButton component renders the button that toggles the language selector dropdown or overlay.
 *
 * @param {Object} props
 * @param {React.RefObject} props.toggleButtonRef - Ref for the toggle button element.
 * @param {boolean} props.isExpanded - Whether the language selector is currently expanded.
 * @param {function} props.setIsExpanded - Function to toggle the expanded state.
 * @returns {JSX.Element} The rendered toggle button.
 */
function ToggleButton({ toggleButtonRef, isExpanded, setIsExpanded }) {
    return (
        <button
            ref={toggleButtonRef}
            className="language-selector__toggle-button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isExpanded}
            aria-label="Select language"
        >
            <LanguageSelectorIcon />
        </button>
    );
}

/**
 * LanguageList component renders the list of supported languages as selectable buttons.
 *
 * @param {Object} props
 * @param {Array<{code: string, label: string}>} props.supportedLanguages - Array of supported language objects.
 * @param {string} props.currentLanguage - The currently selected language code.
 * @param {function} props.setLanguage - Callback to set the selected language.
 * @param {function} props.setIsExpanded - Function to close the language selector after selection.
 * @returns {JSX.Element} The rendered list of language options.
 */
function LanguageList({ supportedLanguages, currentLanguage, setLanguage, setIsExpanded }) {
    return (
        <div className="language-selector__list">
            {supportedLanguages.map(language => (
                <button
                    key={language.code}
                    className={`language-selector__item${currentLanguage === language.code ? ' language-selector__item--selected' : ''}`}
                    onClick={() => { setLanguage(language.code); setIsExpanded(false); }}
                >
                    {language.label}
                </button>
            ))}
        </div>
    );
}

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
        let portalTargetMountPoint = document.querySelector(languageSelectorMountPoint);
        if (portalTargetMountPoint) {
            setPortalContainer(portalTargetMountPoint);
            return;
        }
        const observer = new MutationObserver(() => {
            portalTargetMountPoint = document.querySelector(languageSelectorMountPoint);
            if (portalTargetMountPoint) {
                setPortalContainer(portalTargetMountPoint);
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

    if (!portalContainer) return null;

    return createPortal(
        isDesktop ? (
            <div className="language-selector__button-container">
                {isExpanded && (
                    <div ref={dropdownRef} className="language-selector__container">
                        <LanguageList
                            supportedLanguages={supportedLanguages}
                            currentLanguage={currentLanguage}
                            setLanguage={setLanguage}
                            setIsExpanded={setIsExpanded}
                        />
                    </div>
                )}
                <ToggleButton toggleButtonRef={toggleButtonRef} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            </div>
        ) : (
            <>
                <ToggleButton toggleButtonRef={toggleButtonRef} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                {isExpanded && (
                    <div className="language-selector-overlay">
                        <div className="language-selector-overlay__backdrop" onClick={() => setIsExpanded(false)}></div>
                        <div className="language-selector__container">
                            <div className="language-selector-overlay__header">
                                <button className="language-selector-overlay__exit-button" onClick={() => setIsExpanded(false)} aria-label="Close language selector">
                                    ×
                                </button>
                                <span>{t('Select language')}</span>
                            </div>
                            <LanguageList
                                supportedLanguages={supportedLanguages}
                                currentLanguage={currentLanguage}
                                setLanguage={setLanguage}
                                setIsExpanded={setIsExpanded}
                            />
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

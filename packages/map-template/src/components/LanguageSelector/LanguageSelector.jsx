import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './LanguageSelector.scss';

const supportedLanguages = [
    { code: 'en', label: 'English' },
    { code: 'da', label: 'Dansk' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Español' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'zh', label: '中文' },
];

function LanguageSelector({ currentLanguage, setLanguage }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const dropdownRef = useRef(null);
    const toggleButtonRef = useRef(null);

    // Click outside to close (for modal)
    useEffect(() => {
        if (!isExpanded) return;
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !event.target.closest('.language-selector__toggle-button')
            ) {
                setIsExpanded(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    return (
        <div className="language-selector">
            <button ref={toggleButtonRef} className="language-selector__toggle-button" onClick={() => setIsExpanded(!isExpanded)} aria-haspopup="listbox" aria-expanded={isExpanded} aria-label="Select language">
                Select Language
            </button>
            {isExpanded && (
                <div className="language-selector-overlay">
                    <div className="language-selector-overlay__backdrop" onClick={() => setIsExpanded(false)}></div>
                    <div ref={dropdownRef} className="language-selector__container language-selector__container--mobile">
                        <div className="language-selector-overlay__header">
                            <button className="language-selector-overlay__exit-button" onClick={() => setIsExpanded(false)} aria-label="Close language selector">
                                ×
                            </button>
                            <span>Select language</span>
                        </div>
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
                    </div>
                </div>
            )}
        </div>
    );
}

LanguageSelector.propTypes = {
    currentLanguage: PropTypes.string,
    setLanguage: PropTypes.func.isRequired,
};

export default LanguageSelector;

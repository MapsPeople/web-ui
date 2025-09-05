import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useIsKioskContext } from '../../../../hooks/useIsKioskContext';

/**
 * KioskScrollButtons component handles the scroll buttons functionality in kiosk mode.
 * It manages the scroll buttons for navigating through search results when the list
 * is longer than the viewport in kiosk installations.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the search component is open
 * @param {Array} props.searchResults - Array of search results
 * @param {string} props.searchResultsSelector - CSS selector for the search results container
 * @param {string} props.primaryColor - Primary color for styling
 */
const KioskScrollButtons = forwardRef(({ isOpen, searchResults, searchResultsSelector, primaryColor }, ref) => {
    const scrollButtonsRef = useRef(null);
    const isKioskContext = useIsKioskContext();

    /**
     * Update scroll buttons state - exposed to parent component
     */
    const updateScrollButtons = () => {
        if (scrollButtonsRef.current?.updateScrollButtons) {
            scrollButtonsRef.current.updateScrollButtons();
        }
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        updateScrollButtons
    }), []);

    /*
     * Setup scroll buttons to scroll in search results list when in kiosk mode.
     */
    useEffect(() => {
        if (isOpen && isKioskContext && searchResults.length > 0) {
            const searchResultsElement = document.querySelector(searchResultsSelector || '.mapsindoors-map .search__results');
            if (scrollButtonsRef.current) {
                scrollButtonsRef.current.scrollContainerElementRef = searchResultsElement;
            }
        }
    }, [searchResults, isOpen, isKioskContext, searchResultsSelector]);

    // Only render if in kiosk context with search results
    if (!isOpen || !isKioskContext || searchResults.length === 0) {
        return null;
    }

    return createPortal(
        <div className="search__scroll-buttons">
            <mi-scroll-buttons
                ref={scrollButtonsRef}
                style={{ '--primary-color': primaryColor }}
            ></mi-scroll-buttons>
        </div>,
        document.querySelector('.mapsindoors-map')
    );
});

KioskScrollButtons.displayName = 'KioskScrollButtons';

KioskScrollButtons.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    searchResults: PropTypes.array.isRequired,
    searchResultsSelector: PropTypes.string,
    primaryColor: PropTypes.string
};

export default KioskScrollButtons;

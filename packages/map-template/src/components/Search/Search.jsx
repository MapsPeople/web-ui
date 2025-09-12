import './Search.scss';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import categoriesState from '../../atoms/categoriesState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import primaryColorState from '../../atoms/primaryColorState';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import kioskLocationState from '../../atoms/kioskLocationState';
import searchResultsState from '../../atoms/searchResultsState';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import legendSortedFieldsSelector from '../../selectors/legendSortedFieldsSelector';
import initialVenueNameState from '../../atoms/initialVenueNameState';
import LocationHandler from './components/LocationHandler/LocationHandler';
import KioskKeyboard from './components/Kiosk/KioskKeyboard';
import KioskScrollButtons from './components/Kiosk/KioskScrollButtons';
import SearchResults from './components/SearchResults/SearchResults';
import SearchField from './components/SearchField/SearchField';
import CategoryManager from './components/CategoryManager/CategoryManager';
import PropTypes from 'prop-types';
import ChatWindow from './ChatWindow';

Search.propTypes = {
    categories: PropTypes.array,
    onSetSize: PropTypes.func,
    isOpen: PropTypes.bool
};

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {[[string, number]]} props.categories - All the unique categories that users can filter through.
 * @param {function} props.onSetSize - Callback that is fired when the search field takes focus and when categories are clicked.
 * @param {boolean} props.isOpen - Boolean that describes if the search page is open or not.
 *
 * @returns
 */
function Search({ onSetSize, isOpen }) {

    const searchRef = useRef();
    const locationHandlerRef = useRef(null);
    const requestAnimationFrameId = useRef();

    /** Referencing the search field */
    const searchFieldRef = useRef();

    /** Referencing the KioskKeyboard component */
    const kioskKeyboardRef = useRef();

    /** Referencing the KioskScrollButtons component */
    const kioskScrollButtonsRef = useRef();

    /** Referencing the CategoryManager component */
    const categoryManagerRef = useRef();

    /** Maximum number of search results to show */
    const MAX_RESULTS = 100;

    const [searchResults, setSearchResults] = useRecoilState(searchResultsState);
    const categories = useRecoilValue(categoriesState);
    const primaryColor = useRecoilValue(primaryColorState);

    /** Indicate if search results have been found */
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const [hoveredLocation, setHoveredLocation] = useState();

    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);

    const currentVenueName = useRecoilValue(currentVenueNameState);

    const isDesktop = useIsDesktop();

    const kioskLocation = useRecoilValue(kioskLocationState);

    const isKioskContext = useIsKioskContext();

    const [showLegendButton, setShowLegendButton] = useState(false);

    const legendSections = useRecoilValue(legendSortedFieldsSelector);

    const initialVenueName = useRecoilValue(initialVenueNameState);

    // Track if the search input field is in focus to show categories
    const [isInputFieldInFocus, setIsInputFieldInFocus] = useState(false);

    // Memoize the hover callback to prevent unnecessary re-renders
    const handleHoverLocation = useCallback((location) => {
        setHoveredLocation(location);
    }, []);

    /**
     * Communicate size change to parent component.
     *
     * @param {number} size
     */
    function setSize(size) {
        if (typeof onSetSize === 'function') {
            onSetSize(size);
        }
    }

    /**
     * Pure function to determine if categories should be shown.
     * Categories are shown when:
     * - Search field is in focus
     * - No "not found" message is displayed
     * - Categories are available
     * - No search results are displayed
     *
     * @param {boolean} isInputFieldInFocus - Whether the search field is in focus
     * @param {boolean} showNotFoundMessage - Whether "not found" message is shown
     * @param {Array} categories - Available categories
     * @param {Array} searchResults - Current search results
     * @returns {boolean} Whether categories should be displayed
     */
    function shouldShowCategories(isInputFieldInFocus, showNotFoundMessage, categories, searchResults) {
        return isInputFieldInFocus && !showNotFoundMessage && categories.length > 0 && searchResults.length === 0;
    }

    /**
     * Handle search results from the search field.
     *
     * @param {array} locations - An array of MapsIndoors Location objects.
     * @param {boolean} fitMapBounds - If the map bounds should be adjusted to fit the locations.
     */
    function onResults(locations, fitMapBounds = false) {
        const displayResults = locations.slice(0, MAX_RESULTS);

        // Expand the sheet to occupy the entire screen
        setSize(snapPoints.MAX);

        setSearchResults(displayResults);
        setFilteredLocations(displayResults);
        setShowNotFoundMessage(displayResults.length === 0);

        if (locations && fitMapBounds) {
            locationHandlerRef.current?.fitMapBoundsToLocations(locations);
        }

        // Trigger scroll buttons update through KioskScrollButtons component
        // when category changes and DOM transitions complete
        if (isKioskContext) {
            searchRef.current?.addEventListener('transitionend', () => {
                kioskScrollButtonsRef.current?.updateScrollButtons();
            }, { once: true });
        }
    }


    /**
     * Clear results list when search field is cleared.
     */
    function cleared() {
        setSearchResults([]);
        setShowNotFoundMessage(false);
        const selectedCategory = categoryManagerRef.current?.selectedCategory;
        if (selectedCategory) {
            categoryManagerRef.current?.getFilteredLocations(selectedCategory);
        }

        setFilteredLocations([]);
    }

    /**
     * Calculate the CSS for the container based on context.
     */
    function calculateContainerStyle() {
        if (searchResults.length > 0) {
            let maxHeight;
            if (isDesktop) {
                // On desktop-sized viewports, we want the container to have a max height of 60% of the Map Template.
                maxHeight = document.querySelector('.mapsindoors-map').clientHeight * 0.6 + 'px';
            } else {
                // On mobile-sized viewports, take up all available space if needed.
                maxHeight = '100%';
            }

            return { display: 'flex', flexDirection: 'column', maxHeight, overflow: 'hidden' };
        }
    }

    /*
     * Monitors clicks to manage sheet size and input focus state
     */
    useEffect(() => {
        const SEARCH_FOCUS_ELEMENTS = ['.search__info', '.search__back-button', '.categories', '.sheet__content'];

        // We want to ignore: Floor Selector, View Mode Switch, My Position, View Selector, Mapbox zoom controls and Google Maps zoom controls
        const IGNORE_CLOSE_ELEMENTS = ['.mi-floor-selector', '.view-mode-switch', '.mi-my-position', '.view-selector__toggle-button', '.building-list', '.mapboxgl-ctrl-bottom-right', '.gmnoprint', '.language-selector-portal'];

        const handleSearchFieldFocus = (event) => {
            const clickedInsideSearchArea = SEARCH_FOCUS_ELEMENTS.some(selector =>
                event.target.closest(selector)
            );

            const clickedInsideIgnoreArea = IGNORE_CLOSE_ELEMENTS.some(selector =>
                event.target.closest(selector)
            );

            const clickedInsideResults = event.target.closest('.search-results');

            if (clickedInsideSearchArea) {
                setSize(snapPoints.MAX);
                requestAnimationFrameId.current = requestAnimationFrame(() => { // we use a requestAnimationFrame to ensure that the size change is applied before the focus (meaning that categories are rendered)
                    setIsInputFieldInFocus(true);
                });
            } else if (!clickedInsideResults && !clickedInsideIgnoreArea) {
                setIsInputFieldInFocus(false);
                setSize(snapPoints.MIN);
                categoryManagerRef.current?.clearCategorySelection();
                setSearchResults([]);
                setFilteredLocations([]);
            }
        };

        if (isOpen) {
            requestAnimationFrameId.current = requestAnimationFrame(() => { // we use a requestAnimationFrame to ensure that the click is not registered too early (while other sheets are still "active")
                document.addEventListener('click', handleSearchFieldFocus);
            });
        } else {
            document.removeEventListener('click', handleSearchFieldFocus);
        }

        return () => {
            document.removeEventListener('click', handleSearchFieldFocus);
            if (requestAnimationFrameId.current) {
                cancelAnimationFrame(requestAnimationFrameId.current);
            }
        }
    }, [isOpen]);

    /*
     * React on changes in the venue prop.
     * Deselect category and clear results list.
     */
    useEffect(() => {
        const selectedCategory = categoryManagerRef.current?.selectedCategory;
        if (selectedCategory && currentVenueName !== initialVenueName) {
            setSearchResults([]);
            categoryManagerRef.current?.clearCategorySelection();
        }
    }, [currentVenueName]);

    /*
     * Get the legend sections and determine
     * If the legend button should be shown.
     */
    useEffect(() => {
        if (kioskLocation) {
            setShowLegendButton(legendSections.length > 0);
        }
    }, [kioskLocation]);


    return (
        <div className="search"
            ref={searchRef}
            style={calculateContainerStyle()}>

            {/* LocationHandler component to handle location interactions */}
            <LocationHandler
                ref={locationHandlerRef}
                onHoverLocation={handleHoverLocation}
            />

            {/* SearchField component handles search input and related UI */}
            <SearchField
                ref={searchFieldRef}
                selectedCategory={categoryManagerRef.current?.selectedCategory}
                showLegendButton={showLegendButton}
                onResults={onResults}
                onSetSize={setSize}
                onClearResults={cleared}
                kioskKeyboardRef={kioskKeyboardRef}
                isInputFieldInFocus={isInputFieldInFocus}
                setIsInputFieldInFocus={setIsInputFieldInFocus}
            />

            <ChatWindow
                userMessage={'Hi'} />

            {/* CategoryManager component to handle category logic and UI */}
            <CategoryManager
                ref={categoryManagerRef}
                onResults={onResults}
                onSetSize={setSize}
                searchFieldRef={searchFieldRef}
                setSearchResults={setSearchResults}
                setFilteredLocations={setFilteredLocations}
                showCategories={shouldShowCategories(
                    isInputFieldInFocus,
                    showNotFoundMessage,
                    categories,
                    searchResults
                )}
                showNotFoundMessage={showNotFoundMessage}
                searchResults={searchResults}
            />

            {/* SearchResults component handles error messages and search results display */}
            <SearchResults
                searchResults={searchResults}
                showNotFoundMessage={showNotFoundMessage}
                selectedCategory={categoryManagerRef.current?.selectedCategory}
                childKeys={categoryManagerRef.current?.childKeys || []}
                handleBack={() => categoryManagerRef.current?.handleBack()}
                getFilteredLocations={(category) => categoryManagerRef.current?.getFilteredLocations(category)}
                locationHandlerRef={locationHandlerRef}
                hoveredLocation={hoveredLocation}
                selectedCategoriesArray={categoryManagerRef.current?.selectedCategoriesArray || { current: [] }}
                scrollableContentSwipePrevent={scrollableContentSwipePrevent}
            />

            { /* KioskKeyboard component for kiosk mode */}

            <KioskKeyboard ref={kioskKeyboardRef} />

            { /* KioskScrollButtons component for scroll functionality in kiosk context */}

            <KioskScrollButtons
                ref={kioskScrollButtonsRef}
                isOpen={isOpen}
                searchResults={searchResults}
                searchResultsSelector=".mapsindoors-map .search-results__locations"
                primaryColor={primaryColor}
            />
        </div>
    )
}

export default Search;
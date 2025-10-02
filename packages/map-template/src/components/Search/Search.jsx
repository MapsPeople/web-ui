import './Search.scss';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import categoriesState from '../../atoms/categoriesState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import primaryColorState from '../../atoms/primaryColorState';
import isChatModeEnabledState from '../../atoms/isChatModeEnabledState';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import kioskLocationState from '../../atoms/kioskLocationState';
import searchResultsState from '../../atoms/searchResultsState';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { ReactComponent as AskWithAiIcon } from '../../assets/ask-with-ai-icon.svg';
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
    isOpen: PropTypes.bool,
    onShowRoute: PropTypes.func
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
function Search({ onSetSize, isOpen, onShowRoute }) {
    const { t } = useTranslation();

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

    // Current message to send to chat window
    const [currentChatMessage, setCurrentChatMessage] = useState('');

    // Track if chat mode is enabled
    const [isChatModeEnabled, setIsChatModeEnabled] = useRecoilState(isChatModeEnabledState);

    // State for AI search results location IDs
    const [aiSearchLocationIds, setAiSearchLocationIds] = useState([]);

    // Track whether to show the "Ask with AI" button based on character count
    const [showAskWithAiButton, setShowAskWithAiButton] = useState(false);

    // Memoize the hover callback to prevent unnecessary re-renders
    const handleHoverLocation = useCallback((location) => {
        setHoveredLocation(location);
    }, []);

    /**
     * Callback passed to SearchField as onKeyDown.
     * Invoked on every keydown event in the search input.
     * If Enter is pressed and input is not empty, enables chat mode and sends the message to ChatWindow.
     * Automatically enables chat mode if not already enabled.
     */
    const handleSearchKeyDown = useCallback((event, currentValue) => {
        if (event.key === 'Enter' && currentValue?.trim()) {
            event.preventDefault();
            
            // Enable chat mode if not already enabled
            if (!isChatModeEnabled) {
                setIsChatModeEnabled(true);
            }
            
            setCurrentChatMessage(currentValue.trim());

            // Clear the search field after sending message
            searchFieldRef.current?.clear();
        }
    }, [isChatModeEnabled]);

    /**
     * Handle Ask with AI button click from SearchField
     * @param {string} message - The search input value to send to chat
     */
    const handleOpenChatWindow = useCallback((message) => {
        if (message?.trim()) {
            setCurrentChatMessage(message.trim());
            setIsChatModeEnabled(true);

            // Clear search results to show chat window
            // setSearchResults([]);
            // setShowNotFoundMessage(false);


            // Expand the sheet to show chat window
            // setSize(snapPoints.MAX);
        }
    }, []);

    /**
     * Communicate size change to parent component.
     * Ignores size changes when chat mode is enabled to prevent layout jumping.
     *
     * @param {number} size
     */
    function setSize(size) {
        // Don't change size when chat mode is enabled to prevent layout jumping
        if (isChatModeEnabled) {
            return;
        }
        
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
     * - Not in chat mode (chat mode has its own search results handling)
     *
     * @param {boolean} isInputFieldInFocus - Whether the search field is in focus
     * @param {boolean} showNotFoundMessage - Whether "not found" message is shown
     * @param {Array} categories - Available categories
     * @param {Array} searchResults - Current search results
     * @param {boolean} isChatModeEnabled - Whether chat mode is enabled
     * @returns {boolean} Whether categories should be displayed
     */
    function shouldShowCategories(isInputFieldInFocus, showNotFoundMessage, categories, searchResults, isChatModeEnabled) {
        // Don't show categories in chat mode - chat has its own search results handling
        return isInputFieldInFocus && !showNotFoundMessage && categories.length > 0 && searchResults.length === 0 && !isChatModeEnabled;
    }

    /**
     * Handle search results from the search field.
     *
     * @param {array} locations - An array of MapsIndoors Location objects.
     * @param {boolean} fitMapBounds - If the map bounds should be adjusted to fit the locations.
     */
    function onResults(locations, fitMapBounds = false) {
        const displayResults = locations.slice(0, MAX_RESULTS);

        // Only expand the sheet to occupy the entire screen if not in chat mode
        // Chat mode has its own height management
        if (!isChatModeEnabled) {
            setSize(snapPoints.MAX);
        }

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

        // Only exit chat mode when clearing search if we're not already in chat mode
        // This prevents exiting chat mode when clearing the field after sending a message
        if (!isChatModeEnabled) {
            setIsChatModeEnabled(false);
            setCurrentChatMessage('');
            // Clear chat messages when exiting chat mode
            // setChatMessages([]);
        }

        // Clear AI search results highlighting
        setAiSearchLocationIds([]);
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

    const handleMinimizeChat = useCallback(() => {
        setIsChatModeEnabled(false);
        setSearchResults([]);

        // Disabled for now to preserve the conversation history
        // setCurrentChatMessage('');
        // Clear AI search results highlighting when minimizing chat
        setAiSearchLocationIds([]);
        // Don't clear chat messages to preserve conversation history
    }, []);

    /**
     * Fetch full location objects by their IDs
     * @param {Array} locationIds - Array of location IDs
     * @returns {Promise<Array>} Array of full location objects
     */
    const fetchLocationsByIds = useCallback(async (locationIds) => {
        if (!locationIds || locationIds.length === 0) return [];

        console.log('Search: Fetching locations by IDs:', locationIds);

        try {
            console.log('Search: Fetching full location objects for IDs:', locationIds);
            const promises = locationIds.map(id =>
                window.mapsindoors.services.LocationsService.getLocation(id)
            );
            const locations = await Promise.all(promises);
            const validLocations = locations.filter(location => location !== null);
            console.log('Search: Successfully fetched locations:', validLocations);
            return validLocations;
        } catch (error) {
            console.error('Search: Error fetching locations by IDs:', error);
            return [];
        }
    }, []);

    /**
     * Handle AI search results from ChatWindow - for map highlighting and actions
     * @param {Array} locationIds - Array of location IDs to highlight
     */
    const handleAiSearchResults = useCallback(async (locationIds) => {
        console.log('Search: Received AI search results with location IDs:', locationIds);
        setAiSearchLocationIds(locationIds);

        // Fetch full location objects for map actions (fit bounds, etc.)
        if (locationIds && locationIds.length > 0) {
            const fullLocations = await fetchLocationsByIds(locationIds);
            if (fullLocations.length > 0) {
                console.log('Search: Performing map actions for AI search results:', fullLocations);
                // Fit map bounds to show all AI search result locations
                locationHandlerRef.current?.fitMapBoundsToLocations(fullLocations);
            }
        }
    }, [fetchLocationsByIds]);

    /*
     * Monitors clicks to manage sheet size and input focus state
     */
    useEffect(() => {
        const SEARCH_FOCUS_ELEMENTS = ['.search__info', '.search__back-button', '.categories', '.sheet__content', '.search'];

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
                // Only expand to MAX height if not in chat mode
                // Chat mode has its own height management
                if (!isChatModeEnabled) {
                    setSize(snapPoints.MAX);
                }
                requestAnimationFrameId.current = requestAnimationFrame(() => { // we use a requestAnimationFrame to ensure that the size change is applied before the focus (meaning that categories are rendered)
                    setIsInputFieldInFocus(true);
                });
            } else if (!clickedInsideResults && !clickedInsideIgnoreArea) {
                setIsInputFieldInFocus(false);
                setSize(snapPoints.MIN);

                // No need to clear category selection when in chat mode
                if (!isChatModeEnabled) {
                    categoryManagerRef.current?.clearCategorySelection();
                    setSearchResults([]);
                    setFilteredLocations([]);
                }
                // Exit chat mode when clicking outside
                // setIsChatModeEnabled(false);
                // setCurrentChatMessage('');
                // setIsAiSearchResults(false); // Reset AI search results flag
                // Clear AI search results highlighting
                // setAiSearchLocationIds([]);
                // Clear chat messages when exiting chat mode
                // setChatMessages([]);
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
    }, [isOpen, isChatModeEnabled]);

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

    /*
     * Handle AI search results highlighting on the map
     */
    useEffect(() => {
        if (aiSearchLocationIds.length > 0 && locationHandlerRef.current) {
            // Use the MapsIndoors instance to highlight the locations
            const mapsIndoorsInstance = window.mapsIndoorsInstance;
            if (mapsIndoorsInstance && mapsIndoorsInstance.highlight) {
                console.log('Search: Highlighting AI search results on map:', aiSearchLocationIds);
                mapsIndoorsInstance.highlight(aiSearchLocationIds, false);
            }
        } else if (aiSearchLocationIds.length === 0) {
            // Clear highlighting when no AI search results
            const mapsIndoorsInstance = window.mapsIndoorsInstance;
            if (mapsIndoorsInstance && mapsIndoorsInstance.highlight) {
                mapsIndoorsInstance.highlight([], false);
            }
        }
    }, [aiSearchLocationIds]);

    /*
     * Track searchFieldRef character count, log it, and manage "Ask with AI" button visibility
     * Shows the "Ask with AI" button when character count is greater than 5
     * Only tracks character count when NOT in chat mode
     * TODO: This is probably not the best way to do this, but it works for now
     */
    useEffect(() => {
        // Don't track character count when chat mode is enabled
        if (isChatModeEnabled) {
            setShowAskWithAiButton(false);
            return;
        }
        // Don't track character count when input field is not in focus
        if (!isInputFieldInFocus) return;

        // Track character count when input field is in focus to determine if "Ask with AI" button should be shown
        const trackCharacterCount = () => {
            if (searchFieldRef.current) {
                const currentValue = searchFieldRef.current.getValue();
                const characterCount = currentValue ? currentValue.length : 0;
                // Set showAskWithAiButton based on character count, arbitrary number for now
                setShowAskWithAiButton(characterCount > 5);
                return characterCount;
            }
            setShowAskWithAiButton(false);
            return 0;
        };

        // Track character count when component mounts and when search field value changes
        trackCharacterCount();

        // Set up an interval to periodically check character count
        // This ensures we catch changes that might not trigger other effects
        const intervalId = setInterval(trackCharacterCount, 300);

        return () => {
            clearInterval(intervalId);
        };
    }, [isChatModeEnabled, isInputFieldInFocus]);


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
                onKeyDown={handleSearchKeyDown}
                kioskKeyboardRef={kioskKeyboardRef}
                isInputFieldInFocus={isInputFieldInFocus}
                setIsInputFieldInFocus={setIsInputFieldInFocus}
                isChatModeEnabled={isChatModeEnabled}
                onCloseChat={handleMinimizeChat}
            />

            {/* Ask with AI button - only show when not in chat mode and no existing messages */}
            {!isChatModeEnabled && isInputFieldInFocus && showAskWithAiButton && (
                <button
                    className="search__ask-ai-button"
                    style={{ '--ask-ai-button-primary-color': primaryColor }}
                    onClick={(e) => {
                        e.stopPropagation();
                        const currentValue = searchFieldRef.current?.getValue();
                        if (currentValue?.trim()) {
                            handleOpenChatWindow(currentValue.trim());
                            // Clear the search field after sending message to chat
                            searchFieldRef.current?.clear();
                        } else {
                            // If no current value, just open the chat window
                            setIsChatModeEnabled(true);
                        }
                    }}
                    type="button"
                >
                    <AskWithAiIcon />
                    {t('Ask with AI')}
                </button>
            )}

            <ChatWindow
                message={currentChatMessage}
                isEnabled={isChatModeEnabled}
                onMinimize={handleMinimizeChat}
                onSearchResults={handleAiSearchResults}
                locationHandlerRef={locationHandlerRef}
                hoveredLocation={hoveredLocation}
                onShowRoute={onShowRoute}
            />

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
                    searchResults,
                    isChatModeEnabled
                )}
                showNotFoundMessage={showNotFoundMessage}
                searchResults={searchResults}
            />

            {/* SearchResults component handles error messages and search results display */}
            {/* Only show SearchResults when not in chat mode - ChatSearchResults handles AI results */}
            {!isChatModeEnabled && <SearchResults
                searchResults={searchResults}
                showNotFoundMessage={showNotFoundMessage && !showAskWithAiButton}
                selectedCategory={categoryManagerRef.current?.selectedCategory}
                childKeys={categoryManagerRef.current?.childKeys || []}
                handleBack={() => categoryManagerRef.current?.handleBack()}
                getFilteredLocations={(category) => categoryManagerRef.current?.getFilteredLocations(category)}
                locationHandlerRef={locationHandlerRef}
                hoveredLocation={hoveredLocation}
                selectedCategoriesArray={categoryManagerRef.current?.selectedCategoriesArray || { current: [] }}
                scrollableContentSwipePrevent={scrollableContentSwipePrevent}
            />}

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
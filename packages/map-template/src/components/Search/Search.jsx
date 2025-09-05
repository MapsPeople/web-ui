import './Search.scss';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import categoriesState from '../../atoms/categoriesState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import primaryColorState from '../../atoms/primaryColorState';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search/Search';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import languageState from '../../atoms/languageState';
import { useTranslation } from 'react-i18next';
import kioskLocationState from '../../atoms/kioskLocationState';
import searchResultsState from '../../atoms/searchResultsState';
import selectedCategoryState from '../../atoms/selectedCategoryState';
import Categories from './Categories/Categories';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { ReactComponent as Legend } from '../../assets/legend.svg';
import isLegendDialogVisibleState from '../../atoms/isLegendDialogVisibleState';
import legendSortedFieldsSelector from '../../selectors/legendSortedFieldsSelector';
import searchAllVenuesState from '../../atoms/searchAllVenues';
import venuesInSolutionState from '../../atoms/venuesInSolutionState';
import initialVenueNameState from '../../atoms/initialVenueNameState';
import LocationHandler from './components/LocationHandler/LocationHandler';
import KioskKeyboard from './components/Kiosk/KioskKeyboard';
import KioskScrollButtons from './components/Kiosk/KioskScrollButtons';
import PropTypes from 'prop-types';

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

    /** Maximum number of search results to show */
    const MAX_RESULTS = 100;

    const [searchDisabled, setSearchDisabled] = useState(true);
    const [searchResults, setSearchResults] = useRecoilState(searchResultsState);
    const categories = useRecoilValue(categoriesState);
    const primaryColor = useRecoilValue(primaryColorState);

    /** Indicate if search results have been found */
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);

    const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const [hoveredLocation, setHoveredLocation] = useState();

    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);

    const currentVenueName = useRecoilValue(currentVenueNameState);

    const currentLanguage = useRecoilValue(languageState);

    const isDesktop = useIsDesktop();

    const kioskLocation = useRecoilValue(kioskLocationState);

    const isKioskContext = useIsKioskContext();

    const [, setShowLegendDialog] = useRecoilState(isLegendDialogVisibleState);

    const [showLegendButton, setShowLegendButton] = useState(false);

    const legendSections = useRecoilValue(legendSortedFieldsSelector);

    const searchAllVenues = useRecoilValue(searchAllVenuesState);

    const venuesInSolution = useRecoilValue(venuesInSolutionState);

    const initialVenueName = useRecoilValue(initialVenueNameState);

    const [isInputFieldInFocus, setIsInputFieldInFocus] = useState(false);

    const selectedCategoriesArray = useRef([]);

    const [childKeys, setChildKeys] = useState([]);

    // Memoize the hover callback to prevent unnecessary re-renders
    const handleHoverLocation = useCallback((location) => {
        setHoveredLocation(location);
    }, []);

    /**
     * Handles go back function.
     */
    function handleBack() {
        // If selected categories tree has only parent category, then on back, we need to perform those clear functions.
        // Else, remove child category from selected categories tree array.
        if (selectedCategoriesArray.current.length === 1) {
            setSelectedCategory(null);
            setSearchResults([]);
            setFilteredLocations([]);
            setSize(snapPoints.FIT);
            setIsInputFieldInFocus(true);

            // If there's a search term and it's not just whitespace, re-trigger the search without category filter
            const searchValue = searchFieldRef.current?.getValue()?.trim();
            if (searchValue) {
                searchFieldRef.current.triggerSearch();
            } else {
                // If it's empty or just whitespace, clear the search field
                searchFieldRef.current?.clear();
            }
            selectedCategoriesArray.current.pop();
        } else {
            selectedCategoriesArray.current.pop()
            setSelectedCategory(selectedCategoriesArray.current[0])
        }
    }

    /**
     *
     * Get the locations and filter through them based on categories selected.
     *
     * @param {string} category
     */
    function getFilteredLocations(category) {
        // Creates a selected categoriers tree, where first category in the array is parent and second one is child
        // Ensure category is unique before pushing to selectedCategories.current
        if (!selectedCategoriesArray.current.includes(category)) {
            selectedCategoriesArray.current.push(category);
        }

        // If child category is being selected, we need to clear parent categories results in order to load proper data that belongs to child category.
        if (selectedCategory) {
            setSelectedCategory([]);
            setSearchResults([]);
            setFilteredLocations([]);
        }
        setSelectedCategory(category)

        // Regarding the venue name: The venue parameter in the SDK's getLocations method is case sensitive.
        // So when the currentVenueName is set based on a Locations venue property, the casing may differ.
        // Thus we need to find the venue name from the list of venues.
        window.mapsindoors.services.LocationsService.getLocations({
            categories: category,
            venue: searchAllVenues ? undefined : venuesInSolution.find(venue => venue.name.toLowerCase() === currentVenueName.toLowerCase())?.name,
        }).then(results => onResults(results, true));
    }

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
        if (selectedCategory) {
            getFilteredLocations(selectedCategory);
        }

        setFilteredLocations([]);

        // Clear the keyboard input field through KioskKeyboard component
        kioskKeyboardRef.current?.clearInputField();
    }

    /**
     * When search field is clicked, maximize the sheet size and set focus on the input field.
     * Wait for any bottom sheet transition to end before focusing to avoid content jumping.
     */
    function searchFieldClicked() {
        setSearchDisabled(false);
        searchFieldRef.current.getInputField();

        const sheet = searchRef.current.closest('.sheet');
        if (sheet) {
            sheet.addEventListener('transitionend', () => {
                searchFieldRef.current.focusInput();
                setIsInputFieldInFocus(true);
            }, { once: true });
        } else {
            searchFieldRef.current.focusInput();
            setIsInputFieldInFocus(true);
        }
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

            const clickedInsideResults = event.target.closest('.search__results');

            if (clickedInsideSearchArea) {
                setSize(snapPoints.MAX);
                requestAnimationFrameId.current = requestAnimationFrame(() => { // we use a requestAnimationFrame to ensure that the size change is applied before the focus (meaning that categories are rendered)
                    setIsInputFieldInFocus(true);
                });
            } else if (!clickedInsideResults && !clickedInsideIgnoreArea) {
                setIsInputFieldInFocus(false);
                setSize(snapPoints.MIN);
                setSelectedCategory(null);
                setSearchResults([]);
                setFilteredLocations([]);
                selectedCategoriesArray.current = [];
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
        if (selectedCategory && currentVenueName !== initialVenueName) {
            setSearchResults([]);
            setSelectedCategory(null);
        }
    }, [currentVenueName]);

    /*
     * React on changes in the app language. Any existing category search needs to update with translated Locations.
     */
    useEffect(() => {
        if (selectedCategory) {
            window.mapsindoors.services.LocationsService.once('update_completed', () => {
                searchFieldRef.current.triggerSearch();
            });
        }
    }, [currentLanguage]);

    /*
     * React on changes in the selected category state.
     * If the selected category is present, get the filtered locations based on the selected category.
     */
    useEffect(() => {
        if (selectedCategory) {
            getFilteredLocations(selectedCategory);
        }
    }, [selectedCategory]);

    /*
     * Get the legend sections and determine
     * If the legend button should be shown.
     */
    useEffect(() => {
        if (kioskLocation) {
            setShowLegendButton(legendSections.length > 0);
        }
    }, [kioskLocation]);

    /**
     *
     */
    useEffect(() => {
        const childKeys = categories.find(([key]) => key === selectedCategory)?.[1]?.childKeys || [];
        setChildKeys(childKeys)
    }, [categories, selectedCategory])


    return (
        <div className="search"
            ref={searchRef}
            style={calculateContainerStyle()}>

            {/* LocationHandler component to handle location interactions */}
            <LocationHandler
                ref={locationHandlerRef}
                onHoverLocation={handleHoverLocation}
            />

            { /* Search info which includes legend button if in a Kiosk context. */}

            <div className="search__info" style={{ gridTemplateColumns: isKioskContext && showLegendButton ? 'min-content 1fr' : 'auto' }}>
                {isKioskContext && showLegendButton && <button className="search__legend" onClick={() => setShowLegendDialog(true)}><Legend /></button>}

                { /* Search field that allows users to search for locations (MapsIndoors Locations and external) */}
                <label className="search__label">
                    <span>{t('Search by name, category, building...')}</span>
                    <SearchField
                        ref={searchFieldRef}
                        mapsindoors={true}
                        placeholder={t('Search by name, category, building...')}
                        results={locations => onResults(locations)}
                        clicked={() => searchFieldClicked()}
                        cleared={() => cleared()}
                        category={selectedCategory}
                        disabled={searchDisabled} // Disabled initially to prevent content jumping when clicking and changing sheet size.
                    />
                </label>
            </div>

            {/* Vertical list of Categories */}
            {/* Show full category list only when searchResults are empty */}
            {isInputFieldInFocus && !showNotFoundMessage && categories.length > 0 && searchResults.length === 0 && (
                <Categories
                    onSetSize={onSetSize}
                    searchFieldRef={searchFieldRef}
                    getFilteredLocations={(category) => getFilteredLocations(category)}
                    isOpen={!!selectedCategory}
                    topLevelCategory={true}
                />
            )}

            {/* Message shown if no search results were found */}
            {showNotFoundMessage && <p className="search__error"> {t('Nothing was found')}</p>}

            {/* When search results are found (category is selected or search term is used) */}
            {searchResults.length > 0 && (
                <div className="search__results prevent-scroll" {...scrollableContentSwipePrevent}>

                    {/* Subcategories should only show if a top level category is selected and if that top level category has any childKeys */}
                    {selectedCategory && (
                        <Categories
                            handleBack={handleBack}
                            getFilteredLocations={(category) => getFilteredLocations(category)}
                            onLocationClicked={locationHandlerRef.current?.onLocationClicked}
                            childKeys={childKeys}
                            topLevelCategory={false}
                            selectedCategoriesArray={selectedCategoriesArray}
                        />
                    )}

                    {/* Show locations when there are any searchResults */}
                    <div className="search__results">
                        {searchResults.map(location =>
                            <ListItemLocation
                                key={location.id}
                                location={location}
                                locationClicked={() => locationHandlerRef.current?.onLocationClicked(location)}
                                isHovered={location?.id === hoveredLocation?.id}
                            />
                        )}
                    </div>
                </div>
            )}

            { /* KioskKeyboard component for kiosk mode */}

            <KioskKeyboard ref={kioskKeyboardRef} />

            { /* KioskScrollButtons component for scroll functionality in kiosk context */}

            <KioskScrollButtons
                ref={kioskScrollButtonsRef}
                isOpen={isOpen}
                searchResults={searchResults}
                searchResultsSelector=".mapsindoors-map .search__results"
                primaryColor={primaryColor}
            />
        </div>
    )
}

export default Search;
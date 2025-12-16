import './Search.scss';
import { useRef, useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import appConfigState from '../../atoms/appConfigState';
import categoriesState from '../../atoms/categoriesState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search/Search';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import currentLocationState from '../../atoms/currentLocationState';
import isLocationClickedState from '../../atoms/isLocationClickedState';
import getDesktopPaddingLeft from '../../helpers/GetDesktopPaddingLeft';
import languageState from '../../atoms/languageState';
import { useTranslation } from 'react-i18next';
import kioskLocationState from '../../atoms/kioskLocationState';
import getDesktopPaddingBottom from '../../helpers/GetDesktopPaddingBottom';
import { createPortal } from 'react-dom';
import useKeyboardState from '../../atoms/useKeyboardState';
import Keyboard from '../WebComponentWrappers/Keyboard/Keyboard';
import searchInputState from '../../atoms/searchInputState';
import searchResultsState from '../../atoms/searchResultsState';
import selectedCategoryState from '../../atoms/selectedCategoryState';
import Categories from './Categories/Categories';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { ReactComponent as Legend } from '../../assets/legend.svg';
import isLegendDialogVisibleState from '../../atoms/isLegendDialogVisibleState';
import legendSortedFieldsSelector from '../../selectors/legendSortedFieldsSelector';
import searchAllVenuesState from '../../atoms/searchAllVenues';
import isNullOrUndefined from '../../helpers/isNullOrUndefined';
import venuesInSolutionState from '../../atoms/venuesInSolutionState';
import initialVenueNameState from '../../atoms/initialVenueNameState';
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
    const appConfig = useRecoilValue(appConfigState);

    const { t } = useTranslation();

    const searchRef = useRef();
    const scrollButtonsRef = useRef();
    const requestAnimationFrameId = useRef();

    /** Referencing the search field */
    const searchFieldRef = useRef();

    /** Referencing the keyboard element */
    const keyboardRef = useRef();

    /** Maximum number of search results to show */
    const MAX_RESULTS = 100;
    const [searchResults, setSearchResults] = useRecoilState(searchResultsState);
    const categories = useRecoilValue(categoriesState);
    const useKeyboard = useRecoilValue(useKeyboardState);

    /** Indicate if search results have been found */
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);

    const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const [hoveredLocation, setHoveredLocation] = useState();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);

    const [, setCurrentLocation] = useRecoilState(currentLocationState);

    const [, setIsLocationClicked] = useRecoilState(isLocationClickedState);

    const [currentVenueName, setCurrentVenueName] = useRecoilState(currentVenueNameState);

    const currentLanguage = useRecoilValue(languageState);

    const isDesktop = useIsDesktop();

    const kioskLocation = useRecoilValue(kioskLocationState);

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const searchInput = useRecoilValue(searchInputState);

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

    const [areHorizontalCategoriesEnabled, setAreHorizontalCategoriesEnabled] = useState(false);

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
     * Sort search results alphabetically if configured to do so and a category is selected.
     *
     * @param {Array} results - Array of search results
     * @returns {Array} Sorted or original array based on configuration
     */
    function getSortedSearchResults(results) {
        if (selectedCategory) {
            return [...results].sort((a, b) => {
                return (a.properties?.name || '')
                    .localeCompare(b.properties?.name || '', undefined, { numeric: true });
            })
        }

        return results;
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
            fitMapBoundsToLocations(locations);
        }

        // Handles updates to scroll buttons when the category changes.
        // When a category changes, the scroll buttons need to have their enabled/disabled states updated.
        // Since some categories might load before the DOM element is fully rendered, we listen for the 'transitionend' event.
        // The 'transitionend' event is triggered when the DOM element changes its size, which can occur as a result of new categories being fetched.
        // Upon completion of the size transition, the 'updateScrollButtons' function is triggered to handle the updated state.
        if (isKioskContext) {
            searchRef.current?.addEventListener('transitionend', () => {
                scrollButtonsRef?.current?.updateScrollButtons();
            }, { once: true });
        }
    }


    /**
     * Adjusts the map view to fit the bounds of the provided locations.
     * It will filter out Locations that are not on the current floor or not part of the current venue.
     *
     * @param {Array} locations - An array of Location objects to fit within the map bounds.
     */
    function fitMapBoundsToLocations(locations) {
        if (!mapsIndoorsInstance.goTo) return; // Early exit to prevent crashes if using an older version of the MapsIndoors JS SDK. The goTo method was introduced in version 4.38.0.

        const currentFloorIndex = mapsIndoorsInstance.getFloor();

        // Create a GeoJSON FeatureCollection from the locations that can be used as input to the goTo method.
        const featureCollection = {
            type: 'FeatureCollection',
            features: locations
                // Filter out locations that are not on the current floor. If those were included, it could result in a wrong fit since they are not visible on the map anyway.
                .filter(location => parseInt(location.properties.floor, 10) === parseInt(currentFloorIndex, 10))

                // Filter out locations that are not part of the current venue. Including those when fitting to bounds could cause the map to zoom out too much.
                .filter(location => location.properties.venueId.toLowerCase() === currentVenueName.toLowerCase())

                // Map the locations to GeoJSON features.
                .map(location => ({
                    type: 'Feature',
                    geometry: location.geometry,
                    properties: location.properties
                }))
        };

        if (featureCollection.features.length > 0) {
            Promise.all([getBottomPadding(), getLeftPadding()]).then(([bottomPadding, leftPadding]) => {
                mapsIndoorsInstance.goTo(featureCollection, {
                    maxZoom: 22,
                    padding: { bottom: bottomPadding, left: leftPadding, top: 0, right: 0 }
                });
            });
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

        // If keyboard is not null or undefined, clear the input field
        if (!isNullOrUndefined(keyboardRef.current)) {
            keyboardRef.current.clearInputField();
        }
    }

    /**
     * When search field is clicked, maximize the sheet size and set focus on the from field,
     * and if the useKeyboard prop is present, show the onscreen keyboard.
     * But wait for any bottom sheet transition to end before doing that to avoid content jumping when virtual keyboard appears.
     */
    function searchFieldClicked() {
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
     * Handle hovering over location.
     *
     * @param {object} location
     */
    function onMouseEnter(location) {
        setHoveredLocation(location);
    }

    /**
     * Handle locations clicked on the map.
     *
     * @param {object} location
     */
    function onLocationClicked(location) {
        setCurrentLocation(location);

        // Set the current venue to be the selected location venue.
        if (location.properties.venueId.toLowerCase() !== currentVenueName.toLowerCase()) {
            setCurrentVenueName(location.properties.venueId);
            setIsLocationClicked(true);
        }

        const currentFloor = mapsIndoorsInstance.getFloor();
        const locationFloor = location.properties.floor;

        // Set the floor to the one that the location belongs to.
        if (locationFloor !== currentFloor) {
            mapsIndoorsInstance.setFloor(locationFloor);
        }

        Promise.all([getBottomPadding(), getLeftPadding()]).then(([bottomPadding, leftPadding]) => {
            mapsIndoorsInstance.goTo(location, {
                maxZoom: 22,
                padding: { bottom: bottomPadding, left: leftPadding, top: 0, right: 0 }
            });
        });
    }

    /**
     * Get bottom padding when selecting a location.
     * Calculate all cases depending on the kioskLocation id prop as well.
     */
    function getBottomPadding() {
        return new Promise((resolve) => {
            if (isDesktop) {
                if (kioskLocation) {
                    getDesktopPaddingBottom().then(padding => resolve(padding));
                } else {
                    resolve(0);
                }
            } else {
                resolve(200);
            }
        });
    }

    /**
     * Get left padding when selecting a location.
     * Calculate all cases depending on the kioskLocation id prop as well.
     */
    function getLeftPadding() {
        return new Promise((resolve) => {
            if (isDesktop) {
                if (kioskLocation) {
                    resolve(0);
                } else {
                    getDesktopPaddingLeft().then(padding => resolve(padding));
                }
            } else {
                resolve(0);
            }
        });
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

    /**
     * Determines if categories should be shown under the search field in kiosk mode.
     *
     * @returns {boolean} True if in kiosk context and showCategoriesUnderSearch is enabled, otherwise false.
     */
    function shouldShowCategoriesUnderSearch() {
        // We determine wether to show categories horizontally or vertically based on the areHorizontalCategoriesEnabled setting.
        // Each layout has different styling and thus needs to be treated as separate options.
        return isKioskContext && areHorizontalCategoriesEnabled;
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
     * Sets currently hovered location.
     */
    useEffect(() => {
        return () => {
            setHoveredLocation();
        }
    }, []);

    /*
     * Reset search state when Search component opens to ensure it starts in default state.
     * This is particularly important when returning from directions/wayfinding.
     * Only reset if there's stale state (results or category tree) without a selected category
     */
    useEffect(() => {
        // Only reset if Search is open, no category selected, but stale data exists
        if (isOpen && !selectedCategory) {
            // Reset search results and filtered locations
            setSearchResults([]);
            setFilteredLocations([]);
            setShowNotFoundMessage(false);
            
            // Clear the category selection tree
            selectedCategoriesArray.current = [];
        }
    }, [isOpen, selectedCategory]);

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
     * Handle location hover.
     */
    useEffect(() => {
        mapsIndoorsInstance?.on('mouseenter', onMouseEnter);
        return () => {
            mapsIndoorsInstance?.off('mouseenter', onMouseEnter);
        }
    }, [mapsIndoorsInstance]);

    /*
     * Setup scroll buttons to scroll in search results list when in kiosk mode.
     */
    useEffect(() => {
        if (isOpen && isKioskContext && searchResults.length > 0) {
            const searchResultsElement = document.querySelector('.mapsindoors-map .search__results');
            scrollButtonsRef.current.scrollContainerElementRef = searchResultsElement;
        }
    }, [searchResults, isOpen]);

    /*
     * When useKeyboard parameter is present, add click event listener which determines when the keyboard should be shown or not.
     */
    useEffect(() => {
        if (useKeyboard) {
            const onClick = (event) => {
                // Use the closest() method to check if the element that has been clicked traverses the element and its parents
                // until it finds a node that matches the 'mi-keyboard' selector.
                // If the user clicks on the keyboard or the search fields, the keyboard should stay visible.
                if (event.target.closest('mi-keyboard') ||
                    event.target.tagName.toUpperCase() === 'MI-SEARCH' ||
                    event.target.tagName.toUpperCase() === 'INPUT') {
                    setIsKeyboardVisible(true)
                } else {
                    setIsKeyboardVisible(false);
                }
            };

            window.addEventListener('click', onClick, false);
            return () => {
                window.removeEventListener('click', onClick, false);
            };
        }
    }, [useKeyboard]);

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
    }, [categories, selectedCategory]);

    /*
     * Get app config and determine if categories should be shown under the search field in kiosk mode.
     */
    useEffect(() => {
        setAreHorizontalCategoriesEnabled(appConfig?.appSettings?.areHorizontalCategoriesEnabled === true || appConfig?.appSettings?.areHorizontalCategoriesEnabled === 'true');
    }, [appConfig]);


    return (
        <div className="search"
            ref={searchRef}
            style={calculateContainerStyle()}>

            { /* Search info which includes legend button if in a Kiosk context. */}

            <div className="search__info" style={{ gridTemplateColumns: isKioskContext && showLegendButton ? 'min-content 1fr' : 'auto' }}>
                {isKioskContext && showLegendButton && <button className="search__legend" onClick={() => setShowLegendDialog(true)} aria-label={t('Show legend')}><Legend /></button>}

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
                        disabled={!isOpen} // Disabled when not open to prevent content jumping, enabled when open for keyboard accessibility
                    />
                </label>
            </div>

            {/* Vertical list of Categories */}
            {/* Show full category list if (kiosk mode and showCategoriesUnderSearch is true) OR input is in focus, and only when searchResults are empty */}
            {(shouldShowCategoriesUnderSearch() || isInputFieldInFocus) && !showNotFoundMessage && categories.length > 0 && searchResults.length === 0 && (
                <Categories
                    onSetSize={onSetSize}
                    searchFieldRef={searchFieldRef}
                    getFilteredLocations={(category) => getFilteredLocations(category)}
                    isOpen={!!selectedCategory}
                    topLevelCategory={true}
                    categoryOrientation={areHorizontalCategoriesEnabled ? 'horizontal' : 'vertical'}
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
                            onLocationClicked={onLocationClicked}
                            childKeys={childKeys}
                            topLevelCategory={false}
                            selectedCategoriesArray={selectedCategoriesArray}
                            categoryOrientation={areHorizontalCategoriesEnabled ? 'horizontal' : 'vertical'}
                        />
                    )}

                    {/* Show locations when there are any searchResults */}
                    {getSortedSearchResults(searchResults).map(location =>
                        <ListItemLocation
                            key={location.id}
                            location={location}
                            locationClicked={() => onLocationClicked(location)}
                            isHovered={location?.id === hoveredLocation?.id}
                        />
                    )}
                </div>
            )}

            { /* Keyboard */}

            {isKeyboardVisible && isDesktop && <Keyboard ref={keyboardRef} searchInputElement={searchInput}></Keyboard>}

            { /* Buttons to scroll in the list of search results if in kiosk context */}

            {isOpen && isKioskContext && searchResults.length > 0 && createPortal(
                <div className="search__scroll-buttons">
                    <mi-scroll-buttons ref={scrollButtonsRef}></mi-scroll-buttons>
                </div>,
                document.querySelector('.mapsindoors-map')
            )}
        </div>
    )
}

export default Search;
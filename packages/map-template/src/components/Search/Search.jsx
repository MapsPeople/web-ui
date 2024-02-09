import './Search.scss';
import { useRef, useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
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
import fitBoundsLocation from '../../helpers/fitBoundsLocation';
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
import { useIsKioskContext } from "../../hooks/useIsKioskContext";
import { useIsDesktop } from '../../hooks/useIsDesktop';

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
    const scrollButtonsRef = useRef();

    /** Referencing the search field */
    const searchFieldRef = useRef();

    /** Referencing the keyboard element */
    const keyboardRef = useRef();

    const [searchDisabled, setSearchDisabled] = useState(true);
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

    const [currentVenueId, setCurrentVenueId] = useRecoilState(currentVenueNameState);

    const currentLanguage = useRecoilValue(languageState);

    const isDesktop = useIsDesktop();

    const kioskLocation = useRecoilValue(kioskLocationState);

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const searchInput = useRecoilValue(searchInputState);

    const isKioskContext = useIsKioskContext();

    /**
     * Get the locations and filter through them based on categories selected.
     *
     * @param {string} category
     */
    function getFilteredLocations(category) {
        window.mapsindoors.services.LocationsService.getLocations({
            categories: category,
            venue: kioskLocation && isKioskContext ? kioskLocation.properties.venueId : undefined,
        }).then(onResults);
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
     * @param {array} locations
     */
    function onResults(locations) {
        setSearchResults(locations);
        setFilteredLocations(locations);
        setShowNotFoundMessage(locations.length === 0);
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

        // If keyboard is not null, clear the input field
        if (keyboardRef.current !== null) {
            keyboardRef.current.clearInputField();
        }
    }

    /**
     * When search field is clicked, maximize the sheet size and set focus on the from field,
     * and if the useKeyboard prop is present, show the onscreen keyboard.
     * But wait for any bottom sheet transition to end before doing that to avoid content jumping when virtual keyboard appears.
     */
    function searchFieldClicked() {
        setSize(snapPoints.MAX);
        setSearchDisabled(false);
        searchFieldRef.current.getInputField();

        const sheet = searchRef.current.closest('.sheet');
        if (sheet) {
            sheet.addEventListener('transitionend', () => {
                searchFieldRef.current.focusInput();
            }, { once: true });
        } else {
            searchFieldRef.current.focusInput();
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
        if (location.properties.venueId !== currentVenueId) {
            setCurrentVenueId(location.properties.venueId);
            setIsLocationClicked(true);
        }

        const currentFloor = mapsIndoorsInstance.getFloor();
        const locationFloor = location.properties.floor;

        // Set the floor to the one that the location belongs to.
        if (locationFloor !== currentFloor) {
            mapsIndoorsInstance.setFloor(locationFloor);
        }

        Promise.all([getBottomPadding(), getLeftPadding()]).then(([bottomPadding, leftPadding]) => {
            fitBoundsLocation(location, mapsIndoorsInstance, bottomPadding, leftPadding);
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
        } else {
            return { minHeight: categories.length > 0 ? '136px' : '80px' };
        }
    }

    /*
     * React on changes in the venue prop.
     * Deselect category and clear results list.
     */
    useEffect(() => {
        if (selectedCategory) {
            setSearchResults([]);
            setSelectedCategory(null);
        }
    }, [currentVenueId]);

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
        mapsIndoorsInstance.on('mouseenter', onMouseEnter);
        return () => {
            mapsIndoorsInstance.off('mouseenter', onMouseEnter);
        }
    });

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

            window.addEventListener("click", onClick, false);
            return () => {
                window.removeEventListener("click", onClick, false);
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

    return (
        <div className="search"
            ref={searchRef}
            style={calculateContainerStyle()}>



            { /* Search field that allows users to search for locations (MapsIndoors Locations and external) */}

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



            { /* Horizontal list of Categories */}

            {categories.length > 0 && <Categories onSetSize={onSetSize}
                searchFieldRef={searchFieldRef}
                getFilteredLocations={category => getFilteredLocations(category)}
            />}



            { /* Message shown if no search results were found */}

            {showNotFoundMessage && <p className="search__error"> {t('Nothing was found')}</p>}



            { /* Vertical list of search results. Scrollable. */}

            {searchResults.length > 0 &&
                <div className="search__results prevent-scroll" {...scrollableContentSwipePrevent}>
                    {searchResults.map(location =>
                        <ListItemLocation
                            key={location.id}
                            location={location}
                            locationClicked={() => onLocationClicked(location)}
                            isHovered={location?.id === hoveredLocation?.id}
                        />)}
                </div>
            }



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
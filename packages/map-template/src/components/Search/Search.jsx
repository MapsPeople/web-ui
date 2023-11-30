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
import primaryColorState from '../../atoms/primaryColorState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import currentLocationState from '../../atoms/currentLocationState';
import isLocationClickedState from '../../atoms/isLocationClickedState';
import useMediaQuery from '../../hooks/useMediaQuery';
import fitBoundsLocation from '../../helpers/fitBoundsLocation';
import getDesktopPaddingLeft from '../../helpers/GetDesktopPaddingLeft';
import { useTranslation } from 'react-i18next';

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {[[string, number]]} props.categories - All the unique categories that users can filter through.
 * @param {function} props.onSetSize - Callback that is fired when the search field takes focus.
 *
 * @returns
 */
function Search({ onSetSize }) {

    const { t } = useTranslation();

    const searchRef = useRef();

    /** Referencing the search field */
    const searchFieldRef = useRef();

    const [searchDisabled, setSearchDisabled] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const categories = useRecoilValue(categoriesState);

    /** Indicate if search results have been found */
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);

    /** Referencing the categories results container DOM element */
    const categoriesListRef = useRef();

    /** Determines which category has been selected */
    const [selectedCategory, setSelectedCategory] = useState();

    const scrollableContentSwipePrevent = usePreventSwipe();

    const primaryColor = useRecoilValue(primaryColorState);

    const [hoveredLocation, setHoveredLocation] = useState();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);

    const [, setCurrentLocation] = useRecoilState(currentLocationState);

    const [, setIsLocationClicked] = useRecoilState(isLocationClickedState);

    const [currentVenueId, setCurrentVenueId] = useRecoilState(currentVenueNameState);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    /**
     * Get the locations and filter through them based on categories selected.
     *
     * @param {string} category
     */
    function getFilteredLocations(category) {
        window.mapsindoors.services.LocationsService.getLocations({
            categories: category,
        }).then(onResults);
    }

    /**
     * Handles the click events on the categories list.
     *
     * @param {string} category
     */
    function categoryClicked(category) {
        setSelectedCategory(category);
        setSize(snapPoints.MAX);

        if (selectedCategory === category) {
            // If the clicked category is the same as currently selected, "deselect" it.
            setSearchResults([]);
            setSelectedCategory(null);

            // Pass an empty array to the filtered locations in order to reset the locations.
            setFilteredLocations([]);

            // Check if the search field has a value and trigger the search again.
            if (searchFieldRef.current.getValue()) {
                searchFieldRef.current.triggerSearch();
            }
        } else if (searchFieldRef.current.getValue()) {
            // If the search field has a value, trigger a research based on the new category.
            searchFieldRef.current.triggerSearch();
        } else {
            // If the search field is empty, show all locations with that category.
            getFilteredLocations(category);
        }
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
    }

    /**
     * When search field is clicked, maximize the sheet size and set focus on the from field.
     * But wait for any bottom sheet transition to end before doing that to avoid content jumping when virtual keyboard appears.
     */
    function searchFieldClicked() {
        setSize(snapPoints.MAX);
        setSearchDisabled(false);

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

        fitBoundsLocation(location, mapsIndoorsInstance, isDesktop ? 0 : 200, isDesktop ? getDesktopPaddingLeft() : 0)
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
     * Handle location hover.
     */
    useEffect(() => {
        mapsIndoorsInstance.on('mouseenter', onMouseEnter);
        return () => {
            mapsIndoorsInstance.off('mouseenter', onMouseEnter);
        }
    });

    return (
        <div className="search"
            ref={searchRef}
            style={{ minHeight: categories.length > 0 ? '136px' : '80px' }}>
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
            <div className="search__scrollable prevent-scroll" {...scrollableContentSwipePrevent}>
                {categories.length > 0 &&
                    <div ref={categoriesListRef} className="search__categories">
                        {categories?.map(([category, categoryInfo]) =>
                            <mi-chip
                                icon={categoryInfo.iconUrl}
                                background-color={primaryColor}
                                content={categoryInfo.displayName}
                                active={selectedCategory === category}
                                onClick={() => categoryClicked(category)}
                                key={category}>
                            </mi-chip>
                        )}
                    </div>}
                {showNotFoundMessage && <p className="search__error"> {t('Nothing was found')}</p>}
                {searchResults.length > 0 &&
                    <div className="search__results">
                        {searchResults.map(location =>
                            <ListItemLocation
                                key={location.id}
                                location={location}
                                locationClicked={() => onLocationClicked(location)}
                                isHovered={location?.id === hoveredLocation?.id}
                            />
                        )}
                    </div>
                }
            </div>
        </div>
    )
}

export default Search;
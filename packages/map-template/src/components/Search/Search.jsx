import React from "react";
import './Search.scss';
import { useRef, useState } from 'react';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search/Search';

/** Initialize the MapsIndoors instance. */
const mapsindoors = window.mapsindoors;

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location from the search results is clicked.
 * @param {[[string, number]]} props.categories - All the unique categories that users can filter through.
 * @param {function} props.onLocationsFiltered - Function that is run when the user performs a filter through any category.
 * @param {function} props.onSetSize - Callback that is fired when the search field takes focus.
 * @returns
 */
function Search({ onLocationClick, categories, onLocationsFiltered, onSetSize }) {

    /** Referencing the search field */
    const searchFieldRef = useRef();

    const [searchResults, setSearchResults] = useState([]);

    /** Indicate if search results have been found */
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);

    /** Referencing the categories results container DOM element */
    const categoriesListRef = useRef();

    /** Determines which category has been selected */
    const [selectedCategory, setSelectedCategory] = useState();

    const scrollableContentSwipePrevent = usePreventSwipe();

    /**
     * Get the locations and filter through them based on categories selected.
     *
     * @param {string} category
     */
    function getFilteredLocations(category) {
        mapsindoors.services.LocationsService.getLocations({
            categories: category,
        }).then(locations => {
            // Pass the locations to the parent component.
            onLocationsFiltered(locations);

            setSearchResults(locations);
        });
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
            onLocationsFiltered([]);

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
        onLocationsFiltered(locations);
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

        onLocationsFiltered([]);
    }

    return (
        <div className="search">
            <SearchField
                ref={searchFieldRef}
                mapsindoors={true}
                placeholder="Search by name, category, building..."
                results={locations => onResults(locations)}
                clicked={() => setSize(snapPoints.MAX)}
                cleared={() => cleared()}
                category={selectedCategory}
            />
            <div className="search__scrollable prevent-scroll" {...scrollableContentSwipePrevent}>
                <div ref={categoriesListRef} className="search__categories">
                    {categories?.map(([category, categoryInfo]) =>
                        <mi-chip
                            content={categoryInfo.displayName}
                            active={selectedCategory === category}
                            onClick={() => categoryClicked(category)}
                            key={category}>
                        </mi-chip>)
                    }
                </div>
                <div className="search__results">
                    {showNotFoundMessage && <p>Nothing was found</p>}
                    {searchResults.map(location => <ListItemLocation key={location.id} location={location} locationClicked={e => onLocationClick(e)} />)}
                </div>
            </div>
        </div>
    )
}

export default Search;

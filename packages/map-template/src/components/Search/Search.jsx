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

    /** Referencing the search results container DOM element */
    const searchResultsRef = useRef();

    /** Referencing the categories results container DOM element */
    const categoriesListRef = useRef();

    /** Determines which category has been selected */
    const [selectedCategory, setSelectedCategory] = useState();

    /** Instruct the search field to search for Locations near the map center. */
    // const searchNear = useNear();

    const scrollableContentSwipePrevent = usePreventSwipe();

    function locationClickHandler(location) {
        onLocationClick(location);
    }

    /** Display message when no results have been found. */
    function showNotFoundMessage() {
        const notFoundMessage = document.createElement('p');
        notFoundMessage.innerHTML = "Nothing was found";
        searchResultsRef.current.appendChild(notFoundMessage);
    }

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
     * Set a selected category and only allow one category to be selected at once.
     *
     * @param {string} category
     */
    function categoryClicked(category) {
        /** Perform a search when a category is clicked and filter the results through the category. */
        setSelectedCategory(category);
        setSize(snapPoints.MAX);

        /**
         * Check if the clicked category is the same as the active one.
         * Clear out the results list and set the selected category to null.
         */
        if (selectedCategory === category) {
            setSearchResults([]);
            setSelectedCategory(null);

            // Pass an empty array to the filtered locations in order to reset the locations.
            onLocationsFiltered([]);

            /** Check if the search field has a value and trigger the search again. */
            if (searchFieldRef.current.getValue()) {
                searchFieldRef.current.triggerSearch();
            }

            /**
             * Check if the search field has a value while a category is selected.
             * Trigger the search again and set the current selected category.
             */
        } else if (searchFieldRef.current.value) {
            /**
             * Check if a category is selected and filter through the locations within that category.
             * Clear out the search results after each category is selected.
             */
        } else {
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

        if (locations.length === 0) {
            showNotFoundMessage();
        }
    }

    function cleared() {
        setSearchResults([]);
        if (selectedCategory) {
            // TODO: Test
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
                <div ref={searchResultsRef} className="search__results"></div>
                <div className="search__results">
                    {searchResults.map(location => <ListItemLocation key={location.id} location={location} locationClicked={e => locationClickHandler(e)} />)}
                </div>
            </div>
        </div>
    )
}

export default Search;

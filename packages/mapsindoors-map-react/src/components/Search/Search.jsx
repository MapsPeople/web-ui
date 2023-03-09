import React from "react";
import './Search.scss';
import { useRef, useEffect, useState } from 'react';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import ProgressSteps from "../RouteInstructions/RouteInstructions";

/** Initialize the MapsIndoors instance. */
const mapsindoors = window.mapsindoors;

/**
 * Private variable used inside an event listener for a custom event from a web componenent.
 * Implemented due to the impossibility to use the React useState hook.
 */
let _selectedCategory;

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location from the search results is clicked.
 * @param {set} props.categories - All the unique categories that users can filter through.
 * @param {function} props.onLocationsFiltered - Function that is run when the user performs a filter through any category.
 * @param {function} props.onSetSize - Callback that is fired when the search field takes focus.
 * @returns
 */
function Search({ onLocationClick, categories, onLocationsFiltered, onSetSize }) {

    /** Referencing the search DOM element */
    const searchFieldRef = useRef();

    /** Referencing the search results container DOM element */
    const searchResultsRef = useRef();

    /** Referencing the categories results container DOM element */
    const categoriesListRef = useRef();

    /** Determines which category has been selected */
    const [selectedCategory, setSelectedCategory] = useState();

    const scrollableContentSwipePrevent = usePreventSwipe();

    /**
     * Click event handler that takes the selected location as an argument.
     *
     * @param {string} category
     */
    function resultClickedHandler(location) {
        onLocationClick(location.detail);
    }

    /** Remove click event listeners on all mi-list-item-location components. */
    function clearEventListeners() {
        const listItemLocations = document.querySelectorAll('mi-list-item-location');
        listItemLocations.forEach(element => {
            element.removeEventListener('click', resultClickedHandler);
        });
    }

    /**
     * Add search results by creating a 'mi-list-item-location' component for displaying the content of each result.
     * Append all the results to the results container and listen to the events when a result item is clicked.
     *
     * @param {string} result
     */
    function addSearchResults(result) {
        const listItem = document.createElement('mi-list-item-location');
        listItem.location = result;
        searchResultsRef.current.appendChild(listItem);
        listItem.addEventListener('locationClicked', resultClickedHandler);
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

            /** Function that takes the locations and passes them to the parent component. */
            onLocationsFiltered(locations);

            /** Loop through the filtered locations and add them to the search results list. */
            for (const location of locations) {
                addSearchResults(location);
            }
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
        searchFieldRef.current.setAttribute('mi-categories', category);
        setSize(snapPoints.MAX);

        /**
         * Check if the clicked category is the same as the active one.
         * Clear out the results list and set the selected category to null.
         */
        if (selectedCategory === category) {
            searchResultsRef.current.innerHTML = '';
            setSelectedCategory(null);
            _selectedCategory = null;

            // Pass an empty array to the filtered locations in order to reset the locations.
            onLocationsFiltered([]);

            /** Check if the search field has a value and trigger the search again. */
            if (searchFieldRef.current.value) {
                searchFieldRef.current.removeAttribute('mi-categories');
                searchFieldRef.current.triggerSearch();
            }

            /**
             * Check if the search field has a value while a category is selected.
             * Trigger the search again and set the current selected category.
             */
        } else if (searchFieldRef.current.value) {
            searchFieldRef.current.triggerSearch();
            setSelectedCategory(category);
            _selectedCategory = category;

            /**
             * Check if a category is selected and filter through the locations within that category.
             * Clear out the search results after each category is selected.
             */
        } else {
            searchResultsRef.current.innerHTML = '';
            setSelectedCategory(category);
            _selectedCategory = category;
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

    useEffect(() => {
        /**
         * Search location and add results list implementation.
         * Listen to the 'results' event provided by the 'mi-search' component.
         */
        searchFieldRef.current.addEventListener('results', e => {
            clearEventListeners();
            searchResultsRef.current.innerHTML = '';

            onLocationsFiltered(e.detail);

            if (e.detail.length === 0) {
                showNotFoundMessage();
            } else {
                for (const result of e.detail) {
                    addSearchResults(result);
                }
            }
        });

        clearEventListeners();

        /**
         * Listen to the 'cleared' event provided by the 'mi-search' component.
         * Clear the results list.
         */
        searchFieldRef.current.addEventListener('cleared', () => {
            clearEventListeners();
            searchResultsRef.current.innerHTML = '';
            if (_selectedCategory) {
                getFilteredLocations(_selectedCategory);
            }

            // Pass an empty array to the filtered locations in order to reset the locations.
            onLocationsFiltered([]);
        });

        /** Listen to click events on the input and set the input focus to true. */
        searchFieldRef.current.addEventListener('click', () => {
            setSize(snapPoints.MAX);
        });
    }, []);

    return (
        <div className="search">
            <mi-search ref={searchFieldRef} placeholder="Search by name, category, building..." mapsindoors="true"></mi-search>
            <div className="search__scrollable prevent-scroll" {...scrollableContentSwipePrevent}>
                <div ref={categoriesListRef} className="search__categories">
                    {categories && Array.from(categories).map(category =>
                        <mi-chip content={category}
                            active={selectedCategory === category}
                            onClick={() => categoryClicked(category)}
                            key={category}>
                        </mi-chip>)
                    }
                </div>
                <div ref={searchResultsRef} className="search__results"></div>
            </div>
            {/* <Test /> */}
            <ProgressSteps />
            <div ref={searchResultsRef} className="search__results"></div>
        </div>
    )
}

export default Search;

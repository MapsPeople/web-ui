import React from "react";
import './Search.scss';
import { useRef, useEffect, useState } from 'react';

const mapsindoors = window.mapsindoors;
let _selectedCategory;

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location from the search results is clicked.
 * @param {set} props.categories - All the unique categories that users can filter through.
 * @param {function} props.onLocationsFiltered - Function that is run when the user performs a filter through any category.
 * @returns
 */
function Search({ onLocationClick, categories, onLocationsFiltered }) {

    /** Referencing the search DOM element */
    const searchFieldRef = useRef();

    /** Referencing the search results container DOM element */
    const searchResultsRef = useRef();

    /** Referencing the categories results container DOM element */
    const categoriesListRef = useRef();

    /** Determines if the input has focus */
    const [hasInputFocus, setHasInputFocus] = useState(false);

    /** Determines if any search results have been found */
    const [hasSearchResults, setHasSearchResults] = useState(true);

    /** Determines which category has been selected */
    const [selectedCategory, setSelectedCategory] = useState();

    /**
    * Click event handler that takes the selected location as an argument.
    */
    function resultClickedHandler(location) {
        onLocationClick(location.detail);
    }

    /*
    * Remove click event listeners on all mi-list-item-location components.
    */
    function clearEventListeners() {
        const listItemLocations = document.querySelectorAll('mi-list-item-location');
        listItemLocations.forEach(element => {
            element.removeEventListener('click', resultClickedHandler);
        });
    }

    /*
    * Add search results by creating a 'mi-list-item-location' component for displaying the content of each result.
    * Append all the results to the results container and listen to the events when a result item is clicked.
    */
    function addSearchResults(result) {
        const listItem = document.createElement('mi-list-item-location');
        listItem.location = result;
        searchResultsRef.current.appendChild(listItem);
        listItem.addEventListener('locationClicked', resultClickedHandler);
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

        /*
        * Check if the clicked category is the same as the active one.
        * Clear out the results list and set the selected category to null.
        */
        if (selectedCategory === category) {

            searchResultsRef.current.innerHTML = '';
            setSelectedCategory(null);
            _selectedCategory = null;

            /** Check if the search field has a value and trigger the search again. */
            if (searchFieldRef.current.value) {
                searchFieldRef.current.removeAttribute('mi-categories');
                searchFieldRef.current.triggerSearch();
            }

            /*
            * Check if the search field has a value while a category is selected.
            * Trigger the search again and set the current selected category.
            */
        } else if (searchFieldRef.current.value) {
            searchFieldRef.current.triggerSearch();
            setSelectedCategory(category);
            _selectedCategory = category;

            /*
            * Check if a category is selected and filter through the locations within that category.
            * Clear out the search results after each category is selected.
            */
        } else {
            searchResultsRef.current.innerHTML = '';
            setSelectedCategory(category);
            _selectedCategory = category;

            /** Get the locations and filter through them based on categories selected. */
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
    }

    useEffect(() => {
        /**
         * Search location and add results list implementation.
         * Listen to the 'results' event provided by the 'mi-search' component.
         */
        searchFieldRef.current.addEventListener('results', e => {
            clearEventListeners();
            searchResultsRef.current.innerHTML = '';

            if (e.detail.length === 0) {
                setHasSearchResults(false);
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

                /** Get the locations and filter through them based on categories selected. */
                mapsindoors.services.LocationsService.getLocations({
                    categories: _selectedCategory,
                }).then(locations => {

                    /** Function that takes the locations and passes them to the parent component. */
                    onLocationsFiltered(locations);

                    /** Loop through the filtered locations and add them to the search results list. */
                    for (const location of locations) {
                        addSearchResults(location);
                    }
                });
            }
        });

        /** Listen to click events on the input and set the input focus to true. */
        searchFieldRef.current.addEventListener('click', () => {
            setHasInputFocus(true);
        });
    }, []);

    return (
        <div className={`search ${hasInputFocus ? 'search--full' : 'search--fit'}`}>
            <mi-search ref={searchFieldRef} placeholder="Search by name, category, building..." mapsindoors="true"></mi-search>
            <div ref={categoriesListRef} className="search__categories">
                {categories && Array.from(categories).map(category =>
                    <mi-chip content={category}
                        active={selectedCategory === category}
                        onClick={() => categoryClicked(category)}
                        key={category}>
                    </mi-chip>)
                }
            </div>
            <div ref={searchResultsRef} className="search__results">
                {!hasSearchResults &&
                    <p className="search__results--not-found">Nothing was found</p>}
            </div>
        </div>
    )
}

export default Search;

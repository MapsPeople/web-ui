import React from "react";
import './Search.scss';
import { useRef, useEffect, useState } from 'react';

const mapsindoors = window.mapsindoors;
let privateSelectedCategory;

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

    /** Determines which category has been selected */
    const [selectedCategory, setSelectedCategory] = useState();


    /**
    * Click event handler function that sets the display text of the input field,
    * and clears out the results list.
    */
    function clickHandler(location) {
        onLocationClick(location.detail);
        searchFieldRef.current.setDisplayText('');
        searchResultsRef.current.innerHTML = '';
    }

    /**
    * Handler for the click event on the category chips.
    * Set a selected category and only allow one category to be selected at once.
    *
    * @param {string} category
    */
    function categoryClicked(category) {
        /** Check if the category that is clicked is already selected. */
        /** If yes, set the selected category to null and empty the results list. */
        /** If no, filter the locations based on the selected category and show them in the results list. */
        searchFieldRef.current.setAttribute('mi-categories', category);

        if (selectedCategory === category) {
            searchResultsRef.current.innerHTML = '';
            setSelectedCategory(null);
            privateSelectedCategory = null;
        } else if (searchFieldRef.current.value) {
            searchFieldRef.current.triggerSearch();
            setSelectedCategory(category);
            privateSelectedCategory = category;

        } else {
            searchResultsRef.current.innerHTML = '';
            setSelectedCategory(category);
            privateSelectedCategory = category;

            /** Get the locations and filter through them based on categories selected. */
            mapsindoors.services.LocationsService.getLocations({
                categories: category,
            }).then(locations => {
                /** Function that takes the locations and passes them to the parent component. */
                onLocationsFiltered(locations);

                /** Loop through the filtered locations and add them to the search results list. */
                for (const location of locations) {
                    const listItem = document.createElement('mi-list-item-location');
                    listItem.location = location;
                    searchResultsRef.current.appendChild(listItem);
                    listItem.addEventListener('locationClicked', clickHandler);
                }
            });
        }
    }

    useEffect(() => {
        /*
        * Get all the mi-list-item-location component.
        * Loop through them and remove the event listener.
        */
        function clearEventListeners() {
            const listItemLocations = document.querySelectorAll('mi-list-item-location');
            listItemLocations.forEach(element => {
                element.removeEventListener('click', clickHandler);
            });
        }

        /**
         * Search location and add results list implementation.
         * Listen to the 'results' event provided by the 'mi-search' component.
         * For each search result create a 'mi-list-item-location' component for displaying the content.
         * Append all the results to the results container.
         * Listen to the events when the item is clicked, and set the location value to be the selected one.
         */
        searchFieldRef.current.addEventListener('results', e => {
            clearEventListeners();
            searchResultsRef.current.innerHTML = '';
            for (const result of e.detail) {
                const listItem = document.createElement('mi-list-item-location');
                listItem.location = result;
                searchResultsRef.current.appendChild(listItem);
                listItem.addEventListener('locationClicked', clickHandler);
            }

        });

        clearEventListeners();

        /**
         * Listen to the 'cleared' event provided by the 'mi-search' component.
         * Clear the results list.
         */
        searchFieldRef.current.addEventListener('cleared', () => {
            searchResultsRef.current.innerHTML = '';
            if (privateSelectedCategory) {
                /** Get the locations and filter through them based on categories selected. */
                mapsindoors.services.LocationsService.getLocations({
                    categories: privateSelectedCategory,
                }).then(locations => {
                    /** Function that takes the locations and passes them to the parent component. */
                    onLocationsFiltered(locations);

                    /** Loop through the filtered locations and add them to the search results list. */
                    for (const location of locations) {
                        const listItem = document.createElement('mi-list-item-location');
                        listItem.location = location;
                        searchResultsRef.current.appendChild(listItem);
                        listItem.addEventListener('locationClicked', clickHandler);
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
            <div ref={searchResultsRef} className="search__results"></div>
        </div>
    )
}

export default Search;

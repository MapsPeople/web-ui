import React from "react";
import './Search.scss';
import { useRef, useEffect, useState } from 'react';

const mapsindoors = window.mapsindoors;

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location from the search results is clicked.
 * @param {Object} props.categories
 * @returns
 */
function Search({ onLocationClick, categories }) {

    /** Referencing the search DOM element. */
    const searchFieldRef = useRef();

    /** Referencing the search results container DOM element */
    const searchResultsRef = useRef();

    const categoriesListRef = useRef();

    /** Determines if the input has focus */
    const [hasInputFocus, setHasInputFocus] = useState(false);

    useEffect(() => {

        /**
        * Click event handler function that sets the display text of the input field,
        * and clears out the results list.
        */
        function clickHandler(location) {
            onLocationClick(location.detail);
            searchFieldRef.current.setDisplayText('');
            searchResultsRef.current.innerHTML = '';
        }

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
        });

        /** Listen to click events on the input and set the input focus to true. */
        searchFieldRef.current.addEventListener('click', () => {
            setHasInputFocus(true);
        });

        for (const category of categories) {
            let isCategoryActive = false;
            const chip = document.createElement('mi-chip');
            chip.content = category;
            categoriesListRef.current.appendChild(chip);

            chip.addEventListener('click', () => {
                isCategoryActive = !isCategoryActive;
                chip.active = isCategoryActive;

                if (isCategoryActive) {
                    mapsindoors.services.LocationsService.getLocations({
                        categories: category,
                    }).then(locations => {
                        for (const location of locations) {
                            const listItem = document.createElement('mi-list-item-location');
                            listItem.location = location;
                            searchResultsRef.current.appendChild(listItem);
                        }
                    });
                } else {
                    searchResultsRef.current.innerHTML = '';
                }
            })

        }
    })

    return (
        <div className={`search ${hasInputFocus ? 'search--full' : 'search--fit'}`}>
            <mi-search ref={searchFieldRef} placeholder="Search by name, category, building..." mapsindoors="true"></mi-search>
            <div ref={categoriesListRef} className="search__categories"></div>
            <div ref={searchResultsRef} className="search__results"></div>
        </div>
    )
}

export default Search;

import React from "react";
import './Search.scss';
import { useRef, useEffect, useState } from 'react';

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location from the search results is clicked.
 * @returns
 */
function Search({ onLocationClick }) {

    /** Referencing the search DOM element. */
    const searchFieldRef = useRef();

    /** Referencing the search results container DOM element */
    const searchResultsRef = useRef();

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
            clearEventListeners();
            searchResultsRef.current.innerHTML = '';
        });

        /** Listen to click events on the input and set the input focus to true. */
        searchFieldRef.current.addEventListener('click', () => {
            setHasInputFocus(true);
        });
    })

    return (
        <div className={`search ${hasInputFocus ? 'search--full' : 'search--fit'}`}>
            <mi-search ref={searchFieldRef} placeholder="Search by name, category, building..." mapsindoors="true"></mi-search>
            <div ref={searchResultsRef} className="search__results"></div>
        </div>
    )
}

export default Search;

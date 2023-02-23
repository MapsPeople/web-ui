import React from "react";
import './Search.scss';
import { useRef, useEffect } from 'react';

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location from the search results is clicked.
 * @returns
 */
function Search({ onLocationClick }) {

    const searchFieldRef = useRef();
    const searchResultsRef = useRef();

    useEffect(() => {

        setupSearchResultsHandler(searchFieldRef);

        clearResultList(searchFieldRef, searchResultsRef);

        function setupSearchResultsHandler(locationRef) {
            locationRef.current.addEventListener('results', e => {
                searchResultsRef.current.innerHTML = '';
                for (const result of e.detail) {
                    const listItem = document.createElement('mi-list-item-location');
                    listItem.location = result;
                    searchResultsRef.current.appendChild(listItem);
                    listItem.addEventListener('locationClicked', (location) => {
                        onLocationClick(location.detail);
                        listItem.removeEventListener('locationClicked', location);
                        // locationRef.current.setDisplayName(result.properties.name);
                        // searchResultsRef.current.innerHTML = '';
                    });
                }
            });
        }

        function clearResultList(locationRef, resultsRef) {
            locationRef.current.addEventListener('cleared', () => {
                resultsRef.current.innerHTML = '';
            });
        }
    })

    return (
        <div className="search">
            <mi-search ref={searchFieldRef} placeholder="Search by name, category, building..." mapsindoors="true"></mi-search>
            <div ref={searchResultsRef} className="search__results"></div>
        </div>
    )
}

export default Search;

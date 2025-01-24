import { useEffect, useState } from 'react';
import './Search.css';
import PropTypes from 'prop-types';
import SearchResult from './SearchResult/SearchResult';
import SearchField from './SearchField/SearchField';


Search.propTypes = {
    mapsIndoorsInstance: PropTypes.object,
    onSearchResultClicked: PropTypes.func,
    selectedLocation: PropTypes.object
};

/**
 * Component to search for MapsIndoors Locations and present them in a list of search results.
 *
 * As a search field, we use The SearchField component, which again wraps the mi-search component, which is a custom
 * element that is defined in the {@link https://components.mapsindoors.com|MapsIndoors Components library} and can be
 * used to search for MapsIndoors Locations in the current MapsIndoors Solution.
 *
 * To show the search results, we use the SearchResult component, which again wraps the mi-list-item-location
 * component, which is a custom element that is defined in the {@link https://components.mapsindoors.com|MapsIndoors Components library}
 * and can be used to present a MapsIndoors Location in a list of search results.
 *
 * @param {object} props
 * @param {object} props.mapsIndoorsInstance - MapsIndoors instance.
 * @param {function} props.onSearchResultClicked - Callback function to call when a search result is clicked.
 * @param {object} props.selectedLocation - The currently selected location.
 */
function Search({ mapsIndoorsInstance, onSearchResultClicked, selectedLocation }) {
    // State for search results shown in the list.
    const [searchResults, setSearchResults] = useState([]);

    // State for visibility of the search results list. Will be switched off when a search result is clicked.
    const [searchResultsVisible, setSearchResultsVisible] = useState(false);

    // State for showing a "No results found" message.
    const [noResultsFound, setNoResultsFound] = useState(false);

    // State for the location that is currently hovered in the search results list.
    const [hoveredLocationId, setHoveredLocationId] = useState(null);

    /**
     * When the selected Location is set to nothing, we may want to show the search results list.
     */
    useEffect(() => {
        if (!selectedLocation && searchResults.length > 0) {
            setSearchResultsVisible(true);

            // Highlight the search results on the map.
            mapsIndoorsInstance.highlight(searchResults.map(location => location.id), false);
        }
    }, [selectedLocation]);

    /**
     * Callback for when search results are received.
     * Sets the results in the state and highlights the search results on the map.
     *
     * @param {array} locations
     */
    function onResults(locations) {
        setNoResultsFound(locations.length === 0);
        setSearchResults(locations);
        setSearchResultsVisible(true);

        // Highlight the search results on the map.
        mapsIndoorsInstance.highlight(locations.map(location => location.id), false);
    }

    /**
     * Callback for when the search field is cleared.
     * Clears the search results in the state and removes the highlights on the map.
     */
    const onCleared = () => {
        setSearchResults([]);
        setNoResultsFound(false);
        setSearchResultsVisible(false);
        mapsIndoorsInstance.highlight([], false);
    };

    /**
     * Callback for when a search result is clicked.
     */
    const onLocationClicked = (location) => {
        setSearchResultsVisible(false);
        // Remove highlighting search results on the map.
        mapsIndoorsInstance.highlight([], false);
        if (typeof onSearchResultClicked === 'function') {
            onSearchResultClicked(location);
        }
    };

    /**
     * Event handler for when a location is hovered. Used to set the isHovered state for the search results.
     * @param {object} location
     */
    const onMouseEnter = location => setHoveredLocationId(location?.id);

    /**
     * Setup event listeners for when the user hovers a MapsIndoors Location.
     */
    useEffect(() => {
        if (mapsIndoorsInstance) {
            mapsIndoorsInstance.on('mouseenter', onMouseEnter);
        }

        // Clean up event listeners when the component is unmounted.
        return () => {
            if (mapsIndoorsInstance) {
                mapsIndoorsInstance.off('mouseenter', onMouseEnter);
            }
        };
    }, [mapsIndoorsInstance]);

    return <div className="search">

        {/* Search field */}
        <SearchField
            onResults={locations => onResults(locations)}
            onClear={() => onCleared()}
        />

        {/* Search results.
            We only show the first 20 results in the list.
            We don't use the mi-take prop on the <mi-search> element, since we want all results to be highlighted on the map
            while keeping a managable size of the results list.
        */}
        {searchResults.length > 0 && searchResultsVisible && <div className="search__results">
            {searchResults.slice(0, 20).map((location) => <SearchResult
                key={location.id} location={location}
                mapsIndoorsInstance={mapsIndoorsInstance}
                locationClicked={onLocationClicked}
                isHovered={hoveredLocationId === location.id}
            />)}
        </div>}

        {/* No results found */}
        {noResultsFound && <div className="search__no-results">No location found</div>}
    </div>
}

export default Search;

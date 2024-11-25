import { useEffect, useRef, useState } from 'react';
import './Search.css';
import PropTypes from 'prop-types';
import SearchResult from './SearchResult/SearchResult';


Search.propTypes = {
    mapsIndoorsInstance: PropTypes.object
};

/**
 * Component to search for MapsIndoors Locations and present them in a list of search results.
 *
 * As a search field, we use the mi-search component, which is a custom element that is defined in the MapsIndoors Components library.
 * It can be used to search for Locations in the MapsIndoors data.
 * See: https://components.mapsindoors.com/search/
 *
 * @param {object} props
 * @param {object} props.mapsIndoorsInstance - MapsIndoors instance.
 */
function Search({ mapsIndoorsInstance }) {
    const searchFieldRef = useRef();

    const [searchResults, setSearchResults] = useState([]);
    const [hoveredLocationId, setHoveredLocationId] = useState(null);

    const onSearchResults = (event) => setSearchResults(event.detail);
    const onCleared = () => setSearchResults([]);

    /**
     * Callback for when a search result is clicked.
     */
    const onLocationClicked = () => {
        // TODO: Do something when a search result is clicked.
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

    /*
     * Add event listeners for search results and cleared search field.
     */
    useEffect(() => {
        const { current } = searchFieldRef;

        current.addEventListener('results', onSearchResults);
        current.addEventListener('cleared', onCleared);

        // Clean up event listeners when the component is unmounted.
        return () => {
            current.removeEventListener('results', onSearchResults);
            current.removeEventListener('cleared', onCleared);
        };
    }, []);

    return <div className="search">

        {/* Search field */}
        <mi-search
            ref={searchFieldRef}
            mapsindoors={true} // This attribute is required to enable searching in MapsIndoors data.
            placeholder="Search..."
            mi-take="20" // We are only interested in the 20 most relevant search results.
        />

        {/* Search results */}
        {searchResults.length > 0 && <div className="search__results">
            {searchResults.map((location) => <SearchResult key={location.id} location={location} mapsIndoorsInstance={mapsIndoorsInstance} locationClicked={onLocationClicked} isHovered={hoveredLocationId === location.id} />)}
        </div>}
    </div>
}

export default Search;

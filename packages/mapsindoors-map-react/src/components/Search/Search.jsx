import './Search.scss';
import { useState } from 'react';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search';

/**
 * Show the search results.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location from the search results is clicked.
 * @returns
 */
function Search({ onLocationClick }) {

    /** Determines if the input has focus */
    const [hasInputFocus, setHasInputFocus] = useState(false);

    /** Holds search results given from the search field. */
    const [searchResults, setSearchResults] = useState([]);

    /** Control to clear the search field */
    const [clearSearchField, setClearSearchField] = useState();

    /**
     * React to click on search results by cleaning up and invoking callback prop.
     * @param {object} location
     */
    function locationClickHandler(location) {
        onLocationClick(location);
        setSearchResults([]);
        setClearSearchField(true);
    }

    return (
        <div className={`search ${hasInputFocus ? 'search--full' : 'search--fit'}`}>
            <SearchField
                placeholder="Search by name, category, building..."
                cleared={() => { setSearchResults([]); setClearSearchField(false) }}
                clicked={() => setHasInputFocus(true)}
                results={results => setSearchResults(results)}
                mapsindoors={true}
                clear={clearSearchField}
            />
            <div className="search__results">
                {searchResults.map(location => <ListItemLocation key={location.id} location={location} locationClicked={e => locationClickHandler(e)} />)}
            </div>
        </div>
    )
}

export default Search;

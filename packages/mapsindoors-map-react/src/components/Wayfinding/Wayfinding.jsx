import React, { useState } from "react";
import './Wayfinding.scss';
import { useRef, useEffect } from 'react';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as CheckIcon } from '../../assets/check.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import Tooltip from '../Tooltip/Tooltip';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search/Search';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';

const searchFieldItentifiers = {
    TO: 'TO',
    FROM: 'FROM'
};

/**
 * Show the wayfinding view.
 *
 * @param {Object} props
 * @param {function} props.onStartDirections - Function that is run when the user navigates to the directions page.
 * @param {function} props.onBack - Function that is run when the user navigates to the previous page.
 * @param {string} props.location - The location that the user selected before starting the wayfinding.
 * @param {function} props.onSetSize - Callback that is fired when the component has loaded.
 * @returns
 */
function Wayfinding({ onStartDirections, onBack, location, onSetSize, isActive }) {

    /** Referencing the accessibility details DOM element */
    const detailsRef = useRef();

    const [hasInputFocus, setHasInputFocus] = useState(true);

    /** Holds search results given from a search field. */
    const [searchResults, setSearchResults] = useState([]);

    /** Variable for determining the active search field */
    const [activeSearchField, setActiveSearchField] = useState();

    const [toFieldDisplayText, setToFieldDisplayText] = useState();

    const [fromFieldDisplayText, setFromFieldDisplayText] = useState();

    const scrollableContentSwipePrevent = usePreventSwipe();

    /**
     * Click event handler function that sets the display text of the input field,
     * and clears out the results list.
     */
    function locationClickHandler(location) {
        if (activeSearchField === searchFieldItentifiers.TO) {
            setToFieldDisplayText(location.properties.name);
        } else if (activeSearchField === searchFieldItentifiers.FROM) {
            setFromFieldDisplayText(location.properties.name);
        }

        setSearchResults([]);
        setHasInputFocus(true);
    }

    /**
     * Handle incoming search results from one of the search fields.
     *
     * @param {array} results
     * @param {string} searchFieldIdentifier
     */
    function searchResultsReceived(results, searchFieldIdentifier) {
        setActiveSearchField(searchFieldIdentifier);
        setSearchResults(results);
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
        setSize(snapPoints.MAX);
        // If there is a location selected, pre-fill the value of the `to` field with the location name.
        if (location) {
            setToFieldDisplayText(location.properties.name);
        }

    }, [location]);

    return (
        <div className="wayfinding">
            <div className="wayfinding__directions">
                <div className="wayfinding__title">Start wayfinding</div>
                <button className="wayfinding__close" onClick={() => onBack()} aria-label="Close">
                    <CloseIcon />
                </button>
                <div className="wayfinding__locations">
                    <label className="wayfinding__label">
                        TO
                        <SearchField
                            mapsindoors={true}
                            placeholder="Search by name, category, building..."
                            results={locations => searchResultsReceived(locations, searchFieldItentifiers.TO)}
                            displayText={toFieldDisplayText}
                        />
                    </label>
                    <label className="wayfinding__label">
                        FROM
                        <SearchField
                            hasInputFocus={isActive}
                            mapsindoors={true}
                            placeholder="Search by name, category, buildings..."
                            results={locations => searchResultsReceived(locations, searchFieldItentifiers.FROM)}
                            displayText={fromFieldDisplayText}
                        />
                    </label>
                </div>
            </div>

            <div className="wayfinding__scrollable" {...scrollableContentSwipePrevent}>
                <div className="wayfinding__results">
                    {searchResults.map(location => <ListItemLocation key={location.id} location={location} locationClicked={e => locationClickHandler(e)} />)}
                </div>
            </div>
            {/* Fixme: Add functionality to the accessibility feature. */}
            <div className={`wayfinding__details ${hasInputFocus ? 'wayfinding__details--hide' : 'wayfinding__details--show'}`} ref={detailsRef}>
                <div className="wayfinding__accessibility">
                    <input className="mi-toggle" type="checkbox" />
                    <div>Accessibility</div>
                    <Tooltip text="Turn on Accessibility to get directions that avoids stairs and escalators."></Tooltip>
                </div>
                <hr></hr>
                <div className="wayfinding__info">
                    {/* Fixme: Implement dynamic value rendering. */}
                    <div className="wayfinding__distance">
                        <WalkingIcon />
                        <div>Distance:</div>
                        <div className="wayfinding__meters">545m</div>
                    </div>
                    <div className="wayfinding__time">
                        <ClockIcon />
                        <div>Estimated time:</div>
                        <div className="wayfinding__minutes">2m</div>
                    </div>
                </div>
                <button className="wayfinding__button" onClick={() => onStartDirections()}>
                    <CheckIcon />
                    Go!
                </button>
            </div>
        </div>
    )
}

export default Wayfinding;

import React, { useContext, useEffect, useRef, useState } from "react";
import { ReactComponent as CheckIcon } from '../../assets/check.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import { snapPoints } from '../../constants/snapPoints';
import { DirectionsServiceContext } from '../../DirectionsServiceContext';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import Tooltip from '../Tooltip/Tooltip';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search/Search';
import './Wayfinding.scss';

const searchFieldItentifiers = {
    TO: 'TO',
    FROM: 'FROM'
};

/**
 * Private variable used to assign the active search field.
 * Implemented due to the impossibility to use the React useState hook.
 */
let _activeSearchField;

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
function Wayfinding({ onStartDirections, onBack, location, onSetSize, isActive, onDirections }) {

    /** Referencing the accessibility details DOM element */
    const detailsRef = useRef();

    const directionsService = useContext(DirectionsServiceContext);

    /** Check if a route has been found */
    const [hasFoundRoute, setHasFoundRoute] = useState(true);

    /** Check if search results have been found */
    const [hasSearchResults, setHasSearchResults] = useState(true);

    const [hasError, setHasError] = useState(false);

    /** Holds search results given from a search field */
    const [searchResults, setSearchResults] = useState([]);

    const [toFieldDisplayText, setToFieldDisplayText] = useState();

    const [fromFieldDisplayText, setFromFieldDisplayText] = useState();

    const [destinationLocation, setDestinationLocation] = useState();
    const [originLocation, setOriginLocation] = useState();

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    const [accessibilityOn, setAccessibilityOn] = useState(false);

    const scrollableContentSwipePrevent = usePreventSwipe();

    /**
     * Click event handler function that sets the display text of the input field,
     * and clears out the results list.
     */
    function locationClickHandler(location) {
        if (_activeSearchField === searchFieldItentifiers.TO) {
            setToFieldDisplayText(location.properties.name);
            setDestinationLocation(location);
        } else if (_activeSearchField === searchFieldItentifiers.FROM) {
            setFromFieldDisplayText(location.properties.name);
            setOriginLocation(location);
        }

        setSearchResults([]);
    }

    /**
     * Handle incoming search results from one of the search fields.
     *
     * @param {array} results
     * @param {string} searchFieldIdentifier
     */
    function searchResultsReceived(results, searchFieldIdentifier) {
        _activeSearchField = searchFieldIdentifier;

        if (results.length === 0) {
            setHasSearchResults(false);
        } else {
            setHasSearchResults(true);
            setSearchResults(results);
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

    /**
     * Get a point with a floor from a Location to use as origin or destination point.
     *
     * @param {object} location
     * @returns {object}
     */
    function getLocationPoint(location) {
        const coordinates = location.geometry.type === 'Point' ? location.geometry.coordinates : location.properties.anchor.coordinates;
        return { lat: coordinates[1], lng: coordinates[0], floor: location.properties.floor };
    }

    /**
     * Handle click events on the search field.
     *
     * @param {string} searchFieldIdentifier
     */
    function onSearchClicked(searchFieldIdentifier) {
        _activeSearchField = searchFieldIdentifier;
        resetSearchField();
    }

    /**
     * Handle cleared events on the search field.
     *
     * @param {string} searchFieldIdentifier
     */
    function onSearchCleared(searchFieldIdentifier) {
        _activeSearchField = searchFieldIdentifier;
        resetSearchField();
        setSearchResults([]);
    }

    /**
    * Reset the active field's display text and location.
    */
    function resetSearchField() {
        if (_activeSearchField === searchFieldItentifiers.TO) {
            setToFieldDisplayText('');
            setDestinationLocation();
        } else if (_activeSearchField === searchFieldItentifiers.FROM) {
            setFromFieldDisplayText('');
            setOriginLocation();
        }
    }


    useEffect(() => {
        setSize(snapPoints.MAX);
        // If there is a location selected, pre-fill the value of the `to` field with the location name.
        if (location) {
            setToFieldDisplayText(location.properties.name);
            setDestinationLocation(location);
        }

        _activeSearchField = searchFieldItentifiers.FROM;
    }, [location]);

    /**
     * When both origin location and destination location are selected, call the MapsIndoors SDK
     * to get information about the route.
     */
    useEffect(() => {
        if (originLocation && destinationLocation) {
            directionsService.getRoute({
                origin: getLocationPoint(originLocation),
                destination: getLocationPoint(destinationLocation),
                avoidStairs: accessibilityOn
            }).then(directionsResult => {
                if (directionsResult && directionsResult.legs) {
                    // Calculate total distance and time
                    const totalDistance = directionsResult.legs.reduce((accumulator, current) => accumulator + current.distance.value, 0);
                    const totalTime = directionsResult.legs.reduce((accumulator, current) => accumulator + current.duration.value, 0);

                    setTotalDistance(totalDistance);
                    setTotalTime(totalTime);

                    onDirections({
                        originLocation,
                        destinationLocation,
                        totalDistance,
                        totalTime,
                        directionsResult
                    });
                } else {
                    setHasError(true);
                }
            }, () => {
                setHasFoundRoute(false);
            });
        }
    }, [originLocation, destinationLocation, directionsService, accessibilityOn]);

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
                            clicked={() => onSearchClicked(searchFieldItentifiers.TO)}
                            cleared={() => onSearchCleared(searchFieldItentifiers.TO)}
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
                            clicked={() => onSearchClicked(searchFieldItentifiers.FROM)}
                            cleared={() => onSearchCleared(searchFieldItentifiers.FROM)}
                        />
                    </label>
                </div>
            </div>
            {!hasFoundRoute && <p className="wayfinding__error">No route has been found</p>}
            {hasError && <p className="wayfinding__error">Something went wrong. Please try again.</p>}
            {!hasSearchResults && <p className="wayfinding__error">Nothing was found</p>}
            {
                (!originLocation || !destinationLocation) && <div className="wayfinding__scrollable" {...scrollableContentSwipePrevent}>
                    <div className="wayfinding__results">
                        {searchResults.map(location =>
                            <ListItemLocation
                                key={location.id}
                                location={location}
                                locationClicked={e => locationClickHandler(e)} />
                        )}
                    </div>
                </div>
            }

            {hasFoundRoute && !hasError && originLocation && destinationLocation && <div className={`wayfinding__details`} ref={detailsRef}>
                <div className="wayfinding__accessibility">
                    <input className="mi-toggle" type="checkbox" checked={accessibilityOn} onChange={e => setAccessibilityOn(e.target.checked)} />
                    <div>Accessibility</div>
                    <Tooltip text="Turn on Accessibility to get directions that avoids stairs and escalators."></Tooltip>
                </div>
                <hr></hr>
                <div className="wayfinding__info">
                    <div className="wayfinding__distance">
                        <WalkingIcon />
                        <div>Distance:</div>
                        <div className="wayfinding__meters">{totalDistance && <mi-distance meters={totalDistance} />}</div>
                    </div>
                    <div className="wayfinding__time">
                        <ClockIcon />
                        <div>Estimated time:</div>
                        <div className="wayfinding__minutes">{totalTime && <mi-time seconds={totalTime} />}</div>
                    </div>
                </div>
                <button className="wayfinding__button" onClick={() => onStartDirections()}>
                    <CheckIcon />
                    Go!
                </button>
            </div>}
        </div>
    )
}

export default Wayfinding;

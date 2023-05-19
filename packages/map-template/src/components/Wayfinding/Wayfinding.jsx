import React, { useContext, useState } from "react";
import './Wayfinding.scss';
import { useRef, useEffect } from 'react';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import { ReactComponent as SwitchIcon } from '../../assets/switch.svg';
import { DirectionsServiceContext } from '../../DirectionsServiceContext';
import { UserPositionContext } from '../../UserPositionContext';
import Tooltip from '../Tooltip/Tooltip';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search/Search';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import addGooglePlaceGeometry from "../Map/GoogleMapsMap/GooglePlacesHandler";
import GooglePlaces from '../../assets/google-places.png';
import { mapTypes } from "../../constants/mapTypes";

const searchFieldIdentifiers = {
    TO: 'TO',
    FROM: 'FROM'
};

const googlePlacesIcon = "data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 14 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 0C3.13 0 0 3.13 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 3.13 10.87 0 7 0ZM7 9.5C5.62 9.5 4.5 8.38 4.5 7C4.5 5.62 5.62 4.5 7 4.5C8.38 4.5 9.5 5.62 9.5 7C9.5 8.38 8.38 9.5 7 9.5Z' fill='black' fill-opacity='0.88'/%3E%3C/svg%3E%0A"

/**
 * Show the wayfinding view.
 *
 * @param {Object} props
 * @param {function} props.onStartDirections - Function that is run when the user navigates to the directions page.
 * @param {function} props.onBack - Function that is run when the user navigates to the previous page.
 * @param {object} props.to - The location to navigate to.
 * @param {object} [props.from] - Optional location to navigate from. If omitted, the user has to choose in the search field.
 * @param {function} props.onSetSize - Callback that is fired when the component has loaded.
 * @param {string} props.selectedMapType - The currently selected map type.
 * @returns
 */
function Wayfinding({ onStartDirections, onBack, to, from, onSetSize, isActive, onDirections, selectedMapType, travelMode }) {

    const wayfindingRef = useRef();

    /** Referencing the accessibility details DOM element */
    const detailsRef = useRef();

    const toFieldRef = useRef();
    const fromFieldRef = useRef();

    const directionsService = useContext(DirectionsServiceContext);
    const userPosition = useContext(UserPositionContext);

    const [activeSearchField, setActiveSearchField] = useState();

    /** Indicate if a route has been found */
    const [hasFoundRoute, setHasFoundRoute] = useState(true);

    /** Indicate if search results have been found */
    const [hasSearchResults, setHasSearchResults] = useState(true);

    /** Indicate if the searched route throws errors */
    const [hasError, setHasError] = useState(false);

    /** Indicate if the search has been triggered */
    const [searchTriggered, setSearchTriggered] = useState(false);

    /** Holds search results given from a search field */
    const [searchResults, setSearchResults] = useState([]);

    const [destinationLocation, setDestinationLocation] = useState();
    const [originLocation, setOriginLocation] = useState();

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    const [accessibilityOn, setAccessibilityOn] = useState(false);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const [hasGooglePlaces, setHasGooglePlaces] = useState(false);

    /**
     * Decorates location with data that is required for wayfinding to work.
     * Specifically, adds geometry to a google_places location.
     *
     * @param {object} location
     */
    function decorateLocation(location) {
        if (selectedMapType === mapTypes.Google && location.properties.type === 'google_places') {
            return addGooglePlaceGeometry(location);
        } else {
            return Promise.resolve(location);
        }
    }

    /**
     * Click event handler function that sets the display text of the input field,
     * and clears out the results list.
     *
     * @param {object} location
     */
    function locationClickHandler(location) {
        if (activeSearchField === searchFieldIdentifiers.TO) {
            decorateLocation(location).then(location => {
                setDestinationLocation(location);
                toFieldRef.current.setDisplayText(location.properties.name);
            }, () => setHasFoundRoute(false));
        } else if (activeSearchField === searchFieldIdentifiers.FROM) {
            decorateLocation(location).then(location => {
                setOriginLocation(location);
                fromFieldRef.current.setDisplayText(location.properties.name);
            }, () => setHasFoundRoute(false));
        }
        setHasGooglePlaces(false);
        setSearchTriggered(false);
        setSearchResults([]);
    }

    /**
     * Handle incoming search results from one of the search fields.
     *
     * @param {array} results
     * @param {string} searchFieldIdentifier
     */
    function searchResultsReceived(results, searchFieldIdentifier) {
        setActiveSearchField(searchFieldIdentifier);
        if (results.length === 0) {
            setHasSearchResults(false);
            setHasGooglePlaces(false);
        } else {
            setHasSearchResults(true);
            setSearchResults(results);
            const resultsHaveGooglePlaces = results.filter(result => result.properties.type === 'google_places').length > 0;
            setHasGooglePlaces(resultsHaveGooglePlaces);
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
     * Set the user's current position as the origin.
     *
     * This is done by mocking a MapsIndoors Location with the geometry
     * corresponding to the user's position.
     */
    function setMyPositionAsOrigin() {
        const myPositionGeometry = {
            type: 'Point',
            coordinates: [userPosition.coords.longitude, userPosition.coords.latitude]
        };
        const myPositionLocation = {
            geometry: myPositionGeometry,
            properties: {
                name: 'My Position',
                anchor: myPositionGeometry,
            },
            type: 'Feature'
        };

        fromFieldRef.current.setDisplayText(myPositionLocation.properties.name);
        setOriginLocation(myPositionLocation);
        setHasFoundRoute(true);
    }

    /**
     * Handle click events on the search field.
     *
     * @param {string} searchFieldIdentifier
     */
    function onSearchClicked(searchFieldIdentifier) {
        setActiveSearchField(searchFieldIdentifier);
        triggerSearch(searchFieldIdentifier);
        setHasError(false);
        setHasFoundRoute(true);
        setHasGooglePlaces(false);
    }

    /**
     * Handle cleared events on the search field.
     *
     * @param {string} searchFieldIdentifier
     */
    function onSearchCleared(searchFieldIdentifier) {
        setActiveSearchField(searchFieldIdentifier);
        resetSearchField(searchFieldIdentifier);
        setSearchResults([]);
        setHasError(false);
        setHasFoundRoute(true);
        setHasGooglePlaces(false);
    }

    /**
     * Reset the active field's display text and location.
     *
     * @param {string} searchFieldIdentifier
     */
    function resetSearchField(searchFieldIdentifier) {
        if (searchFieldIdentifier === searchFieldIdentifiers.TO) {
            setDestinationLocation();
        } else if (searchFieldIdentifier === searchFieldIdentifiers.FROM) {
            setOriginLocation();
        }
    }

    /**
     * Programatically trigger the search.
     *
     * @param {string} searchFieldIdentifier
     */
    function triggerSearch(searchFieldIdentifier) {
        if (searchFieldIdentifier === searchFieldIdentifiers.TO) {
            setSearchResults([]);
            if (toFieldRef.current.getValue()) {
                setSearchTriggered(true)
                toFieldRef.current.triggerSearch();
            }
        } else if (searchFieldIdentifier === searchFieldIdentifiers.FROM) {
            setSearchResults([]);
            if (fromFieldRef.current.getValue()) {
                setSearchTriggered(true)
                fromFieldRef.current.triggerSearch();
            }
        }
    }

    /**
     * Click handler for switching the origin and destination fields.
     */
    function switchDirectionsHandler() {
        if (destinationLocation || originLocation) {
            if (originLocation) {
                toFieldRef.current.setDisplayText(originLocation.properties.name);
            } else {
                toFieldRef.current.clear();
            }
            if (destinationLocation) {
                fromFieldRef.current.setDisplayText(destinationLocation.properties.name);
            } else {
                fromFieldRef.current.clear();
            }
            setDestinationLocation(originLocation);
            setOriginLocation(destinationLocation);
        }
    }

    /**
     * Either set user position to "from field" or focus the "from" field.
     */
    function setPositionOrSetFocus() {
        if (userPosition && !from) {
            setMyPositionAsOrigin();
        } else if (!from) {
            fromFieldRef.current.focusInput();
        }
    }

    useEffect(() => {
        setSize(snapPoints.MAX);

        // If there is a "to" location, use that as the "to" field.
        if (to) {
            toFieldRef.current.setDisplayText(to.properties.name);
            setDestinationLocation(to);
        }

        // If there is a "from" location, use that as the 'from' field. Otherwise trigger focus on search field.
        if (from) {
            fromFieldRef.current.setDisplayText(from.properties.name);
            setOriginLocation(from);
        } else {
            setActiveSearchField(searchFieldIdentifiers.FROM);
        }

        if (isActive && !fromFieldRef.current?.getValue()) {
            // Set focus on the from field.
            // But wait for any bottom sheet transition to end before doing that to avoid content jumping when virtual keyboard appears.
            const sheet = wayfindingRef.current.closest('.sheet');
            if (sheet) {
                sheet.addEventListener('transitionend', () => {
                    setPositionOrSetFocus();
                }, { once: true });
            } else {
                setPositionOrSetFocus();
            }
        }
    }, [isActive, to, from]);

    /**
     * When both origin location and destination location are selected, call the MapsIndoors SDK
     * to get information about the route.
     */
    useEffect(() => {
        if (originLocation && destinationLocation) {
            directionsService.getRoute({
                origin: getLocationPoint(originLocation),
                destination: getLocationPoint(destinationLocation),
                travelMode: travelMode,
                avoidStairs: accessibilityOn
            }).then(directionsResult => {
                if (directionsResult && directionsResult.legs) {
                    setHasError(false);
                    setHasFoundRoute(true);
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
    }, [originLocation, destinationLocation, directionsService, accessibilityOn, travelMode]);

    useEffect(() => {
        if (selectedMapType === mapTypes.Mapbox) {
            setHasGooglePlaces(false);
            setSearchResults(searchResults.filter(result => result.properties.type !== 'google_places'));
        }
    }, [selectedMapType]);

    return (
        <div className="wayfinding" ref={wayfindingRef}>
            <div className="wayfinding__directions">
                <div className="wayfinding__title">Start wayfinding</div>
                <button className="wayfinding__close"
                    onClick={() => onBack()}
                    aria-label="Close">
                    <CloseIcon />
                </button>
                <div className="wayfinding__locations">
                    <label className="wayfinding__label">
                        FROM
                        <SearchField
                            ref={fromFieldRef}
                            mapsindoors={true}
                            google={selectedMapType === mapTypes.Google}
                            placeholder="Search by name, category, building..."
                            results={locations => searchResultsReceived(locations, searchFieldIdentifiers.FROM)}
                            clicked={() => onSearchClicked(searchFieldIdentifiers.FROM)}
                            cleared={() => onSearchCleared(searchFieldIdentifiers.FROM)}
                        />
                    </label>
                    <button onClick={() => switchDirectionsHandler()}
                        aria-label="Switch"
                        className="wayfinding__switch">
                        <SwitchIcon />
                    </button>
                    <label className="wayfinding__label">
                        TO
                        <SearchField
                            ref={toFieldRef}
                            mapsindoors={true}
                            google={selectedMapType === mapTypes.Google}
                            placeholder="Search by name, category, building..."
                            results={locations => searchResultsReceived(locations, searchFieldIdentifiers.TO)}
                            clicked={() => onSearchClicked(searchFieldIdentifiers.TO)}
                            cleared={() => onSearchCleared(searchFieldIdentifiers.TO)}
                        />
                    </label>
                    {userPosition && originLocation?.properties.name !== 'My Position' && <p className="wayfinding__use-current-position">
                        <button onClick={() => setMyPositionAsOrigin()}>Use My Position</button>
                    </p>}
                </div>
            </div>
            {!hasFoundRoute && <p className="wayfinding__error">No route has been found</p>}
            {hasError && <p className="wayfinding__error">Something went wrong. Please try again.</p>}
            {!hasSearchResults && <p className="wayfinding__error">Nothing was found</p>}
            <div className="wayfinding__scrollable" {...scrollableContentSwipePrevent}>
                <div className="wayfinding__results">
                    {searchResults.map(location =>
                        <ListItemLocation
                            key={location.id}
                            icon={location.properties.type === 'google_places' ? googlePlacesIcon : undefined}
                            location={location}
                            locationClicked={e => locationClickHandler(e)} />
                    )}
                    {hasGooglePlaces && <img className="wayfinding__google" alt="Powered by Google" src={GooglePlaces} />}
                </div>
            </div>
            {!searchTriggered && hasFoundRoute && !hasError && originLocation && destinationLocation && <div className={`wayfinding__details`} ref={detailsRef}>
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
                    Go!
                </button>
            </div>}
        </div>
    )
}

export default Wayfinding;

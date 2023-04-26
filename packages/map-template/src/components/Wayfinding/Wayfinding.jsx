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
import handleGooglePlaces from "../Map/GoogleMapsMap/GooglePlacesHandler";
import GooglePlaces from '../../assets/google-places.png';

const searchFieldIdentifiers = {
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
 * @param {string} props.selectedMapType - The currently selected map type.
 * @returns
 */
function Wayfinding({ onStartDirections, onBack, location, onSetSize, isActive, onDirections, selectedMapType }) {

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

    const [isGoogleMap, setIsGoogleMap] = useState();

    const [hasGooglePlaces, setHasGooglePlaces] = useState(false);

    /**
     * Click event handler function that sets the display text of the input field,
     * and clears out the results list.
     * Handle the google places and create the coordinates in order to be able
     * to get directions, if selected.
     */
    async function locationClickHandler(location) {
        if (activeSearchField === searchFieldIdentifiers.TO) {
            if (selectedMapType === 'google' && location.properties.type === 'google_places') {
                handleGooglePlaces(location)
                    .then((result) => {
                        location.geometry = {
                            type: 'Point',
                            coordinates: [result.geometry.location.lng(), result.geometry.location.lat()]
                        };
                        setDestinationLocation(location);
                        toFieldRef.current.setDisplayText(location.properties.name);
                    })
                    .catch(() => {
                        setHasFoundRoute(false);
                    });
            } else {
                setDestinationLocation(location);
                toFieldRef.current.setDisplayText(location.properties.name);
            }
        } else if (activeSearchField === searchFieldIdentifiers.FROM) {
            if (selectedMapType === 'google' && location.properties.type === 'google_places') {
                handleGooglePlaces(location)
                    .then((result) => {
                        location.geometry = {
                            type: 'Point',
                            coordinates: [result.geometry.location.lng(), result.geometry.location.lat()]
                        };
                        setOriginLocation(location);
                        fromFieldRef.current.setDisplayText(location.properties.name);
                    })
                    .catch(() => {
                        setHasFoundRoute(false);
                    });
            } else {
                setOriginLocation(location);
                fromFieldRef.current.setDisplayText(location.properties.name);
            }
        }
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
            if (results.filter(result => result.properties.type === 'google_places').length > 0) {
                setHasGooglePlaces(true);
            } else {
                setHasGooglePlaces(false);
            }
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

    useEffect(() => {
        setSize(snapPoints.MAX);
        // If there is a location selected, pre-fill the value of the `to` field with the location name.
        if (location) {
            toFieldRef.current.setDisplayText(location.properties.name);
            setDestinationLocation(location);
        }

        setActiveSearchField(searchFieldIdentifiers.FROM);
    }, [location]);

    useEffect(() => {
        if (isActive && !fromFieldRef.current?.getValue()) {
            // Set focus on the from field.
            // But wait for any bottom sheet transition to end before doing that to avoid content jumping when virtual keyboard appears.
            const sheet = wayfindingRef.current.closest('.sheet');
            if (sheet) {
                sheet.addEventListener('transitionend', () => {
                    fromFieldRef.current.focusInput();
                }, { once: true });
            } else {
                fromFieldRef.current.focusInput();
            }

            if (userPosition) {
                // If the user's position is known, use that as Origin.
                setMyPositionAsOrigin();
            }
        }
    }, [isActive]);

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

    useEffect(() => {
        if (selectedMapType === 'google') {
            setIsGoogleMap(true);
        } else {
            setIsGoogleMap(false);
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
                        TO
                        <SearchField
                            ref={toFieldRef}
                            mapsindoors={true}
                            google={isGoogleMap}
                            placeholder="Search by name, category, building..."
                            results={locations => searchResultsReceived(locations, searchFieldIdentifiers.TO)}
                            clicked={() => onSearchClicked(searchFieldIdentifiers.TO)}
                            cleared={() => onSearchCleared(searchFieldIdentifiers.TO)}
                        />
                    </label>
                    <button onClick={() => switchDirectionsHandler()}
                        aria-label="Switch"
                        className="wayfinding__switch">
                        <SwitchIcon />
                    </button>
                    <label className="wayfinding__label">
                        FROM
                        <SearchField
                            ref={fromFieldRef}
                            mapsindoors={true}
                            google={isGoogleMap}
                            placeholder="Search by name, category, buildings..."
                            results={locations => searchResultsReceived(locations, searchFieldIdentifiers.FROM)}
                            clicked={() => onSearchClicked(searchFieldIdentifiers.FROM)}
                            cleared={() => onSearchCleared(searchFieldIdentifiers.FROM)}
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

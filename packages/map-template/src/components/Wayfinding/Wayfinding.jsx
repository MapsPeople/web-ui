import React, { useState } from "react";
import './Wayfinding.scss';
import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walk.svg';
import { ReactComponent as SwitchIcon } from '../../assets/switch.svg';
import { useRecoilState, useRecoilValue } from 'recoil';
import userPositionState from '../../atoms/userPositionState';
import directionsServiceState from '../../atoms/directionsServiceState';
import currentLocationState from '../../atoms/currentLocationState';
import travelModeState from '../../atoms/travelModeState';
import mapTypeState from '../../atoms/mapTypeState';
import Tooltip from '../Tooltip/Tooltip';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search/Search';
import { snapPoints } from '../../constants/snapPoints';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import generateMyPositionLocation from '../../helpers/MyPositionLocation';
import addGooglePlaceGeometry from "../Map/GoogleMapsMap/GooglePlacesHandler";
import GooglePlaces from '../../assets/google-places.png';
import { mapTypes } from "../../constants/mapTypes";
import { ReactComponent as WalkIcon } from '../../assets/walk.svg';
import { ReactComponent as DriveIcon } from '../../assets/drive.svg';
import { ReactComponent as BikeIcon } from '../../assets/bike.svg';
import { ReactComponent as CompassArrow } from '../../assets/compass-arrow.svg';
import { travelModes } from "../../constants/travelModes";
import Dropdown from "../WebComponentWrappers/Dropdown/Dropdown";
import primaryColorState from "../../atoms/primaryColorState";
import addMapboxPlaceGeometry from "../Map/MapboxMap/MapboxPlacesHandler";
import mapboxAccessTokenState from "../../atoms/mapboxAccessTokenState";
import distanceUnitSystemSelector from '../../selectors/distanceUnitSystemSelector';
import useDirectionsInfo from "../../hooks/useDirectionsInfo";
import hasFoundRouteState from "../../atoms/hasFoundRouteState";

const searchFieldIdentifiers = {
    TO: 'TO',
    FROM: 'FROM'
};

const externalLocationIcon = "data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 14 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 0C3.13 0 0 3.13 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 3.13 10.87 0 7 0ZM7 9.5C5.62 9.5 4.5 8.38 4.5 7C4.5 5.62 5.62 4.5 7 4.5C8.38 4.5 9.5 5.62 9.5 7C9.5 8.38 8.38 9.5 7 9.5Z' fill='black' fill-opacity='0.88'/%3E%3C/svg%3E%0A"

/**
 * Show the wayfinding view.
 *
 * @param {Object} props
 * @param {function} props.onStartDirections - Function that is run when the user navigates to the directions page.
 * @param {function} props.onBack - Function that is run when the user navigates to the previous page.
 * @param {object} props.directionsToLocation - Optional location to navigate to.
 * @param {object} [props.directionsFromLocation] - Optional location to navigate from. If omitted, the user has to choose in the search field.
 * @param {function} props.onSetSize - Callback that is fired when the component has loaded.
 *
 * @returns
 */
function Wayfinding({ onStartDirections, onBack, directionsToLocation, directionsFromLocation, onSetSize, isActive }) {

    const { t } = useTranslation();

    const wayfindingRef = useRef();

    /** Referencing the accessibility details DOM element */
    const detailsRef = useRef();

    const toFieldRef = useRef();
    const fromFieldRef = useRef();

    const directionsService = useRecoilValue(directionsServiceState);
    const userPosition = useRecoilValue(userPositionState);
    const currentLocation = useRecoilValue(currentLocationState);
    const selectedMapType = useRecoilValue(mapTypeState);
    const primaryColor = useRecoilValue(primaryColorState);

    const [activeSearchField, setActiveSearchField] = useState();

    /** Indicate if a route has been found */
    const [, setHasFoundRoute] = useRecoilState(hasFoundRouteState);

    /** Indicate if search results have been found */
    const [hasSearchResults, setHasSearchResults] = useState(true);

    /** Indicate if the search has been triggered */
    const [searchTriggered, setSearchTriggered] = useState(false);

    /** Holds search results given from a search field */
    const [searchResults, setSearchResults] = useState([]);

    const [destinationLocation, setDestinationLocation] = useState();
    const originLocationRef = useRef();

    const [accessibilityOn, setAccessibilityOn] = useState(false);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const [hasGooglePlaces, setHasGooglePlaces] = useState(false);

    const [travelMode, setTravelMode] = useRecoilState(travelModeState);

    /** Indicate if the option to choose My Position should be shown */
    const [showMyPositionOption, setShowMyPositionOption] = useState(false);

    const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);

    const distanceUnitSystem = useRecoilValue(distanceUnitSystemSelector);

    const [totalDistance, totalTime, hasFoundRoute] = useDirectionsInfo(originLocationRef.current, destinationLocation, directionsService, travelMode, accessibilityOn)

    /**
     * Decorates location with data that is required for wayfinding to work.
     * Specifically, adds geometry to a google_places location.
     *
     * @param {object} location
     */
    function decorateLocation(location) {
        if (selectedMapType === mapTypes.Google && location.properties.type === 'google_places') {
            return addGooglePlaceGeometry(location);
        } else if (selectedMapType === mapTypes.Mapbox && location.properties.type === 'mapbox_places') {
            return addMapboxPlaceGeometry(location, mapboxAccessToken);
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
            decorateLocation(location).then(decoratedLocation => {
                setDestinationLocation(decoratedLocation);
                toFieldRef.current.setDisplayText(decoratedLocation.properties.name);
            }, () => setHasFoundRoute(false));
        } else if (activeSearchField === searchFieldIdentifiers.FROM) {
            decorateLocation(location).then(decoratedLocation => {
                originLocationRef.current = decoratedLocation;
                fromFieldRef.current.setDisplayText(decoratedLocation.properties.name);
            }, () => setHasFoundRoute(false));
        }
        setHasGooglePlaces(false);
        setSearchTriggered(false);
        setSearchResults([]);
        setShowMyPositionOption(false);
    }

    /**
     * Handle incoming search results from one of the search fields.
     *
     * @param {array} results
     * @param {string} searchFieldIdentifier
     */
    function searchResultsReceived(results, searchFieldIdentifier) {
        setActiveSearchField(searchFieldIdentifier);
        setHasFoundRoute(true);
        if (results.length === 0) {
            setHasSearchResults(false);
            setHasGooglePlaces(false);
            setSearchResults([]);
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
     * Set the user's current position as the selected field.
     *
     * This is done by having a GeoJSON Feature with geometry corresponding to
     * the user's position.
     */
    function selectMyPosition() {
        const myPositionLocation = generateMyPositionLocation(userPosition);

        if (activeSearchField === searchFieldIdentifiers.TO) {
            toFieldRef.current.setDisplayText(myPositionLocation.properties.name);
            setDestinationLocation(myPositionLocation);
        } else if (activeSearchField === searchFieldIdentifiers.FROM) {
            fromFieldRef.current.setDisplayText(myPositionLocation.properties.name);
            originLocationRef.current = myPositionLocation;
        }
        setSearchResults([]);
        setHasFoundRoute(true);
        setHasSearchResults(true);
        setHasGooglePlaces(false);
        setSearchTriggered(false);
        setShowMyPositionOption(false);
    }

    /**
     * Check if any of the fields have the 'USER_POSITION' selected.
     * The 'USER_POSITION' option should only be available for one search field at a time.
     */
    function showMyPositionOptionButton(searchFieldIdentifier) {
        if (originLocationRef.current?.id === 'USER_POSITION' && searchFieldIdentifier === searchFieldIdentifiers.TO) {
            setShowMyPositionOption(false);
        } else if (destinationLocation?.id === 'USER_POSITION' && searchFieldIdentifier === searchFieldIdentifiers.FROM) {
            setShowMyPositionOption(false);
        } else {
            setShowMyPositionOption(true);
        }
    }

    /**
     * Handle the value change of the input field.
     */
    function onInputChanged(searchFieldIdentifier) {
        showMyPositionOptionButton(searchFieldIdentifier)
    }

    /**
     * Handle click events on the search field.
     *
     * @param {string} searchFieldIdentifier
     */
    function onSearchClicked(searchFieldIdentifier) {
        setActiveSearchField(searchFieldIdentifier);
        triggerSearch(searchFieldIdentifier);
        setHasFoundRoute(true);
        setHasGooglePlaces(false);
        showMyPositionOptionButton(searchFieldIdentifier)
    }

    /**
     * Handle cleared events on the search field.
     *
     * @param {string} searchFieldIdentifier
     */
    function onSearchCleared(searchFieldIdentifier) {
        setShowMyPositionOption(true);
        setActiveSearchField(searchFieldIdentifier);
        resetSearchField(searchFieldIdentifier);
        setSearchResults([]);
        setHasFoundRoute(true);
        setHasGooglePlaces(false);
        setHasSearchResults(true);
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
            originLocationRef.current = undefined;
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
        if (destinationLocation || originLocationRef.current) {
            if (originLocationRef.current) {
                toFieldRef.current.setDisplayText(originLocationRef.current.properties.name);
            } else {
                toFieldRef.current.clear();
            }
            if (destinationLocation) {
                fromFieldRef.current.setDisplayText(destinationLocation.properties.name);
            } else {
                fromFieldRef.current.clear();
            }
            setDestinationLocation(originLocationRef.current);
            originLocationRef.current = destinationLocation;
        }
    }

    useEffect(() => {
        setSize(snapPoints.MAX);

        // In case both the from and to locations are the user's position, unset the directionsToLocation. We don't want the user to be able to navigate to and from the user's position.
        if (directionsFromLocation?.id === 'USER_POSITION' && directionsToLocation?.id === 'USER_POSITION') {
            directionsToLocation = undefined; // FIXME: Antipattern. Will be fixed by global state management.
        }

        // If there is a directionsToLocation and no currentLocation (otherwise the user had actively selected something else), use that as the "to" field.
        if (directionsToLocation?.properties && !currentLocation) {
            toFieldRef.current.setDisplayText(directionsToLocation.properties.name);
            setDestinationLocation(directionsToLocation);
        }

        // If there is a directionsFromLocation, use that as the 'from' field. Otherwise trigger focus on search field.
        if (directionsFromLocation?.properties) {
            fromFieldRef.current.setDisplayText(directionsFromLocation.properties.name);
            originLocationRef.current = directionsFromLocation;
        } else {
            setActiveSearchField(searchFieldIdentifiers.FROM);
        }

        if (isActive && !fromFieldRef.current?.getValue()) {
            // Set focus on the from field.
            // But wait for any bottom sheet transition to end before doing that to avoid content jumping when virtual keyboard appears.
            const sheet = wayfindingRef.current.closest('.sheet');
            if (sheet) {
                sheet.addEventListener('transitionend', () => {
                    if (directionsFromLocation !== 'USER_POSITION_PENDING' && directionsToLocation?.id !== 'USER_POSITION') {
                        fromFieldRef.current.focusInput();
                    }
                }, { once: true });
            } else if (directionsFromLocation !== 'USER_POSITION_PENDING' && directionsToLocation?.id !== 'USER_POSITION') {
                fromFieldRef.current.focusInput();
            }

            if (userPosition && !originLocationRef.current && directionsToLocation?.id !== 'USER_POSITION') {
                // If the user's position is known and no origin location is set, use the position as Origin.

                const myPositionLocation = generateMyPositionLocation(userPosition);
                fromFieldRef.current.setDisplayText(myPositionLocation.properties.name);
                originLocationRef.current = myPositionLocation
                setHasFoundRoute(true);
                setHasSearchResults(true);
                setSearchResults([]);
            }
        }
    }, [isActive, directionsToLocation, directionsFromLocation]);

    /*
     * React on changes on the selected map type.
     */
    useEffect(() => {
        if (selectedMapType === mapTypes.Mapbox) {
            setHasGooglePlaces(false);
            setSearchResults(searchResults.filter(result => result.properties.type !== 'google_places'));
        }
    }, [selectedMapType]);

    /*
     * When current location is set, make sure to set that as the destination.
     */
    useEffect(() => {
        if (currentLocation) {
            setDestinationLocation(currentLocation);
            toFieldRef.current.setDisplayText(currentLocation.properties.name);
        }
    }, [currentLocation]);

    return (
        <div className="wayfinding" ref={wayfindingRef}>
            <div className="wayfinding__directions">
                <div className="wayfinding__title">{t('Start wayfinding')}</div>
                <button className="wayfinding__close"
                    onClick={() => onBack()}
                    aria-label="Close">
                    <CloseIcon />
                </button>
                <div className="wayfinding__locations">
                    <label className="wayfinding__label">
                        {t('From').toUpperCase()}
                        <SearchField
                            ref={fromFieldRef}
                            mapsindoors={true}
                            google={selectedMapType === mapTypes.Google}
                            mapbox={selectedMapType === mapTypes.Mapbox}
                            placeholder={t('Search by name, category, building...')}
                            results={locations => searchResultsReceived(locations, searchFieldIdentifiers.FROM)}
                            clicked={() => onSearchClicked(searchFieldIdentifiers.FROM)}
                            cleared={() => onSearchCleared(searchFieldIdentifiers.FROM)}
                            changed={() => onInputChanged(searchFieldIdentifiers.FROM)}
                        />
                    </label>
                    <button onClick={() => switchDirectionsHandler()}
                        aria-label={t('Switch')}
                        className="wayfinding__switch">
                        <SwitchIcon />
                    </button>
                    <label className="wayfinding__label">
                        {t('To').toUpperCase()}
                        <SearchField
                            ref={toFieldRef}
                            mapsindoors={true}
                            google={selectedMapType === mapTypes.Google}
                            mapbox={selectedMapType === mapTypes.Mapbox}
                            placeholder={t('Search by name, category, building...')}
                            results={locations => searchResultsReceived(locations, searchFieldIdentifiers.TO)}
                            clicked={() => onSearchClicked(searchFieldIdentifiers.TO)}
                            cleared={() => onSearchCleared(searchFieldIdentifiers.TO)}
                            changed={() => onInputChanged(searchFieldIdentifiers.TO)}
                        />
                    </label>

                </div>
            </div>
            {!hasFoundRoute && <p className="wayfinding__error">{t('No route found')}</p>}
            {!hasSearchResults && !showMyPositionOption && <p className="wayfinding__error">{t('Nothing was found')}</p>}
            {userPosition && showMyPositionOption && <button type="button" className="wayfinding__use-current-position" onClick={() => selectMyPosition()}>
                <CompassArrow />
                {t('My position')}
            </button>}
            {searchResults.length > 0 &&
                <div className="wayfinding__scrollable" {...scrollableContentSwipePrevent}>
                    <div className="wayfinding__results">
                        {searchResults.map(location =>
                            <ListItemLocation
                                key={location.id}
                                icon={(location.properties.type === 'google_places' || location.properties.type === 'mapbox_places') ? externalLocationIcon : undefined}
                                location={location}
                                locationClicked={e => locationClickHandler(e)} />
                        )}
                        {hasGooglePlaces && <img className="wayfinding__google" alt="Powered by Google" src={GooglePlaces} />}
                    </div>
                </div>}
            {!searchTriggered && !showMyPositionOption && hasFoundRoute && !hasGooglePlaces && originLocationRef.current && destinationLocation && <div className={`wayfinding__details`} ref={detailsRef}>
                <div className="wayfinding__settings">
                    <div className="wayfinding__accessibility">
                        <input className="mi-toggle" type="checkbox" checked={accessibilityOn} onChange={e => setAccessibilityOn(e.target.checked)} style={{ backgroundColor: accessibilityOn ? primaryColor : '' }} />
                        <div>{t('Accessibility')}</div>
                        <Tooltip text={t('Turn on Accessibility to get directions that avoid stairs and escalators.')}></Tooltip>
                    </div>
                    <div className="wayfinding__travel">
                        <Dropdown selectionChanged={travelMode => setTravelMode(travelMode[0].value)}>
                            <mi-dropdown-item selected value={travelModes.WALKING}>
                                <WalkIcon></WalkIcon>
                                {t('Walk')}
                            </mi-dropdown-item>
                            <mi-dropdown-item value={travelModes.DRIVING}>
                                <DriveIcon></DriveIcon>
                                {t('Drive')}
                            </mi-dropdown-item>
                            <mi-dropdown-item value={travelModes.BICYCLING}>
                                <BikeIcon></BikeIcon>
                                {t('Bike')}
                            </mi-dropdown-item>
                        </Dropdown>
                    </div>
                </div>
                <hr></hr>
                <div className="wayfinding__info">
                    <div className="wayfinding__distance">
                        {travelMode === travelModes.WALKING && <WalkingIcon />}
                        {travelMode === travelModes.DRIVING && <DriveIcon />}
                        {travelMode === travelModes.BICYCLING && <BikeIcon />}
                        <div>{t('Distance')}:</div>
                        <div className="wayfinding__meters">{totalDistance && <mi-distance unit={distanceUnitSystem} meters={totalDistance} />}</div>
                    </div>
                    <div className="wayfinding__time">
                        <ClockIcon />
                        <div>{t('Estimated time')}:</div>
                        <div className="wayfinding__minutes">{totalTime && <mi-time translations={JSON.stringify({ days: t('d'), hours: t('h'), minutes: t('min') })}  seconds={totalTime} />}</div>
                    </div>
                </div>
                <button className="wayfinding__button" style={{ background: primaryColor }} onClick={() => onStartDirections()}>
                    {t('Go!')}
                </button>
            </div>}
        </div>
    )
}

export default Wayfinding;

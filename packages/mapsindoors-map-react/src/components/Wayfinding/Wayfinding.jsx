import React, { useContext, useState } from "react";
import './Wayfinding.scss';
import { useRef, useEffect } from 'react';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as CheckIcon } from '../../assets/check.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import { DirectionsServiceContext } from '../../DirectionsServiceContext';
import Tooltip from '../Tooltip/Tooltip';
import ListItemLocation from '../WebComponentWrappers/ListItemLocation/ListItemLocation';
import SearchField from '../WebComponentWrappers/Search/Search';

const searchFieldItentifiers = {
    TO: 'TO',
    FROM: 'FROM'
};

function Wayfinding({ onStartDirections, onBack, location }) {

    /** Referencing the accessibility details DOM element */
    const detailsRef = useRef();

    const directionsService = useContext(DirectionsServiceContext);

    const [hasInputFocus, setHasInputFocus] = useState(true);

    /** Holds search results given from a search field. */
    const [searchResults, setSearchResults] = useState([]);

    /** Variable for determining the active search field */
    const [activeSearchField, setActiveSearchField] = useState();

    const [toFieldDisplayText, setToFieldDisplayText] = useState();
    const [fromFieldDisplayText, setFromFieldDisplayText] = useState();

    const [destinationLocation, setDestinationLocation] = useState();
    const [originLocation, setOriginLocation] = useState();

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    /**
     * Click event handler function that sets the display text of the input field,
     * and clears out the results list.
     */
    function locationClickHandler(location) {
        if (activeSearchField === searchFieldItentifiers.TO) {
            setToFieldDisplayText(location.properties.name);
            setDestinationLocation(location);
        } else if (activeSearchField === searchFieldItentifiers.FROM) {
            setFromFieldDisplayText(location.properties.name);
            setOriginLocation(location);
        }

        setSearchResults([]);
        setHasInputFocus(false);
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

    useEffect(() => {
        // If there is a location selected, pre-fill the value of the `to` field with the location name.
        if (location) {
            setToFieldDisplayText(location.properties.name);
            setDestinationLocation(location);
        }
    }, [location]);

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
     * When both origin location and destination location are selected, call the MapsIndoors SDK
     * to get information about the route.
     */
    useEffect(() => {
        if (originLocation && destinationLocation) {
            directionsService.getRoute({
                origin: getLocationPoint(originLocation),
                destination: getLocationPoint(destinationLocation)
                // FIXME: set avoidStairs to true if accessibility is toggled on.
            }).then(directionsResult => {
                // Calculate total distance and time
                // FIXME: Can we get a "faulty" response with no legs? If so, this will probably crash.
                setTotalDistance(directionsResult.legs.reduce((accumulator, current) => accumulator + current.distance.value, 0));
                setTotalTime(directionsResult.legs.reduce((accumulator, current) => accumulator + current.duration.value, 0));
            }, () => {
                // FIXME: No route found or other request errors.
            });

        }
    }, [originLocation, destinationLocation, directionsService]);

    return (
        <div className={`wayfinding ${hasInputFocus ? 'wayfinding--full' : 'wayfinding--fit'}`}>
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
                            clicked={() => setHasInputFocus(true)}
                         />
                    </label>
                    <label className="wayfinding__label">
                        FROM
                        <SearchField
                            mapsindoors={true}
                            placeholder="Search by name, category, buildings..."
                            results={locations => searchResultsReceived(locations, searchFieldItentifiers.FROM)}
                            displayText={fromFieldDisplayText}
                            clicked={() => setHasInputFocus(true)}
                        />
                    </label>
                </div>
            </div>
            {(!originLocation || !destinationLocation) && <div className="wayfinding__results">
                {searchResults.map(location => <ListItemLocation key={location.id} location={location} locationClicked={e => locationClickHandler(e)} />)}
            </div>}
            {/* Fixme: Add functionality to the accessibility feature. */}
            {!hasInputFocus && originLocation && destinationLocation && <div className={`wayfinding__details`} ref={detailsRef}>
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

import React from "react";
import { useEffect, useState } from 'react';
import './Modal.scss'
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';

const VIEWS = {
    SEARCH: 0,
    LOCATION_DETAILS: 1,
    WAYFINDING: 2,
    DIRECTIONS: 3
};

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {Object} props.setCurrentLocation - The setter for the currently selected MapsIndoors Location.
 * @param {Object} props.currentCategories - The unique categories displayed based on the existing locations.
 * @param {function} props.onLocationsFiltered - The list of locations after filtering through the categories.
 * @param {function} props.onLocationsSearched - The list of locations after search is performed.
*/
function Modal({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered, onLocationsSearched }) {
    const [activePage, setActivePage] = useState(null);

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : VIEWS.SEARCH);
    }, [currentLocation]);

    const pages = [
        <div className={`modal ${activePage === VIEWS.SEARCH ? 'modal--open' : ''}`} key="A">
            <Search onLocationClick={(location) => setCurrentLocation(location)}
                categories={currentCategories}
                onLocationsFiltered={(locations) => onLocationsFiltered(locations)}
                onLocationsSearched={(locations) => onLocationsSearched(locations)}
            />
        </div>,
        <div className={`modal ${activePage === VIEWS.LOCATION_DETAILS ? 'modal--open' : ''}`} key="B">
            <LocationDetails onStartWayfinding={() => setActivePage(VIEWS.WAYFINDING)}
                location={currentLocation}
                onBack={() => setActivePage(VIEWS.SEARCH)} />
        </div>,
        <div className={`modal ${activePage === VIEWS.WAYFINDING ? 'modal--open' : ''}`} key="C">
            <Wayfinding onStartDirections={() => setActivePage(VIEWS.DIRECTIONS)}
                location={currentLocation}
                onBack={() => setActivePage(VIEWS.LOCATION_DETAILS)} />
        </div>,
        <div className={`modal ${activePage === VIEWS.DIRECTIONS ? 'modal--open' : ''}`} key="D">
            <Directions onBack={() => setActivePage(VIEWS.WAYFINDING)} />
        </div>
    ]

    return (
        <div className="modals">
            {pages}
        </div>
    )
}

export default Modal;
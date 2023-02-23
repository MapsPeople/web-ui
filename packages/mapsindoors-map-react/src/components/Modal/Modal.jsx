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
 */
function Modal({ currentLocation, setCurrentLocation }) {
    const [activePage, setActivePage] = useState(null);

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : VIEWS.SEARCH);
    }, [currentLocation]);

    const pages = [
        <div className="modal">
            <Search onLocationClick={(location) => setCurrentLocation(location)} />
        </div>,
        <div className="modal">
            <LocationDetails onStartWayfinding={() => setActivePage(VIEWS.WAYFINDING)} location={currentLocation} onBack={() => setActivePage(VIEWS.SEARCH)} />
        </div>,
        <div className="modal">
            <Wayfinding onStartDirections={() => setActivePage(VIEWS.DIRECTIONS)} onBack={() => setActivePage(VIEWS.LOCATION_DETAILS)} />
        </div>,
        <div className="modal">
            <Directions onBack={() => setActivePage(VIEWS.WAYFINDING)} />
        </div>
    ]

    return (
        <div className="modals">
            {pages[activePage]}
        </div>
    )
}

export default Modal;
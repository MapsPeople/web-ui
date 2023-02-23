import React from "react";
import { useEffect, useState } from 'react';
import './Modal.scss'
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';

const VIEWS = {
    LOCATION_DETAILS: 0,
    WAYFINDING: 1,
    DIRECTIONS: 2
};

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {function} props.onClose - Callback that fires when all modals are closed.
 */
function Modal({ currentLocation, onClose }) {
    const [activePage, setActivePage] = useState(null);

    /**
    * When the user closes the location details.
    */
    function close() {
        setActivePage(null);
        onClose();
    }

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const pages = [
        <div className={`modal ${activePage === VIEWS.LOCATION_DETAILS ? 'modal--open' : ''}`} key="A">
            <LocationDetails onStartWayfinding={() => setActivePage(VIEWS.WAYFINDING)} location={currentLocation} onClose={() => close()} />
        </div>,
         <div className={`modal ${activePage === VIEWS.WAYFINDING ? 'modal--open' : ''}`} key="B">
            <Wayfinding onStartDirections={() => setActivePage(VIEWS.DIRECTIONS)} location={currentLocation} onBack={() => setActivePage(VIEWS.LOCATION_DETAILS)} />
        </div>,
         <div className={`modal ${activePage === VIEWS.DIRECTIONS ? 'modal--open' : ''}`} key="C">
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
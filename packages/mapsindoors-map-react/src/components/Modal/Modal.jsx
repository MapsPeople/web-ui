import React from "react";
import { useEffect } from 'react';
import { useState } from 'react';
import './Modal.scss'
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';

const VIEWS = {
    LOCATION_DETAILS: 0,
    WAYFINDING: 1,
    DIRECTIONS: 2
};

function Modal({ currentLocation, onClose }) {
    const [activePage, setActivePage] = useState(null);

    /**
    * When a page is closed.
    */
    function close() {
        setActivePage(null);
        onClose();
    }

    function startWayfinding() {
        setActivePage(VIEWS.WAYFINDING);
    }

    function startDirections() {
        setActivePage(VIEWS.DIRECTIONS);
    }

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const pages = [
        // Location details
        <div className='modal'>
            <LocationDetails location={currentLocation} onClose={() => close()} onStartWayfinding={() => startWayfinding()} />
        </div>,
        <div className='modal'>
            <Wayfinding onClose={() => close()} onStartDirections={() => startDirections()} />
        </div>,
        <div className='modal'>
            <Directions onClose={() => close()} />
        </div>
    ]

    return (
        <div className='modals'>
            {pages[activePage]}
        </div>
    )
}

export default Modal;
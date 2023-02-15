import React from "react";
import { useEffect } from 'react';
import { useState } from 'react';
import './Modal.scss'
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';

const VIEWS = {
    LOCATION_DETAILS: 0,
    WAYFINDING: 1
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

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const pages = [
        <div className="modal">
            <LocationDetails onStartWayfinding={() => setActivePage(VIEWS.WAYFINDING)} location={currentLocation} onClose={() => close()} />
        </div>,
        <div className="modal">
            <Wayfinding onClose={() => close()} onBack={() => setActivePage(VIEWS.LOCATION_DETAILS)} />
        </div>
    ]

    return (
        <div className="modals">
            {pages[activePage]}
        </div>
    )
}

export default Modal;
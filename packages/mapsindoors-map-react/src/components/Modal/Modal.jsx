import React from "react";
import { useEffect } from 'react';
import { useState } from 'react';
import './Modal.scss'
import LocationDetails from "../BottomSheet/LocationDetails/LocationDetails";

const PAGES = {
    LOCATION_DETAILS: 0
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
        setActivePage(currentLocation ? PAGES.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const pages = [
        // Location details
        <div className={`modal`}>
            <LocationDetails location={currentLocation} onClose={() => close()} />
        </div>
    ]

    return (
        <div>
            <div className='modals'>{pages[activePage]}</div>
        </div>
    )
}

export default Modal;
import React from "react";
import { useEffect } from 'react';
import './Modal.scss'
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';

function Modal({ currentLocation, onClose, pushToHistory, goBackInHistory, appState, appStates }) {

    /**
    * When a page is closed.
    */
    function close() {
        pushToHistory(appStates.SEARCH);
        onClose();
    }

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        if (currentLocation) {
            pushToHistory(appStates.LOCATION_DETAILS);
        }
    }, [currentLocation, appStates]); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing pushToHistory dependency to avoid running the useEffect when that is executed

    return (
        <div className="modals">
            {appState === appStates.LOCATION_DETAILS && <div className="modal">
                <LocationDetails onStartWayfinding={() => pushToHistory(appStates.WAYFINDING)} location={currentLocation} onClose={() => close()} />
            </div>}
            {appState === appStates.WAYFINDING && <div className="modal">
                <Wayfinding onClose={() => close()} onBack={() => goBackInHistory()} />
            </div>}
        </div>
    )
}

export default Modal;
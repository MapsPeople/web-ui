import React from "react";
import { useEffect } from 'react';
import './Modal.scss'
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';

/**
 * @param {object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {function} props.onClose - Callback that fires when all bottom sheets are closed.
 * @param {function} props.pushState - function to push entry to app state and browser history
 * @param {function} props.goBack - function to go back in app state and browser history
 * @param {string} props.currentAppState - current app state
 * @param {object} props.appStates - all app states
 * @returns
 */
function Modal({ currentLocation, onClose, pushState, goBack, currentAppState, appStates }) {

    /**
    * When the user closes the location details.
    */
    function close() {
        goBack();
        onClose();
    }

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        if (currentLocation) {
            pushState(appStates.LOCATION_DETAILS);
        }
    }, [currentLocation, appStates]); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing pushState dependency to avoid running the useEffect when that is executed

    return (
        <div className="modals">
            {currentAppState === appStates.LOCATION_DETAILS && <div className="modal">
                <LocationDetails onStartWayfinding={() => pushState(appStates.WAYFINDING)} location={currentLocation} onClose={() => close()} />
            </div>}
            {currentAppState === appStates.WAYFINDING && <div className="modal">
                <Wayfinding onStartDirections={() => pushState(appStates.DIRECTIONS)} onBack={() => goBack()} />
            </div>}
            {currentAppState === appStates.DIRECTIONS && <div className="modal">
                <Directions onBack={() => goBack()} />
            </div>}
        </div>
    )
}

export default Modal;
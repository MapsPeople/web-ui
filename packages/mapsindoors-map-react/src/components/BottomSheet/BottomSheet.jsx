import { useEffect } from 'react';
import { useState } from 'react';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';

const VIEWS = {
    LOCATION_DETAILS: 0,
    WAYFINDING: 1,
    DIRECTIONS: 2
};

function BottomSheet({ currentLocation, onClose}) {
    const [activeBottomSheet, setActiveBottomSheet] = useState(null);

    /**
     * When the user closes the location details.
     */
    function close() {
        setActiveBottomSheet(null);
        onClose();
    }

    /**
   * When the user starts the wayfinding.
   */
    function startWayfinding() {
        setActiveBottomSheet(VIEWS.WAYFINDING);
    }

    /**
   * When the user closes the wayfinding.
   */
    function closeWayfinding() {
        setActiveBottomSheet(VIEWS.LOCATION_DETAILS);
    }

    /**
   * When the user starts the directions.
   */
    function startDirections() {
        setActiveBottomSheet(VIEWS.DIRECTIONS);
    }

    /**
   * When the user closes the directions. 
   */
    function closeDirections() {
        setActiveBottomSheet(VIEWS.WAYFINDING);
    }

    /*
     * React on changes on the current location.
     */
    useEffect(() => {
        setActiveBottomSheet(currentLocation ? VIEWS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const bottomSheets = [
        // Location details
        <div className='bottom-sheet'>
            <LocationDetails location={currentLocation} onClose={() => close()} onStartWayfinding={() => startWayfinding()} />
        </div>,
        <div className='bottom-sheet'>
            <Wayfinding onClose={() => closeWayfinding()} onStartDirections={() => startDirections()} />
        </div>,
        <div className='bottom-sheet'>
            <Directions onClose={() => closeDirections()} />
        </div>
    ]

    return <div className='bottom-sheets'>{bottomSheets[activeBottomSheet]}</div>
}

export default BottomSheet;
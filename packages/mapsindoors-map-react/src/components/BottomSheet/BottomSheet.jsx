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

function BottomSheet({ currentLocation, onClose }) {

    const [activeBottomSheet, setActiveBottomSheet] = useState(null);

    /**
     * When a sheet is closed.
     */
    function close() {
        setActiveBottomSheet(null);
        onClose();
    }

    function startWayfinding() {
        setActiveBottomSheet(VIEWS.WAYFINDING);
    }

    function startDirections() {
        setActiveBottomSheet(VIEWS.DIRECTIONS);
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
            <Wayfinding onClose={() => close()} onStartDirections={() => startDirections()} />
        </div>,
        <div className='bottom-sheet'>
            <Directions onClose={() => close()} />
        </div>
    ]

    return <div className='bottom-sheets'>{bottomSheets[activeBottomSheet]}</div>
}

export default BottomSheet;
import { useEffect } from 'react';
import { useState } from 'react';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';

const BOTTOM_SHEETS = {
    LOCATION_DETAILS: 0,
    WAYFINDING: 1,
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
        setActiveBottomSheet(BOTTOM_SHEETS.WAYFINDING);
    }

    /*
     * React on changes on the current location.
     */
    useEffect(() => {
        setActiveBottomSheet(currentLocation ? BOTTOM_SHEETS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const bottomSheets = [
        // Location details
        <div className={`bottom-sheet`}>
            <LocationDetails location={currentLocation} onClose={() => close()} onStartWayfinding={() => startWayfinding()} />
        </div>,
        <div className={`bottom-sheet`}>
            <Wayfinding onClose={() => close()}/>
        </div>
    ]

    return <div className='bottom-sheets'>{bottomSheets[activeBottomSheet]}</div>
}

export default BottomSheet;
import { useEffect } from 'react';
import { useState } from 'react';
import './BottomSheet.scss';
import LocationDetails from './LocationDetails/LocationDetails';

const BOTTOM_SHEETS = {
    LOCATION_DETAILS: 0
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

    /*
     * React on changes on the current location.
     */
    useEffect(() => {
        setActiveBottomSheet(currentLocation ? BOTTOM_SHEETS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const bottomSheets = [
        // Location details
        <div className={`bottom-sheet`}>
            <LocationDetails location={currentLocation} onClose={() => close()} />
        </div>
    ]

    return <div className='bottom-sheets'>{bottomSheets[activeBottomSheet]}</div>
}

export default BottomSheet;
import { useEffect } from 'react';
import { useState } from 'react';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from './LocationDetails/LocationDetails';

const BOTTOM_SHEETS = {
    LOCATION_DETAILS: 0,
    WAYFINDING: 1
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
        <Sheet minHeight="72" isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS} key="A">
            <LocationDetails onStartWayfinding={() => setActiveBottomSheet(BOTTOM_SHEETS.WAYFINDING)} location={currentLocation} onClose={() => close()} />
        </Sheet>,
        <Sheet isOpen={activeBottomSheet === BOTTOM_SHEETS.WAYFINDING} key="B">
            {/* FIXME: Implement actual components for wayfinding */}
            <div style={{ color: 'black', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>FIXME</div>
        </Sheet>
    ]

    return <div className='bottom-sheets'>{bottomSheets}</div>
}

export default BottomSheet;
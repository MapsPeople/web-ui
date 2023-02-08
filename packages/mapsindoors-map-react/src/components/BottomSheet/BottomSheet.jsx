import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ContainerContext } from './ContainerContext';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';

const BOTTOM_SHEETS = {
    LOCATION_DETAILS: 0,
    WAYFINDING: 1
};

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {function} props.onClose - Callback that fires when all bottom sheets are closed.
 */
function BottomSheet({ currentLocation, onClose }) {

    const bottomSheetRef = useRef();
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
        <Sheet minHeight="72" addSnapPointForContent={true} snapPoints={[0, 100]} isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS} key="A">
            <LocationDetails onStartWayfinding={() => setActiveBottomSheet(BOTTOM_SHEETS.WAYFINDING)} location={currentLocation} onClose={() => close()} />
        </Sheet>,
        <Sheet addSnapPointForContent={true} isOpen={activeBottomSheet === BOTTOM_SHEETS.WAYFINDING} key="B">
            {/* FIXME: Implement actual components for wayfinding */}
            <div style={{ color: 'black', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>FIXME</div>
        </Sheet>
    ]

    return <div ref={bottomSheetRef} className='bottom-sheets'>
        <ContainerContext.Provider value={bottomSheetRef}>
            {bottomSheets}
        </ContainerContext.Provider>
    </div>
}

export default BottomSheet;
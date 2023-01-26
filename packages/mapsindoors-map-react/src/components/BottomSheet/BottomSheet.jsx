import { useEffect } from 'react';
import { useState } from 'react';
import Sheet from 'react-modal-sheet';
import './BottomSheet.scss';
import LocationDetails from './LocationDetails/LocationDetails';

const BOTTOM_SHEETS = {
    LOCATION_DETAILS: 0
};

function BottomSheet({ mountPoint, currentLocation, onClose }) {

    const [activeBottomSheet, setActiveBottomSheet] = useState(null);

    /*
     * React on changes on the current location.
     */
    useEffect(() => {
        setActiveBottomSheet(currentLocation ? BOTTOM_SHEETS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const bottomSheets = [
        // Location details sheet
        <Sheet
            className="bottom-sheet"
            style={{ position: 'absolute' }}
            isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS}
            detent={'content-height'}
            onClose={() => onClose()}
            mountPoint={mountPoint.current}
        >
                <Sheet.Container>
                    <Sheet.Content>
                        <LocationDetails location={currentLocation} onClose={() => setActiveBottomSheet(null)} />
                    </Sheet.Content>
                </Sheet.Container>
        </Sheet>
    ]

    return <div>{bottomSheets[activeBottomSheet]}</div>
}

export default BottomSheet;
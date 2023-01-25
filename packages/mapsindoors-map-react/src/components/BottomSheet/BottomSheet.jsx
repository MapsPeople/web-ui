import { useEffect } from 'react';
import { useState } from 'react';
import Sheet from 'react-modal-sheet';
import LocationDetails from './LocationDetails/LocationDetails';

const BOTTOM_SHEETS = {
    LOCATION_DETAILS: 0
};

function BottomSheet({ currentLocation, onClose }) {

    const [activeBottomSheet, setActiveBottomSheet] = useState(null);

    /*
     * React on changes on the current location.
     */
    useEffect(() => {
        setActiveBottomSheet(currentLocation ? BOTTOM_SHEETS.LOCATION_DETAILS : undefined);
    }, [currentLocation]);

    const snapPoints = [-10, 0.5, 0.2];

    const bottomSheets = [
        // Location details sheet
        <Sheet
            style={{ position: 'absolute', zIndex: 10000000 }}
            isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS}
            detent={'content-height'}
            onClose={() => onClose()}
            mountPoint={document.querySelector('.mapsindoors-map')} // FIXME: Ref
        >
                <Sheet.Container>
                    <Sheet.Content>
                        <LocationDetails location={currentLocation} />
                    </Sheet.Content>
                </Sheet.Container>
        </Sheet>
    ]

    return <div>{bottomSheets[activeBottomSheet]}</div>
}

export default BottomSheet;
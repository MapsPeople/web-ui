import { useEffect } from 'react';
import { useState } from 'react';
import Sheet from 'react-modal-sheet';

const BOTTOM_SHEETS = {
    LOCATION_DETAILS: 0
};

function BottomSheet({ currentLocation }) {

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
            isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS}
            snapPoints={snapPoints}
            initialSnap={2}
            mountPoint={document.querySelector('.mapsindoors-map')} // FIXME: Ref
        >
                <Sheet.Container>
                    <Sheet.Content>
                        {/* FIXME: Actual Location details  */}
                        <div style={{color: 'black'}}>
                            {currentLocation?.properties.name}
                        </div>
                    </Sheet.Content>
                </Sheet.Container>
        </Sheet>
    ]

    return <div>{bottomSheets[activeBottomSheet]}</div>
}

export default BottomSheet;
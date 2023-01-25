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
            style={{ position: 'absolute', zIndex: 10000000 }}
            isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS}
            detent={'content-height'}
            onClose={() => { /* FIXME: unset currentLocation */ }}
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
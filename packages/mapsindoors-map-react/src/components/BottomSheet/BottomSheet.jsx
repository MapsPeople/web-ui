import { useEffect, useRef } from 'react';
import { ContainerContext } from './ContainerContext';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {function} props.onClose - Callback that fires when all bottom sheets are closed.
 */
function BottomSheet({ currentLocation, onClose, pushToHistory, goBackInHistory, appState, appStates }) {

    const bottomSheetRef = useRef();

    /**
     * When a sheet is closed.
     */
    function close() {
        pushToHistory(appStates.SEARCH);
        onClose();
    }

    /*
     * React on changes on the current location.
     */
    useEffect(() => {
        if (currentLocation) {
            pushToHistory(appStates.LOCATION_DETAILS);
        }
    }, [currentLocation, appStates, pushToHistory]);

    const bottomSheets = [
        <Sheet minHeight="128" isOpen={appState === appStates.LOCATION_DETAILS} key="A">
            <LocationDetails onStartWayfinding={() => pushToHistory(appStates.WAYFINDING)} location={currentLocation} onClose={() => close()} />
        </Sheet>,
        <Sheet minHeight="60" isOpen={appState === appStates.WAYFINDING} key="B">
            <Wayfinding onClose={close} onBack={() => goBackInHistory()} />
        </Sheet>
    ];

    return <div ref={bottomSheetRef} className='bottom-sheets'>
        <ContainerContext.Provider value={bottomSheetRef}>
            {bottomSheets}
        </ContainerContext.Provider>
    </div>
}

export default BottomSheet;
import { useEffect, useRef } from 'react';
import { ContainerContext } from './ContainerContext';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';

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
    }, [currentLocation, appStates]); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing pushToHistory dependency to avoid running the useEffect when that is executed

    return <div ref={bottomSheetRef} className='bottom-sheets'>
        <ContainerContext.Provider value={bottomSheetRef}>
            <Sheet minHeight="128" isOpen={appState === appStates.LOCATION_DETAILS} key="A">
                <LocationDetails onStartWayfinding={() => pushToHistory(appStates.WAYFINDING)} location={currentLocation} onClose={() => close()} />
            </Sheet>,
            <Sheet minHeight="220" isOpen={appState === appStates.WAYFINDING} key="B">
                <Wayfinding onStartDirections={() => pushToHistory(appStates.DIRECTIONS)} onBack={() => goBackInHistory()} />
            </Sheet>
            <Sheet minHeight="220" isOpen={appState === appStates.DIRECTIONS} key="C">
                <Directions onBack={() => goBackInHistory()} />
            </Sheet>
        </ContainerContext.Provider>
    </div>
}

export default BottomSheet;
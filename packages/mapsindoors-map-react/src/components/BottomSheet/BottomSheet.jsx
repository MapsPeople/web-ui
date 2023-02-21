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
 * @param {function} props.pushState - function to push entry to app state and browser history
 * @param {function} props.goBack - function to go back in app state and browser history
 * @param {string} props.appState - current app state
 * @param {object} props.appStates - all app states
 */
function BottomSheet({ currentLocation, onClose, pushState, goBack, appState, appStates }) {

    const bottomSheetRef = useRef();

    /**
     * When a sheet is closed.
     */
    function close() {
        goBack();
        onClose();
    }

    /*
     * React on changes on the current location.
     */
    useEffect(() => {
        if (currentLocation) {
            pushState(appStates.LOCATION_DETAILS);
        }
    }, [currentLocation, appStates]); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing pushState dependency to avoid running the useEffect when that is executed

    return <div ref={bottomSheetRef} className='bottom-sheets'>
        <ContainerContext.Provider value={bottomSheetRef}>
            <Sheet minHeight="128" isOpen={appState === appStates.LOCATION_DETAILS}>
                <LocationDetails onStartWayfinding={() => pushState(appStates.WAYFINDING)} location={currentLocation} onClose={() => close()} />
            </Sheet>,
            <Sheet minHeight="220" isOpen={appState === appStates.WAYFINDING}>
                <Wayfinding onStartDirections={() => pushState(appStates.DIRECTIONS)} onBack={() => goBack()} />
            </Sheet>
            <Sheet minHeight="220" isOpen={appState === appStates.DIRECTIONS}>
                <Directions onBack={() => goBack()} />
            </Sheet>
        </ContainerContext.Provider>
    </div>
}

export default BottomSheet;
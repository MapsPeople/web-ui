import { useResetRecoilState, useRecoilValue } from 'recoil';
import activeStepState from '../atoms/activeStep';
import currentLocationState from '../atoms/currentLocationState';
import directionsResponseState from '../atoms/directionsResponseState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';
import isLocationClickedState from '../atoms/isLocationClickedState';
import notificationMessageState from '../atoms/notificationMessageState';
import travelModeState from '../atoms/travelModeState';
import accessibilityOnState from '../atoms/accessibilityOnState';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';

/**
 * Reset a number of Recoil atoms to initial values when route is finished.
 *
 * @returns {function}
 */
export function useOnRouteFinished() {

    const activeStep = useResetRecoilState(activeStepState);
    const currentLocation = useResetRecoilState(currentLocationState);
    const directionsResponse = useResetRecoilState(directionsResponseState);
    const hasFoundRoute = useResetRecoilState(hasFoundRouteState);
    const isLocationClicked = useResetRecoilState(isLocationClickedState);
    const notificationMessage = useResetRecoilState(notificationMessageState);
    const travelMode = useResetRecoilState(travelModeState);
    const accessibilityOn = useResetRecoilState(accessibilityOnState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    return () => {
        activeStep();
        currentLocation();
        directionsResponse();
        hasFoundRoute();
        isLocationClicked();
        notificationMessage();
        travelMode();
        accessibilityOn();
        
        // Clear any selection pins when route is finished to avoid visual clutter
        if (mapsIndoorsInstance) {
            mapsIndoorsInstance.deselectLocation();
        }
    };
}
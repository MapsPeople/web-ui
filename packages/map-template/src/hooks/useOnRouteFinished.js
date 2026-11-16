import { useAtomValue } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import activeStepState from '../atoms/activeStep';
import currentLocationState from '../atoms/currentLocationState';
import directionsResponseState from '../atoms/directionsResponseState';
import directionsLoadingState from '../atoms/directionsLoadingState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';
import isLocationClickedState from '../atoms/isLocationClickedState';
import notificationMessageState from '../atoms/notificationMessageState';
import travelModeState from '../atoms/travelModeState';
import accessibilityOnState from '../atoms/accessibilityOnState';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';

/**
 * Reset a number of Jotai atoms to initial values when route is finished.
 *
 * @returns {function}
 */
export function useOnRouteFinished() {

    const activeStep = useResetAtom(activeStepState);
    const currentLocation = useResetAtom(currentLocationState);
    const directionsResponse = useResetAtom(directionsResponseState);
    const directionsLoading = useResetAtom(directionsLoadingState);
    const hasFoundRoute = useResetAtom(hasFoundRouteState);
    const isLocationClicked = useResetAtom(isLocationClickedState);
    const notificationMessage = useResetAtom(notificationMessageState);
    const travelMode = useResetAtom(travelModeState);
    const accessibilityOn = useResetAtom(accessibilityOnState);
    const mapsIndoorsInstance = useAtomValue(mapsIndoorsInstanceState);

    return () => {
        activeStep();
        currentLocation();
        directionsResponse();
        directionsLoading();
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
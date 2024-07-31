import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import activeStepState from '../atoms/activeStep';
import currentLocationState from '../atoms/currentLocationState';
import directionsResponseState from '../atoms/directionsResponseState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';
import isLocationClickedState from '../atoms/isLocationClickedState';
import notificationMessageState from '../atoms/notificationMessageState';
import showQRCodeDialogState from '../atoms/showQRCodeDialogState';
import substepsToggledState from '../atoms/substepsToggledState';
import travelModeState from '../atoms/travelModeState';
import searchResultsState from '../atoms/searchResultsState';
import accessibilityOnState from '../atoms/accessibilityOnState';
import isLegendDialogVisibleState from '../atoms/isLegendDialogVisibleState';
import mapboxViewModeState from '../atoms/mapboxViewModeState';
import venueWasSelectedState from '../atoms/venueWasSelectedState';
import initialVenueNameState from '../atoms/initialVenueNameState';
import currentVenueNameState from '../atoms/currentVenueNameState';

/**
 * Reset a number of Recoil atoms to initial values.
 *
 * @returns {function} - Call this to reset.
 */
export function useReset() {

    const initialVenueName = useRecoilValue(initialVenueNameState);
    const [, setCurrentVenueName] = useRecoilState(currentVenueNameState);

    const activeStep = useResetRecoilState(activeStepState);
    const currentLocation = useResetRecoilState(currentLocationState);
    const directionsResponse = useResetRecoilState(directionsResponseState);
    const hasFoundRoute = useResetRecoilState(hasFoundRouteState);
    const isLocationClicked = useResetRecoilState(isLocationClickedState);
    const notificationMessage = useResetRecoilState(notificationMessageState);
    const showQRCodeDialog = useResetRecoilState(showQRCodeDialogState);
    const substepsToggled = useResetRecoilState(substepsToggledState);
    const travelMode = useResetRecoilState(travelModeState);
    const searchResults = useResetRecoilState(searchResultsState);
    const accessibilityOn = useResetRecoilState(accessibilityOnState);
    const isLegendDialogVisible  = useResetRecoilState(isLegendDialogVisibleState);
    const mapboxViewMode = useResetRecoilState(mapboxViewModeState);
    const venueWasSelected = useResetRecoilState(venueWasSelectedState);

    return () => {
        activeStep();
        currentLocation();
        directionsResponse();
        hasFoundRoute();
        isLocationClicked();
        notificationMessage();
        showQRCodeDialog();
        substepsToggled();
        travelMode();
        searchResults();
        accessibilityOn();
        isLegendDialogVisible();
        mapboxViewMode();
        venueWasSelected();

        // Make sure to reset the venue to the initial one.
        if (initialVenueName) {
            setCurrentVenueName(initialVenueName);
        }
    };
}

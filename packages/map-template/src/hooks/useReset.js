import { useAtomValue, useSetAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import activeStepState from '../atoms/activeStep';
import currentLocationState from '../atoms/currentLocationState';
import directionsResponseState from '../atoms/directionsResponseState';
import directionsLoadingState from '../atoms/directionsLoadingState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';
import isLocationClickedState from '../atoms/isLocationClickedState';
import notificationMessageState from '../atoms/notificationMessageState';
import showQRCodeDialogState from '../atoms/showQRCodeDialogState';
import qrCodeLinkState from '../atoms/qrCodeLinkState';
import substepsToggledState from '../atoms/substepsToggledState';
import travelModeState from '../atoms/travelModeState';
import searchResultsState from '../atoms/searchResultsState';
import accessibilityOnState from '../atoms/accessibilityOnState';
import isLegendDialogVisibleState from '../atoms/isLegendDialogVisibleState';
import mapboxViewModeState from '../atoms/mapboxViewModeState';
import venueWasSelectedState from '../atoms/venueWasSelectedState';
import initialVenueNameState from '../atoms/initialVenueNameState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import userPositionState from '../atoms/userPositionState';

/**
 * Reset a number of Jotai atoms to initial values.
 *
 * @returns {function} - Call this to reset.
 */
export function useReset() {

    const initialVenueName = useAtomValue(initialVenueNameState);
    const setCurrentVenueName = useSetAtom(currentVenueNameState);

    const activeStep = useResetAtom(activeStepState);
    const currentLocation = useResetAtom(currentLocationState);
    const directionsResponse = useResetAtom(directionsResponseState);
    const directionsLoading = useResetAtom(directionsLoadingState);
    const hasFoundRoute = useResetAtom(hasFoundRouteState);
    const isLocationClicked = useResetAtom(isLocationClickedState);
    const notificationMessage = useResetAtom(notificationMessageState);
    const showQRCodeDialog = useResetAtom(showQRCodeDialogState);
    const qrCodeLink = useResetAtom(qrCodeLinkState);
    const substepsToggled = useResetAtom(substepsToggledState);
    const travelMode = useResetAtom(travelModeState);
    const searchResults = useResetAtom(searchResultsState);
    const accessibilityOn = useResetAtom(accessibilityOnState);
    const isLegendDialogVisible  = useResetAtom(isLegendDialogVisibleState);
    const mapboxViewMode = useResetAtom(mapboxViewModeState);
    const venueWasSelected = useResetAtom(venueWasSelectedState);
    const userPosition = useResetAtom(userPositionState);

    return () => {
        qrCodeLink();
        activeStep();
        currentLocation();
        directionsResponse();
        directionsLoading();
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
        userPosition();

        // Make sure to reset the venue to the initial one.
        if (initialVenueName) {
            setCurrentVenueName(initialVenueName);
        }
    };
}

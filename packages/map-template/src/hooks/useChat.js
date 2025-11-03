import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import filteredLocationsState from '../atoms/filteredLocationsState';
import directionsServiceState from '../atoms/directionsServiceState';
import directionsResponseState from '../atoms/directionsResponseState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';
import travelModeState from '../atoms/travelModeState';
import accessibilityOnState from '../atoms/accessibilityOnState';
import shuttleBusOnState from '../atoms/shuttleBusOnState';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import kioskLocationState from '../atoms/kioskLocationState';
import getLocationPoint from '../helpers/GetLocationPoint';
import getDesktopPaddingLeft from '../helpers/GetDesktopPaddingLeft';
import getDesktopPaddingBottom from '../helpers/GetDesktopPaddingBottom';
import fitMapBoundsToLocations from '../helpers/FitMapBoundsToLocations';
import { useIsDesktop } from './useIsDesktop';

/**
 * Hook to handle chat search results by fetching Location objects from IDs
 * and setting them in filteredLocations state for highlighting on the map.
 * Also pans the map to fit the bounds of the locations.
 *
 * @returns {function} handleChatSearchResults - Callback function to handle search results
 */
export const useChatLocations = () => {
    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const currentVenueName = useRecoilValue(currentVenueNameState);
    const kioskLocation = useRecoilValue(kioskLocationState);
    const isDesktop = useIsDesktop();

    /**
     * Calculate padding for map bounds based on context (desktop/mobile, kiosk mode).
     * Returns promises that resolve to padding values.
     *
     * @returns {Promise<[number, number]>} - Promise that resolves to [bottomPadding, leftPadding]
     */
    const calculatePadding = useCallback(async () => {
        const getBottomPadding = async () => {
            if (isDesktop) {
                if (kioskLocation) {
                    return await getDesktopPaddingBottom();
                }
                return 0;
            }
            return 200;
        };

        const getLeftPadding = async () => {
            if (isDesktop) {
                if (kioskLocation) {
                    return 0;
                }
                return await getDesktopPaddingLeft();
            }
            return 0;
        };

        return Promise.all([getBottomPadding(), getLeftPadding()]);
    }, [isDesktop, kioskLocation]);

    const handleChatSearchResults = useCallback(async (locationIds) => {
        if (!locationIds || locationIds.length === 0) {
            setFilteredLocations([]);
            return;
        }

        try {
            const promises = locationIds.map(id =>
                window.mapsindoors.services.LocationsService.getLocation(id)
            );
            const locations = await Promise.all(promises);
            const validLocations = locations.filter(location => location !== null);

            // Set the locations in filteredLocations state
            // MapWrapper will automatically watch this state and highlight the locations on the map
            setFilteredLocations(validLocations);

            // Pan the map to fit the bounds of the locations
            if (validLocations.length > 0 && mapsIndoorsInstance) {
                const [bottomPadding, leftPadding] = await calculatePadding();
                await fitMapBoundsToLocations(validLocations, mapsIndoorsInstance, currentVenueName, bottomPadding, leftPadding);
            }
        } catch (error) {
            console.error('useChatLocations: Error fetching locations:', error);
            setFilteredLocations([]);
        }
    }, [setFilteredLocations, mapsIndoorsInstance, currentVenueName, calculatePadding]);

    return handleChatSearchResults;
};

/**
 * Hook to handle chat directions by fetching Location objects from IDs,
 * calculating the route, and navigating to DIRECTIONS view.
 *
 * @param {function} pushAppView - Function to navigate to a different app view
 * @param {object} appViews - Object containing app view constants (must have DIRECTIONS property)
 * @returns {function} handleChatShowRoute - Callback function to handle showing route
 */
export const useChatDirections = (pushAppView, appViews) => {
    const directionsService = useRecoilValue(directionsServiceState);
    const [, setDirectionsResponse] = useRecoilState(directionsResponseState);
    const [, setHasFoundRoute] = useRecoilState(hasFoundRouteState);
    const travelMode = useRecoilValue(travelModeState);
    const accessibilityOn = useRecoilValue(accessibilityOnState);
    const shuttleBusOn = useRecoilValue(shuttleBusOnState);

    const handleChatShowRoute = useCallback(async (directionIds) => {
        if (!directionIds || !directionIds.originLocationId || !directionIds.destinationLocationId) {
            return;
        }

        if (!directionsService) {
            console.error('useChatDirections: Directions service not available');
            return;
        }

        try {
            // Fetch both location objects in parallel
            const [originLocation, destinationLocation] = await Promise.all([
                window.mapsindoors.services.LocationsService.getLocation(directionIds.originLocationId),
                window.mapsindoors.services.LocationsService.getLocation(directionIds.destinationLocationId)
            ]);

            if (!originLocation || !destinationLocation) {
                console.error('useChatDirections: Failed to fetch one or both locations');
                return;
            }

            // Check if locations have geometry (required for routing)
            if (!originLocation.geometry || !destinationLocation.geometry) {
                console.error('useChatDirections: Locations missing geometry required for routing');
                return;
            }

            // Calculate the route
            const directionsResult = await directionsService.getRoute({
                origin: getLocationPoint(originLocation),
                destination: getLocationPoint(destinationLocation),
                travelMode: travelMode,
                avoidStairs: accessibilityOn,
                excludeHighwayTypes: shuttleBusOn ? [] : ['busway']
            });

            if (directionsResult && directionsResult.legs) {
                // Calculate total distance and time
                const totalDistance = directionsResult.legs.reduce((accumulator, current) => accumulator + current.distance.value, 0);
                const totalTime = directionsResult.legs.reduce((accumulator, current) => accumulator + current.duration.value, 0);

                // Set the directions response in state (Directions component reads from this)
                setDirectionsResponse({
                    originLocation,
                    destinationLocation,
                    totalDistance,
                    totalTime,
                    directionsResult
                });
                setHasFoundRoute(true);

                // Navigate directly to DIRECTIONS view
                pushAppView(appViews.DIRECTIONS);
            } else {
                console.error('useChatDirections: Failed to calculate route');
            }
        } catch (error) {
            console.error('useChatDirections: Error fetching locations or calculating route:', error);
        }
    }, [directionsService, travelMode, accessibilityOn, shuttleBusOn, setDirectionsResponse, setHasFoundRoute, pushAppView, appViews]);

    return handleChatShowRoute;
};


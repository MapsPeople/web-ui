import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import filteredLocationsState from '../atoms/filteredLocationsState';
import directionsServiceState from '../atoms/directionsServiceState';
import directionsResponseState from '../atoms/directionsResponseState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';
import travelModeState from '../atoms/travelModeState';
import accessibilityOnState from '../atoms/accessibilityOnState';
import shuttleBusOnState from '../atoms/shuttleBusOnState';
import getLocationPoint from '../helpers/GetLocationPoint';

/**
 * Hook to handle chat search results by fetching Location objects from IDs
 * and setting them in filteredLocations state for highlighting on the map.
 *
 * @returns {function} handleChatSearchResults - Callback function to handle search results
 */
export const useChatLocations = () => {
    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);

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
        } catch (error) {
            console.error('useChatLocations: Error fetching locations:', error);
            setFilteredLocations([]);
        }
    }, [setFilteredLocations]);

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


import { useState, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import resolveLocationIds from '../helpers/resolveLocationIds';
import directionsServiceState from '../atoms/directionsServiceState';
import travelModeState from '../atoms/travelModeState';
import accessibilityOnState from '../atoms/accessibilityOnState';
import getLocationPoint from '../helpers/GetLocationPoint';

/**
 * Hook to handle directions data from chat and resolve location IDs to full location objects.
 * 
 * @returns {Object} Object containing resolved locations and handler function
 */
const useDirectionsFromChat = () => {
    const [isResolving, setIsResolving] = useState(false);
    const [resolvedLocations, setResolvedLocations] = useState(null);
    
    // Get required services and state
    const directionsService = useRecoilValue(directionsServiceState);
    const travelMode = useRecoilValue(travelModeState);
    const accessibilityOn = useRecoilValue(accessibilityOnState);

    /**
     * Resolve location IDs from chat directions data to full location objects and get directions.
     * 
     * @param {Object} locationIds - Object containing originLocationId and destinationLocationId
     * @returns {Promise<Object>} Promise that resolves to an object with originLocation and destinationLocation
     */
    const resolveDirectionsFromChat = useCallback(async (locationIds) => {
        if (!locationIds || (!locationIds.originLocationId && !locationIds.destinationLocationId)) {
            console.warn('No valid location IDs provided for directions resolution');
            return null;
        }

        setIsResolving(true);
        
        try {
            console.log('Resolving location IDs for wayfinding:', locationIds);
            const resolved = await resolveLocationIds(locationIds);
            
            // Check if we successfully resolved at least one location
            if (resolved.originLocation || resolved.destinationLocation) {
                setResolvedLocations(resolved);
                console.log('Successfully resolved locations:', resolved);
                
                // If we have both origin and destination, get the actual directions
                if (resolved.originLocation && resolved.destinationLocation && directionsService) {
                    try {
                        console.log('Getting directions for resolved locations');
                        const directionsResult = await directionsService.getRoute({
                            origin: getLocationPoint(resolved.originLocation),
                            destination: getLocationPoint(resolved.destinationLocation),
                            travelMode: travelMode,
                            avoidStairs: accessibilityOn
                        });
                        
                        if (directionsResult && directionsResult.legs) {
                            // Calculate total distance and time
                            const totalDistance = directionsResult.legs.reduce((accumulator, current) => accumulator + current.distance.value, 0);
                            const totalTime = directionsResult.legs.reduce((accumulator, current) => accumulator + current.duration.value, 0);
                            
                            // Set the directions response state so the Directions component can use it
                            // We need to import and use the setter for directionsResponseState
                            console.log('Directions calculated successfully, setting directions response state');
                            
                            // For now, we'll return the directions data and let the calling component handle setting the state
                            return {
                                ...resolved,
                                directionsResult,
                                totalDistance,
                                totalTime
                            };
                        }
                    } catch (directionsError) {
                        console.error('Error getting directions:', directionsError);
                        // Still return the resolved locations even if directions failed
                    }
                }
                
                return resolved;
            } else {
                console.warn('Failed to resolve any locations from IDs:', locationIds);
                return null;
            }
        } catch (error) {
            console.error('Error resolving directions from chat:', error);
            return null;
        } finally {
            setIsResolving(false);
        }
    }, [directionsService, travelMode, accessibilityOn]);

    /**
     * Clear resolved locations (useful when navigating away or starting new directions).
     */
    const clearResolvedLocations = useCallback(() => {
        setResolvedLocations(null);
    }, []);

    return {
        resolvedLocations,
        isResolving,
        resolveDirectionsFromChat,
        clearResolvedLocations
    };
};

export default useDirectionsFromChat;

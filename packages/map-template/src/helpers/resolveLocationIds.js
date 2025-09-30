/**
 * Resolve location IDs to full location objects for wayfinding.
 * 
 * @param {Object} locationIds - Object containing originLocationId and destinationLocationId
 * @returns {Promise<Object>} Promise that resolves to an object with originLocation and destinationLocation
 */
export default async function resolveLocationIds(locationIds) {
    const { originLocationId, destinationLocationId } = locationIds;
    
    try {
        // Create promises to fetch both locations in parallel
        const promises = [];
        
        if (originLocationId) {
            promises.push(
                window.mapsindoors.services.LocationsService.getLocation(originLocationId)
                    .then(location => ({ type: 'origin', location }))
                    .catch(error => {
                        console.error('Error fetching origin location:', error);
                        return { type: 'origin', location: null };
                    })
            );
        }
        
        if (destinationLocationId) {
            promises.push(
                window.mapsindoors.services.LocationsService.getLocation(destinationLocationId)
                    .then(location => ({ type: 'destination', location }))
                    .catch(error => {
                        console.error('Error fetching destination location:', error);
                        return { type: 'destination', location: null };
                    })
            );
        }
        
        // Wait for all location fetches to complete
        const results = await Promise.all(promises);
        
        // Organize results into the expected format
        const resolvedLocations = {
            originLocation: null,
            destinationLocation: null
        };
        
        results.forEach(({ type, location }) => {
            if (type === 'origin') {
                resolvedLocations.originLocation = location;
            } else if (type === 'destination') {
                resolvedLocations.destinationLocation = location;
            }
        });
        
        return resolvedLocations;
        
    } catch (error) {
        console.error('Error resolving location IDs:', error);
        return {
            originLocation: null,
            destinationLocation: null
        };
    }
}

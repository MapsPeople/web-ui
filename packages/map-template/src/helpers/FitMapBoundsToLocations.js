/**
 * Adjusts the map view to fit the bounds of the provided locations.
 * It will filter out Locations that are not on the current floor or not part of the current venue.
 *
 * @param {Array} locations - An array of Location objects to fit within the map bounds.
 * @param {object} mapsIndoorsInstance - MapsIndoors instance.
 * @param {string} currentVenueName - Current venue name to filter locations.
 * @param {Promise<number>|number} bottomPadding - Bottom padding in pixels (can be a Promise or a number).
 * @param {Promise<number>|number} leftPadding - Left padding in pixels (can be a Promise or a number).
 */
export default async function fitMapBoundsToLocations(locations, mapsIndoorsInstance, currentVenueName, bottomPadding, leftPadding) {
    if (!mapsIndoorsInstance || !mapsIndoorsInstance.goTo) {
        // Early exit if instance not available or goTo method doesn't exist
        // The goTo method was introduced in version 4.38.0 of the MapsIndoors JS SDK
        return;
    }

    const currentFloorIndex = mapsIndoorsInstance.getFloor();

    // Create a GeoJSON FeatureCollection from the locations that can be used as input to the goTo method.
    const featureCollection = {
        type: 'FeatureCollection',
        features: locations
            // Filter out locations that are not on the current floor. If those were included, it could result in a wrong fit since they are not visible on the map anyway.
            .filter(location => parseInt(location.properties.floor, 10) === parseInt(currentFloorIndex, 10))
            // Filter out locations that are not part of the current venue. Including those when fitting to bounds could cause the map to zoom out too much.
            .filter(location => currentVenueName && location.properties.venueId.toLowerCase() === currentVenueName.toLowerCase())
            // Map the locations to GeoJSON features.
            .map(location => ({
                type: 'Feature',
                geometry: location.geometry,
                properties: location.properties
            }))
    };

    if (featureCollection.features.length > 0) {
        // Resolve padding values (they might be promises or numbers)
        const resolvedBottomPadding = bottomPadding instanceof Promise ? await bottomPadding : bottomPadding;
        const resolvedLeftPadding = leftPadding instanceof Promise ? await leftPadding : leftPadding;

        mapsIndoorsInstance.goTo(featureCollection, {
            maxZoom: 22,
            padding: { bottom: resolvedBottomPadding, left: resolvedLeftPadding, top: 0, right: 0 }
        });
    }
}


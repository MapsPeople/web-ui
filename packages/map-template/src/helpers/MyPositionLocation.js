/**
 * Generates a GeoJSON feature representing user position
 * given a GeolocationPosition object.
 *
 * @param {GeolocationPosition} userPosition
 * @returns {GeoJSON.Feature}
 */
export default function generateMyPositionLocation(userPosition) {
    const geometry = {
        type: 'Point',
        coordinates: [userPosition.coords.longitude, userPosition.coords.latitude]
    };

    return {
        geometry: geometry,
        properties: {
            name: 'My Position',
            anchor: geometry,
        },
        type: 'Feature'
    };
}

/**
 * Get a point with a floor from a Location to use as origin or destination point.
 *
 * @param {object} location
 * @returns {object}
 */
export default function getLocationPoint(location) {
    const coordinates = location.geometry.type === 'Point' ? location.geometry.coordinates : location.properties.anchor.coordinates;
    return { lat: coordinates[1], lng: coordinates[0], floor: location.properties.floor };
}

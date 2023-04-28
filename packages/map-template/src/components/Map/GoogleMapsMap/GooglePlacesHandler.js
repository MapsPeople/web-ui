let googleMapsGeocoder;

/**
 *  Handle google places and add geometry with type and coordinates.
 *
 * @param {Object} location
 */
function addGooglePlaceGeometry(location) {
    return new Promise((resolve, reject) => {
        if (!googleMapsGeocoder) {
            googleMapsGeocoder = new window.google.maps.Geocoder();
        }
        googleMapsGeocoder.geocode({ 'placeId': location.properties.placeId }, (results) => {
            if (results.length > 0) {
                location.geometry = {
                    type: 'Point',
                    coordinates: [results[0].geometry.location.lng(), results[0].geometry.location.lat()]
                };
                resolve(location);
            } else {
                reject();
            }
        });
    });
}

export default addGooglePlaceGeometry;
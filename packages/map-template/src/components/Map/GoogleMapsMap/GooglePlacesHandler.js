let googleMapsGeocoder;

/**
 *  Handle google places.
 *
 * @param {Object} location
 */
function handleGooglePlaces(location) {
    return new Promise((resolve, reject) => {
        if (!googleMapsGeocoder) {
            googleMapsGeocoder = new window.google.maps.Geocoder();
        }
        googleMapsGeocoder.geocode({ 'placeId': location.properties.placeId }, (results) => {
            if (results.length > 0) {
                resolve(results[0]);
            } else {
                reject();
            }
        });
    });
}

export default handleGooglePlaces;
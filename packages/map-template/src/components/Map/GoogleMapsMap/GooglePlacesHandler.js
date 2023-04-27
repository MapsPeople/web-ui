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

export default handleGooglePlaces;
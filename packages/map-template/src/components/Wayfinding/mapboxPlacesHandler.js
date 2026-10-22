import getMapboxPlacesSessionToken, { resetMapboxPlacesSessionToken } from '../../utils/getMapboxPlacesSessionToken';

/**
 * Handle Mapbox places and add geometry with type and coordinates.
 *
 * @param {Object} location
 * @param {string} mapboxAccessToken
 */
function addMapboxPlaceGeometry(location, mapboxAccessToken) {
    const mapboxPlacesSessionToken = getMapboxPlacesSessionToken();

    return new Promise((resolve, reject) => {
        const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${location.id}?session_token=${mapboxPlacesSessionToken}&access_token=${mapboxAccessToken}`;

        fetch(url)
            .then((response) => {
                if (response.status !== 200) {
                    return reject();
                } else {
                    return response.json();
                }
            })
            .then((result) => {
                location.geometry = {
                    type: 'Point',
                    coordinates: [result.features[0].geometry.coordinates[0], result.features[0].geometry.coordinates[1]]
                }
                resetMapboxPlacesSessionToken();
                resolve(location);
            })
            .catch(() => {
                reject();
            });
    });
}

export default addMapboxPlaceGeometry;

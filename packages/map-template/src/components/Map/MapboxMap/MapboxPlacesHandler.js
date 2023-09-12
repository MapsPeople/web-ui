import axios from 'axios';

function retrieveSuggestedFeature(locationId) {
    return `https://api.mapbox.com/search/searchbox/v1/retrieve/${locationId}?session_token=[GENERATED-UUID]&access_token=pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjazVzNjB5a3EwODd0M2Ztb3FjYmZmbzJhIn0._fo_iTl7ZHPrl634-F2qYg`;
}

/**
 * Handle mapbox places and add geometry with type and coordinates.
 *
 * @param {Object} location
 */
function addMapboxPlaceGeometry(location) {
    return new Promise((resolve) => {
        const url = retrieveSuggestedFeature(location.id);

        axios.get(url)
            .then((result) => {
                location.geometry = {
                    type: 'Point',
                    coordinates: [result.data.features[0].geometry.coordinates[0], result.data.features[0].geometry.coordinates[1]]
                }
                resolve(location);
            })
            .catch(err => {
                console.error('Error: ', err);
            });
    });
}

export default addMapboxPlaceGeometry;
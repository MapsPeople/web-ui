/**
 * Handle Mapbox places and add geometry with type and coordinates.
 *
 * @param {Object} location
 */
function addMapboxPlaceGeometry(location) {

    return new Promise((resolve) => {

        const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${location.id}?session_token=[GENERATED-UUID]&access_token=pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjazVzNjB5a3EwODd0M2Ztb3FjYmZmbzJhIn0._fo_iTl7ZHPrl634-F2qYg`;

        fetch(url)
            .then((response) => {
                return response.json();
            })
            .then((result) => {
                location.geometry = {
                    type: 'Point',
                    coordinates: [result.features[0].geometry.coordinates[0], result.features[0].geometry.coordinates[1]]
                }
                resolve(location);
            })
            .catch(err => {
                console.log('Error: ', err);
            });
    });
}

export default addMapboxPlaceGeometry;
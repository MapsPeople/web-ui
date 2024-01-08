import { t } from 'i18next';

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
        id: 'USER_POSITION',
        geometry: geometry,
        properties: {
            name: t('My position'),
            anchor: geometry,
        },
        type: 'Feature'
    };
}

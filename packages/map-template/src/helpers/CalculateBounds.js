import { bbox, circle as createCircle } from '@turf/turf';

/**
 * Calculate the bounding box for the given geometry.
 * If the geometry is a point, a 5x5 meter bounds will be used.
 *
 * @param {GeoJSON.Geometry} geometry
 * @returns {GeoJSON.BBox}
 */
export function calculateBounds(geometry) {
    if (geometry?.type === 'Point') {
        return bbox(createCircle(geometry, 5, { units: 'meters', steps: 4 }));
    } else {
        return bbox(geometry);
    }
}

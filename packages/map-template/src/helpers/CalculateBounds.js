import { bbox, circle as createCircle } from '@turf/turf';

export function calculateBounds(geometry) {
    if (geometry?.type === 'Point') {
        return bbox(createCircle(geometry, 5, { units: 'meters', steps: 4 }));
    } else {
        return bbox(geometry);
    }
}

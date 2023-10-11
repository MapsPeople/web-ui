import { bbox, circle as createCircle } from '@turf/turf';

export function calculateBounds(geometry) {
    if (geometry?.type === 'Point') {
        console.log('first',bbox(createCircle(geometry, 5, { units: 'meters', steps: 4 })))
        return bbox(createCircle(geometry, 5, { units: 'meters', steps: 4 }));
    } else {
        console.log('second',bbox(geometry))

        return bbox(geometry);
    }
}

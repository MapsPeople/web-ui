import getLocationPoint from '../../helpers/GetLocationPoint';
import * as turf from '@turf/turf';

describe('getLocationPoint', () => {
    it('returns correct lat, lng, floor for geometry type Point', () => {
        const location = {
            geometry: { type: 'Point', coordinates: [10, 20] },
            properties: { floor: 5 }
        };
        const result = getLocationPoint(location);
        expect(result).toEqual({ lat: 20, lng: 10, floor: 5 });
    });

    it('returns correct lat, lng, floor for geometry type other than Point', () => {
        const location = {
            geometry: { type: 'Polygon' },
            properties: { anchor: { coordinates: [30, 40] }, floor: 2 }
        };
        const result = getLocationPoint(location);
        expect(result).toEqual({ lat: 40, lng: 30, floor: 2 });
    });

    it('handles Point geometry created with turf', () => {
        const point = turf.point([10, 20]);
        const location = {
            ...point,
            properties: { floor: 5 }
        };
        const result = getLocationPoint(location);
        expect(result).toEqual({ lat: 20, lng: 10, floor: 5 });
    });

    it('handles Polygon geometry created with turf', () => {
        const coordinates = [
            [[30, 40], [31, 40], [31, 41], [30, 41], [30, 40]]
        ];
        const polygon = turf.polygon(coordinates);
        const location = {
            ...polygon,
            properties: { 
                anchor: { coordinates: [30, 40] },
                floor: 2 
            }
        };
        const result = getLocationPoint(location);
        expect(result).toEqual({ lat: 40, lng: 30, floor: 2 });
    });

    describe('edge cases', () => {
        it('handles missing floor property', () => {
            const point = turf.point([10, 20]);
            const location = { ...point };
            const result = getLocationPoint(location);
            expect(result).toEqual({ lat: 20, lng: 10, floor: undefined });
        });

        it('throws error for missing coordinates', () => {
            const location = {
                geometry: { type: 'Point' },
                properties: { floor: 1 }
            };
            expect(() => getLocationPoint(location)).toThrow();
        });

        it('throws error for invalid geometry type', () => {
            const location = {
                geometry: { type: 'Invalid' },
                properties: { floor: 1 }
            };
            expect(() => getLocationPoint(location)).toThrow();
        });

        it('throws error for null location', () => {
            expect(() => getLocationPoint(null)).toThrow();
        });
    });
});
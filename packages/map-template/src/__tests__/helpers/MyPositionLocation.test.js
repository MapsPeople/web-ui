import generateMyPositionLocation from '../../helpers/MyPositionLocation';
import * as turf from '@turf/turf';

// Mock i18next
jest.mock('i18next', () => ({
    t: jest.fn().mockReturnValue('My position')
}));

describe('generateMyPositionLocation', () => {
    const mockPosition = {
        coords: {
            latitude: 56.17,
            longitude: 10.19
        }
    };

    it('generates valid GeoJSON feature with correct coordinates', () => {
        const result = generateMyPositionLocation(mockPosition);
        const expectedPoint = turf.point([10.19, 56.17]);

        expect(result.type).toBe('Feature');
        expect(result.id).toBe('USER_POSITION');
        expect(result.geometry).toEqual(expectedPoint.geometry);
    });

    it('includes correct properties', () => {
        const result = generateMyPositionLocation(mockPosition);
        
        expect(result.properties).toEqual({
            name: 'My position',
            anchor: {
                type: 'Point',
                coordinates: [10.19, 56.17]
            }
        });
    });

    it('matches turf point structure', () => {
        const result = generateMyPositionLocation(mockPosition);
        const turfPoint = turf.point([10.19, 56.17]);
        
        expect(result.geometry.coordinates).toEqual(turfPoint.geometry.coordinates);
        expect(result.geometry.type).toBe(turfPoint.geometry.type);
    });

    it('throws error for invalid position data', () => {
        const invalidPosition = {};
        expect(() => generateMyPositionLocation(invalidPosition)).toThrow();
    });
});
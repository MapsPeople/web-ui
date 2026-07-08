import { processFunctionData } from './processFunctionData';

describe('processFunctionData', () => {
    it('includes avoidStairs when the backend set it true', () => {
        const result = processFunctionData({
            key: 'directions',
            value: { originLocationId: 'origin-1', destinationLocationId: 'dest-1', avoidStairs: true }
        });
        expect(result.directionsLocationIds).toEqual({
            originLocationId: 'origin-1',
            destinationLocationId: 'dest-1',
            avoidStairs: true
        });
    });

    it('omits avoidStairs when the backend did not send it', () => {
        const result = processFunctionData({
            key: 'directions',
            value: { originLocationId: 'origin-1', destinationLocationId: 'dest-1' }
        });
        expect(result.directionsLocationIds).toEqual({
            originLocationId: 'origin-1',
            destinationLocationId: 'dest-1'
        });
        expect(result.directionsLocationIds).not.toHaveProperty('avoidStairs');
    });

    it('returns null directionsLocationIds when ids are missing, regardless of avoidStairs', () => {
        const result = processFunctionData({ key: 'directions', value: { avoidStairs: true } });
        expect(result.directionsLocationIds).toBeNull();
    });
});

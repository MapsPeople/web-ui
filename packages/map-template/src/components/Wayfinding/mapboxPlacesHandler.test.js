import addMapboxPlaceGeometry from './mapboxPlacesHandler';
import getMapboxPlacesSessionToken, { resetMapboxPlacesSessionToken } from '../../utils/getMapboxPlacesSessionToken';

describe('addMapboxPlaceGeometry', () => {
    beforeEach(() => {
        resetMapboxPlacesSessionToken();
    });

    it('retrieves with the token that was current before the reset and then resets it', async () => {
        const tokenBefore = getMapboxPlacesSessionToken();
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({ features: [{ geometry: { coordinates: [12.5, 55.7] } }] })
        });

        const location = await addMapboxPlaceGeometry({ id: 'place-1' }, 'access-token');

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch.mock.calls[0][0]).toContain(`session_token=${tokenBefore}`);
        expect(location.geometry.coordinates).toEqual([12.5, 55.7]);
        expect(getMapboxPlacesSessionToken()).not.toBe(tokenBefore);
    });

    it('keeps the token when the retrieve fails', async () => {
        const tokenBefore = getMapboxPlacesSessionToken();
        global.fetch = jest.fn().mockResolvedValue({ status: 500 });

        await expect(addMapboxPlaceGeometry({ id: 'place-1' }, 'access-token')).rejects.toBeUndefined();

        expect(getMapboxPlacesSessionToken()).toBe(tokenBefore);
    });
});

import getMapboxPlacesSessionToken, { resetMapboxPlacesSessionToken } from './getMapboxPlacesSessionToken';

describe('getMapboxPlacesSessionToken', () => {
    beforeEach(() => {
        resetMapboxPlacesSessionToken();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the same token on repeated calls', () => {
        expect(getMapboxPlacesSessionToken()).toBe(getMapboxPlacesSessionToken());
    });

    it('returns a new token after reset', () => {
        const firstToken = getMapboxPlacesSessionToken();
        resetMapboxPlacesSessionToken();
        expect(getMapboxPlacesSessionToken()).not.toBe(firstToken);
    });

    it('returns a stable token when sessionStorage throws', () => {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
        jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('denied'); });

        const token = getMapboxPlacesSessionToken();
        expect(token).toEqual(expect.any(String));
        expect(getMapboxPlacesSessionToken()).toBe(token);

        expect(() => resetMapboxPlacesSessionToken()).not.toThrow();
        expect(getMapboxPlacesSessionToken()).not.toBe(token);
    });

    it('returns a UUID-shaped token when crypto.randomUUID is undefined', () => {
        const originalRandomUUID = crypto.randomUUID;
        Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });

        const token = getMapboxPlacesSessionToken();
        Object.defineProperty(crypto, 'randomUUID', { value: originalRandomUUID, configurable: true });

        expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
});

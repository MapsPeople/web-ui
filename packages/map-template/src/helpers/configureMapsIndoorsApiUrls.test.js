import configureMapsIndoorsApiUrls, { normalizeMapsIndoorsApiUrls } from './configureMapsIndoorsApiUrls';

describe('configureMapsIndoorsApiUrls', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('normalizes semicolon and comma separated API URLs', () => {
        expect(normalizeMapsIndoorsApiUrls(' http://localhost:5099/ ; https://api.dev.mapsindoors.com,https://example.com/path/ ')).toEqual([
            'http://localhost:5099',
            'https://api.dev.mapsindoors.com',
            'https://example.com/path'
        ]);
    });

    it('sets the SDK API URL override when configured', () => {
        configureMapsIndoorsApiUrls('http://localhost:5099/');

        expect(localStorage.getItem('mi:apiUrls')).toBe('http://localhost:5099');
        expect(localStorage.getItem('mi:mapTemplateApiUrlsManaged')).toBe('true');
    });

    it('clears a managed SDK API URL override when no URL is configured', () => {
        configureMapsIndoorsApiUrls('http://localhost:5099/');

        configureMapsIndoorsApiUrls(undefined);

        expect(localStorage.getItem('mi:apiUrls')).toBeNull();
        expect(localStorage.getItem('mi:mapTemplateApiUrlsManaged')).toBeNull();
    });

    it('leaves an unmanaged SDK API URL override untouched', () => {
        localStorage.setItem('mi:apiUrls', 'https://api.dev.mapsindoors.com');

        configureMapsIndoorsApiUrls(undefined);

        expect(localStorage.getItem('mi:apiUrls')).toBe('https://api.dev.mapsindoors.com');
    });

    it('ignores invalid API URL configuration', () => {
        configureMapsIndoorsApiUrls('not-a-url');

        expect(localStorage.getItem('mi:apiUrls')).toBeNull();
        expect(localStorage.getItem('mi:mapTemplateApiUrlsManaged')).toBeNull();
    });
});

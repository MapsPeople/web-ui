import {
    buildRouteShareUrl,
    shareRouteWithFallback,
    shareRouteResults
} from './shareRouteHelpers';

describe('buildRouteShareUrl', () => {
    it('encodes route share query parameters', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map',
            apiKey: 'key with spaces&symbols',
            originId: 'origin&1',
            destinationId: 'destination 2'
        });

        expect(url).toBe('https://example.com/map?directionsFrom=origin%261&directionsTo=destination+2&apiKey=key+with+spaces%26symbols');
    });

    it('omits apiKey when it is not set', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map',
            apiKey: undefined,
            originId: 'origin',
            destinationId: 'destination'
        });

        expect(url).toBe('https://example.com/map?directionsFrom=origin&directionsTo=destination');
    });

    it('preserves existing query parameters when adding route share parameters', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map?floor=1&language=en',
            apiKey: 'api-key',
            originId: 'origin',
            destinationId: 'destination'
        });

        expect(url).toBe('https://example.com/map?floor=1&language=en&directionsFrom=origin&directionsTo=destination&apiKey=api-key');
    });

    it('adds route share parameters before a hash fragment', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map#details',
            apiKey: 'api-key',
            originId: 'origin',
            destinationId: 'destination'
        });

        expect(url).toBe('https://example.com/map?directionsFrom=origin&directionsTo=destination&apiKey=api-key#details');
    });

    it('preserves unrelated existing query parameter bytes exactly', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map?x=a%20b&tilde=~&plus=a+b#details',
            apiKey: 'api-key',
            originId: 'origin',
            destinationId: 'destination'
        });

        expect(url).toBe('https://example.com/map?x=a%20b&tilde=~&plus=a+b&directionsFrom=origin&directionsTo=destination&apiKey=api-key#details');
    });

    it('preserves empty unrelated query segments when appending route params', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map?x=1&&y=2&',
            apiKey: undefined,
            originId: 'origin',
            destinationId: 'destination'
        });

        expect(url).toBe('https://example.com/map?x=1&&y=2&&directionsFrom=origin&directionsTo=destination');
    });

    it('includes venue when provided', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map',
            apiKey: 'api-key',
            originId: 'origin',
            destinationId: 'destination',
            venue: 'BUILDINGB'
        });

        expect(url).toBe('https://example.com/map?directionsFrom=origin&directionsTo=destination&apiKey=api-key&venue=BUILDINGB');
    });

    it('omits venue when not provided', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map',
            apiKey: 'api-key',
            originId: 'origin',
            destinationId: 'destination'
        });

        expect(new URL(url).searchParams.has('venue')).toBe(false);
    });

    it('replaces stale venue in base URL when a new venue is provided', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map?venue=OLDVENUE&floor=1',
            apiKey: 'api-key',
            originId: 'origin',
            destinationId: 'destination',
            venue: 'NEWVENUE'
        });
        const searchParams = new URL(url).searchParams;

        expect(searchParams.get('venue')).toBe('NEWVENUE');
        expect(searchParams.getAll('venue')).toHaveLength(1);
        expect(searchParams.get('floor')).toBe('1');
    });

    it('drops stale venue from base URL when venue is not provided', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map?venue=OLDVENUE',
            apiKey: 'api-key',
            originId: 'origin',
            destinationId: 'destination'
        });

        expect(new URL(url).searchParams.has('venue')).toBe(false);
    });

    it('replaces stale directionsFrom/directionsTo/apiKey from base and removes stale apiKey when apiKey is undefined', () => {
        const url = buildRouteShareUrl({
            base: 'https://example.com/map?directionsFrom=stale-origin&directionsTo=stale-destination&apiKey=stale-key&floor=1',
            apiKey: undefined,
            originId: 'origin',
            destinationId: 'destination'
        });
        const searchParams = new URL(url).searchParams;

        expect(searchParams.get('directionsFrom')).toBe('origin');
        expect(searchParams.get('directionsTo')).toBe('destination');
        expect(searchParams.get('floor')).toBe('1');
        expect(searchParams.has('apiKey')).toBe(false);
        expect(searchParams.getAll('directionsFrom')).toHaveLength(1);
        expect(searchParams.getAll('directionsTo')).toHaveLength(1);
    });

    it('requires an absolute base URL', () => {
        let thrownError;

        try {
            buildRouteShareUrl({
                base: '/map',
                apiKey: 'api-key',
                originId: 'origin',
                destinationId: 'destination'
            });
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError?.constructor.name).toBe('TypeError');
    });
});

describe('shareRouteWithFallback', () => {
    it('copies when clipboard is the preferred available path', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);

        const result = await shareRouteWithFallback({
            share: undefined,
            clipboard: { writeText },
            prefersShareSheet: false,
            sharePayload: { url: 'https://example.com/map' },
            copyUrl: 'https://example.com/map'
        });

        expect(result).toBe(shareRouteResults.COPIED);
        expect(writeText).toHaveBeenCalledWith('https://example.com/map');
    });

    it('returns failed when clipboard copy rejects', async () => {
        const writeText = jest.fn().mockRejectedValue(new Error('blocked'));

        const result = await shareRouteWithFallback({
            share: undefined,
            clipboard: { writeText },
            prefersShareSheet: false,
            sharePayload: { url: 'https://example.com/map' },
            copyUrl: 'https://example.com/map'
        });

        expect(result).toBe(shareRouteResults.FAILED);
    });

    it('keeps user-cancelled native share silent and does not copy', async () => {
        const abortError = new DOMException('Share cancelled', 'AbortError');
        const share = jest.fn().mockRejectedValue(abortError);
        const writeText = jest.fn().mockResolvedValue(undefined);

        const result = await shareRouteWithFallback({
            share,
            clipboard: { writeText },
            prefersShareSheet: true,
            sharePayload: { url: 'https://example.com/map' },
            copyUrl: 'https://example.com/map'
        });

        expect(result).toBe(shareRouteResults.CANCELLED);
        expect(writeText).not.toHaveBeenCalled();
    });

    it('falls back to clipboard when native share fails for a non-cancel reason', async () => {
        const share = jest.fn().mockRejectedValue(new Error('blocked'));
        const writeText = jest.fn().mockResolvedValue(undefined);

        const result = await shareRouteWithFallback({
            share,
            clipboard: { writeText },
            prefersShareSheet: true,
            sharePayload: { url: 'https://example.com/map' },
            copyUrl: 'https://example.com/map'
        });

        expect(result).toBe(shareRouteResults.COPIED);
        expect(writeText).toHaveBeenCalledWith('https://example.com/map');
    });

    it('returns failed when native share and clipboard fallback both fail', async () => {
        const share = jest.fn().mockRejectedValue(new Error('blocked'));
        const writeText = jest.fn().mockRejectedValue(new Error('clipboard blocked'));

        const result = await shareRouteWithFallback({
            share,
            clipboard: { writeText },
            prefersShareSheet: true,
            sharePayload: { url: 'https://example.com/map' },
            copyUrl: 'https://example.com/map'
        });

        expect(result).toBe(shareRouteResults.FAILED);
    });
});

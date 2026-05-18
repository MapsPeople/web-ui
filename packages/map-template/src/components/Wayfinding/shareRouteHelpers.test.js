const fs = require('fs');
const path = require('path');

function loadShareRouteHelpers() {
    const helperPath = path.join(__dirname, 'shareRouteHelpers.js');
    const source = fs.readFileSync(helperPath, 'utf8');
    const runnableSource = source
        .replace('export const shareRouteResults =', 'const shareRouteResults =')
        .replace('export function buildRouteShareUrl', 'function buildRouteShareUrl')
        .replace('export async function shareRouteWithFallback', 'async function shareRouteWithFallback');

    return new Function(
        'URLSearchParams',
        `${runnableSource}
return {
    buildRouteShareUrl,
    shareRouteWithFallback,
    shareRouteResults
};`
    )(URLSearchParams);
}

const {
    buildRouteShareUrl,
    shareRouteWithFallback,
    shareRouteResults
} = loadShareRouteHelpers();

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

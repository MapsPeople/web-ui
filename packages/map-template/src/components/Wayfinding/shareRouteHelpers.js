export const shareRouteResults = {
    SHARED: 'shared',
    COPIED: 'copied',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
};

export function buildRouteShareUrl({ base, apiKey, originId, destinationId }) {
    const params = new URLSearchParams({
        directionsFrom: originId,
        directionsTo: destinationId
    });

    if (apiKey) {
        params.set('apiKey', apiKey);
    }

    return `${base}?${params.toString()}`;
}

async function copyRouteToClipboard(clipboard, copyUrl) {
    if (typeof clipboard?.writeText !== 'function') {
        return false;
    }

    try {
        await clipboard.writeText(copyUrl);
        return true;
    } catch {
        return false;
    }
}

function isAbortError(error) {
    return error?.name === 'AbortError';
}

export async function shareRouteWithFallback({ share, clipboard, prefersShareSheet, sharePayload, copyUrl }) {
    const canShare = typeof share === 'function';
    const canCopy = typeof clipboard?.writeText === 'function';

    if (canShare && prefersShareSheet) {
        try {
            await share(sharePayload);
            return shareRouteResults.SHARED;
        } catch (error) {
            if (isAbortError(error)) {
                return shareRouteResults.CANCELLED;
            }

            if (canCopy && await copyRouteToClipboard(clipboard, copyUrl)) {
                return shareRouteResults.COPIED;
            }

            return shareRouteResults.FAILED;
        }
    }

    if (canCopy) {
        return await copyRouteToClipboard(clipboard, copyUrl)
            ? shareRouteResults.COPIED
            : shareRouteResults.FAILED;
    }

    if (canShare) {
        try {
            await share(sharePayload);
            return shareRouteResults.SHARED;
        } catch (error) {
            return isAbortError(error)
                ? shareRouteResults.CANCELLED
                : shareRouteResults.FAILED;
        }
    }

    return shareRouteResults.FAILED;
}

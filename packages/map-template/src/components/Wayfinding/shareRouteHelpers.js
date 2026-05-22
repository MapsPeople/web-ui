export const shareRouteResults = {
    SHARED: 'shared',
    COPIED: 'copied',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
};

export function buildRouteShareUrl({ base, apiKey, originId, destinationId, venue }) {
    new URL(base);

    const hashIndex = base.indexOf('#');
    const hash = hashIndex === -1 ? '' : base.slice(hashIndex);
    const baseBeforeHash = hashIndex === -1 ? base : base.slice(0, hashIndex);
    const queryIndex = baseBeforeHash.indexOf('?');
    const baseWithoutQuery = queryIndex === -1 ? baseBeforeHash : baseBeforeHash.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : baseBeforeHash.slice(queryIndex + 1);
    const routeParamNames = new Set(['directionsFrom', 'directionsTo', 'apiKey', 'venue']);
    const preservedParams = query
        ? query.split('&').filter((param) => {
            const key = param.split('=', 1)[0];
            const decodedKey = new URLSearchParams(`${key}=`).keys().next().value;

            return !routeParamNames.has(decodedKey);
        })
        : [];
    const routeParams = new URLSearchParams({
        directionsFrom: originId,
        directionsTo: destinationId
    });

    if (apiKey) {
        routeParams.set('apiKey', apiKey);
    }

    if (venue) {
        routeParams.set('venue', venue);
    }

    const routeQuery = routeParams.toString();
    const nextQuery = preservedParams.length > 0
        ? `${preservedParams.join('&')}&${routeQuery}`
        : routeQuery;

    return `${baseWithoutQuery}?${nextQuery}${hash}`;
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

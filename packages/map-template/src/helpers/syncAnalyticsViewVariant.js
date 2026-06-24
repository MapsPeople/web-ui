/**
 * Resolve the analytics viewVariant from host props.
 * Uses kioskOriginLocationId (sync) rather than the fetched kiosk Location object.
 *
 * @param {string | undefined} kioskOriginLocationId
 * @param {boolean} isDesktop
 * @returns {'kiosk' | 'desktop' | 'mobile'}
 */
export function getAnalyticsViewVariant(kioskOriginLocationId, isDesktop) {
    if (kioskOriginLocationId && isDesktop) {
        return 'kiosk';
    }

    return isDesktop ? 'desktop' : 'mobile';
}

/**
 * Sync analytics viewVariant with the MapsIndoors SDK Logger.
 * Must run before bootstrap analytics events are flushed (SDK_LOADED, etc.).
 *
 * @param {string | undefined} kioskOriginLocationId
 * @param {boolean} isDesktop
 * @param {object} [mapsIndoorsInstance]
 */
export function syncAnalyticsViewVariant(kioskOriginLocationId, isDesktop, mapsIndoorsInstance) {
    const viewVariant = getAnalyticsViewVariant(kioskOriginLocationId, isDesktop);
    const context = { viewVariant };

    window.mapsindoors?.Logger?.setAnalyticsContext?.(context);
    mapsIndoorsInstance?.setAnalyticsContext?.(context);
}

import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import isMapReadyState from '../atoms/isMapReadyState';
import notificationMessageState from '../atoms/notificationMessageState';

const INITIAL_PROGRESS = { phase: 'initializing', progress: 0.08 };
const FALLBACK_COMPLETE_AFTER_MAP_READY_MS = 2500;
const HARD_TIMEOUT_MS = 60000;

/**
 * Tracks staged map-content loading for the splash screen.
 *
 * Prefers SDK `loading_progress` / `content_ready` when the local Web SDK emits them.
 * Before the MapsIndoors instance exists, synthesizes early "initializing" progress from
 * script and config load. If the SDK has no progress events (older builds), falls back to
 * hiding the splash a short time after the camera is ready. A 60s hard timeout always
 * hides the splash if `content_ready` never arrives. The timer restarts on each
 * loading session (including after a map reset). An error notification hides the splash
 * immediately so the user can see it (for example a missing Mapbox or Google Maps key).
 *
 * @param {Object} options
 * @param {boolean} options.mapsindoorsSDKAvailable
 * @param {Object} [options.appConfig]
 * @returns {{ phase: string, progress: number, showSplash: boolean, isFading: boolean }}
 */
export function useMapLoadingProgress({ mapsindoorsSDKAvailable, appConfig }) {
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const isMapReady = useRecoilValue(isMapReadyState);
    const loadError = useRecoilValue(notificationMessageState);
    const [progress, setProgress] = useState(INITIAL_PROGRESS);
    const [showSplash, setShowSplash] = useState(true);
    const [isFading, setIsFading] = useState(false);
    const sdkReportsProgress = useRef(false);
    const wasMapReady = useRef(false);
    const hasCompleted = useRef(false);
    const [loadingSession, setLoadingSession] = useState(0);

    const markComplete = () => {
        hasCompleted.current = true;
        setProgress({ phase: 'complete', progress: 1 });
    };

    useEffect(() => {
        if (mapsindoorsSDKAvailable && !sdkReportsProgress.current) {
            setProgress(current => current.progress >= 0.18 ? current : { phase: 'initializing', progress: 0.18 });
        }
    }, [mapsindoorsSDKAvailable]);

    useEffect(() => {
        if (appConfig && !sdkReportsProgress.current) {
            setProgress(current => current.progress >= 0.28 ? current : { phase: 'initializing', progress: 0.28 });
        }
    }, [appConfig]);

    useEffect(() => {
        if (!mapsIndoorsInstance) {
            return undefined;
        }

        const applyProgress = payload => {
            if (!payload?.phase) {
                return;
            }
            if (hasCompleted.current && payload.phase !== 'complete') {
                return;
            }
            sdkReportsProgress.current = true;
            if (payload.phase === 'complete') {
                hasCompleted.current = true;
            }
            setProgress(payload);
        };

        const snapshot = mapsIndoorsInstance.getLoadingProgress?.();
        if (snapshot) {
            applyProgress(snapshot);
        }

        const onProgress = payload => applyProgress(payload);
        const onContentReady = () => applyProgress({ phase: 'complete', progress: 1 });

        mapsIndoorsInstance.on('loading_progress', onProgress);
        mapsIndoorsInstance.on('content_ready', onContentReady);

        return () => {
            mapsIndoorsInstance.off('loading_progress', onProgress);
            mapsIndoorsInstance.off('content_ready', onContentReady);
        };
    }, [mapsIndoorsInstance]);

    useEffect(() => {
        if (!mapsIndoorsInstance || sdkReportsProgress.current) {
            return undefined;
        }

        const onLocationsChanged = () => {
            if (sdkReportsProgress.current) {
                return;
            }
            setProgress(current => current.progress >= 0.45 ? current : { phase: 'fetching_locations', progress: 0.45 });
        };

        mapsIndoorsInstance.on('locations_changed', onLocationsChanged);
        return () => mapsIndoorsInstance.off('locations_changed', onLocationsChanged);
    }, [mapsIndoorsInstance]);

    useEffect(() => {
        if (!isMapReady || sdkReportsProgress.current) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            if (!sdkReportsProgress.current) {
                markComplete();
            }
        }, FALLBACK_COMPLETE_AFTER_MAP_READY_MS);

        return () => clearTimeout(timeoutId);
    }, [isMapReady]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!hasCompleted.current) {
                markComplete();
            }
        }, HARD_TIMEOUT_MS);

        return () => clearTimeout(timeoutId);
    }, [loadingSession]);

    useEffect(() => {
        if (loadError?.type !== 'error') {
            return;
        }
        hasCompleted.current = true;
        setIsFading(false);
        setShowSplash(false);
    }, [loadError]);

    useEffect(() => {
        if (!isMapReady && wasMapReady.current) {
            if (loadError?.type === 'error') {
                wasMapReady.current = isMapReady;
                return;
            }
            sdkReportsProgress.current = false;
            hasCompleted.current = false;
            setShowSplash(true);
            setIsFading(false);
            setProgress(INITIAL_PROGRESS);
            setLoadingSession(session => session + 1);
        }
        wasMapReady.current = isMapReady;
    }, [isMapReady, loadError]);

    useEffect(() => {
        if (progress.phase !== 'complete' || !showSplash) {
            return undefined;
        }

        const prefersReducedMotion = typeof window !== 'undefined'
            && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

        if (prefersReducedMotion) {
            setShowSplash(false);
            return undefined;
        }

        setIsFading(true);
        const timeoutId = setTimeout(() => setShowSplash(false), 400);
        return () => clearTimeout(timeoutId);
    }, [progress.phase, showSplash]);

    return { ...progress, showSplash, isFading };
}

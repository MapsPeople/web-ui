import { useEffect } from 'react';

/**
 * Closes the active panel when the user presses Escape.
 * Pass a map of appView key → close function; only non-SEARCH views are closeable.
 *
 * @param {string} currentAppView
 * @param {object} handlers - { [appViewKey]: () => void }
 */
export function useEscapeToClose(currentAppView, handlers) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key !== 'Escape') return;
            handlers[currentAppView]?.();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [currentAppView, handlers]);
}

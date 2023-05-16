import { useEffect, useState } from 'react';

const appViews = {
    SEARCH: undefined, // undefined as the initial "app state" is easier to work with
    EXTERNALIDS: 'EXTERNALIDS',
    VENUE_SELECTOR: 'VENUE_SELECTOR',
    LOCATION_DETAILS: 'LOCATION_DETAILS',
    WAYFINDING: 'WAYFINDING',
    DIRECTIONS: 'DIRECTIONS'
};

/**
 * Hook to handle browser history and make browser back/forward buttons work without having
 * an actual router that modifies the URL.
 */
export const useAppHistory = () => {

    const [currentAppView, setCurrentAppView] = useState(undefined);
    const [currentAppViewPayload, setCurrentAppViewPayload] = useState();

    useEffect(() => {
        function popstateHandler(event) {
            setCurrentAppView(event.state?.value);
            setCurrentAppViewPayload(event.state?.payload);
        }

        window.addEventListener('popstate', popstateHandler);

        return () => {
            window.removeEventListener('popstate', popstateHandler);
        }
    }, []);

    /**
     * Push an app view to the history.
     *
     * @param {string} value - one of appViews
     * @param {any} [payload] - optional payload (state).
     */
    const pushAppView = (value, payload) => {
        window.history.pushState({ value, payload }, '');
        setCurrentAppView(value);
    }

    /**
     * Trigger going back in browser history.
     */
    const goBack = () => {
        window.history.back();
    };

    return [pushAppView, goBack, currentAppView, currentAppViewPayload, appViews]
}

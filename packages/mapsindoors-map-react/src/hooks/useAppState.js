import { useEffect, useState } from 'react';

const appStates = {
    SEARCH: 'SEARCH',
    VENUE_SELECTOR: 'VENUE_SELECTOR',
    LOCATION_DETAILS: 'LOCATION_DETAILS',
    WAYFINDING: 'WAYFINDING',
    DIRECTIONS: 'DIRECTIONS'
};

/**
 * Hook to handle browser history and make browser back/forward buttons work without having
 * an actual router that modifies the URL.
 *
 * It maintains a "app state", ideally corresponding to the current view in focus.
 */
export const useAppHistory = () => {

    useEffect(() => {
        function popstateHandler(event) {
            setAppState(event.state);
        }

        window.addEventListener('popstate', popstateHandler);

        return () => {
            window.removeEventListener('popstate', popstateHandler);
        }
    }, []);

    const [appState, setAppState] = useState();

    const pushState = value => {
        window.history.pushState(value, '');
        setAppState(value);
    }

    const goBack = () => {
        window.history.back();
    };

    return [pushState, goBack, appState, appStates]
}

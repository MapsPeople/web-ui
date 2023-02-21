import { useEffect, useState } from 'react';

const appStates = {
    MAIN: 'MAIN',
    VENUE_SELECTOR: 'VENUE_SELECTOR'
};

/**
 * Hook to handle browser history and make browser back/forward buttons work without having
 * an actual router that modifies the URL.
 *
 * It maintains a "app state", ideally corresponding to the current view in focus.
 *
 */
export const useAppState = () => {

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

    const pushToHistory = value => {
        window.history.pushState(value, '');
        setAppState(value);
    }

    const goBackInHistory = () => {
        window.history.back();
    };

    return [pushToHistory, goBackInHistory, appState, appStates]
}

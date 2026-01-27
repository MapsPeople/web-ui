import { useRef } from 'react';

// Module-level state to store the initial chat message
let initialChatMessage = '';

/**
 * Hook to manage the initial chat message from search.
 * Uses module-level state to avoid Recoil overhead for transient data.
 * 
 * @returns {object} Object with getInitialMessage, setInitialMessage, and clearInitialMessage functions
 */
export const useInitialChatMessage = () => {
    // Use ref to ensure we get the latest value even if hook is recreated
    const stateRef = useRef({
        getInitialMessage: () => initialChatMessage,
        setInitialMessage: (message) => {
            initialChatMessage = message || '';
        },
        clearInitialMessage: () => {
            initialChatMessage = '';
        }
    });

    return stateRef.current;
};


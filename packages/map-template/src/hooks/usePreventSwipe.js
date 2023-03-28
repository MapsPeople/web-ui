import { useSwipeable } from 'react-swipeable';

/**
 * React hook that can be used to allow scrollable content within element that has swipe listeners.
 */
export const usePreventSwipe = () => {
    return useSwipeable({
        onSwiping: ({ event }) => event.stopPropagation()
    });
};

import { useLayoutEffect, useState } from 'react';

/**
 * A React Hook to check if an element has vertical overflow.
 *
 * Based on https://www.robinwieruch.de/react-custom-hook-check-if-overflow/
 */
export const useIsVerticalOverflow = (ref, callback) => {
    const [isOverflow, setIsOverflow] = useState(undefined);

    useLayoutEffect(() => {
        const { current } = ref;

        const trigger = () => {
            const hasOverflow = current.scrollHeight > current.clientHeight;

            setIsOverflow(hasOverflow);

            if (callback) callback(hasOverflow);
        };

        if (current) {
            if ('ResizeObserver' in window) {
                new ResizeObserver(trigger).observe(current);
            }
            trigger();
        }
    }, [callback, ref]);

    return isOverflow;
}
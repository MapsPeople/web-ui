import { useEffect, useState } from 'react';

/**
 * A React Hook to check if an element has vertical overflow.
 *
 * Based on https://www.robinwieruch.de/react-custom-hook-check-if-overflow/
 */
export const useIsVerticalOverflow = (stateTrigger, ref) => {
    const [isOverflow, setIsOverflow] = useState(undefined);

    useEffect(() => {

        const check = () => {
            const hasOverflow = ref.current?.scrollHeight > ref.current?.clientHeight;
            setIsOverflow(hasOverflow);
        };

        check();

        if (ref.current) {
            new ResizeObserver(check).observe(ref.current);
        }
    }, [stateTrigger, ref]);

    return isOverflow;
}

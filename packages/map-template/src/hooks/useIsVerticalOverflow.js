import { useEffect, useState } from 'react';

/**
 * A React Hook to check if an element has vertical overflow. It will also
 * expose if the element had vertical overflow at first.
 *
 * Based on https://www.robinwieruch.de/react-custom-hook-check-if-overflow/
 */
export const useIsVerticalOverflow = (stateTrigger, ref) => {
    const [isOverflow, setIsOverflow] = useState(undefined);
    const [initialOverflow, setInitialOverflow] = useState(undefined);

    useEffect(() => {

        const check = (initial = false) => {
            const hasOverflow = ref.current?.scrollHeight > ref.current?.clientHeight;
            setIsOverflow(hasOverflow);

            if (initial === true) {
                setInitialOverflow(hasOverflow);
            }
        };

        check(true);

        if (ref.current) {
            new ResizeObserver(check).observe(ref.current);
        }
    }, [stateTrigger, ref]);

    return [isOverflow, initialOverflow];
}

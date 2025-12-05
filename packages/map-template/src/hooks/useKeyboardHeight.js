import { useLayoutEffect, useState, useRef } from 'react';

/**
 * Custom hook that calculates and tracks mobile keyboard height
 * 
 * @param {boolean} isDesktop - Whether the current viewport is desktop size
 * @returns {number} The keyboard height in pixels (0 when keyboard is not visible)
 */
export const useKeyboardHeight = (isDesktop) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const resizeTimeoutRef = useRef(null);

    useLayoutEffect(() => {
        if (isDesktop) return;

        // Calculate and update keyboard height (called after debounce)
        const updateKeyboardHeight = () => {
            if (!window.visualViewport) return;

            const viewportHeight = window.visualViewport.height;
            const windowHeight = window.innerHeight;
            const calculatedKeyboardHeight = windowHeight - viewportHeight;

            // If the calculated keyboard height is greater than 50 pixels, set the keyboard height to the calculated height
            // Otherwise, set the keyboard height to 0
            if (calculatedKeyboardHeight > 50) {
                setKeyboardHeight(calculatedKeyboardHeight);
            } else {
                setKeyboardHeight(0);
            }
        };

        // Debounced handler: wait for viewport to stabilize to avoid flickering
        const handleViewportResize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }

            resizeTimeoutRef.current = setTimeout(updateKeyboardHeight, 150);
        };

        // Listen to visual viewport resize events
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportResize);
            handleViewportResize();
        }

        return () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportResize);
            }
        };
    }, [isDesktop]);

    return keyboardHeight;
};


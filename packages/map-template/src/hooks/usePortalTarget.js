import { useState, useEffect } from 'react';

/**
 * Hook to find a portal target DOM element by CSS selector.
 * Tries to find the element synchronously first, then falls back to a MutationObserver
 * to detect when the element is added to the DOM.
 *
 * @param {string} selector - CSS selector for the portal target element.
 * @returns {Element|null} The found DOM element, or null if not yet available.
 */
function usePortalTarget(selector) {
    const [portalElement, setPortalElement] = useState(() => document.querySelector(selector));

    useEffect(() => {
        const updatePortalElement = () => {
            const matchedElement = document.querySelector(selector);
            setPortalElement(prev => prev === matchedElement ? prev : matchedElement);
        };

        updatePortalElement();

        const observer = new MutationObserver(updatePortalElement);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [selector]);

    return portalElement;
}

export { usePortalTarget };

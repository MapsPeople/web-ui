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
        if (portalElement) return;

        const existingElement = document.querySelector(selector);
        if (existingElement) {
            setPortalElement(existingElement);
            return;
        }

        const observer = new MutationObserver(() => {
            const addedElement = document.querySelector(selector);
            if (addedElement) {
                setPortalElement(addedElement);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [selector, portalElement]);

    return portalElement;
}

export { usePortalTarget };

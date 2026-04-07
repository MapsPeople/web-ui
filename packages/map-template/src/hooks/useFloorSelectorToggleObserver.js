import { useEffect, useRef } from 'react';

/**
 * Observes the floor selector's toggle button class to detect open/close,
 * then measures overlap after the expansion animation finishes.
 *
 * @param {Object} params
 * @param {React.RefObject} params.floorSelectorRef - Ref to the floor selector element
 * @param {Function} params.setIsFloorSelectorExpanded - State setter for floor selector expansion
 * @param {Function} params.measureOverlap - Callback to measure overlap between floor selector and bottom controls
 * @param {Object} params.mapsIndoorsInstance - MapsIndoors SDK instance (dependency trigger)
 * @param {Object} params.mapInstance - Map instance (dependency trigger)
 * @returns {React.RefObject<boolean>} isFloorSelectorOpenRef - Ref tracking whether the floor selector is open
 */
export function useFloorSelectorToggleObserver({ floorSelectorRef, setIsFloorSelectorExpanded, measureOverlap, mapsIndoorsInstance, mapInstance }) {
    const overlapTimerRef = useRef(null);
    const isFloorSelectorOpenRef = useRef(false);

    useEffect(() => {
        const floorSelector = floorSelectorRef.current;
        if (!floorSelector) return;

        const onClassChange = () => {
            if (overlapTimerRef.current) {
                clearTimeout(overlapTimerRef.current);
            }

            const button = floorSelector.querySelector('.mi-floor-selector__button');
            if (!button) return;

            const isOpen = button.classList.contains('mi-floor-selector__button--open');
            isFloorSelectorOpenRef.current = isOpen;

            if (!isOpen) {
                setIsFloorSelectorExpanded(false);
                return;
            }

            overlapTimerRef.current = setTimeout(measureOverlap, 50);
        };

        const observer = new MutationObserver(onClassChange);
        observer.observe(floorSelector, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            observer.disconnect();
            if (overlapTimerRef.current) {
                clearTimeout(overlapTimerRef.current);
            }
        };
    }, [floorSelectorRef, setIsFloorSelectorExpanded, measureOverlap, mapsIndoorsInstance, mapInstance]);

    return isFloorSelectorOpenRef;
}

import { useState, useEffect } from 'react';

/**
 * Tracks the current snap index for a react-modal-sheet `Sheet`.
 *
 * Only one sheet is visible at a time, so a single index is sufficient.
 * The index resets to `1` (the default `initialSnap`) on every view change
 * to avoid carrying a stale index across views whose snap arrays differ in length.
 *
 * @param {string} currentAppView - The active view key; changing it resets the snap index.
 * @returns {{ handleSnap: (index: number) => void, isAtMaxSnap: (sp: number[]) => boolean }}
 */
export function useSnapState(currentAppView) {
    const [snapIndex, setSnapIndex] = useState(1);

    useEffect(() => setSnapIndex(1), [currentAppView]);

    /** Pass directly to `Sheet`'s `onSnap` prop. */
    const handleSnap = (index) => setSnapIndex(index);

    /** Returns `true` when the sheet is at the last (largest) snap point in `sp`. */
    const isAtMaxSnap = (sp) => snapIndex === sp.length - 1;

    return { handleSnap, isAtMaxSnap };
}

/**
 * Get bottom padding on mobile.
 * Returns a promise with the padding in pixels.
 */
export default function getMobilePaddingBottom() {
    return new Promise(resolve => {
        const sheetContainer = document.querySelector('.react-modal-sheet-container');
        if (sheetContainer) {
            resolve(getReactModalSheetVisibleHeight(sheetContainer));
            return;
        }

        const TIMEOUT_MS = 1500;
        let observer;
        const finalize = value => {
            observer?.disconnect();
            clearTimeout(timeoutId);
            resolve(value);
        };

        observer = new MutationObserver(() => {
            const sheetContainer = document.querySelector('.react-modal-sheet-container');
            if (sheetContainer) {
                finalize(getReactModalSheetVisibleHeight(sheetContainer));
            }
        });

        const timeoutId = window.setTimeout(() => finalize(0), TIMEOUT_MS);
        observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
    });
}

function getReactModalSheetVisibleHeight(container) {
    const mapContainer = document.querySelector('.mapsindoors-map');
    const mapRect = mapContainer.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return Math.max(0, mapRect.bottom - containerRect.top);
}

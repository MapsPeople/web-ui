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

        const observer = new MutationObserver(() => {
            const sheetContainer = document.querySelector('.react-modal-sheet-container');
            if (sheetContainer) {
                observer.disconnect();
                resolve(getReactModalSheetVisibleHeight(sheetContainer));
            }
        });

        observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
    });
}

function getReactModalSheetVisibleHeight(container) {
    const mapContainer = document.querySelector('.mapsindoors-map');
    const mapRect = mapContainer.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return Math.max(0, mapRect.bottom - containerRect.top);
}

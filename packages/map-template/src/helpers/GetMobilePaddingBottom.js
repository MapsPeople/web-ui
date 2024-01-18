/**
 * Get bottom padding on mobile.
 * Returns a promise with the padding in pixels.
 */
export default function getMobilePaddingBottom() {
    return new Promise(resolve => {
        const bottomSheet = document.querySelector('.sheet--active');
        const mapContainer = document.querySelector('.mapsindoors-map');

        // If there is no bottom sheet element (yet), setup a MutationObserver that listens for the appearance of it.
        if (!bottomSheet) {
            const observer = new MutationObserver(() => {
                const bottomSheet = document.querySelector('.sheet--active');
                if (bottomSheet) {
                    observer.disconnect();
                    resolve(mapContainer.offsetHeight - bottomSheet.offsetTop); // Subtract the top padding from the height of the map container element.
                }
            });

            observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
        } else {
            resolve(mapContainer.offsetHeight - bottomSheet.offsetTop)
        }
    });
}
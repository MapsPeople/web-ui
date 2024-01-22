/**
 * Get bottom padding on desktop.
 * Returns a promise with the padding in pixels.
 *
 * @returns {Promise}
 */
export default function getDesktopPaddingBottom() {
    return new Promise(resolve => {
        const sidebar = document.querySelector('.modal--open');
        const mapContainer = document.querySelector('.mapsindoors-map');

        // If there is no sidebar element (yet), setup a MutationObserver that listens for the appearance of it.
        if (!sidebar) {
            const observer = new MutationObserver(() => {
                const sidebar = document.querySelector('.modal--open');
                if (sidebar) {
                    observer.disconnect();
                    resolve(mapContainer.offsetHeight - sidebar?.offsetTop); // Subtract the top padding from the height of the map container element.
                }
            });

            // Observe changes in the DOM (see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options)
            observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
        } else {
            resolve(mapContainer.offsetHeight - sidebar?.offsetTop); // Subtract the top padding from the height of the map container element.
        }
    });
}

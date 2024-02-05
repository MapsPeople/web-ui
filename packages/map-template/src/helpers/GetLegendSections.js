/**
 * Get bottom padding on desktop.
 * Returns a promise with the padding in pixels.
 *
 * @returns {Promise}
 */
export default function getLegendSections() {
    return new Promise(resolve => {
        const legend = document.querySelector('.legend__sections');

        // If there is no legend element (yet), setup a MutationObserver that listens for the appearance of it.
        if (!legend) {
            const observer = new MutationObserver(() => {
                const legend = document.querySelector('.legend__sections');
                if (legend) {
                    observer.disconnect();
                    resolve(legend?.offsetHeight);
                }
            });

            // Observe changes in the DOM (see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options)
            observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
        } else {
            resolve(legend?.offsetHeight);
        }
    });
}

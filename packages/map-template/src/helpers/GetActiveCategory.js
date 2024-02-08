/**
 * Get the active chip element.
 *
 * @returns {Promise}
 */
export default function getActiveCategory() {
    return new Promise(resolve => {
        const activeChip = document.querySelector('.chip--active');

        // If there is no active chip element (yet), setup a MutationObserver that listens for the appearance of it.
        if (!activeChip) {
            const observer = new MutationObserver(() => {
                const activeChip = document.querySelector('.chip--active');
                if (activeChip) {
                    observer.disconnect();
                    resolve(activeChip);
                }
            });

            // Observe changes in the DOM (see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options)
            observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
        } else {
            resolve(activeChip); 
        }
    });
}

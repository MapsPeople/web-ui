/**
 * Get the active category element.
 *
 * @returns {Promise}
 */
export default function getActiveCategory() {
    return new Promise(resolve => {
        const activeCategory = document.querySelector('.chip--active');

        // If there is no active chip element (yet), setup a MutationObserver that listens for the appearance of it.
        if (!activeCategory) {
            const observer = new MutationObserver(() => {
                const activeCategory = document.querySelector('.chip--active');
                if (activeCategory) {
                    observer.disconnect();
                    resolve(activeCategory);
                }
            });

            // Observe changes in the DOM (see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options)
            observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
        } else {
            resolve(activeCategory); 
        }
    });
}

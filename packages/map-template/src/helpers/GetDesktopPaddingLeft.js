/**
 * Get left padding on desktop.
 * Returns a promise with the padding in pixels.
 */
export default function getDesktopPaddingLeft() {
    return new Promise(resolve => {
        const sidebar = document.querySelector('.modal--open');

        // If there is no sidebar element (yet), setup a MutationObserver that listens for the appearance of it.
        if (!sidebar) {
            const observer = new MutationObserver(() => {
                const sidebar = document.querySelector('.modal--open');
                if (sidebar) {
                    observer.disconnect();
                    resolve(sidebar?.offsetWidth + sidebar?.offsetLeft * 2); // The width of the sidebar plus adequate padding
                }
            });

            // Observe changes in the DOM (see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options)
            observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
        } else {
            resolve(sidebar?.offsetWidth + sidebar?.offsetLeft * 2); // The width of the sidebar plus adequate padding
        }
    });
}
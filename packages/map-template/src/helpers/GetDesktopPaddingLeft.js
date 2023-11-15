/**
 * Get left padding on desktop.
 */
export default function getDesktopPaddingLeft() {
    // The width of the sidebar plus adequate padding
    const sidebar = document.querySelector('.modal--open');
    return sidebar?.offsetWidth + sidebar?.offsetLeft * 2;
}
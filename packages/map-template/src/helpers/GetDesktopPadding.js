/**
 * Get left padding for directions on desktop.
 */
export default function getDesktopPadding() {
    // The width of the sidebar plus adequate padding
    const sidebar = document.querySelector('.modal--open');
    return sidebar.offsetWidth + sidebar.offsetLeft * 2;
}
/**
 * Get bottom padding on desktop.
 */
export default function getDesktopPaddingBottom() {
    const sidebar = document.querySelector('.modal--open');
    const mapContainer = document.querySelector('.mapsindoors-map');
    // Subtract the top padding from the height of the map container element.
    return mapContainer.offsetHeight - sidebar?.offsetTop;
}
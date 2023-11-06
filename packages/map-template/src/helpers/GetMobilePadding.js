/**
 * Get left padding for directions on desktop.
 */
export default function getMobilePadding() {
    const bottomSheet = document.querySelector('.sheet--active');
    const mapContainer = document.querySelector('.mapsindoors-map');
    // Subtract the top padding from the height of the map container element.
    return mapContainer.offsetHeight - bottomSheet.offsetTop;
}
/**
 * Check if the solution allows the zoom level to be 22.
 * If yes, set the zoom level to 22, otherwise set it to 21.
 */
export default function setMapZoomLevel(mapsIndoorsInstance) {
    return window.mapsindoors.services.SolutionsService.getSolution().then(solution => {
        const hasZoom22 = Object.values(solution.modules).find(zoomLevel => zoomLevel === 'z22')
        mapsIndoorsInstance?.setZoom(hasZoom22 ? 22 : 21);
    });
}

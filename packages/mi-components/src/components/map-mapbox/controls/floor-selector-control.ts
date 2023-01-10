declare const mapsindoors;

/**
 * Create a new instance of the MapsIndoors Floor-selector map control.
 *
 * @export
 * @class FloorSelectorControl
 */
export class FloorSelectorControl {
    map: any;
    floorSelectorElement: HTMLDivElement;
    floorSelectorInstance: any;

    constructor(map, mapsIndoorsInstance) {
        this.map = map;
        this.floorSelectorElement = document.createElement('div');
        this.floorSelectorInstance = new mapsindoors.FloorSelector(this.floorSelectorElement, mapsIndoorsInstance);
    }

    /**
     * Triggered by mapbox when added to the map.
     * @returns {HTMLDivElement} The Floor Selector control element.
     */
    onAdd(): HTMLDivElement {
        this.floorSelectorElement.classList.add('mapboxgl-ctrl');
        return this.floorSelectorElement;
    }

    /**
     * Remove element and clean up references
     * Triggered by mapbox when removed from the map.
     */
    onRemove(): void {
        this.floorSelectorElement.parentNode.removeChild(this.floorSelectorElement);
        this.map = undefined;
    }
}
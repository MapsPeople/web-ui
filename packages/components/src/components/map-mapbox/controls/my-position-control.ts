declare const mapsindoors;

/**
 * Create a new instance of the MapsIndoors My Position map control.
 *
 * @export
 * @class MyPositionControl
 */
export class MyPositionControl {
    map: any;
    myPositionControlElement: HTMLDivElement;
    myPositionControlInstance: any;

    constructor(map, mapsIndoorsInstance) {
        this.map = map;
        this.myPositionControlElement = document.createElement('div');
        this.myPositionControlInstance = new mapsindoors.PositionControl(this.myPositionControlElement, {
            mapsIndoors: mapsIndoorsInstance,
            positionOptions: {
                enableHighAccuracy: false,
                maximumAge: 300000,
                timeout: 10000
            }
        });
    }

    /**
     * Triggered by mapbox when added to the map.
     * @returns {HTMLDivElement} The My Position control element.
     */
    onAdd(): HTMLDivElement {
        this.myPositionControlElement.classList.add('mapboxgl-ctrl');
        return this.myPositionControlElement;
    }

    /**
     * Remove element and clean up references
     * Triggered by mapbox when removed from the map.
     */
    onRemove(): void {
        this.myPositionControlElement.parentNode.removeChild(this.myPositionControlElement);
        this.map = undefined;
    }
}
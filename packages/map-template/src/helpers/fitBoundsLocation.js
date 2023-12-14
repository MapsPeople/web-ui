import { calculateBounds } from "./CalculateBounds";

/**
 * Calculate the location bbox, and then fit bounds of a location.
 * Add padding left and bottom as parameters, due to needing to dynamically calculate that.
 * Add startZoomLevel, pitch and bearing as parameters.
 * 
 * @param {object} location
 * @param {object} mapsIndoorsInstance
 * @param {number} paddingBottom
 * @param {number} paddingLeft
 * @param {number} startZoomLevel
 * @param {number} pitch
 * @param {number} bearing
 */
export default function fitBoundsLocation(location, mapsIndoorsInstance, paddingBottom, paddingLeft, startZoomLevel, pitch, bearing) {
    // Calculate the location bbox
    const locationBbox = calculateBounds(location.geometry)
    let coordinates = { west: locationBbox[0], south: locationBbox[1], east: locationBbox[2], north: locationBbox[3] }
    // Fit map to the bounds of the location coordinates, and add left padding
    mapsIndoorsInstance.getMapView().fitBounds(coordinates, { top: 0, right: 0, bottom: paddingBottom, left: paddingLeft }).then(() => {
        // Set the map zoom level if the property is provided.
        if (startZoomLevel) {
            mapsIndoorsInstance.setZoom(parseInt(startZoomLevel));
        }
        // Set the map pitch if the property is provided.
        if (!isNaN(parseInt(pitch))) {
            mapsIndoorsInstance.getMapView().tilt(parseInt(pitch));
        }
        // Set the map bearing if the property is provided.
        if (!isNaN(parseInt(bearing))) {
            mapsIndoorsInstance.getMapView().rotate(parseInt(bearing));
        }
    });
}
import { calculateBounds } from "./CalculateBounds";

/**
 * Calculate the location bbox, and then fit bounds of a location.
 * Add padding left and bottom as parameters, due to needing to dynamically calculate that.
 * Handle the presence of the startZoomLevel, pitch and bearing props.
 * 
 * @param {object} location - The location that the map should fit the bounds to.
 * @param {object} mapsIndoorsInstance - The MapsIndoors instance.
 * @param {number} paddingBottom - The padding that should be applied at the bottom.
 * @param {number} paddingLeft - The padding that should be applied on the left side.
 * @param {number} startZoomLevel - The initial zoom level of the map.
 * @param {number} pitch - The pitch (Mapbox) or tilt (Google) value of the map.
 * @param {number} bearing - The bearing (Mapbox) or heading (Google) value of the map.
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
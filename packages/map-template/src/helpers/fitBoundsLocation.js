import { calculateBounds } from "./CalculateBounds";

/**
 * Calculate the location bbox, and then fit bounds of a location.
 */
export default function fitBoundsLocation(location, mapsIndoorsInstance, paddingBottom, paddingLeft) {
    // Calculate the location bbox
    const locationBbox = calculateBounds(location.geometry)
    let coordinates = { west: locationBbox[0], south: locationBbox[1], east: locationBbox[2], north: locationBbox[3] }
    // Fit map to the bounds of the location coordinates, and add left padding
    mapsIndoorsInstance.getMapView().fitBounds(coordinates, { top: 0, right: 0, bottom: paddingBottom, left: paddingLeft});
}
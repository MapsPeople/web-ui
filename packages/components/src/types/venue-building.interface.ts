import { Geometry, Point } from 'geojson';

/**
 * Type definition for MapsIndoors Building.
 * Based on the MapsIndoors JavaScript SDK Building interface documentation.
 *
 * @see https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/Building.html
 */
export interface VenueBuilding {
    /** The building id. */
    id: string;
    /** Administrative ID of the building. */
    administrativeId: string;
    /** Venue ID the building belongs to. */
    venueId: string;
    /** Anchor is a GeoJSON Point at the center of the building. */
    anchor: Point;
    /** Contains all translatable informations for a building. */
    buildingInfo: {
        name: string;
        language: string;
        aliases?: string | null;
        fields?: { [key: string]: any };
    };
    /** List of all floors in the building. Keys are floor indexes as strings (e.g., "0", "10", "20"). */
    floors: { [floorIndex: string]: any };
    /** The geometry of the building. See GeoJSON Geometry specification. */
    geometry: Geometry;
    /** Creation date/time. Only present in the detailed format. */
    createdAt?: Date;
    /** Last modification date/time. Only present in the detailed format. */
    lastModified?: Date;
}


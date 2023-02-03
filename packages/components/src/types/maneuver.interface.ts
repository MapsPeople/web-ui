import { Geometry } from 'geojson';
import { RouteLocation } from './route-location.interface';

export interface Maneuver {
    distance: {
        text: string,
        value: number
    },
    duration: {
        text: string,
        value: number
    },
    start_location: RouteLocation,
    end_location: RouteLocation,
    geometry: Geometry
    highway: string,
    route_context: string,
    instructions: string,
    maneuver: string,
    travel_mode: string
}
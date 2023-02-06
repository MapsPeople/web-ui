import { Geometry } from 'geojson';
import { LatLngBounds } from './lat-lng-bounds.interface';
import { Leg } from './leg.interface';

export interface Route {
    geometry: Geometry,
    bounds: LatLngBounds
    legs: Leg[],
    distance: number,
    duration: number,
}
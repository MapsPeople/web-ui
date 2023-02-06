import { RouteLocation } from './route-location.interface';
import { Step } from './step.interface';

export interface Leg {
    distance: {
        text: string,
        value: number
    },
    duration: {
        text: string,
        value: number
    },
    start_location: RouteLocation,
    start_address: string
    end_location: RouteLocation,
    end_address: string,
    steps: Step[]
}
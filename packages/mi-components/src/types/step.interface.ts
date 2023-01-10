import { Geometry } from 'geojson';
import { Maneuver } from './maneuver.interface';
import { RouteLocation } from './route-location.interface';
import { Venue, Building } from '@mapsindoors/typescript-interfaces';

export interface Step {
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    start_location: RouteLocation;
    end_location: RouteLocation;
    geometry: Geometry;
    highway: string;
    route_context: string;
    html_instructions: string;
    maneuver: string;
    travel_mode: string;
    originalLegIndex?: number;
    originalStepIndex?: number;
    steps: Maneuver[];
    parking?: boolean;
    name?: string;
    label?: string;
    instructions?: string;
    start_context?: StepContext;
    end_context?: StepContext;
    transit_information?: TransitInformation;
}

export interface StepContext {
    building: Building;
    floor: any;
    venue: Venue;
}

interface TransitInformation {
    arrival_stop?: {
        name?: string;
        location?: { lat: number; lng: number };
    };
    arrival_time?: {
        text?: string;
        time?: string;
        value?: Date;
    };
    departure_stop?: {
        name?: string;
        location?: { lat: number; lng: number };
    };
    departure_time?: {
        text?: string;
        time?: string;
        value?: Date;
    };
    headsign?: string;
    headway?: number;
    line?: {
        agencies?: TransitAgency[];
        color?: string;
        icon?: string;
        name?: string;
        short_name?: string;
        text_color?: string;
        url?: string;
        vehicle?: {
            icon?: string;
            local_icon?: string;
            name?: string;
            type?: string
        };
    };
    num_stops?: number;
    trip_short_name?: string;
}

interface TransitAgency {
    name: string;
    phone: string;
    url: string;
}
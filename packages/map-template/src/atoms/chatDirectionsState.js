import { atom } from 'recoil';

/**
 * State to hold resolved locations from chat directions.
 * This allows the wayfinding component to be pre-filled with locations
 * from AI-generated directions.
 */
const chatDirectionsState = atom({
    key: 'chatDirectionsState',
    default: {
        originLocation: null,
        destinationLocation: null
    }
});

export default chatDirectionsState;

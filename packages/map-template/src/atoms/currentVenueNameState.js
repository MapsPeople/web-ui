import { atom } from 'recoil';

/**
 * Holds the name (Administrative ID) of the current Venue.
 * This is not to be confused with the "venue" prop that can be used to dynamically change venue.
 */
const currentVenueNameState = atom({
    key: 'currentVenueName',
    default: null
});

export default currentVenueNameState;

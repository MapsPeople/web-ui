import { atom } from 'recoil';

/**
 * Holds the Venue object of the current Venue.
 * This is not to be confused with the "venue" prop that can be used to dynamically change venue.
 */
const venueState = atom({
    key: 'venueState',
    default: null
});

export default venueState;

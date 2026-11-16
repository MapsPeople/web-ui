import { atom } from 'jotai';

/**
 * Holds the name (Administrative ID) of the current Venue.
 * This is not to be confused with the "venue" prop that can be used to initially set and dynamically change venue.
 *
 * @type {null | string}
 */
const currentVenueNameState = atom(null);

export default currentVenueNameState;

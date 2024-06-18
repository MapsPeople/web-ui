import { atom } from 'recoil';

/*
 * Used for the useCurrentVenue hook.
 * Hold the name of the current Venue.
 * This is not to be confused with the "venue" prop that can be used to dynamically change venue.
 */
const currentVenueNameState = atom({
    key: 'currentVenueName',
    default: null
});

export default currentVenueNameState;

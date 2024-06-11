// Used for the useCurrentVenue hook

import { atom } from 'recoil';

/**
 * Atom for holding the Venue object for the current Venue.
 */
const venueState = atom({
    key: 'venueState',
    default: null
});

export default venueState;

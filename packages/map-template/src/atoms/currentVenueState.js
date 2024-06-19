import { atom } from 'recoil';

/**
 * Holds the Venue object of the current Venue.
 * This is not to be confused with the "venue" prop that can be used to dynamically change venue.
 *
 * @type {null | Object}
 * @see {@link https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/Venue.html}
 */
const venueState = atom({
    key: 'venueState',
    default: null
});

export default venueState;

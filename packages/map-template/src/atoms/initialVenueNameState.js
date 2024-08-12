import { atom } from 'recoil';

/**
 * Holds the initial venue name, mening the name of the very first venue that was determined.
 *
 * @type {null | string}
 */
const initialVenueNameState = atom({
    key: 'initialVenueName',
    default: null
});

export default initialVenueNameState;

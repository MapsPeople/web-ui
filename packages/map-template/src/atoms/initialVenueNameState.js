import { atom } from 'jotai';

/**
 * Holds the initial venue name, mening the name of the very first venue that was determined.
 *
 * @type {null | string}
 */
const initialVenueNameState = atom(null);

export default initialVenueNameState;

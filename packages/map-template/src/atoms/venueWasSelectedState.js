import { atomWithReset } from 'jotai/utils';

/**
 * Holds information whether a Venue was selected in the Venue Selector or not.
 *
 * @type {boolean}
 */
const venueWasSelectedState = atomWithReset(false);

export default venueWasSelectedState;

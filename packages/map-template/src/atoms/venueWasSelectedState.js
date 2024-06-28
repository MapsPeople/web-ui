import { atom } from 'recoil';

/**
 * Holds information whether a Venue was selected in the Venue Selector or not.
 *
 * @type {boolean}
 */
const venueWasSelectedState = atom({
    key: 'venueWasSelected',
    default: false
});

export default venueWasSelectedState;

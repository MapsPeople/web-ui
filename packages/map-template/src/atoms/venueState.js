import { atom } from 'recoil';

/**
 * Holds the value of the venue prop.
 */
const venueState = atom({
    key: 'venue',
    default: undefined
});

export default venueState;

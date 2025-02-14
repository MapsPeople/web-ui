import { atom } from 'recoil';

/**
 * Holds a Location that is used to set the to or from field in the wayfinding component.
 */
const wayfindingLocationState = atom({
    key: 'wayfindingLocation',
    default: null
});

export default wayfindingLocationState;

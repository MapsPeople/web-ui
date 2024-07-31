import { atom } from 'recoil';

/**
 * Holds all Venue objects in the current solution.
 *
 * @type {Object[]}
 * @see {@link https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/Venue.html}
 */
const venuesInSolutionState = atom({
    key: 'venues',
    default: []
});

export default venuesInSolutionState;

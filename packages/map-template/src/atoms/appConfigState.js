import { atom } from 'recoil';

/**
 * Holds the MapsIndoors App Config object for the current solution.
 *
 * @type {Object}
 * @see {@link https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/AppConfig.html}
 */
const appConfigState = atom({
    key: 'appConfig',
    default: undefined
});

export default appConfigState;

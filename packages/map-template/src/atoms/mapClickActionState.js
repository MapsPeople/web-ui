import { atom } from 'recoil';
import { mapClickActions } from '../constants/mapClickActions';

/**
 * Atom for storing what should happen when clicking on a MapsIndoors Location on the map.
 */
const mapClickActionState = atom({
    key: 'mapClickAction',
    default: mapClickActions.SetCurrentLocation
});

export default mapClickActionState;

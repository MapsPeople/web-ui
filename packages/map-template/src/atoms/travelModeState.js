import { atom } from 'recoil';
import { travelModes } from '../constants/travelModes';

const travelModeState = atom({
    key: 'travelMode',
    default: travelModes.WALKING
});

export default travelModeState;

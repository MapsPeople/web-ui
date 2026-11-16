import { atomWithReset } from 'jotai/utils';
import { travelModes } from '../constants/travelModes';

const travelModeState = atomWithReset(travelModes.WALKING);

export default travelModeState;

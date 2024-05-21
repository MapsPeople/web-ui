import { atom } from 'recoil';
import { ViewModes } from '../constants/viewModes';

const mapboxViewModeState = atom({
    key: 'mapboxViewMode',
    default: ViewModes.initial3D
});

export default mapboxViewModeState;

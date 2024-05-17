import { selector } from 'recoil';
import pitchState from '../atoms/pitchState';
import { ViewModes } from '../components/Map/MapboxMap/ViewmodeSwitch/ViewModeSwitch';
import mapboxViewModeState from '../atoms/mapboxViewModeState';

/**
 * Selector to get which pitch to apply when fitting bounds.
 */
const currentPitchSelector = selector({
    key: 'currentPitch',
    get: ({ get }) => {
        const pitch = get(pitchState);
        const viewMode = get(mapboxViewModeState);

        let result;

        switch (viewMode) {
            case ViewModes.initial3D:
                // Any pitch property wins over initial 3D mode
                result = (pitch !== null && pitch !== undefined) ? pitch : 45;
                break;
            case ViewModes.clicked3D:
                result = 45;
                break;
            case ViewModes.clicked2D:
                result = 0;
                break;
            default:
                // Intentionally left blank.
        }

        return result;
    }
});

export default currentPitchSelector;

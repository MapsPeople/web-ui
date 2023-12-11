import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import solutionState from '../atoms/solutionState';

/**
 * Custom hook to zoom far in on the map based on Solution module.
 */
const useSetMaxZoomLevel = () => {

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const solution = useRecoilValue(solutionState);

    const setMaxZoomLevel = () => {
        if (mapsIndoorsInstance && solution) {
            const hasZoom22 = solution.modules.map(module => module.toLowerCase()).includes('z22');
            mapsIndoorsInstance.setZoom(hasZoom22 ? 22 : 21);
        }
    }

    return setMaxZoomLevel;
};

export default useSetMaxZoomLevel;

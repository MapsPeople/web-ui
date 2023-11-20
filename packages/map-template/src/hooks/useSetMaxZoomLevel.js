
import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import solutionState from '../atoms/solutionState';

const useSetMaxZoomLevel = () => {

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const solution = useRecoilValue(solutionState);
    const maxZoomLevel = useRef();
    const mapsIndoorsRef = useRef();

    useEffect(() => {
        if (mapsIndoorsInstance && solution) {
            mapsIndoorsRef.current = mapsIndoorsInstance;
            // Set max zoom level to 22 if allowed for the solution, otherwise 21.
            maxZoomLevel.current = solution.modules.map(module => module.toLowerCase()).includes('z22') ? 22 : 21;
        }
    }, [mapsIndoorsInstance, solution]);

    const setMaxZoomLevel = () => {
        // Zoom in as far as allowed (21 or 22).
        mapsIndoorsRef.current.setZoom(maxZoomLevel.current);
    };

    return setMaxZoomLevel;
}

export default useSetMaxZoomLevel;

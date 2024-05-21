import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import solutionState from '../../../../atoms/solutionState';
import { ReactComponent as Light2D } from '../../../../assets/2d-light.svg';
import { ReactComponent as Dark2D } from '../../../../assets/2d-dark.svg';
import { ReactComponent as Light3D } from '../../../../assets/3d-light.svg';
import { ReactComponent as Dark3D } from '../../../../assets/3d-dark.svg';
import primaryColorState from '../../../../atoms/primaryColorState';
import mapboxViewModeState from '../../../../atoms/mapboxViewModeState';
import './ViewModeSwitch.scss';
import currentPitchSelector from '../../../../selectors/currentPitch';

export const ViewModes = Object.freeze({
    initial3D: 1,
    clicked3D: 2,
    clicked2D: 3
});

function ViewModeSwitch({ mapView }) {

    const solution = useRecoilValue(solutionState);
    const primaryColor = useRecoilValue(primaryColorState);
    const [viewMode, setViewMode] = useRecoilState(mapboxViewModeState);
    const [shouldShowSwitch, setShouldShowSwitch] = useState(false);
    const currentPitch = useRecoilValue(currentPitchSelector);

    useEffect(() => {
        if (['mapbox', '3dwalls', 'floorplan'].every(requiredModule => solution.modules.map(module => module.toLowerCase()).includes(requiredModule))) {
            setShouldShowSwitch(true);
            setViewMode(ViewModes.initial3D);
        }
    }, [solution]);

    useEffect(() => {
        // Toggle 2D and 3D features on the map
        if (mapView?.isReady) {
            // If the viewMode is null, set the ViewMode to be initial3D
            if (viewMode === null) {
                setViewMode(ViewModes.initial3D);
            }
            switch (viewMode) {
                case ViewModes.clicked2D:
                    mapView.hideFeatures([mapView.MapboxFeatures.MODEL3D, mapView.MapboxFeatures.WALLS3D, mapView.MapboxFeatures.EXTRUSION3D, mapView.MapboxFeatures.EXTRUDEDBUILDINGS]);
                    mapView.tilt(0, 2000);
                    break;
                case ViewModes.initial3D:
                    mapView.tilt(currentPitch, 2000);
                    mapView.hideFeatures([mapView.MapboxFeatures.MODEL2D, mapView.MapboxFeatures.WALLS2D]);
                    break;
                case ViewModes.clicked3D:
                    mapView.tilt(45, 2000);
                    mapView.hideFeatures([mapView.MapboxFeatures.MODEL2D, mapView.MapboxFeatures.WALLS2D]);
                    break;
                default:
                    // Intentionally left blank
            }
        }
    }, [mapView?.isReady, viewMode]);

    return <>
        {shouldShowSwitch && <div className="switch">
            <button className="switch__button"
                onClick={() => setViewMode(ViewModes.clicked2D)}
                style={{ backgroundColor: viewMode === ViewModes.clicked2D ? primaryColor : 'white' }}
            >
                {viewMode === ViewModes.clicked2D ? <Light2D /> : <Dark2D />}
            </button>
            <button className="switch__button"
                onClick={() => setViewMode(ViewModes.clicked3D)}
                style={{ backgroundColor: [ViewModes.initial3D, ViewModes.clicked3D].includes(viewMode) ? primaryColor : 'white' }}
            >
                {[ViewModes.initial3D, ViewModes.clicked3D].includes(viewMode) ? <Light3D /> : <Dark3D />}
            </button>
        </div>}
    </>
}

export default ViewModeSwitch;

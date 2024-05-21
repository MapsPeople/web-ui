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
import { ViewModes } from '../../../../constants/viewModes';

function ViewModeSwitch({ mapView }) {

    const solution = useRecoilValue(solutionState);
    const primaryColor = useRecoilValue(primaryColorState);
    const [viewMode, setViewMode] = useRecoilState(mapboxViewModeState);
    const [shouldShowSwitch, setShouldShowSwitch] = useState(false);
    const currentPitch = useRecoilValue(currentPitchSelector);

    // If the modules are enables, show the Visibility Switch and set the View Mode
    useEffect(() => {
        if (['mapbox', '3dwalls', 'floorplan'].every(requiredModule => solution.modules.map(module => module.toLowerCase()).includes(requiredModule))) {
            setShouldShowSwitch(true);
            setViewMode(ViewModes.initial3D);
        }
    }, [solution]);

    // Handle the toggling of the 2D/3D features on the map
    useEffect(() => {
        if (mapView?.isReady) {
            switch (viewMode) {
                    // If the 2D View Mode has been clicked, hide the 3D features and tilt the map to 0 degrees. 
                case ViewModes.clicked2D:
                    mapView.tilt(0, 2000);
                    mapView.hideFeatures([mapView.MapboxFeatures.MODEL3D, mapView.MapboxFeatures.WALLS3D, mapView.MapboxFeatures.EXTRUSION3D, mapView.MapboxFeatures.EXTRUDEDBUILDINGS]);
                    break;
                    // If the Visibility Switch has not been interacted with, hide the 2D features
                    // Tilt the map to the 'currentPitch' value - this is the value that the timeout property resets to. 
                case ViewModes.initial3D:
                    mapView.tilt(currentPitch, 2000);
                    mapView.hideFeatures([mapView.MapboxFeatures.MODEL2D, mapView.MapboxFeatures.WALLS2D]);
                    break;
                    // If the 3D View Mode has been clicked, hide the 2D features and tilt the map to 45 degrees. 
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
        {shouldShowSwitch && <div className="view-mode-switch">
            <button className="view-mode-switch__button"
                onClick={() => setViewMode(ViewModes.clicked2D)}
                style={{ backgroundColor: viewMode === ViewModes.clicked2D ? primaryColor : 'white' }}
            >
                {viewMode === ViewModes.clicked2D ? <Light2D /> : <Dark2D />}
            </button>
            <button className="view-mode-switch__button"
                onClick={() => setViewMode(ViewModes.clicked3D)}
                style={{ backgroundColor: [ViewModes.initial3D, ViewModes.clicked3D].includes(viewMode) ? primaryColor : 'white' }}
            >
                {[ViewModes.initial3D, ViewModes.clicked3D].includes(viewMode) ? <Light3D /> : <Dark3D />}
            </button>
        </div>}
    </>
}

export default ViewModeSwitch;

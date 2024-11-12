import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './ViewModeSwitch.scss';

import Light2D from '../../../../assets/2d-light.svg?react';
import Dark2D from '../../../../assets/2d-dark.svg?react';
import Light3D from '../../../../assets/3d-light.svg?react';
import Dark3D from '../../../../assets/3d-dark.svg?react';

const ViewModes = Object.freeze({
    initial3D: 'initial3D',
    clicked3D: 'clicked3D',
    clicked2D: 'clicked2D'
});

ViewModeSwitch.propTypes = {
    viewModeTrigger: PropTypes.string,
    mapView: PropTypes.object,
    solution: PropTypes.object,
    reset: PropTypes.bool,
    activeColor: PropTypes.string
}

/**
 *
 * @param {Object} props
 * @param {Object} props.mapView - Instance of a MapsIndoors MapView
 * @param {Object} [props.solution] - The current MapsIndoors solution
 * @param {boolean} [props.reset] - Set to true to reset to initial 3D mode
 * @param {string} [props.activeColor='#005655'] - The color to use to mark the active view mode
 */
function ViewModeSwitch({ mapView, solution, reset, activeColor='#005655' }) {

    const [visible, setVisible] = useState(false);
    const [viewMode, setViewMode] = useState();

    useEffect(() => {
        if (!solution) return;

        // If the required modules are enables, show the Visibility Switch and set the View Mode
        if (['mapbox', '3dwalls', 'floorplan'].every(requiredModule => solution.modules.map(module => module.toLowerCase()).includes(requiredModule))) {
            setVisible(true);
            setViewMode(ViewModes.initial3D);
        }
    }, [solution]);

    useEffect(() => {
        if (reset) {
            setViewMode(ViewModes.initial3D);
        }
    }, [reset]);

    useEffect(() => {
        if (visible === true && mapView) {
            switch (viewMode) {
                // If the 2D View Mode has been clicked, hide the 3D features and tilt the map to 0 degrees.
                case ViewModes.clicked2D:
                    mapView.tilt(0, 2000);
                    mapView.hideFeatures([mapView.FeatureType.MODEL3D, mapView.FeatureType.WALLS3D, mapView.FeatureType.EXTRUSION3D, mapView.FeatureType.EXTRUDEDBUILDINGS]);
                    break;

                // If the Visibility Switch has not been interacted with, hide the 2D features
                // Tilt the map to the 'currentPitch' value - this is the value that the timeout property resets to.
                case ViewModes.initial3D:
                    mapView.tilt(mapView.getPitch(), 2000);
                    mapView.hideFeatures([mapView.FeatureType.MODEL2D, mapView.FeatureType.WALLS2D]);
                    break;

                // If the 3D View Mode has been clicked, hide the 2D features and tilt the map to 45 degrees.
                case ViewModes.clicked3D:
                    mapView.tilt(45, 2000);
                    mapView.hideFeatures([mapView.FeatureType.MODEL2D, mapView.FeatureType.WALLS2D]);
                    break;

                default:
                    // Intentionally left blank
            }
        }
    }, [viewMode, mapView, visible]);

    return <>
        {visible && <div className="view-mode-switch">
            <button className="view-mode-switch__button"
                onClick={() => setViewMode(ViewModes.clicked2D)}
                style={{ backgroundColor: viewMode === ViewModes.clicked2D ? activeColor : 'white' }}
            >
                {viewMode === ViewModes.clicked2D ? <Light2D /> : <Dark2D />}
            </button>
            <button className="view-mode-switch__button"
                onClick={() => setViewMode(ViewModes.clicked3D)}
                style={{ backgroundColor: [ViewModes.initial3D, ViewModes.clicked3D].includes(viewMode) ? activeColor : 'white' }}
            >
                {[ViewModes.initial3D, ViewModes.clicked3D].includes(viewMode) ? <Light3D /> : <Dark3D />}
            </button>
        </div>}
    </>
}

export default ViewModeSwitch;
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './ViewModeSwitch.scss';
import isNullOrUndefined from '../../../../../../map-template/src/helpers/isNullOrUndefined';
import { ReactComponent as Light2D } from '../../../../assets/2d-light.svg';
import { ReactComponent as Dark2D } from '../../../../assets/2d-dark.svg';
import { ReactComponent as Light3D } from '../../../../assets/3d-light.svg';
import { ReactComponent as Dark3D } from '../../../../assets/3d-dark.svg';

const ViewModes = Object.freeze({
    initial3D: 'initial3D',
    clicked3D: 'clicked3D',
    clicked2D: 'clicked2D'
});

ViewModeSwitch.propTypes = {
    mapView: PropTypes.object,
    pitch: PropTypes.number,
    solution: PropTypes.object,
    reset: PropTypes.number,
    activeColor: PropTypes.string,
    show2DModelsIn3D: PropTypes.string
}

/**
 *
 * @param {Object} props
 * @param {Object} [props.mapView] - Instance of a MapsIndoors MapView
 * @param {number} [props.pitch] - The value of the pitch property on the map (not necessarily the current map pitch)
 * @param {Object} [props.solution] - The current MapsIndoors solution
 * @param {number} [props.reset] - Set/increase the number reset to initial 3D mode
 * @param {string} [props.activeColor='#005655'] - The color to use to mark the active view mode
 * @param {string} [props.show2DModelsIn3D] - Object that contains the app settings
 */
function ViewModeSwitch({ mapView, pitch, reset, activeColor = '#005655', show2DModelsIn3D }) {

    const [viewMode, setViewMode] = useState(ViewModes.initial3D);
    const portalTarget = document.querySelector('.viewmode-switch-portal');

    // The show2DModelsIn3D property from AppConfig is received as a string ("true"/"false") or might be undefined.
    // We need to explicitly check for the string value "true" for the setting to take effect.
    const is2DModelsEnabledIn3D = () => {
        return show2DModelsIn3D === "true";
    };

    useEffect(() => {
        if (reset) {
            setViewMode(ViewModes.initial3D);
        }
    }, [reset]);

    useEffect(() => {
        if (mapView) {
            // Make sure the map is ready before applying view mode changes. This is to mitigate a timing issue with the hideFeatures method on the SDK.
            const mapViewReady = new Promise((resolve) => {
                if (mapView.isReady) {
                    resolve();
                } else {
                    mapView.on('ready', () => {
                        resolve();
                    });
                }
            });

            mapViewReady.then(() => {
                switch (viewMode) {
                    // If the 2D View Mode has been clicked, hide the 3D features and tilt the map to 0 degrees.
                    case ViewModes.clicked2D:
                        mapView.tilt(0, 2000);
                        mapView.hideFeatures([mapView.FeatureType.MODEL3D, mapView.FeatureType.WALLS3D, mapView.FeatureType.EXTRUSION3D, mapView.FeatureType.EXTRUDEDBUILDINGS]);
                        break;

                    // If the Visibility Switch has not been interacted with, hide the 2D features
                    // Tilt the map to the 'currentPitch' value - this is the value that the timeout property resets to.
                    case ViewModes.initial3D:
                        mapView.tilt(!isNullOrUndefined(pitch) ? pitch : 45, 2000);
                        mapView.hideFeatures([
                            ...(!is2DModelsEnabledIn3D() ? [mapView.FeatureType.MODEL2D] : []),
                            mapView.FeatureType.WALLS2D
                        ]);
                        break;

                    // If the 3D View Mode has been clicked, hide the 2D features and tilt the map to 45 degrees.
                    case ViewModes.clicked3D:
                        mapView.tilt(45, 2000);
                        mapView.hideFeatures([
                            ...(!is2DModelsEnabledIn3D() ? [mapView.FeatureType.MODEL2D] : []),
                            mapView.FeatureType.WALLS2D
                        ]);
                        break;

                    default:
                    // Intentionally left blank
                }
            });
        }
    }, [viewMode, mapView]);

    // Don't render if the portal target doesn't exist
    if (!portalTarget) {
        return null;
    }

    return createPortal(
        <div className="view-mode-switch">
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
        </div>,
        portalTarget
    );
}

export default ViewModeSwitch;
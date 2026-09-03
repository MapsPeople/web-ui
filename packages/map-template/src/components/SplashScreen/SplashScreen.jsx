import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import primaryColorState from '../../atoms/primaryColorState';
import logoState from '../../atoms/logoState';
import { useOptionalTranslation } from '../../hooks/useOptionalTranslation';
import './SplashScreen.scss';

const STAGE_LABELS = {
    initializing: 'Preparing your map',
    fetching_locations: 'Finding places',
    building_geometry: 'Drawing the map',
    loading_2d_models: 'Adding 2D models',
    loading_3d_models: 'Adding 3D models',
    applying_to_map: 'Adding locations',
    complete: 'Map ready'
};

/**
 * Initial loading overlay. Shows the solution logo, a determinate progress bar, and the
 * current load stage so large solutions do not appear as an empty map.
 */
function SplashScreen({ phase = 'initializing', progress = 0, isFading = false }) {
    const primaryColor = useRecoilValue(primaryColorState);
    const logo = useRecoilValue(logoState);
    const t = useOptionalTranslation();

    const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
    const currentLabelKey = STAGE_LABELS[phase] ?? STAGE_LABELS.initializing;

    return (
        <div
            className={`splash-screen${isFading ? ' splash-screen--fading' : ''}`}
            role="status"
            aria-live="polite"
            aria-busy={phase !== 'complete'}
        >
            <div className="splash-screen__container">
                <img
                    className={'splash-screen__logo ' + (logo ? 'splash-screen__logo--visible' : '')}
                    src={logo}
                    alt=""
                />
                <div className="splash-screen__progress">
                    <div
                        className="splash-screen__progress-track"
                        style={{ backgroundColor: `${primaryColor}33` }}
                    >
                        <div
                            className={`splash-screen__progress-bar${phase !== 'complete' ? ' splash-screen__progress-bar--active' : ''}`}
                            style={{
                                width: `${percent}%`,
                                backgroundColor: primaryColor
                            }}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                            aria-label={t(currentLabelKey)}
                        />
                    </div>
                    <p className="splash-screen__status">{t(currentLabelKey)}</p>
                </div>
            </div>
        </div>
    );
}

SplashScreen.propTypes = {
    phase: PropTypes.string,
    progress: PropTypes.number,
    isFading: PropTypes.bool
};

export default SplashScreen;

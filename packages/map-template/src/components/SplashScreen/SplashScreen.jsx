import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import primaryColorState from '../../atoms/primaryColorState';
import logoState from '../../atoms/logoState';
import { useOptionalTranslation } from '../../hooks/useOptionalTranslation';
import './SplashScreen.scss';

const STAGES = [
    { phase: 'initializing', labelKey: 'Loading map' },
    { phase: 'fetching_locations', labelKey: 'Fetching locations' },
    { phase: 'building_geometry', labelKey: 'Building map' },
    { phase: 'loading_2d_models', labelKey: 'Loading 2D models', optional: true },
    { phase: 'loading_3d_models', labelKey: 'Loading 3D models', optional: true },
    { phase: 'applying_to_map', labelKey: 'Adding locations to the map' }
];

const PHASE_ORDER = STAGES.map(stage => stage.phase);

/**
 * Initial loading overlay. Shows the solution logo, a determinate progress bar, and the
 * current SDK load stage so large solutions do not appear as an empty map.
 */
function SplashScreen({ phase = 'initializing', progress = 0, isFading = false, seenPhases }) {
    const primaryColor = useRecoilValue(primaryColorState);
    const logo = useRecoilValue(logoState);
    const t = useOptionalTranslation();

    const currentStageIndex = Math.max(0, PHASE_ORDER.indexOf(phase));
    const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
    const currentLabelKey = phase === 'complete'
        ? 'Map ready'
        : (STAGES.find(stage => stage.phase === phase)?.labelKey ?? 'Loading map');

    const visibleStages = useMemo(() => {
        return STAGES.filter(stage => !stage.optional || seenPhases?.has(stage.phase));
    }, [seenPhases]);

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
                <ol className="splash-screen__stages">
                    {visibleStages.map((stage, index) => {
                        const stageIndex = PHASE_ORDER.indexOf(stage.phase);
                        const isDone = phase === 'complete' || stageIndex < currentStageIndex;
                        const isCurrent = phase !== 'complete' && stage.phase === phase;
                        return (
                            <li
                                key={stage.phase}
                                className={`splash-screen__stage${isDone ? ' splash-screen__stage--done' : ''}${isCurrent ? ' splash-screen__stage--current' : ''}`}
                                style={isCurrent ? { color: primaryColor } : undefined}
                            >
                                <span className="splash-screen__stage-marker" aria-hidden="true">
                                    {isDone ? '✓' : index + 1}
                                </span>
                                {t(stage.labelKey)}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}

SplashScreen.propTypes = {
    phase: PropTypes.string,
    progress: PropTypes.number,
    isFading: PropTypes.bool,
    seenPhases: PropTypes.instanceOf(Set)
};

export default SplashScreen;

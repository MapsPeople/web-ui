import PropTypes from 'prop-types';
import { useAtomValue } from 'jotai';
import appConfigState from '../../atoms/appConfigState';
import { useMapLoadingProgress } from '../../hooks/useMapLoadingProgress';
import SplashScreen from './SplashScreen';

/**
 * Owns splash loading state so MapTemplate does not rerender on every SDK progress tick.
 */
function SplashScreenContainer({ mapsindoorsSDKAvailable }) {
    const appConfig = useAtomValue(appConfigState);
    const { phase, progress, showSplash, isFading } = useMapLoadingProgress({
        mapsindoorsSDKAvailable,
        appConfig
    });

    if (!showSplash) {
        return null;
    }

    return (
        <SplashScreen
            phase={phase}
            progress={progress}
            isFading={isFading}
        />
    );
}

SplashScreenContainer.propTypes = {
    mapsindoorsSDKAvailable: PropTypes.bool
};

export default SplashScreenContainer;

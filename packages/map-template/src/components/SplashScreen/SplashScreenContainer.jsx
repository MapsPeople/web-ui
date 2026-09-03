import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import appConfigState from '../../atoms/appConfigState';
import { useMapLoadingProgress } from '../../hooks/useMapLoadingProgress';
import SplashScreen from './SplashScreen';

/**
 * Owns splash loading state so MapTemplate does not rerender on every SDK progress tick.
 */
function SplashScreenContainer({ mapsindoorsSDKAvailable }) {
    const appConfig = useRecoilValue(appConfigState);
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

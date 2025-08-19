import { useRecoilValue } from 'recoil';
import primaryColorState from '../../atoms/primaryColorState';
import './SplashScreen.scss';
import logoState from '../../atoms/logoState';

/**
 * Creates the splash screen loading initially in the app.
 * The default color and logo are MapsIndoors' visual identity.
 */
function SplashScreen() {
    const primaryColor = useRecoilValue(primaryColorState);
    const logo = useRecoilValue(logoState);

    return (
        <div className="splash-screen">
            <div className="splash-screen__container">
                <img className={'splash-screen__logo ' + (logo ? 'splash-screen__logo--visible' : '')}
                    src={logo}
                    alt=""
                />
                {/* The border value is set based on the #rrggbbaa and includes an
                        opacity level of around 20%, which translates to the value of 33. */}
                <div className="splash-screen__loader"
                    style={{
                        border: `8px solid ${primaryColor}33`,
                        borderLeft: `8px solid ${primaryColor}`
                    }}>
                </div>
            </div>
        </div>
    )
}

export default SplashScreen;
import React from "react";
import { useRecoilValue } from "recoil";
import logo from "../../assets/logo.svg";
import primaryColorState from "../../atoms/primaryColorState";
import './SplashScreen.scss';

const defaultLogo = logo;

/**
 * Creates the splash screen loading initially in the app.
 * The default colors and logo are MapsIndoors' visual identity.
 * The component allows for customisation of these two properties according to each case,
 * along with the width and the height of the logo.
 *
 * @param {object} props
 * @param {string} props.logo - The logo that appears on the splash screen.
 */
function SplashScreen({ logo = defaultLogo }) {
    const primaryColor = useRecoilValue(primaryColorState);

    return (
        <div className="splash-screen">
            <div className="splash-screen__container">
                <img className="splash-screen__logo"
                    src={logo}
                    alt="logo"
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
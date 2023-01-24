import React from "react";
import { useState, useEffect } from 'react';
import { CSSTransition } from "react-transition-group";
import logo from "../../assets/logo.svg"
import './SplashScreen.scss';

const defaultLogo = logo;
const defaultColor = "#005655";

/**
 * Creates the splash screen loading initially in the app.
 * The default colors and logo are MapsIndoors' visual identity.
 * The component allows for customisation of these two properties according to each case,
 * along with the width and the height of the logo.
 *
 * @param {object} props
 * @param {string} props.primaryColor - The primary color of the application.
 * @param {string} props.logo - The logo that appears on the splash screen.
 */
function SplashScreen({ primaryColor = defaultColor, logo = defaultLogo, logoWidth, logoHeight }) {
    const [isEnter, setIsEnter] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsEnter(true), 3000)
    }, [])

    /**
     * Converts an HEX value to an RGB value.
     * It accepts three or six digits HEX values.
     *
     * @param {string} hex
     */
    const convertHexToRgb = hex =>
        hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
            , (m, r, g, b) => '#' + r + r + g + g + b + b)
            .substring(1).match(/.{2}/g)
            .map(x => parseInt(x, 16))

    return (
        <CSSTransition
            in={isEnter}
            timeout={3000}
            appear={true}
            classNames="splash-screen">
            <div className="splash-screen">
                <CSSTransition
                    in={isEnter}
                    timeout={3000}
                    appear={true}
                    classNames="splash-screen__logo">
                    <img className="splash-screen__logo"
                        src={logo}
                        alt="logo"
                        style={{width: logoWidth, height: logoHeight}}
                    />
                </CSSTransition>
                <div className="splash-screen__loader"
                    style={{
                        border: `8px solid rgba(${convertHexToRgb(primaryColor)}, 0.3)`,
                        borderLeft: `8px solid ${primaryColor}`
                    }}>
                </div>
            </div>
        </CSSTransition>)
}

export default SplashScreen;
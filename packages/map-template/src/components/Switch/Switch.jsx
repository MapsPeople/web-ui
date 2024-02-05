import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import primaryColorState from "../../atoms/primaryColorState";
import './Switch.scss';
import { ReactComponent as Light2D } from '../../assets/2d-light.svg';
import { ReactComponent as Dark2D } from '../../assets/2d-dark.svg';
import { ReactComponent as Light3D } from '../../assets/3d-light.svg';
import { ReactComponent as Dark3D } from '../../assets/3d-dark.svg';

/**
 * Creates the splash screen loading initially in the app.
 * The default color and logo are MapsIndoors' visual identity.
 */
function Switch() {
    const primaryColor = useRecoilValue(primaryColorState);

    const [active, setActive] = useState('3D');

    function setActiveTab(prop) {
        setActive(prop);
    }

    return (
        <div className="switch">
            <div className="switch__button"
                onClick={() => setActiveTab('2D')}
                style={{ backgroundColor: active === '2D' ? primaryColor : 'white' }}
            >
                {active === '2D' ? <Light2D /> : <Dark2D />}
            </div>
            <div className="switch__button"
                onClick={() => setActiveTab('3D')}
                style={{ backgroundColor: active === '3D' ? primaryColor : 'white' }}
            >
                {active === '3D' ? <Light3D /> : <Dark3D />}
            </div>
        </div>
    )
}

export default Switch;
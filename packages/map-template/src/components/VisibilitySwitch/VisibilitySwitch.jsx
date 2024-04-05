import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import primaryColorState from "../../atoms/primaryColorState";
import './VisibilitySwitch.scss';
import { ReactComponent as Light2D } from '../../assets/2d-light.svg';
import { ReactComponent as Dark2D } from '../../assets/2d-dark.svg';
import { ReactComponent as Light3D } from '../../assets/3d-light.svg';
import { ReactComponent as Dark3D } from '../../assets/3d-dark.svg';
import is3DToggledState from "../../atoms/is3DToggledState";

/**
 * Component responsible for switching between the 2D and 3D features.
 */
function VisibilitySwitch() {
    const primaryColor = useRecoilValue(primaryColorState);

    const [is3DToggled, setIs3DToggled] = useRecoilState(is3DToggledState);

    return (
        <div className="switch">
            <div className="switch__button"
                onClick={() => setIs3DToggled(!is3DToggled)}
                style={{ backgroundColor: !is3DToggled ? primaryColor : 'white' }}
            >
                {!is3DToggled ? <Light2D /> : <Dark2D />}
            </div>
            <div className="switch__button"
                onClick={() => setIs3DToggled(!is3DToggled)}
                style={{ backgroundColor: is3DToggled ? primaryColor : 'white' }}
            >
                {is3DToggled ? <Light3D /> : <Dark3D />}
            </div>
        </div>
    )
}

export default VisibilitySwitch;
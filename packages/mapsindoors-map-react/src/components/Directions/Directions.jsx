import React from "react";
import './Directions.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';

function Directions({ onClose }) {
    return (
        <div className="directions">
            <div className="directions__details">
                <button className="directions__close" onClick={() => onClose()}>
                    <CloseIcon />
                </button>
                <div className="directions__locations">
                    <div className="directions__to">
                        <div className="directions__label">
                            TO
                        </div>
                        <div>Meeting room</div>
                    </div>
                    <div className="directions__from">
                        <div className="directions__label">
                            FROM
                        </div>
                        <div>Main office</div>
                    </div>
                </div>
            </div>
            <div className="directions__guide">
                <div className="directions__info">
                    <div className="directions__distance">
                        <WalkingIcon />
                        <div>Distance:</div>
                        <div className="directions__meters">545m</div>
                    </div>
                    <div className="directions__time">
                        <ClockIcon />
                        <div>Estimated time:</div>
                        <div className="directions__minutes">2m</div>
                    </div>
                </div>
                <hr></hr>
                <div className="directions__steps">
                    Steps
                </div>
            </div>
        </div>
    )
}

export default Directions;
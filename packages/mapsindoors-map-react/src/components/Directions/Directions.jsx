import React, { useContext, useEffect, useState } from "react";
import './Directions.scss';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';

const mapsindoors = window.mapsindoors;

function Directions({ isOpen, onBack, directions }) {

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    useEffect(() => {
        if (isOpen && directions) {
            setTotalDistance(directions.totalDistance);
            setTotalTime(directions.totalTime);

            const directionsRenderer = new mapsindoors.directions.DirectionsRenderer({
                mapsIndoors: mapsIndoorsInstance,
                fitBoundsPadding: 60 // FIXME: Route should not be covered by bottom sheet or modal
            });

            directionsRenderer.setRoute(directions.directionsResult);
        }
    }, [isOpen, directions, mapsIndoorsInstance]);

    return (
        <div className="directions">
            <div className="directions__details">
                <button className="directions__close" onClick={() => onBack()} aria-label="Close">
                    <CloseIcon />
                </button>
                <div className="directions__locations">
                    <div className="directions__container">
                        <label className="directions__label">
                            To
                        </label>
                        {directions?.destinationLocation && <div>{directions.destinationLocation.properties.name}</div>}
                    </div>
                    <div className="directions__container">
                        <label className="directions__label">
                            From
                        </label>
                        {directions?.originLocation && <div>{directions.originLocation.properties.name}</div>}
                    </div>
                </div>
            </div>
            <div className="directions__guide">
                <div className="directions__info">
                    <div className="directions__distance">
                        <WalkingIcon />
                        <div>Distance:</div>
                        <div className="directions__meters">{totalDistance && <mi-distance meters={totalDistance} />}</div>
                    </div>
                    <div className="directions__time">
                        <ClockIcon />
                        <div>Estimated time:</div>
                        <div className="directions__minutes">{totalTime && <mi-time seconds={totalTime} />}</div>
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
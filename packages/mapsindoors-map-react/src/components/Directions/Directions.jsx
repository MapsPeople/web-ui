import React, { useContext, useEffect, useState } from "react";
import './Directions.scss';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import RouteInstructions from "../RouteInstructions/RouteInstructions";

const mapsindoors = window.mapsindoors;

let directionsRenderer;

function Directions({ isOpen, onBack, directions }) {

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    useEffect(() => {
        if (isOpen && directions) {
            setTotalDistance(directions.totalDistance);
            setTotalTime(directions.totalTime);

            directionsRenderer = new mapsindoors.directions.DirectionsRenderer({
                mapsIndoors: mapsIndoorsInstance,
                fitBoundsPadding: { top: 60, bottom: 360, left: 60, right: 60 } // FIXME: Remove hardcoded values, while ensuring route is not be covered by bottom sheet or modal.
            });

            directionsRenderer.setRoute(directions.directionsResult);

            // Set the step index to be 0 in order to display the correct instruction on the map.
            directionsRenderer.setStepIndex(0);
        }
    }, [isOpen, directions, mapsIndoorsInstance]);

    /**
     * Transform the steps in legs to a flat array of steps.
     */
    function getRouteSteps() {
        if (!directions) {
            return [];
        }

        return directions.directionsResult.legs.reduce((accummulator, leg, legIndex) => {
            for (const stepIndex in leg.steps) {
                const step = leg.steps[stepIndex];

                accummulator.push(step);
            }
            return accummulator;
        }, []);
    }

    /**
     * Render the next navigation step on the map.
     */
    function onNext() {
        if (directionsRenderer) {
            directionsRenderer.nextStep();
        }
    }

    /**
     * Render the previous navigation step on the map.
     */
    function onPrevious() {
        if (directionsRenderer) {
            directionsRenderer.previousStep();
        }
    }

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
                    <RouteInstructions
                        steps={getRouteSteps()}
                        originLocation={directions?.originLocation}
                        onNextStep={() => onNext()}
                        onPreviousStep={() => onPrevious()}>
                    </RouteInstructions>
                </div>
            </div>
        </div>
    )
}

export default Directions;
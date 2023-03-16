import React, { useContext, useEffect, useState } from "react";
import './Directions.scss';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import ProgressSteps from "../RouteInstructions/RouteInstructions";
import useMediaQuery from '../../hooks/useMediaQuery';

const mapsindoors = window.mapsindoors;

let directionsRenderer;

function Directions({ isOpen, onBack, directions }) {

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    useEffect(() => {
        if (isOpen && directions) {
            setTotalDistance(directions.totalDistance);
            setTotalTime(directions.totalTime);

            // 6 percent of smallest of viewport height or width
            const padding = Math.min(window.innerHeight, window.innerWidth) * 0.06;



            directionsRenderer = new mapsindoors.directions.DirectionsRenderer({
                mapsIndoors: mapsIndoorsInstance,
                fitBoundsPadding: {
                    top: padding,
                    bottom: isDesktop ? padding : getBottomSheetHeight(),
                    left: isDesktop ? getSidebarWidth() : padding,
                    right: padding
                }

            });

            directionsRenderer.setRoute(directions.directionsResult);
            directionsRenderer.setStepIndex(0);
        }

    }, [isOpen, directions, mapsIndoorsInstance]);

    /**
     * Close the directions and set the visibility of the blue route to false.
     */
    function onDirectionsClosed() {
        directionsRenderer.setOptions({ mapsIndoors: null, visible: false });
        onBack();
    }

    /**
     * Transform the step in legs to a flat array of steps.
     */
    function getRouteSteps() {
        if (!directions) {
            return [];
        }

        let currentIndex = 0;

        return directions.directionsResult.legs.reduce((accummulator, leg, legIndex) => {
            for (const stepIndex in leg.steps) {
                const step = leg.steps[stepIndex];
                step.originalLegIndex = legIndex;
                step.originalStepIndex = parseInt(stepIndex);
                // Assign each step an id for identifying the active step
                step.id = currentIndex;
                currentIndex += 1;

                accummulator.push(step);
            }
            return accummulator;

        }, []);
    }

    /**
     * Display the map interaction when navigatin to the next step.
     */
    function onNext() {
        if (directionsRenderer) {
            directionsRenderer.nextStep();
        }
    }

    /**
     * Display the map interaction when navigatin to the previous step.
     */
    function onPrevious() {
        if (directionsRenderer) {
            directionsRenderer.previousStep();
        }
    }

    /**
        * Get the height of the bottom sheet in pixels.
       */
    function getBottomSheetHeight() {
        const bottomSheet = document.querySelector('.sheet--active');
        const mapContainer = document.querySelector('.mapsindoors-map');
        // Subtract the top padding from the height of the map container element.
        return mapContainer.offsetHeight - bottomSheet.offsetTop;
    }

    /**
     * Get the width of the sidebar in pixels
    */
    function getSidebarWidth() {
        const sidebar = document.querySelector('.modal--open');
        const mapContainer = document.querySelector('.mapsindoors-map');
        // Subtract the sum of the sidebar's width and the left padding from the width of the map container element.
        return mapContainer.offsetWidth - (sidebar.offsetWidth + sidebar.offsetLeft);

    }

    return (
        <div className="directions">
            <div className="directions__details">
                <button className="directions__close" onClick={() => onDirectionsClosed()} aria-label="Close">
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
                    <ProgressSteps
                        steps={getRouteSteps()}
                        onNextStep={() => onNext()}
                        onPreviousStep={() => onPrevious()}>
                    </ProgressSteps>
                </div>
            </div>
        </div>
    )
}

export default Directions;
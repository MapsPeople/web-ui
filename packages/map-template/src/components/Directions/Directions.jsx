import React, { useEffect, useState, useRef } from "react";
import './Directions.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import travelModeState from '../../atoms/travelModeState';
import RouteInstructions from "../RouteInstructions/RouteInstructions";
import useMediaQuery from '../../hooks/useMediaQuery';
import directionsResponseState from "../../atoms/directionsResponseState";
import activeStepState from "../../atoms/activeStep";
import { snapPoints } from "../../constants/snapPoints";
import substepsToggledState from "../../atoms/substepsToggledState";
import getDesktopPaddingLeft from "../../helpers/GetDesktopPaddingLeft";
import getMobilePaddingBottom from "../../helpers/GetMobilePaddingBottom";

let directionsRenderer;

/**
 * Show the directions view.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Indicates if the directions view is open.
 * @param {function} props.onBack - Callback that fires when the directions view is closed by the user.
 * @param {function} props.onSetSize - Callback that is fired when the component has loaded.
 * @param {function} props.snapPointSwiped - Changes value when user has swiped a Bottom sheet to a new snap point.
 *
 */
function Directions({ isOpen, onBack, onSetSize, snapPointSwiped }) {
    // Holds the MapsIndoors DisplayRule for the destination
    const [destinationDisplayRule, setDestinationDisplayRule] = useState(null);

    const destinationInfoElement = useRef(null);
    const guideElement = useRef(null);

    const [totalTime, setTotalTime] = useState();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const travelMode = useRecoilValue(travelModeState);

    const directions = useRecoilValue(directionsResponseState);

    const [, setActiveStep] = useRecoilState(activeStepState);

    const [substepsOpen, setSubstepsOpen] = useRecoilState(substepsToggledState);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    useEffect(() => {
        setDestinationDisplayRule(null);

        if (isOpen && directions) {
            setTotalTime(directions.totalTime);

            // 6 percent of smallest of viewport height or width
            const padding = Math.min(window.innerHeight, window.innerWidth) * 0.06;

            // Set the directions renderer and the route to null, in order to avoid multiple routes shown simultaneously.
            directionsRenderer?.setRoute(null);
            directionsRenderer = null;

            directionsRenderer = new window.mapsindoors.directions.DirectionsRenderer({
                mapsIndoors: mapsIndoorsInstance,
                fitBoundsPadding: {
                    top: padding,
                    bottom: isDesktop ? padding : getMobilePaddingBottom(),
                    left: isDesktop ? getDesktopPaddingLeft() : padding,
                    right: padding
                }
            });

            directionsRenderer.setRoute(directions.directionsResult);

            // Set the step index to be 0 in order to display the correct instruction on the map.
            directionsRenderer.setStepIndex(0);

            destinationInfoElement.current.location = directions.destinationLocation;

            // If the destination is My Position, then set the display rule to null.
            if (directions.destinationLocation.properties.name === 'My Position') {
                setDestinationDisplayRule(null)
            } else {
                setDestinationDisplayRule(mapsIndoorsInstance.getDisplayRule(directions.destinationLocation));
            }
        }
    }, [isOpen, directions, mapsIndoorsInstance, travelMode]);

    /*
     * Make sure directions stop rendering on the map when the Directions view is not active anymore.
     */
    useEffect(() => {
        if (!isOpen && directionsRenderer) {
            stopRendering();
        }
    }, [isOpen]);

    /**
     * Transform the steps in legs to a flat array of steps.
     */
    function getRouteSteps() {
        if (!directions) {
            return [];
        }

        return directions.directionsResult.legs.reduce((accummulator, leg) => {
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
        guideElement.current.scrollTop = 0;
        if (directionsRenderer) {
            directionsRenderer.nextStep();
        }
    }

    /**
     * Render the previous navigation step on the map.
     */
    function onPrevious() {
        guideElement.current.scrollTop = 0;
        if (directionsRenderer) {
            directionsRenderer.previousStep();
        }
    }

    /**
     * Trigger to directions renderer to fit the map to the current directions step.
     */
    function onFitCurrentDirections() {
        if (directionsRenderer) {
            directionsRenderer.setStepIndex(directionsRenderer.getStepIndex(), directionsRenderer.getLegIndex());
        }
    }

    /**
     * Stop rendering directions on the map.
     */
    function stopRendering() {
        directionsRenderer.setRoute(null);
        directionsRenderer = null;
    }

    /**
     * Reset the substeps to 0 and close the substeps.
     * Set the size of the bottom sheet to fit the content.
     */
    function resetSubsteps() {
        setActiveStep(0);
        setSubstepsOpen(false);
        setSize(snapPoints.FIT);
    }

    /**
     * Close the directions.
     * Reset the active steps and stop rendering directions.
     */
    function onDirectionsClosed() {
        resetSubsteps();
        stopRendering();
        onBack();
    }

    /**
     * Communicate size change to parent component.
     * @param {number} size
     */
    function setSize(size) {
        if (typeof onSetSize === 'function') {
            onSetSize(size);
        }
    }

    /**
     * Set the size of the bottom sheet depending on the substepsOpen state.
     */
    useEffect(() => {
        substepsOpen ? setSize(snapPoints.MAX) : setSize(snapPoints.FIT);
    }, [substepsOpen]);

    /**
     * When user swipes the bottom sheet to a new snap point.
     */
    useEffect(() => {
        if (isOpen && snapPointSwiped) {
            setSubstepsOpen(snapPointSwiped === snapPoints.MAX);
        }
    }, [isOpen, snapPointSwiped]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="directions">
            <div className="directions__steps">
                <div className="directions__minutes">{totalTime && <mi-time seconds={totalTime} />}</div>
                <RouteInstructions
                    steps={getRouteSteps()}
                    originLocation={directions?.originLocation}
                    onNextStep={() => onNext()}
                    isOpen={isOpen}
                    onPreviousStep={() => onPrevious()}
                    onFitCurrentDirections={() => onFitCurrentDirections()}
                >
                </RouteInstructions>
            </div>
            <hr></hr>
            <div className="directions__actions">
                <div className="directions__details">
                    {directions?.destinationLocation &&
                        <div className="directions__info">
                            {destinationDisplayRule && directions.destinationLocation.name !== 'My Position' &&
                                <div className="directions__icon">
                                    <img alt="" src={destinationDisplayRule.icon.src ? destinationDisplayRule.icon.src : destinationDisplayRule.icon} />
                                </div>}
                            <div className="directions__content">
                                <div className='directions__name'>
                                    {directions?.destinationLocation.properties.name}
                                </div>
                                <mi-location-info ref={destinationInfoElement} show-external-id={false} />
                            </div>
                        </div>
                    }
                </div>
                <button className="directions__close" onClick={() => onDirectionsClosed()} aria-label="Close">
                    Cancel route
                </button>
            </div>
        </div>
    )
}

export default Directions;
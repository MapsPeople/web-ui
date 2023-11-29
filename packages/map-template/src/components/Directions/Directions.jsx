import React, { useEffect, useState, useRef } from "react";
import './Directions.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import travelModeState from '../../atoms/travelModeState';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walk.svg';
import { ReactComponent as DriveIcon } from '../../assets/drive.svg';
import { ReactComponent as BikeIcon } from '../../assets/bike.svg';
import { ReactComponent as QRCode } from '../../assets/qrcode.svg';
import RouteInstructions from "../RouteInstructions/RouteInstructions";
import useMediaQuery from '../../hooks/useMediaQuery';
import { travelModes } from "../../constants/travelModes";
import directionsResponseState from "../../atoms/directionsResponseState";
import activeStepState from "../../atoms/activeStep";
import { snapPoints } from "../../constants/snapPoints";
import substepsToggledState from "../../atoms/substepsToggledState";
import getDesktopPaddingLeft from "../../helpers/GetDesktopPaddingLeft";
import getMobilePaddingBottom from "../../helpers/GetMobilePaddingBottom";
import getDesktopPaddingBottom from "../../helpers/GetDesktopPaddingBottom";
import kioskLocationState from "../../atoms/kioskLocationState";
import showQRCodeDialogState from "../../atoms/showQRCodeDialogState";

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
    const originInfoElement = useRef(null);
    const guideElement = useRef(null);

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const travelMode = useRecoilValue(travelModeState);

    const directions = useRecoilValue(directionsResponseState);

    const [, setActiveStep] = useRecoilState(activeStepState);

    const [substepsOpen, setSubstepsOpen] = useRecoilState(substepsToggledState);

    const kioskLocation = useRecoilValue(kioskLocationState)

    const isDesktop = useMediaQuery('(min-width: 992px)');

    const [, setShowQRCodeDialog] = useRecoilState(showQRCodeDialogState);

    useEffect(() => {
        setDestinationDisplayRule(null);

        if (isOpen && directions) {
            setTotalDistance(directions.totalDistance);
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
                    bottom: getBottomPadding(padding),
                    left: getLeftPadding(padding),
                    right: padding
                }
            });

            directionsRenderer.setRoute(directions.directionsResult);

            // Set the step index to be 0 in order to display the correct instruction on the map.
            directionsRenderer.setStepIndex(0);

            originInfoElement.current.location = directions.originLocation;
            destinationInfoElement.current.location = directions.destinationLocation;

            // If the destination is My Position, then set the display rule to null.
            if (directions.destinationLocation.properties.name === 'My Position') {
                setDestinationDisplayRule(null)
            } else {
                setDestinationDisplayRule(mapsIndoorsInstance.getDisplayRule(directions.destinationLocation));
            }
        }
    }, [isOpen, directions, mapsIndoorsInstance, travelMode]);


    /**
     * Get bottom padding when getting directions.
     * Calculate all cases depending on the kioskLocation id prop as well.
     */
    function getBottomPadding(padding) {
        if (isDesktop) {
            if (kioskLocation) {
                return getDesktopPaddingBottom();
            } else {
                return padding;
            }
        } else {
            return getMobilePaddingBottom();
        }
    }

    /**
    * Get left padding when getting directions. 
    * Calculate all cases depending on the kioskLocation id prop as well. 
    */
    function getLeftPadding(padding) {
        if (isDesktop) {
            if (kioskLocation) {
                return padding;
            } else {
                return getDesktopPaddingLeft();
            }
        } else {
            return padding;
        }
    }

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

    function onShowQRCode() {
        setShowQRCodeDialog(true);
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
            <div className="directions__details">
                <button className="directions__close" onClick={() => onDirectionsClosed()} aria-label="Close">
                    <CloseIcon />
                </button>
                <div className="directions__locations">
                    <div className="directions__container">
                        <label className="directions__label">
                            From
                        </label>
                        {directions?.originLocation &&
                            <div className="directions__info">
                                <div className="directions__content">
                                    <div className='directions__name'>
                                        {directions?.originLocation.properties.name}
                                        {directions?.originLocation.properties.name !== 'My Position' && <div>·</div>}
                                        <mi-location-info ref={originInfoElement} show-external-id={false} />
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="directions__container">
                        <label className="directions__label">
                            To
                        </label>
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
                </div>
            </div>
            <div ref={guideElement} className="directions__guide">
                <div className="directions__route">
                    <div className="directions__metrics">
                        <div className="directions__distance">
                            {travelMode === travelModes.WALKING && <WalkingIcon />}
                            {travelMode === travelModes.DRIVING && <DriveIcon />}
                            {travelMode === travelModes.BICYCLING && <BikeIcon />}
                            <div>Distance:</div>
                            <div className="directions__meters">{totalDistance && <mi-distance meters={totalDistance} />}</div>
                        </div>
                        <div className="directions__time">
                            <ClockIcon />
                            <div>Estimated time:</div>
                            <div className="directions__minutes">{totalTime && <mi-time seconds={totalTime} />}</div>
                        </div>
                    </div>
                    <button className='directions__qr-code' onClick={() => onShowQRCode()}><QRCode /> Scan QR code</button>
                </div>
                <hr></hr>
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
        </div>
    )
}

export default Directions;
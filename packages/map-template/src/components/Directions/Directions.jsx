import React, { useContext, useEffect, useState, useRef } from "react";
import './Directions.scss';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import RouteInstructions from "../RouteInstructions/RouteInstructions";
import useMediaQuery from '../../hooks/useMediaQuery';

const mapsindoors = window.mapsindoors;

let directionsRenderer;

function Directions({ isOpen, onBack, directions }) {
    // Holds the MapsIndoors DisplayRule for the origin
    const [originDisplayRule, setOriginDisplayRule] = useState(null);
    // Holds the MapsIndoors DisplayRule for the destination
    const [destinationDisplayRule, setDestinationDisplayRule] = useState(null);

    const destinationInfoElement = useRef(null);
    const originInfoElement = useRef(null);

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    useEffect(() => {
        setDestinationDisplayRule(null);
        setOriginDisplayRule(null);
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

            // Set the step index to be 0 in order to display the correct instruction on the map.
            directionsRenderer.setStepIndex(0);

            originInfoElement.current.location = directions.originLocation;
            destinationInfoElement.current.location = directions.destinationLocation;
            setOriginDisplayRule(mapsIndoorsInstance.getDisplayRule(directions.originLocation));
            setDestinationDisplayRule(mapsIndoorsInstance.getDisplayRule(directions.destinationLocation));
        }


    }, [isOpen, directions, mapsIndoorsInstance]);

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

    // FIXME: investigate if we can handle the height and width with hooks
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

    /**
     * Stop rendering directions on the map.
     */
    function stopRendering() {
        directionsRenderer.setRoute(null);
        directionsRenderer = null;
    }

    /**
     * Close the directions.
     */
    function onDirectionsClosed() {
        stopRendering();
        onBack();
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
                            From
                        </label>
                        {directions?.originLocation &&
                            <div className="directions__info">
                                <div className="directions__icon">
                                    {originDisplayRule && <img alt="" src={originDisplayRule.icon.src ? originDisplayRule.icon.src : originDisplayRule.icon} />}
                                </div>
                                <div className="directions__content">
                                    <div className='directions__name'>
                                        {directions?.originLocation.properties.name}
                                    </div>
                                    <mi-location-info ref={originInfoElement} />
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
                                <div className="directions__icon">
                                    {destinationDisplayRule && <img alt="" src={destinationDisplayRule.icon.src ? destinationDisplayRule.icon.src : destinationDisplayRule.icon} />}
                                </div>
                                <div className="directions__content">
                                    <div className='directions__name'>
                                        {directions?.destinationLocation.properties.name}
                                    </div>
                                    <mi-location-info ref={destinationInfoElement} />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="directions__guide">
                <div className="directions__metrics">
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
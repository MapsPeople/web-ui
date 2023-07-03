import React, { useEffect, useRef, useState } from 'react'
import './RouteInstructions.scss';
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg';
import { useRecoilState, useRecoilValue } from 'recoil';
import directionsResponseState from '../../atoms/directionsResponseState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import activeStepState from '../../atoms/activeStep';
import setMapZoomLevel from '../../helpers/SetMapZoomLevel';
import RouteInstructionsStep from '../WebComponentWrappers/RouteInstructionsStep/RouteInstructionsStep';
import substepsToggledState from '../../atoms/substepsToggledState';
import triggerSubstepsState from '../../atoms/triggerSubstepsState';

/**
 * Private variable used for checking if the next button should be enabled.
 * Implemented due to the impossibility to use the React useState hook.
 */
let _allowNextStep = true;

/**
 * Route instructions step by step component.
 *
 * @param {Object} props
 * @param {array} props.steps - The steps array passed after the directions are set.
 * @param {function} props.onNextStep - Function handling the navigation to the next step.
 * @param {function} props.onPreviousStep - Function handling the navigation to the previous step.
 * @param {object} props.originLocation - The initial location where the route starts from.
 * @param {boolean} props.isOpen - Indicates if the directions view is open.
 *
 * @returns
 */
function RouteInstructions({ steps, onNextStep, onPreviousStep, originLocation, isOpen }) {
    const routeInstructionsRef = useRef();

    /** Referencing the previous step of each active step */
    const [previous, setPrevious] = useState();

    const [activeStep, setActiveStep] = useRecoilState(activeStepState);

    const [totalSteps, setTotalSteps] = useState();

    const [lastStepMapState, setLastStepMapState] = useState({ zoom: "", center: "" });

    const directions = useRecoilValue(directionsResponseState);

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const substepsOpen = useRecoilValue(substepsToggledState);

    const triggerSubsteps = useRecoilValue(triggerSubstepsState);

    // Indicate if the next step action is active.
    const [isNextStep, setIsNextStep] = useState(true);

    /**
     * Clone the last step in the directions in order to create a destination step.
     * Assign the specific travel mode to the destination step and set the steps to null.
     * Push the destination step at the end of the steps array.
     */
    useEffect(() => {
        const lastStep = steps[steps.length - 1];
        const destinationStep = { ...lastStep }
        destinationStep.travel_mode = 'DESTINATION';
        destinationStep.steps = null;
        steps.push(destinationStep);
        setTotalSteps(steps);
    }, [steps]);

    /**
     * Get the zoom and the center of the last step when the map instance is idle.
     * Wait until getting the zoom and center, then allow the user to go to the next step.
     */
    function getZoomAndCenter() {
        return new Promise(resolve => {
            function getCenter() {
                const zoom = mapsIndoorsInstance.getMapView().getZoom();
                const center = mapsIndoorsInstance.getMapView().getCenter();
                setLastStepMapState({ zoom, center });

                if (isNextStep === true) {
                    _allowNextStep = true;
                }
                resolve();
            }
            mapsIndoorsInstance.getMapView().once('idle', getCenter);
        });
    }

    /**
     * Disable the next step and get the zoom and center of the map.
     */
    async function asyncCall() {
        if (isNextStep === true) {
            _allowNextStep = false;
        }
        getZoomAndCenter();
    }

    /**
     * Get the zoom and the center of the destination step.
     */
    useEffect(() => {
        if (isOpen) {
            // Check if the directions have more than 2 steps, else take the first step.
            if (totalSteps?.length > 2) {
                if (activeStep === totalSteps?.length - 2 && !triggerSubsteps) {
                    asyncCall();
                }
            } else if (activeStep === 0 && lastStepMapState.zoom === "" && lastStepMapState.center === "") {
                asyncCall();
            }

            if (activeStep === totalSteps?.length - 1 && directions?.destinationLocation) {
                // Get the destination location
                const destinationLocation = directions?.destinationLocation;

                // Center the map to the location coordinates.
                const destinationLocationGeometry = destinationLocation?.geometry.type === 'Point' ? destinationLocation?.geometry.coordinates : destinationLocation?.properties.anchor.coordinates;
                mapsIndoorsInstance.getMapView().setCenter({ lat: destinationLocationGeometry[1], lng: destinationLocationGeometry[0] });

                // Call function to set the map zoom level depeding on the max zoom supported on the solution
                setMapZoomLevel(mapsIndoorsInstance);
            }

            // Check if the substeps are closed or open, and trigger the method on the <route-instructions-step> component.
            if (substepsOpen === false) {
                routeInstructionsRef.current.closeSubsteps();
            } else if (substepsOpen === true) {
                routeInstructionsRef.current.openSubsteps();
            }
        }
    }, [isOpen, activeStep, totalSteps, substepsOpen]);

    /**
     * Navigate to the next step.
     * Set the previous step in order to show the correct
     * instruction and travel mode.
     */
    function nextStep() {
        setPrevious(totalSteps[activeStep]);
        setActiveStep(activeStep + 1);
        onNextStep();
        setIsNextStep(true);
    }

    /**
     * Navigate to the previous step.
     * Set the previous step in order to show the correct
     * instruction and travel mode.
     */
    function previousStep() {
        setPrevious(totalSteps[activeStep - 2]);
        setActiveStep(activeStep - 1);
        setIsNextStep(false);

        if (activeStep === totalSteps?.length - 1) {
            mapsIndoorsInstance.getMapView().setZoom(lastStepMapState.zoom);
            mapsIndoorsInstance.getMapView().setCenter(lastStepMapState.center);
        } else {
            onPreviousStep();
        }
    }

    // Translations required for the mi-route-instructions-step component
    const translations = {
        walk: 'Walk',
        bike: 'Bike',
        transit: 'Transit',
        drive: 'Drive',
        destination: 'You have arrived',
        leave: 'Leave',
        from: 'From',
        park: 'Park',
        at: 'at',
        building: 'Building',
        venue: 'Venue',
        takeStaircaseToLevel: 'Take staircase to level',
        takeLadderToLevel: 'Take the ladder to level',
        takeElevatorToLevel: 'Take elevator to level',
        takeEscalatorToLevel: 'Take escalator to level',
        takeWheelchairLiftToLevel: 'Take wheelchair lift to level',
        takeWheelchairRampToLevel: 'Take wheelchair ramp to level',
        exit: 'Exit',
        enter: 'Enter',
        stops: 'stops',
        andContinue: 'and continue',
        continueStraightAhead: 'Continue straight ahead',
        goLeft: 'Go left',
        goSharpLeft: 'Go sharp left',
        goSlightLeft: 'Go slight left',
        goRight: 'Go right',
        goSharpRight: 'Go sharp right',
        goSlightRight: 'Go slight right',
        turnAround: 'Turn around',
        days: 'd',
        hours: 'h',
        minutes: 'min'
    }

    return (
        <div className="route-instructions">
            {totalSteps &&
                <>
                    <RouteInstructionsStep
                        translations={translations}
                        totalSteps={totalSteps}
                        activeStep={activeStep}
                        previous={previous}
                        directions={directions}
                        originLocation={originLocation}
                        ref={routeInstructionsRef}
                    >
                    </RouteInstructionsStep>
                    <div className='route-instructions__footer'>
                        <div className="route-instructions__progress">
                            {totalSteps.map((_, index) => (
                                <div className={`route-instructions__step ${(activeStep) >= index ? "completed" : ""}`} key={index}>
                                    <div className="step-counter"></div>
                                </div>
                            ))}
                        </div>
                        <div className="route-instructions__actions">
                            <button className="route-instructions__button"
                                onClick={() => previousStep()}
                                aria-label="Previous"
                                disabled={activeStep === 0}>
                                <ArrowLeft></ArrowLeft>
                            </button>
                            <div className="route-instructions__overview">Step {activeStep + 1} of {totalSteps.length}</div>
                            <button className="route-instructions__button"
                                onClick={() => nextStep()}
                                aria-label="Next"
                                disabled={activeStep === totalSteps.length - 1 || _allowNextStep === false}>
                                <ArrowRight></ArrowRight>
                            </button>
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export default RouteInstructions
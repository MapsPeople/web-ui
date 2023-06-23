import React, { useEffect, useState } from 'react'
import './RouteInstructions.scss';
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg';
import { useRecoilState, useRecoilValue } from 'recoil';
import directionsResponseState from '../../atoms/directionsResponseState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import activeStepState from '../../atoms/activeStep';
import setMapZoomLevel from '../../helpers/SetMapZoomLevel';

/**
 * Route instructions step by step component.
 *
 * @param {Object} props
 * @param {array} props.steps - The steps array passed after the directions are set.
 * @param {function} props.onNextStep - Function handling the navigation to the next step.
 * @param {function} props.onPreviousStep - Function handling the navigation to the previous step.
 * @param {object} props.originLocation - The initial location where the route starts from.
 *
 * @returns
 */
function RouteInstructions({ steps, onNextStep, onPreviousStep, originLocation }) {
    /** Referencing the previous step of each active step */
    const [previous, setPrevious] = useState();

    const [activeStep, setActiveStep] = useRecoilState(activeStepState);
    const [totalSteps, setTotalSteps] = useState();

    const [lastStepZoom, setLastStepZoom] = useState();
    const [lastStepCenter, setLastStepCenter] = useState();

    const directions = useRecoilValue(directionsResponseState);

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    /**
     * Clone the last step in the directions in order to create a destination step.
     * Assign the specific travel mode to the destination step and push the destination step at the end of the steps array.
     *
     */
    useEffect(() => {
        const lastStep = steps[steps.length - 1];
        const destinationStep = { ...lastStep }
        destinationStep.travel_mode = 'DESTINATION'
        steps.push(destinationStep);
        setTotalSteps(steps);
    }, [steps]);

    /**
     * Get the zoom and the center of the last step and the destination step in the directions.
     *
     */
    useEffect(() => {
        if (activeStep === totalSteps?.length - 1) {
            const lastStepZoom = mapsIndoorsInstance.getZoom();
            const lastStepCenter = mapsIndoorsInstance.getMapView().getCenter();
            setLastStepZoom(lastStepZoom);
            setLastStepCenter(lastStepCenter);

            if (directions?.destinationLocation) {
                // Get the destination location
                const destinationLocation = directions?.destinationLocation;

                // Center the map to the location coordinates.
                const destinationLocationGeometry = destinationLocation?.geometry.type === 'Point' ? destinationLocation?.geometry.coordinates : destinationLocation?.properties.anchor.coordinates;
                mapsIndoorsInstance.getMapView().setCenter({ lat: destinationLocationGeometry[1], lng: destinationLocationGeometry[0] });

                // Call function to set the map zoom level depeding on the max zoom supported on the solution
                setMapZoomLevel(mapsIndoorsInstance);
            }
        }
    }, [activeStep]);

    /**
     * Navigate to the next step.
     * Set the previous step in order to show the correct
     * instruction and travel mode.
     */
    function nextStep() {
        setPrevious(totalSteps[activeStep]);
        setActiveStep(activeStep + 1);
        onNextStep();
    }

    /**
     * Navigate to the previous step.
     * Set the previous step in order to show the correct
     * instruction and travel mode.
     */
    function previousStep() {
        setPrevious(totalSteps[activeStep - 2]);
        setActiveStep(activeStep - 1);

        if (activeStep === totalSteps?.length - 1) {
            mapsIndoorsInstance.getMapView().setCenter(lastStepCenter);
            mapsIndoorsInstance.setZoom(lastStepZoom);
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
                    <mi-route-instructions-step
                        step={JSON.stringify(totalSteps[activeStep])}
                        translations={JSON.stringify(translations)}
                        destination-location={directions?.destinationLocation.properties.name}
                        from-travel-mode={previous?.travel_mode ?? ""}
                        from-route-context={previous?.route_context ?? originLocation?.properties?.name ?? ""}>
                    </mi-route-instructions-step>
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
                            disabled={activeStep === totalSteps.length - 1}>
                            <ArrowRight></ArrowRight>
                        </button>
                    </div>
                </>
            }
        </div>
    )
}

export default RouteInstructions
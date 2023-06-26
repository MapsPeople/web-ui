import React, { useEffect, useState } from 'react'
import './RouteInstructions.scss';
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg';
import RouteInstructionsStep from '../WebComponentWrappers/RouteInstructionsStep/RouteInstructionsStep';

/**
 * Route instructions step by step component.
 *
 * @param {Object} props
 * @param {array} props.steps - The steps array passed after the directions are set.
 * @param {function} props.onNextStep - Function handling the navigation to the next step.
 * @param {function} props.onPreviousStep - Function handling the navigation to the previous step.
 * @param {object} props.originLocation - The initial location where the route starts from.
 * @param {function} props.onSubstepsToggled - Function handling the navigation to the previous step.
 *
 * @returns
 */
function RouteInstructions({ steps, onNextStep, onPreviousStep, originLocation, onSubstepsToggled }) {
    /** Referencing the previous step of each active step */
    const [previous, setPrevious] = useState();

    const [activeStep, setActiveStep] = useState(0);

    /*
     * Make sure to reset active step whenever the steps change.
     */
    useEffect(() => {
        setActiveStep(0);
    }, [steps]);

    /**
     * Navigate to the next step.
     * Set the previous step in order to show the correct
     * instruction and travel mode.
     */
    function nextStep() {
        setPrevious(steps[activeStep]);
        setActiveStep(activeStep + 1);
        onNextStep();
    }

    /**
     * Navigate to the previous step.
     * Set the previous step in order to show the correct
     * instruction and travel mode.
     */
    function previousStep() {
        setPrevious(steps[activeStep - 2]);
        setActiveStep(activeStep - 1);
        onPreviousStep();
    }

    // Translations required for the mi-route-instructions-step component
    const translations = {
        walk: 'Walk',
        bike: 'Bike',
        transit: 'Transit',
        drive: 'Drive',
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
            {steps &&
                <>
                    <RouteInstructionsStep
                        translations={translations}
                        steps={steps}
                        activeStep={activeStep}
                        previous={previous}
                        originLocation={originLocation}
                        substepsToggled={() => onSubstepsToggled()}
                        >
                    </RouteInstructionsStep>
                    <div className='route-instructions__footer'>
                        <div className="route-instructions__progress">
                            {steps.map((_, index) => (
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
                            <div className="route-instructions__overview">Step {activeStep + 1} of {steps.length}</div>
                            <button className="route-instructions__button"
                                onClick={() => nextStep()}
                                aria-label="Next"
                                disabled={activeStep === steps.length - 1}>
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
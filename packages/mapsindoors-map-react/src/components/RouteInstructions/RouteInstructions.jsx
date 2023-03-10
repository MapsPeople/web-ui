import React, { useState } from 'react'
import styled from 'styled-components'
import './RouteInstructions.scss';
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg';

const ButtonStyle = styled.button`
  background: none;
  color: #ffffff;
  cursor: pointer;
  border: none;
  :active {
    transform: scale(0.98);
  }
  :disabled {
    color: #000000;
    cursor: not-allowed;
    opacity:0.3;
  }
`

/**
 * Progress steps
 *
 * @param {Object} props
 * @param {array} props.steps
 * @returns
 */
function ProgressSteps({ steps }) {
    const [activeStep, setActiveStep] = useState(1)

    const nextStep = () => {
        setActiveStep(activeStep + 1)
    }

    const prevStep = () => {
        setActiveStep(activeStep - 1)
    }

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
        <div className='route-instructions'>
            {steps &&
                <>
                    <mi-route-instructions-step
                        step={JSON.stringify(steps.find(step => step.id === (activeStep - 1)))}
                        key={activeStep}
                        translations={JSON.stringify(translations)}
                        hideIndoorSubsteps={false}
                        fromRouteContext='Outside'>
                    </mi-route-instructions-step>
                    <div className='route-instructions__progress'>
                        {steps.map(({ id }) => (
                            <div className={`route-instructions__step ${(activeStep - 1) >= id ? 'completed' : ''}`} key={id}>
                                <div className="step-counter"></div>
                            </div>
                        ))}
                    </div>
                    <div className='route-instructions__actions'>
                        <ButtonStyle onClick={prevStep} disabled={activeStep === 1}>
                            <ArrowLeft></ArrowLeft>
                        </ButtonStyle>
                        <div className='route-instructions__overview'>Step {activeStep} of {steps.length}</div>
                        <ButtonStyle onClick={nextStep} disabled={activeStep === steps.length}>
                            <ArrowRight></ArrowRight>
                        </ButtonStyle>
                    </div>
                </>
            }
        </div>
    )
}

export default ProgressSteps
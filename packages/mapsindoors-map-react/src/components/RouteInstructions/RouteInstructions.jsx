import React, { useState } from 'react'
import styled from 'styled-components'
import './RouteInstructions.scss';

const ButtonStyle = styled.button`
  border-radius: 4px;
  border: 0;
  background: #005655;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  width: 90px;
  :active {
    transform: scale(0.98);
  }
  :disabled {
    background: lightgray;
    color: #000000;
    cursor: not-allowed;
  }
`

const steps = [
    {
        step: 1,
    },
    {
        step: 2,
    },
    {
        step: 3,
    },
    {
        step: 4,
    },
]

function ProgressSteps() {
    const [activeStep, setActiveStep] = useState(1)

    const nextStep = () => {
        setActiveStep(activeStep + 1)
    }

    const prevStep = () => {
        setActiveStep(activeStep - 1)
    }

    const totalSteps = steps.length

    return (
        <div className='route-instructions'>
            <div className='route-instructions__progress'>
                {steps.map(({ step }) => (
                    <div className={`route-instructions__step ${activeStep >= step ? 'completed' : ''}`} key={step}>
                        <div className="step-counter"></div>
                    </div>
                ))}
            </div>
            <div className='route-instructions__actions'>
                <ButtonStyle onClick={prevStep} disabled={activeStep === 1}>
                    Previous
                </ButtonStyle>
                <div className='route-instructions__overview'>Step {activeStep} of {totalSteps}</div>
                <ButtonStyle onClick={nextStep} disabled={activeStep === totalSteps}>
                    Next
                </ButtonStyle>
            </div>
        </div>
    )
}

export default ProgressSteps
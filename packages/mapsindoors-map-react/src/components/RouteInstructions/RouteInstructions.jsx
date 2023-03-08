import React, { useState } from 'react'
import styled from 'styled-components'
import './RouteInstructions.scss';

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 70px;
  position: relative;
  :before {
    content: '';
    position: absolute;
    background: lightgray;
    height: 4px;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
  }
  :after {
    content: '';
    position: absolute;
    background: #005655;
    height: 4px;
    width: ${({ width }) => width};
    top: 50%;
    transition: 0.4s ease;
    transform: translateY(-50%);
    left: 0;
  }
`

const StepStyle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 3px solid ${({ step }) =>
        step === 'completed' ? '#005655' : 'lightgray'};
  transition: 0.4s ease;
  display: flex;
  justify-content: center;
  align-items: center;
`

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
        label: 'Step 1',
        step: 1,
    },
    {
        label: 'Step 2',
        step: 2,
    },
    {
        label: 'Step 3',
        step: 3,
    },
    {
        label: 'Step 4',
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

    const width = `${(100 / (totalSteps - 1)) * (activeStep - 1)}%`


    return (
        <div className='main-container'>
            <StepContainer width={width}>
                {steps.map(({ step, label }) => (
                    <div className='step-wrapper' key={step}>
                        <StepStyle step={activeStep >= step ? 'completed' : 'incomplete'}>
                            {activeStep > step ? (
                                <div className='checkmark'>L</div>
                            ) : (
                                <div className='step-count'>{step}</div>
                            )}
                        </StepStyle>
                        <div className='steps-label-container'>
                            <div className='step-label' key={step}>{label}</div>
                        </div>
                    </div>
                ))}
            </StepContainer>
            <div className='buttons-container'>
                <ButtonStyle onClick={prevStep} disabled={activeStep === 1}>
                    Previous
                </ButtonStyle>
                <ButtonStyle onClick={nextStep} disabled={activeStep === totalSteps}>
                    Next
                </ButtonStyle>
            </div>
        </div>
    )
}

export default ProgressSteps
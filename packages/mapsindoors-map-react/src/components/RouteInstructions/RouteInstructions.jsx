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

function ProgressSteps() {
    const [activeStep, setActiveStep] = useState(1)

    const nextStep = () => {
        setActiveStep(activeStep + 1)
    }

    const prevStep = () => {
        setActiveStep(activeStep - 1)
    }

    const allSteps = [
        {
            id: 1,
            distance: {
                text: '',
                value: 10
            },

            start_location: {
                floor_name: '0',
                lat: 57.0581246,
                lng: 9.9506587,
                zLevel: 0
            },
            end_location: {
                floor_name: '0',
                lat: 57.0580794,
                lng: 9.9504232,
                zLevel: 0
            },
            geometry: null,
            highway: 'footway',
            end_context: {
                building: {
                    buildingInfo: {
                        name: "The White House"
                    }
                },
                venue: {
                    venueInfo: {
                        name: "The White House"
                    }
                }
            },
            route_context: 'InsideBuilding',
            html_instructions: null,
            maneuver: null,
            travel_mode: 'WALKING',
            name: 'The White House',
            originalLegIndex: 0,
            originalStepIndex: 0,
            steps: [
                {
                    distance: { text: '9 m', value: 9 },
                    duration: { text: '0 mins', value: 6 },
                    end_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
                    geometry: { type: 'LineString', coordinates: Array(15) },
                    highway: 'footway',
                    html_instructions: null,
                    maneuver: 'straight',
                    route_context: 'InsideBuilding',
                    start_location: { zLevel: 0, floor_name: '0', lat: 57.0580794, lng: 9.9504232 },
                    travel_mode: 'WALKING'
                },
                {
                    distance: { text: '3 m', value: 3 },
                    duration: { text: '0 mins', value: 2 },
                    end_location: { zLevel: 0, floor_name: '0', lat: 57.0581098, lng: 9.9505663 },
                    geometry: { type: 'LineString', coordinates: Array(2) },
                    highway: 'footway',
                    html_instructions: null,
                    maneuver: 'turn-right',
                    route_context: 'InsideBuilding',
                    start_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
                    travel_mode: 'WALKING'
                }
            ]
        },
        {
            id: 2,
            distance: {
                text: '',
                value: 20
            },

            start_location: {
                floor_name: '0',
                lat: 57.0581246,
                lng: 9.9506587,
                zLevel: 0
            },
            end_location: {
                floor_name: '0',
                lat: 57.0580794,
                lng: 9.9504232,
                zLevel: 0
            },
            geometry: null,
            highway: 'footway',
            end_context: {
                building: {
                    buildingInfo: {
                        name: "The White House"
                    }
                },
                venue: {
                    venueInfo: {
                        name: "The White House"
                    }
                }
            },
            route_context: 'InsideBuilding',
            html_instructions: null,
            maneuver: null,
            travel_mode: 'WALKING',
            name: 'The White House',
            originalLegIndex: 0,
            originalStepIndex: 0,
            steps: [
                {
                    distance: { text: '9 m', value: 9 },
                    duration: { text: '0 mins', value: 6 },
                    end_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
                    geometry: { type: 'LineString', coordinates: Array(15) },
                    highway: 'footway',
                    html_instructions: null,
                    maneuver: 'straight',
                    route_context: 'InsideBuilding',
                    start_location: { zLevel: 0, floor_name: '0', lat: 57.0580794, lng: 9.9504232 },
                    travel_mode: 'WALKING'
                },
                {
                    distance: { text: '3 m', value: 3 },
                    duration: { text: '0 mins', value: 2 },
                    end_location: { zLevel: 0, floor_name: '0', lat: 57.0581098, lng: 9.9505663 },
                    geometry: { type: 'LineString', coordinates: Array(2) },
                    highway: 'footway',
                    html_instructions: null,
                    maneuver: 'turn-right',
                    route_context: 'InsideBuilding',
                    start_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
                    travel_mode: 'WALKING'
                }
            ]
        },
        {
            id: 3,
            distance: {
                text: '',
                value: 30
            },

            start_location: {
                floor_name: '0',
                lat: 57.0581246,
                lng: 9.9506587,
                zLevel: 0
            },
            end_location: {
                floor_name: '0',
                lat: 57.0580794,
                lng: 9.9504232,
                zLevel: 0
            },
            geometry: null,
            highway: 'footway',
            end_context: {
                building: {
                    buildingInfo: {
                        name: "The White House"
                    }
                },
                venue: {
                    venueInfo: {
                        name: "The White House"
                    }
                }
            },
            route_context: 'InsideBuilding',
            html_instructions: null,
            maneuver: null,
            travel_mode: 'WALKING',
            name: 'The White House',
            originalLegIndex: 0,
            originalStepIndex: 0,
            steps: [
                {
                    distance: { text: '9 m', value: 9 },
                    duration: { text: '0 mins', value: 6 },
                    end_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
                    geometry: { type: 'LineString', coordinates: Array(15) },
                    highway: 'footway',
                    html_instructions: null,
                    maneuver: 'straight',
                    route_context: 'InsideBuilding',
                    start_location: { zLevel: 0, floor_name: '0', lat: 57.0580794, lng: 9.9504232 },
                    travel_mode: 'WALKING'
                },
                {
                    distance: { text: '3 m', value: 3 },
                    duration: { text: '0 mins', value: 2 },
                    end_location: { zLevel: 0, floor_name: '0', lat: 57.0581098, lng: 9.9505663 },
                    geometry: { type: 'LineString', coordinates: Array(2) },
                    highway: 'footway',
                    html_instructions: null,
                    maneuver: 'turn-right',
                    route_context: 'InsideBuilding',
                    start_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
                    travel_mode: 'WALKING'
                }
            ]
        }

    ]

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
        takeElevatorToLevel: 'Take elevator to level',
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

    const totalSteps = allSteps.length

    return (
        <div className='route-instructions'>
            <mi-route-instructions-step
                step={JSON.stringify(allSteps[activeStep - 1])}
                key={activeStep}
                translations={JSON.stringify(translations)}
                hideIndoorSubsteps={false}
                fromRouteContext='Outside'>
            </mi-route-instructions-step>
            <div className='route-instructions__progress'>
                {allSteps.map(({ id }) => (
                    <>
                    <div className={`route-instructions__step ${activeStep >= id ? 'completed' : ''}`} key={id}>
                        <div className="step-counter"></div>
                    </div>
                    </>
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
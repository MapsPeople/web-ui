import { useEffect, useRef } from 'react'
import './RouteInstructions.scss';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import directionsResponseState from '../../atoms/directionsResponseState';
import activeStepState from '../../atoms/activeStep';
import RouteInstructionsStep from '../WebComponentWrappers/RouteInstructionsStep/RouteInstructionsStep';
import substepsToggledState from '../../atoms/substepsToggledState';
import isDestinationStepState from '../../atoms/isDestinationStepState';
import PropTypes from 'prop-types';

RouteInstructions.propTypes = {
    steps: PropTypes.array,
    previous: PropTypes.object,
    originLocation: PropTypes.object,
    isOpen: PropTypes.bool
};

/**
 * Route instructions step by step component.
 *
 * @param {Object} props
 * @param {array} props.steps - The steps array passed after the directions are set.
 * @param {object} props.previous - The previous step used to show the correct instruction and travel mode.
 * @param {object} props.originLocation - The initial location where the route starts from.
 * @param {boolean} props.isOpen - Indicates if the directions view is open.
 *
 * @returns
 */
function RouteInstructions({ steps, previous, originLocation, isOpen }) {

    const routeInstructionsRef = useRef();

    const activeStep = useRecoilValue(activeStepState);

    const directions = useRecoilValue(directionsResponseState);

    const substepsOpen = useRecoilValue(substepsToggledState);

    const setIsDestinationStep = useSetRecoilState(isDestinationStepState);

    /**
     * Get the zoom and the center of the destination step.
     */
    useEffect(() => {
        if (isOpen) {
            if (activeStep === steps?.length - 1 && directions?.destinationLocation) {
                setIsDestinationStep(true);
            } else {
                setIsDestinationStep(false);
            }

            if (substepsOpen === false) {
                routeInstructionsRef.current?.closeSubsteps();
            } else if (substepsOpen === true) {
                routeInstructionsRef.current?.openSubsteps();
            }
        }
    }, [isOpen, activeStep, steps, substepsOpen]);

    return (
        <div className="route-instructions prevent-scroll">
            {steps?.length > 0 &&
                <RouteInstructionsStep
                    totalSteps={steps}
                    activeStep={activeStep}
                    previous={previous}
                    directions={directions}
                    originLocation={originLocation}
                    ref={routeInstructionsRef}
                >
                </RouteInstructionsStep>
            }
        </div>
    )
}

export default RouteInstructions

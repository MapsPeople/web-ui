import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import substepsToggledState from '../../../atoms/substepsToggledState';
import triggerSubstepsState from '../../../atoms/triggerSubstepsState';
import { useIsKioskContext } from '../../../hooks/useIsKioskContext';
import PropTypes from 'prop-types';

/**
 * React wrapper around the custom element <mi-route-instructions-step>.
 *
 * @param {object} props
 * @param {object} translations - The text to be displayed on the instructions steps.
 * @param {array} totalSteps - The total steps to be rendered.
 * @param {number} activeStep - The current step to be shown.
 * @param {object} previous - The previous step.
 * @param {object} originLocation - The origin location when starting the directions.
 * @param {object} directions - The directions object.
 *
 */
const RouteInstructionsStep = forwardRef(function RouteInstructionsStepComponent(props, ref) {
    const { totalSteps, activeStep, previous, originLocation, directions } = props;
    const elementRef = useRef();

    const { t } = useTranslation();

    const [substepsOpen, setSubstepsOpen] = useRecoilState(substepsToggledState);
    const [, setTriggerSubsteps] = useRecoilState(triggerSubstepsState);

    const isKioskContext = useIsKioskContext();

    /**
     * Method that can be triggered on the element.
     */
    useImperativeHandle(ref, () => ({
        openSubsteps() {
            elementRef.current.openSubsteps();
        },
        closeSubsteps() {
            elementRef.current.closeSubsteps();
        }
    }));

    // Translations required for the mi-route-instructions-step component
    const translations = {
        walk: t('Walk'),
        bike: t('Bike'),
        transit: t('Transit'),
        drive: t('Drive'),
        destination: t('You have arrived'),
        leave: t('Leave'),
        from: t('From'),
        park: t('Park'),
        at: t('at'),
        building: t('Building'),
        venue: t('Venue'),
        takeStaircaseToLevel: t('Take staircase to level'),
        takeLadderToLevel: t('Take the ladder to level'),
        takeElevatorToLevel: t('Take elevator to level'),
        takeEscalatorToLevel: t('Take escalator to level'),
        takeWheelchairLiftToLevel: t('Take wheelchair lift to level'),
        takeWheelchairRampToLevel: t('Take wheelchair ramp to level'),
        exit: t('Exit'),
        enter: t('Enter'),
        stops: t('stops'),
        andContinue: t('and continue'),
        continueStraightAhead: t('Continue straight ahead'),
        goLeft: t('Go left'),
        goSharpLeft: t('Go sharp left'),
        goSlightLeft: t('Go slight left'),
        goRight: t('Go right'),
        goSharpRight: t('Go sharp right'),
        goSlightRight: t('Go slight right'),
        turnAround: t('Turn around'),
        days: t('d'),
        hours: t('h'),
        minutes: t('min'),
        rideTheBus: t('Ride the bus')
    };

    useEffect(() => {
        const { current } = elementRef;

        function onSubstepsToggled() {
            setTriggerSubsteps(true);
            setSubstepsOpen(!substepsOpen);
        }

        current.addEventListener('substepsToggled', onSubstepsToggled);

        return () => {
            current.removeEventListener('substepsToggled', onSubstepsToggled);
        }
    }, [substepsOpen]);


    return <mi-route-instructions-step
        ref={elementRef}
        show-toggle-button={!isKioskContext}
        step={JSON.stringify(totalSteps[activeStep])}
        translations={JSON.stringify(translations)}
        destination-location={directions?.destinationLocation.properties.name}
        from-travel-mode={previous?.travel_mode ?? ""}
        from-route-context={previous?.route_context ?? originLocation?.properties?.name ?? ""}>
    </mi-route-instructions-step>
});

RouteInstructionsStep.propTypes = {
    totalSteps: PropTypes.array,
    activeStep: PropTypes.number,
    previous: PropTypes.object,
    originLocation: PropTypes.object,
    directions: PropTypes.object
};

export default RouteInstructionsStep;

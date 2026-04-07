import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useSetRecoilState } from 'recoil';
import substepsToggledState from '../../../atoms/substepsToggledState';
import triggerSubstepsState from '../../../atoms/triggerSubstepsState';
import { useIsKioskContext } from '../../../hooks/useIsKioskContext';
import PropTypes from 'prop-types';

const RouteInstructionsStepHeader = forwardRef(function RouteInstructionsStepHeaderComponent(props, ref) {
    const { totalSteps, activeStep, previous, originLocation } = props;
    const elementRef = useRef();

    const { t } = useTranslation();
    const [substepsOpen, setSubstepsOpen] = useRecoilState(substepsToggledState);
    const setTriggerSubsteps = useSetRecoilState(triggerSubstepsState);
    const isKioskContext = useIsKioskContext();

    useImperativeHandle(ref, () => ({
        openSubsteps() {
            elementRef.current.openSubsteps();
        },
        closeSubsteps() {
            elementRef.current.closeSubsteps();
        }
    }));

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

    return <mi-route-instructions-step-header
        ref={elementRef}
        show-toggle-button={!isKioskContext}
        step={JSON.stringify(totalSteps[activeStep])}
        translations={JSON.stringify(translations)}
        from-travel-mode={previous?.travel_mode ?? ''}
        from-route-context={previous?.route_context ?? originLocation?.properties?.name ?? ''}>
    </mi-route-instructions-step-header>;
});

RouteInstructionsStepHeader.propTypes = {
    totalSteps: PropTypes.array,
    activeStep: PropTypes.number,
    previous: PropTypes.object,
    originLocation: PropTypes.object
};

export default RouteInstructionsStepHeader;

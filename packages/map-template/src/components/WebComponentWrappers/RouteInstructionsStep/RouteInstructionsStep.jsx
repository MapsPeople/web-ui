import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useRecoilState } from 'recoil';
import substepsToggledState from '../../../atoms/substepsToggledState';
import triggerSubstepsState from '../../../atoms/triggerSubstepsState';
import kioskLocationState from '../../../atoms/kioskLocationState';

/**
 * React wrapper around the custom element <mi-route-instructions-step>.
 *
 * @param {object} props
 * @param {object} translations - The text to be displayed on the instructions steps.
 * @param {object} totalSteps - The total steps to be rendered.
 * @param {object} activeStep - The current step to be shown.
 * @param {object} previous - The previous step.
 * @param {object} originLocation - The origin location when starting the directions.
 * @param {object} directions - The directions object.
 *
 */
const RouteInstructionsStep = forwardRef(({ translations, totalSteps, activeStep, previous, originLocation, directions }, ref) => {
    const elementRef = useRef();

    const [substepsOpen, setSubstepsOpen] = useRecoilState(substepsToggledState);
    const [, setTriggerSubsteps] = useRecoilState(triggerSubstepsState);

    const kioskLocation = useRecoilState(kioskLocationState);

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
        show-toggle-button={kioskLocation[0] === undefined ? true : false}
        step={JSON.stringify(totalSteps[activeStep])}
        translations={JSON.stringify(translations)}
        destination-location={directions?.destinationLocation.properties.name}
        from-travel-mode={previous?.travel_mode ?? ""}
        from-route-context={previous?.route_context ?? originLocation?.properties?.name ?? ""}>
    </mi-route-instructions-step>
});

export default RouteInstructionsStep;

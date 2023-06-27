import { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import substepsToggledState from '../../../atoms/substepsToggledState';

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
function RouteInstructionsStep({ translations, totalSteps, activeStep, previous, originLocation, directions }) {
    const elementRef = useRef();

    const [substeps, setSubsteps] = useRecoilState(substepsToggledState);

    useEffect(() => {
        const { current } = elementRef;

        function onSubstepsToggled() {
            current.substepsAreOpen = !current.substepsAreOpen
            setSubsteps(current.substepsAreOpen);
        }

        current.addEventListener('substepsToggled', onSubstepsToggled);

        return () => {
            current.removeEventListener('substepsToggled', onSubstepsToggled);
        }
    }, []);

    return <mi-route-instructions-step
        ref={elementRef}
        step={JSON.stringify(totalSteps[activeStep])}
        translations={JSON.stringify(translations)}
        destination-location={directions?.destinationLocation.properties.name}
        from-travel-mode={previous?.travel_mode ?? ""}
        substeps-are-open={substeps}
        from-route-context={previous?.route_context ?? originLocation?.properties?.name ?? ""}>
    </mi-route-instructions-step>

};

export default RouteInstructionsStep;

import { useEffect, useRef } from 'react';

/**
 * React wrapper around the custom element <mi-search>.
 *
 * @param {object} props
 * @param {object} translations - The text to be displayed on the instructions steps.
 * @param {object} totalSteps - The total steps to be rendered.
 * @param {object} activeStep - The current step to be shown.
 * @param {object} previous - The previous step.
 * @param {object} originLocation - The origin location when starting the directions.
 * @param {object} directions - The directions object.
 * @param {function} substepsToggled - Callback function triggered when the substeps button is toggled.
 *
 */
function RouteInstructionsStep({ translations, totalSteps, activeStep, previous, originLocation, substepsToggled, directions }) {
    const elementRef = useRef();

    useEffect(() => {
        const clickHandler = customEvent => substepsToggled(customEvent.detail);

        const { current } = elementRef;

        current.addEventListener('substepsToggled', clickHandler);

        return () => {
            current.removeEventListener('substepsToggled', clickHandler);
        }

    }, [substepsToggled]);

    return <mi-route-instructions-step
        ref={elementRef}
        step={JSON.stringify(totalSteps[activeStep])}
        translations={JSON.stringify(translations)}
        destination-location={directions?.destinationLocation.properties.name}
        from-travel-mode={previous?.travel_mode ?? ""}
        from-route-context={previous?.route_context ?? originLocation?.properties?.name ?? ""}>
    </mi-route-instructions-step>

};

export default RouteInstructionsStep;

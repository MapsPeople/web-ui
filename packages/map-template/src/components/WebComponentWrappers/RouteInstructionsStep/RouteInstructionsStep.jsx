import { useEffect, useRef } from 'react';

/**
 * React wrapper around the custom element <mi-search>.
 *
 * @param {object} props
 * @param {object} translations
 * @param {object} steps
 * @param {object} activeStep
 * @param {object} previous
 * @param {object} originLocation
 * @param {function} substepsToggled
 *
 */
function RouteInstructionsStep({ translations, steps, activeStep, previous, originLocation, substepsToggled }) {
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
        step={JSON.stringify(steps[activeStep])}
        translations={JSON.stringify(translations)}
        from-travel-mode={previous?.travel_mode ?? ""}
        from-route-context={previous?.route_context ?? originLocation?.properties?.name ?? ""}>
    </mi-route-instructions-step>

};

export default RouteInstructionsStep;

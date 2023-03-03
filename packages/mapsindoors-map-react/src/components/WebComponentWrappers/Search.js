import { useEffect, useRef } from 'react';

/**
 * React wrapper around the custom element <mi-search>.
 *
 * @param {object} props
 * @param {string} props.placeholder - Placeholder in search field.
 * @param {boolean} props.mapsindoors - Set to true to search in MapsIndoors Locations.
 * @param {function} props.results - Function that is called when search results are received.
 * @param {function} props.clicked - Function
 * @param {function} props.cleared
 */
function SearchField({ placeholder, mapsindoors, results, clicked, cleared }) {
    const elementRef = useRef();

    useEffect(() => {
        const searchResultsHandler = customEvent => results(customEvent.detail);

        const { current } = elementRef;

        if (mapsindoors === true) {
            current.mapsindoors = 'true';
        }

        current.addEventListener('results', searchResultsHandler);
        current.addEventListener('click', clicked);
        current.addEventListener('cleared', cleared);

        return () => {
            current.removeEventListener('results', searchResultsHandler);
            current.removeEventListener('click', clicked);
            current.removeEventListener('cleared', cleared);
        }

    }, [placeholder, mapsindoors, results, clicked, cleared]);

    return <mi-search ref={elementRef} placeholder={placeholder} />
}

export default SearchField;

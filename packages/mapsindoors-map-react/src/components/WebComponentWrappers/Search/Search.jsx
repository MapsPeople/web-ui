import { useEffect, useRef } from 'react';

/**
 * React wrapper around the custom element <mi-search>.
 *
 * @param {object} props
 * @param {string} props.placeholder - Placeholder in search field.
 * @param {boolean} props.mapsindoors - Set to true to search in MapsIndoors Locations.
 * @param {function} props.results - Function that is called when search results are received.
 * @param {function} props.clicked - Function that is called when search field is clicked.
 * @param {function} props.cleared - Function that is called when search field is cleared.
 * @param {boolean} props.clear - Programatically clear the search field.
 * @param {string} props.displayText - Display text in the search field when the user selects a result.
 * @param {boolean} props.hasInputFocus - If set to true, it will set focus to the input field.
 *
 */
function SearchField({ placeholder, mapsindoors, results, clicked, cleared, clear, displayText, hasInputFocus }) {
    const elementRef = useRef();

    useEffect(() => {
        const searchResultsHandler = customEvent => results(customEvent.detail);

        const { current } = elementRef;

        if (mapsindoors === true) {
            current.mapsindoors = 'true';
        }

        if (clear === true) {
            current.clear();
        }

        if (displayText) {
            current.setDisplayText(displayText);
        }

        if (hasInputFocus && !current.value) {
            current.focusInput();
        }

        current.addEventListener('results', searchResultsHandler);
        current.addEventListener('click', clicked);
        current.addEventListener('cleared', cleared);

        return () => {
            current.removeEventListener('results', searchResultsHandler);
            current.removeEventListener('click', clicked);
            current.removeEventListener('cleared', cleared);
        }

    }, [placeholder, mapsindoors, results, clicked, cleared, displayText, hasInputFocus]);



    return <mi-search ref={elementRef} placeholder={placeholder} />
}

export default SearchField;

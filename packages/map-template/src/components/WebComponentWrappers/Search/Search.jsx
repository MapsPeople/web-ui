import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import useNear from '../../../hooks/useNear';

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
 * @param {boolean} props.hasInputFocus - If set to true, it will set focus to the input field.
 * @param {string} props.category - If set, search will be performed for Locations having this category.
 */
const SearchField = forwardRef(({ placeholder, mapsindoors, results, clicked, cleared, hasInputFocus, category }, ref) => {
    const elementRef = useRef();

    /** Instruct the search field to search for Locations near the map center. */
    const searchNear = useNear();

    /**
     * Methods that can be triggered on the mi-search element.
     */
    useImperativeHandle(ref, () => ({
        triggerSearch() {
            elementRef.current.triggerSearch()
        },
        getValue() {
            return elementRef.current.value;
        },
        setDisplayText(displayText) {
            elementRef.current.setDisplayText(displayText);
        }
    }));

    useEffect(() => {
        const searchResultsHandler = customEvent => results(customEvent.detail);

        const { current } = elementRef;

        if (mapsindoors === true) {
            current.mapsindoors = 'true';
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

    }, [placeholder, mapsindoors, results, clicked, cleared, hasInputFocus]);

    return <mi-search ref={elementRef} placeholder={placeholder} mi-near={searchNear} mi-categories={category}  />
});

export default SearchField;

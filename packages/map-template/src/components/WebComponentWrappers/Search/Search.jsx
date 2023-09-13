import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import useNear from '../../../hooks/useNear';
import { useRecoilValue } from 'recoil';
import mapboxAccessTokenState from '../../../atoms/mapboxAccessTokenState';

/**
 * React wrapper around the custom element <mi-search>.
 *
 * @param {object} props
 * @param {string} props.placeholder - Placeholder in search field.
 * @param {boolean} props.mapsindoors - Set to true to search in MapsIndoors Locations.
 * @param {function} props.results - Function that is called when search results are received.
 * @param {function} props.clicked - Function that is called when search field is clicked.
 * @param {function} props.cleared - Function that is called when search field is cleared.
 * @param {string} props.category - If set, search will be performed for Locations having this category.
 * @param {boolean} props.preventFocus - If set to true, the search field will be disabled.
 * @param {boolean} props.google - Set to true to include results from Google Places autocomplete service.
 * @param {boolean} props.mapbox - Set to true to include results from Mapbox Places autocomplete service.
 */
const SearchField = forwardRef(({ placeholder, mapsindoors, results, clicked, cleared, category, google, mapbox, disabled = false }, ref) => {
    const elementRef = useRef();

    const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);

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
        },
        focusInput() {
            elementRef.current.focusInput();
        },
        clear() {
            elementRef.current.clear();
        }
    }));

    useEffect(() => {
        const searchResultsHandler = customEvent => results(customEvent.detail);

        const { current } = elementRef;

        if (mapsindoors === true) {
            current.mapsindoors = 'true';
        }

        function onCleared() {
            if (!current.getValue) {
                current.focusInput();
            }
            cleared();
        }

        current.addEventListener('results', searchResultsHandler);
        current.addEventListener('click', clicked);
        current.addEventListener('cleared', onCleared);

        return () => {
            current.removeEventListener('results', searchResultsHandler);
            current.removeEventListener('click', clicked);
            current.removeEventListener('cleared', onCleared);
        }

    }, [placeholder, mapsindoors, results, clicked, cleared, google, mapbox]);

    return <mi-search ref={elementRef}
        placeholder={placeholder}
        mapbox-access-token={mapboxAccessToken}
        mi-near={searchNear}
        mi-categories={category}
        disabled={disabled}
        mapbox={mapbox}
        google={google} />
});

export default SearchField;

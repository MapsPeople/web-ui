import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import useNear from '../../../hooks/useNear';
import { useRecoilValue, useRecoilState } from 'recoil';
import userPositionState from '../../../atoms/userPositionState';
import languageState from '../../../atoms/languageState';
import searchInputState from '../../../atoms/searchInputState';
import currentVenueNameState from '../../../atoms/currentVenueNameState';
import searchAllVenuesState from '../../../atoms/searchAllVenues';
import PropTypes from 'prop-types';

/**
 * React wrapper around the custom element <mi-search>.
 *
 * @param {object} props
 * @param {string} props.placeholder - Placeholder in search field.
 * @param {boolean} props.mapsindoors - Set to true to search in MapsIndoors Locations.
 * @param {function} props.results - Function that is called when search results are received.
 * @param {function} props.clicked - Function that is called when search field is clicked.
 * @param {function} props.cleared - Function that is called when search field is cleared.
 * @param {function} props.changed - Function that is called when value of the input field is changed.
 * @param {string} props.category - If set, search will be performed for Locations having this category.
 * @param {boolean} props.preventFocus - If set to true, the search field will be disabled.
 * @param {boolean} props.google - Set to true to include results from Google Places autocomplete service.
 * @param {boolean} props.mapbox - Set to true to include results from Mapbox Places autocomplete service.
 */
const SearchField = forwardRef(function SearchFieldComponent(props, ref) {
    const { placeholder, mapsindoors, results, clicked, cleared, changed, category, google, mapbox, disabled = false } = props;
    const elementRef = useRef();

    const userPosition = useRecoilValue(userPositionState);
    const language = useRecoilValue(languageState);

    const [, setSearchInput] = useRecoilState(searchInputState)

    const mapboxPlacesSessionToken = sessionStorage.getItem('mapboxPlacesSessionToken');

    const userPositionCoordinates = {
        longitude: userPosition?.coords.longitude,
        latitude: userPosition?.coords.latitude,
    }

    /** Instruct the search field to search for Locations near the map center. */
    const searchNear = useNear();

    const currentVenueName = useRecoilValue(currentVenueNameState);

    const searchAllVenues = useRecoilValue(searchAllVenuesState);

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
        },
        getInputField() {
            return elementRef.current.getInputField().then((searchInput) => setSearchInput(searchInput));
        }
    }));

    useEffect(() => {
        const { current } = elementRef;

        if (current.value) {
            window.mapsindoors.services.LocationsService.once('update_completed', () => {
                current.triggerSearch();
            });
        }
    }, [language]);

    useEffect(() => {
        const searchResultsHandler = customEvent => results(customEvent.detail);
        const onCleared = () => cleared();

        const { current } = elementRef;

        if (mapsindoors === true) {
            current.mapsindoors = 'true';
        }

        current.addEventListener('results', searchResultsHandler);
        current.addEventListener('click', clicked);
        current.addEventListener('cleared', onCleared);
        current.addEventListener('changed', changed);

        return () => {
            current.removeEventListener('results', searchResultsHandler);
            current.removeEventListener('click', clicked);
            current.removeEventListener('cleared', onCleared);
            current.removeEventListener('changed', changed);
        }

    }, [placeholder, mapsindoors, results, clicked, cleared, google, mapbox, changed]);

    return <mi-search ref={elementRef}
        id-attribute='search'
        placeholder={placeholder}
        session-token={mapboxPlacesSessionToken}
        user-position={(userPositionCoordinates.latitude !== undefined && userPositionCoordinates.longitude !== undefined) ? Object.values(userPositionCoordinates).join(',') : null}
        mi-near={searchNear}
        mi-categories={category}
        disabled={disabled}
        mapbox={mapbox}
        google={google}
        mi-venue={searchAllVenues ? undefined : currentVenueName}
        language={language} />
});

SearchField.propTypes = {
    placeholder: PropTypes.string,
    mapsindoors: PropTypes.bool,
    results: PropTypes.func,
    clicked: PropTypes.func,
    cleared: PropTypes.func,
    changed: PropTypes.func,
    category: PropTypes.string,
    preventFocus: PropTypes.bool,
    google: PropTypes.bool,
    mapbox: PropTypes.bool,
    disabled: PropTypes.bool
};

export default SearchField;

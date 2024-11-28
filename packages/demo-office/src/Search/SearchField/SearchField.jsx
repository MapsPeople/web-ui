import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import fakeData from '../../fakeData';

SearchField.propTypes = {
    onResults: PropTypes.func,
    onClear: PropTypes.func,
};

/**
 * This component is a wrapper around the custom element `<mi-search>`.
 *
 * It can be used to search for Locations in the MapsIndoors data.
 *
 * See {@link https://components.mapsindoors.com/search/ mi-search documentation}
 *
 * The wrapper component is needed because the `<mi-search>` element is cumbersome to use directly, since the
 * custom events it emits cannot easily be listened to in React.
 *
 * @param {*} props
 * @param {function} props.onResults - Callback for when search results are received.
 * @param {function} props.onClear - Callback for when the search field is cleared.
 */
function SearchField({ onResults, onClear }) {

    const elementRef = useRef(null);

    /*
     * Add event listeners for the custom events emitted by the <mi-search> component.
     */
    useEffect(() => {
        const searchResultsHandler = customEvent => onResults(customEvent.detail);
        const clearHandler = () => onClear();

        const { current } = elementRef;

        current.addEventListener('results', searchResultsHandler);
        current.addEventListener('cleared', clearHandler);

        // Clean up event listeners when the component is unmounted.
        return () => {
            current.removeEventListener('results', searchResultsHandler);
            current.removeEventListener('cleared', clearHandler);
        }
    }, [onResults, onClear]);

    return <mi-search
        ref={elementRef}
        mapsindoors="true" // Enable MapsIndoors search.
        placeholder="Search..." // Placeholder text for the search field when nothing is entered.
        mi-near={fakeData.devicePosition.lat + ',' + fakeData.devicePosition.lng} // Search for Locations near the fake device position.
        mi-venue={fakeData.startPosition.venueAdministrativeID} // Search for Locations within this venue only.
    />
}

export default SearchField;

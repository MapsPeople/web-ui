import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';


SearchResult.propTypes = {
    location: PropTypes.object,
    mapsIndoorsInstance: PropTypes.object,
    locationClicked: PropTypes.func
};

/**
 * This component is a wrapper around the custom element <mi-list-item-location>.
 * This is needed because the <mi-list-item-location> takes a Location object as a prop, and the Location object cannot be passed directly from React.
 * Instead, we need to pass the Location object to the custom element through a ref.
 *
 * @param {*} props
 * @param {Object} props.location - MapsIndoors Location object.
 * @param {Object} props.mapsIndoorsInstance - MapsIndoors instance.
 * @param {function} props.locationClicked - Function that is called when the Location is clicked.
 * @returns
 */
function SearchResult({ location, mapsIndoorsInstance, locationClicked }) {

    const elementRef = useRef();

    useEffect(() => {
        // Event listener for when a search result is clicked. Calls the locationClicked function with the clicked location.
        const clickHandler = customEvent => locationClicked(customEvent.detail);

        const { current } = elementRef;

        // Set the location object and icon on the custom element.
        current.location = location;
        current.icon = mapsIndoorsInstance.getDisplayRule(location).icon;

        current.addEventListener('locationClicked', clickHandler);

        // Clean up event listeners when the component is unmounted.
        return () => {
            current.removeEventListener('locationClicked', clickHandler);
        };

    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <mi-list-item-location ref={elementRef} />
    );
}

export default SearchResult;

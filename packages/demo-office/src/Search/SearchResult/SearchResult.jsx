import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';


SearchResult.propTypes = {
    location: PropTypes.object,
    mapsIndoorsInstance: PropTypes.object,
    locationClicked: PropTypes.func,
    isHovered: PropTypes.bool
};

/**
 * This component is a wrapper around the custom element <mi-list-item-location>.
 *
 * It can be used to present a MapsIndoors Location in a list of search results.
 *
 * See {@link https://components.mapsindoors.com/list-item-location/ mi-list-item-location documentation}
 *
 * This is needed because the <mi-list-item-location> takes a Location object as a prop, and the Location object cannot be passed directly from React.
 * Instead, we need to pass the Location object to the custom element through a ref.
 *
 * @param {*} props
 * @param {Object} props.location - MapsIndoors Location object.
 * @param {Object} props.mapsIndoorsInstance - MapsIndoors instance.
 * @param {function} props.locationClicked - Function that is called when the Location is clicked.
 * @returns
 */
function SearchResult({ location, mapsIndoorsInstance, locationClicked, isHovered }) {

    const elementRef = useRef();

    useEffect(() => {
        // Event listener for when a search result is clicked. Calls the locationClicked function with the clicked location.
        const clickHandler = customEvent => locationClicked(customEvent.detail);

        const hoverHandler = () => {
            // Check if the location is non-selectable before hovering it
            if (location.properties.locationSettings?.selectable !== false) {
                mapsIndoorsInstance.hoverLocation(location);
            }
        };
        const unhoverHandler = () => {
            // Check if the location is non-selectable before unhovering it
            if (!location.properties.locationSettings?.selectable !== false) {
                mapsIndoorsInstance.unhoverLocation(location);
            }
        };

        const { current } = elementRef;

        // Set the location object and icon on the custom element.
        current.location = location;
        current.icon = mapsIndoorsInstance.getDisplayRule(location).icon;

        current.addEventListener('locationClicked', clickHandler);
        current.addEventListener('mouseover', hoverHandler);
        current.addEventListener('mouseout', unhoverHandler);

        // Clean up event listeners when the component is unmounted.
        return () => {
            current.removeEventListener('locationClicked', clickHandler);
            current.removeEventListener('mouseover', hoverHandler);
            current.removeEventListener('mouseout', unhoverHandler);
        };

    }, [location]);

    /*
     * Add a class to the element when the location is hovered.
     */
    useEffect(() => {
        if (isHovered) {
            elementRef.current.classList.add('hovered');
        } else {
            elementRef.current.classList.remove('hovered');
        }
    }, [isHovered]);

    return (
        <mi-list-item-location ref={elementRef} />
    );
}

export default SearchResult;

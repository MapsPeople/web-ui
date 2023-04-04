import { useContext, useEffect, useRef, useState } from 'react';
import { MapsIndoorsContext } from '../../../MapsIndoorsContext';

/**
 * React wrapper around the custom element <mi-list-item-location>.
 *
 * @param {object} props
 * @param {object} location - MapsIndoors Location
 * @param {function} locationClicked - Function that is called when Location is clicked.
 */
function ListItemLocation({ location, locationClicked }) {
    const elementRef = useRef();

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    useEffect(() => {
        const clickHandler = customEvent => locationClicked(customEvent.detail);

        const { current } = elementRef;

        current.location = location;
        current.icon = mapsIndoorsInstance.getDisplayRule(location).icon;
        current.addEventListener('locationClicked', clickHandler);

        return () => current.removeEventListener('locationClicked', clickHandler);
    }, [location, locationClicked]);


    return <mi-list-item-location ref={elementRef} />
}

export default ListItemLocation;

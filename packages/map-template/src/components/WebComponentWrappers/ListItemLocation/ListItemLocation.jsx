import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';

/**
 * React wrapper around the custom element <mi-list-item-location>.
 *
 * @param {object} props
 * @param {object} location - MapsIndoors Location
 * @param {function} locationClicked - Function that is called when Location is clicked.
 * @param {string} icon
 */
function ListItemLocation({ location, locationClicked, icon, isHovered }) {
    const elementRef = useRef();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    useEffect(() => {
        const clickHandler = customEvent => locationClicked(customEvent.detail);
        const hoverHandler = () => {
            mapsIndoorsInstance.hoverLocation(location);
        }
        const unhoverHandler = () => {
            mapsIndoorsInstance.unhoverLocation(location);
        }

        const { current } = elementRef;

        current.location = location;

        current.icon = icon ? icon : mapsIndoorsInstance.getDisplayRule(location).icon;

        current.addEventListener('locationClicked', clickHandler);
        current.addEventListener('mouseover', hoverHandler)
        current.addEventListener('mouseout', unhoverHandler)

        if (isHovered) {
            elementRef.current.classList.add('hovered')
        } else {
            elementRef.current.classList.remove('hovered')
        }

        return () => {
            current.removeEventListener('locationClicked', clickHandler);
            current.removeEventListener('mouseover', hoverHandler);
            current.removeEventListener('mouseout', unhoverHandler)
        }
    }, [location, locationClicked, isHovered]);


    return <mi-list-item-location ref={elementRef} />
}

export default ListItemLocation;

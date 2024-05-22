import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import { useTranslation } from 'react-i18next';
import './ListItemLocation.scss';

/**
 * React wrapper around the custom element <mi-list-item-location>.
 *
 * @param {object} props
 * @param {object} location - MapsIndoors Location
 * @param {function} locationClicked - Function that is called when Location is clicked.
 * @param {string} icon - The icon to be shown in the list item location component.
 */
function ListItemLocation({ location, locationClicked, icon, isHovered }) {
    const { t } = useTranslation();
    const elementRef = useRef();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    useEffect(() => {
        const clickHandler = customEvent => locationClicked(customEvent.detail);
        const hoverHandler = () => {
            // Check if the location is non-selectable (either set on the Location or inherited from the type) before hovering it.
            if (location.properties.locationSettings?.selectable !== false || location.properties.locationSettings?.selectable !== null) {
                mapsIndoorsInstance.hoverLocation(location);
            }
        }
        const unhoverHandler = () => {
            // Check if the location is non-selectable (either set on the Location or inherited from the type) from type before unhovering it.
            if (!location.properties.locationSettings?.selectable !== false || !location.properties.locationSettings?.selectable !== null) {
                mapsIndoorsInstance.unhoverLocation(location);
            }
        }

        // Add a "non-selectable" class to the non-selectable (either set on the Location or inherited from the type) from type locations.
        if (location.properties.locationSettings?.selectable === false || location.properties.locationSettings?.selectable === null) {
            elementRef.current.classList.add("non-selectable");
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


    return <mi-list-item-location level={t('Level')} ref={elementRef} show-external-id={false} />
}

export default ListItemLocation;

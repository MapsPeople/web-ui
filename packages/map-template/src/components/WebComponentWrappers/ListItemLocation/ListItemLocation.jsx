import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import { useTranslation } from 'react-i18next';
import './ListItemLocation.scss';
import showExternalIDsState from '../../../atoms/showExternalIDsState';
import PropTypes from 'prop-types';

ListItemLocation.propTypes = {
    location: PropTypes.object,
    locationClicked: PropTypes.func,
    icon: PropTypes.string,
    isHovered: PropTypes.bool
};

/**
 * React wrapper around the custom element <mi-list-item-location>.
 *
 * @param {object} props
 * @param {object} location - MapsIndoors Location
 * @param {function} locationClicked - Function that is called when Location is clicked.
 * @param {string} icon - The icon to be shown in the list item location component.
 * @param {boolean} isHovered - Check if the location is hovered.
 */
function ListItemLocation({ location, locationClicked, icon, isHovered }) {
    const { t } = useTranslation();
    const elementRef = useRef();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const showExternalIDs = useRecoilValue(showExternalIDsState);

    useEffect(() => {
        const clickHandler = customEvent => locationClicked(customEvent.detail);
        const hoverHandler = () => {
            // Check if the location is non-selectable before hovering it
            if (location.properties.locationSettings?.selectable !== false) {
                mapsIndoorsInstance.hoverLocation(location);
            }
        }
        const unhoverHandler = () => {
            // Check if the location is non-selectable before unhovering it
            if (!location.properties.locationSettings?.selectable !== false) {
                mapsIndoorsInstance.unhoverLocation(location);
            }
        }

        // Add a "non-selectable" class to the non-selectable locations.
        if (location.properties.locationSettings?.selectable === false) {
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


    return <mi-list-item-location level={t('Level')} ref={elementRef} show-external-id={showExternalIDs} />
}

export default ListItemLocation;

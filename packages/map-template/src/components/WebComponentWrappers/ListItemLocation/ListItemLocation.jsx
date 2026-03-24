import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import { useTranslation } from 'react-i18next';
import './ListItemLocation.scss';
import showExternalIDsState from '../../../atoms/showExternalIDsState';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

ListItemLocation.propTypes = {
    location: PropTypes.object,
    locationClicked: PropTypes.func,
    icon: PropTypes.string,
    isHovered: PropTypes.bool,
    disableHover: PropTypes.bool
};

/**
 * React wrapper around the custom element <mi-list-item-location>.
 *
 * @param {object} props
 * @param {object} location - MapsIndoors Location
 * @param {function} locationClicked - Function that is called when Location is clicked.
 * @param {string} icon - The icon to be shown in the list item location component.
 * @param {boolean} isHovered - Check if the location is hovered.
 * @param {boolean} disableHover - Disable hover functionality to prevent dual pins during routing.
 */
function ListItemLocation({ location, locationClicked, icon, isHovered, disableHover }) {
    const { t } = useTranslation();
    const elementRef = useRef();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const showExternalIDs = useRecoilValue(showExternalIDsState);

    useEffect(() => {
        const clickHandler = customEvent => {
            mapsIndoorsInstance.unhoverLocation();
            locationClicked(customEvent.detail);
        };
        const hoverHandler = debounce(() => {
            // Skip hover functionality if disabled (e.g., during routing to prevent dual pins)
            if (disableHover) return;
            
            // Check if the location is non-selectable before hovering it
            if (location.properties.locationSettings?.selectable !== false) {
                mapsIndoorsInstance.hoverLocation(location);
            }
        });
        const unhoverHandler = debounce(() => {
            // Skip unhover functionality if disabled
            if (disableHover) return;
            
            // Check if the location is non-selectable before unhovering it
            if (location.properties.locationSettings?.selectable !== false) {
                mapsIndoorsInstance.unhoverLocation(location);
            }
        });

        // Add a "non-selectable" class to the non-selectable locations.
        if (location.properties.locationSettings?.selectable === false) {
            elementRef.current.classList.add('non-selectable');
        }

        const { current } = elementRef;

        current.location = location;

        current.icon = icon ? icon : mapsIndoorsInstance.getDisplayRule(location).icon;

        current.addEventListener('locationClicked', clickHandler);
        
        // Only add hover listeners if hover is not disabled
        if (!disableHover) {
            current.addEventListener('mouseover', hoverHandler);
            current.addEventListener('mouseout', unhoverHandler);
        }

        if (isHovered) {
            elementRef.current.classList.add('hovered')
        } else {
            elementRef.current.classList.remove('hovered')
        }

        return () => {
            current.removeEventListener('locationClicked', clickHandler);
            
            // Only remove hover listeners if they were added
            if (!disableHover) {
                current.removeEventListener('mouseover', hoverHandler);
                current.removeEventListener('mouseout', unhoverHandler);
            }
        }
    }, [location, locationClicked, isHovered, disableHover]);


    return <mi-list-item-location level={t('Level')} ref={elementRef} show-external-id={showExternalIDs} />
}

export default ListItemLocation;

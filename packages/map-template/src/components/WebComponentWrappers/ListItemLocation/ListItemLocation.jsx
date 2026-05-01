import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import { useTranslation } from 'react-i18next';
import './ListItemLocation.scss';
import showExternalIDsState from '../../../atoms/showExternalIDsState';
import DirectionsArrowIcon from '../../../assets/directions-arrow.svg?react';
import PropTypes from 'prop-types';
ListItemLocation.propTypes = {
    location: PropTypes.object,
    locationClicked: PropTypes.func,
    icon: PropTypes.string,
    isHovered: PropTypes.bool,
    disableHover: PropTypes.bool,
    onRouteClick: PropTypes.func
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
 * @param {function} [onRouteClick] - When provided, renders a compact route button beside the
 *   list item. Invoked on click; click event is stopped from propagating so the underlying
 *   `locationClicked` handler does not also fire. Leave undefined to hide the button.
 */
function ListItemLocation({ location, locationClicked, icon, isHovered, disableHover, onRouteClick }) {
    const { t } = useTranslation();
    const elementRef = useRef();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const showExternalIDs = useRecoilValue(showExternalIDsState);

    useEffect(() => {
        const clickHandler = customEvent => {
            mapsIndoorsInstance.unhoverLocation();
            locationClicked(customEvent.detail);
        };
        const hoverHandler = () => {
            if (disableHover) return;
            if (location.properties.locationSettings?.selectable !== false) {
                mapsIndoorsInstance.hoverLocation(location);
            }
        };
        const unhoverHandler = () => {
            if (disableHover) return;
            if (location.properties.locationSettings?.selectable !== false) {
                mapsIndoorsInstance.unhoverLocation(location);
            }
        };

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


    const handleRouteClick = (event) => {
        event.stopPropagation();
        onRouteClick?.();
    };

    return (
        <div className="list-item-location">
            <mi-list-item-location level={t('Level')} ref={elementRef} show-external-id={showExternalIDs} />
            {onRouteClick && (
                <button
                    type="button"
                    className="list-item-location__route-button"
                    onClick={handleRouteClick}
                    aria-label={t('Get directions')}
                    title={t('Get directions')}
                >
                    <DirectionsArrowIcon aria-hidden="true" />
                </button>
            )}
        </div>
    );
}

export default ListItemLocation;

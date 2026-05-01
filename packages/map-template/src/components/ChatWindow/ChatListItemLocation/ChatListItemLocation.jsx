import { useEffect, useMemo, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import showExternalIDsState from '../../../atoms/showExternalIDsState';
import WalkIcon from '../../../assets/walk.svg?react';
import DirectionsArrowIcon from '../../../assets/directions-arrow.svg?react';
import './ChatListItemLocation.scss';

ChatListItemLocation.propTypes = {
    location: PropTypes.object.isRequired,
    locationClicked: PropTypes.func,
    durationSeconds: PropTypes.number,
    onRouteClick: PropTypes.func
};

/**
 * Converts a duration in seconds into a human-readable walking time string.
 * Returns null for invalid or missing input so callers can conditionally render.
 *
 * @param {number|null|undefined} seconds - Duration in seconds.
 * @param {Function} t - i18next translation function.
 * @returns {string|null} Formatted duration label, e.g. "< 1 min", "1 min", "5 mins".
 */
function formatWalkingDuration(seconds, t) {
    if (seconds == null || Number.isNaN(seconds)) return null;
    if (seconds < 60) return t('< 1 min');
    const minutes = Math.round(seconds / 60);
    return minutes === 1 ? t('1 min') : t('{{count}} mins', { count: minutes });
}

/**
 * Renders a single location card inside the chat window result list.
 * Shows the location icon, name, floor info, and optional walking duration.
 * When an `onRouteClick` handler is provided, a "Get directions" button is also shown.
 *
 * @param {object}   props
 * @param {object}   props.location          - MapsIndoors location object.
 * @param {Function} [props.locationClicked] - Called when the card is clicked (selectable locations only).
 * @param {number}   [props.durationSeconds] - Estimated walking time in seconds; omit to hide duration.
 * @param {Function} [props.onRouteClick]    - Called when the directions button is clicked; omit to hide button.
 */
function ChatListItemLocation({ location, locationClicked, durationSeconds, onRouteClick }) {
    const { t } = useTranslation();
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const showExternalIDs = useRecoilValue(showExternalIDsState);
    const locationInfoRef = useRef(null);

    const selectable = location?.properties?.locationSettings?.selectable !== false;
    const iconSrc = useMemo(() => {
        const displayRule = mapsIndoorsInstance?.getDisplayRule?.(location);
        return displayRule?.icon?.src || displayRule?.icon || null;
    }, [mapsIndoorsInstance, location]);
    const durationLabel = formatWalkingDuration(durationSeconds, t);

    useEffect(() => {
        if (locationInfoRef.current) {
            locationInfoRef.current.location = location;
        }
    }, [location]);

    /** Selects the location and clears any hover state. No-op for non-selectable locations. */
    const handleCardClick = () => {
        if (!selectable) return;
        mapsIndoorsInstance?.unhoverLocation?.();
        locationClicked?.();
    };

    /** Applies a hover highlight on the map marker when the cursor enters the card. */
    const handleMouseEnter = () => {
        if (!selectable) return;
        mapsIndoorsInstance?.hoverLocation?.(location);
    };

    /** Removes the hover highlight from the map marker when the cursor leaves the card. */
    const handleMouseLeave = () => {
        if (!selectable) return;
        mapsIndoorsInstance?.unhoverLocation?.(location);
    };

    /**
     * Handles the "Get directions" button click.
     * Stops propagation so the parent card click handler is not also triggered.
     *
     * @param {React.MouseEvent} event
     */
    const handleRouteClick = (event) => {
        event.stopPropagation();
        mapsIndoorsInstance?.unhoverLocation?.();
        onRouteClick?.();
    };

    return (
        <div
            className={`chat-list-item-location${selectable ? '' : ' chat-list-item-location--non-selectable'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                className="chat-list-item-location__card-button"
                onClick={handleCardClick}
                tabIndex={selectable ? 0 : -1}
            >
                {iconSrc && (
                    <div className="chat-list-item-location__icon">
                        <img src={iconSrc} alt="" />
                    </div>
                )}
                <div className="chat-list-item-location__body">
                    <div className="chat-list-item-location__title">{location.properties.name}</div>
                    <mi-location-info
                        level={t('Level')}
                        ref={locationInfoRef}
                        show-external-id={showExternalIDs}
                    />
                    {durationLabel && (
                        <div className="chat-list-item-location__duration">
                            <WalkIcon aria-hidden="true" />
                            <span>{durationLabel}</span>
                        </div>
                    )}
                </div>
            </button>
            {onRouteClick && (
                <button
                    type="button"
                    className="chat-list-item-location__route-button"
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

export default ChatListItemLocation;

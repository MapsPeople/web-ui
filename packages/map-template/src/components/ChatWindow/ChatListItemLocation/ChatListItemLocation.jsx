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

function formatWalkingDuration(seconds, t) {
    if (seconds == null || Number.isNaN(seconds)) return null;
    if (seconds < 60) return t('< 1 min');
    const minutes = Math.round(seconds / 60);
    return minutes === 1 ? t('1 min') : t('{{count}} mins', { count: minutes });
}

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

    const handleCardClick = () => {
        if (!selectable) return;
        mapsIndoorsInstance?.unhoverLocation?.();
        locationClicked?.();
    };

    const handleMouseEnter = () => {
        if (!selectable) return;
        mapsIndoorsInstance?.hoverLocation?.(location);
    };

    const handleMouseLeave = () => {
        if (!selectable) return;
        mapsIndoorsInstance?.unhoverLocation?.(location);
    };

    const handleRouteClick = (event) => {
        event.stopPropagation();
        onRouteClick?.();
    };

    return (
        <div
            className={`chat-list-item-location${selectable ? '' : ' chat-list-item-location--non-selectable'}`}
            onClick={handleCardClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role={selectable ? 'button' : undefined}
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

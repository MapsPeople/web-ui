import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './OpeningHours.scss';

OpeningHours.propTypes = {
    openingHours: PropTypes.object
};

/**
 * 
 * @param {object} props
 * @param {object} props.openingHours // Opening hours data
 * @returns 
 */
function OpeningHours({ openingHours }) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const currentDay = new Date().getDay();
    const weekdays = [
        t('Monday'),
        t('Tuesday'),
        t('Wednesday'),
        t('Thursday'),
        t('Friday'),
        t('Saturday'),
        t('Sunday')
    ];

    const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1;
    const { standardOpeningHours } = openingHours || {};

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getOperatingHoursForDay = (day) => {
        const dayData = standardOpeningHours?.[day.toLowerCase()];
        if (!dayData || dayData.closedAllDay) {
            return {
                text: t('Closed'),
                isClosed: true
            };
        }
        return {
            text: `${formatTime(dayData.startTime)} - ${formatTime(dayData.endTime)}`,
            isClosed: false
        };
    };

    // Keep useCallback as this involves time calculations
    const isCurrentlyOpen = useCallback((dayData) => {
        if (!dayData || dayData.closedAllDay) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHours, startMinutes] = dayData.startTime.split(':');
        const [endHours, endMinutes] = dayData.endTime.split(':');

        const startTime = parseInt(startHours) * 60 + parseInt(startMinutes);
        const endTime = parseInt(endHours) * 60 + parseInt(endMinutes);

        return currentTime >= startTime && currentTime <= endTime;
    }, []);

    const getCurrentDayStatus = useCallback(() => {
        const isOpen = isCurrentlyOpen(
            standardOpeningHours?.[weekdays[adjustedCurrentDay].toLowerCase()]
        );

        return isOpen ? t('Open') : t('Closed');
    }, [standardOpeningHours, weekdays, adjustedCurrentDay, isCurrentlyOpen, t]);

    const text = getCurrentDayStatus();

    return (
        <div className="opening-hours">
            <ul className="opening-hours__list">
                <li className="opening-hours__list-item opening-hours__list-item--current" onClick={() => setIsExpanded(!isExpanded)}>
                    <span className="opening-hours__time">
                        {getOperatingHoursForDay(weekdays[adjustedCurrentDay]).text}
                    </span>
                    <span className={`opening-hours__status-text opening-hours__status-text--${text.toLowerCase()}`}>
                        {text}
                    </span>
                </li>

                {isExpanded && weekdays.map((day) => {
                    const hours = getOperatingHoursForDay(day);
                    return (
                        <li key={day} className="opening-hours__list-item">
                            <span className="opening-hours__day">{day}</span>
                            <span className={`opening-hours__hours ${hours.isClosed ? 'opening-hours__hours--closed' : ''}`}>
                                {hours.text}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default memo(OpeningHours);

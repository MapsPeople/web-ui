import { memo, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './OpeningHours.scss';
import { ReactComponent as ClockIcon } from '../../assets/clock-light.svg';
import { ReactComponent as ChevronDownIcon } from '../../assets/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from '../../assets/chevron-up.svg';

OpeningHours.propTypes = {
    openingHours: PropTypes.object,
    isAmFormat: PropTypes.bool,
    isMondayFirstDayOfTheWeek: PropTypes.bool
};

/**
 * 
 * @param {object} props
 * @param {object} props.openingHours // Opening hours data
 * @param {boolean} [props.isAmFormat] // Whether to display time in AM/PM format
 * @param {boolean} [props.isMondayFirstDayOfTheWeek] // Whether Monday is the first day of the week
 * @returns 
 */
function OpeningHours({ openingHours, isAmFormat = false, isMondayFirstDayOfTheWeek = true }) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const currentDay = new Date().getDay(); // Get current day (0-6, Sunday is 0)
    // Create weekdays array with display order using useMemo
    const weekdays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(new Date(2024, 0, i + 1));
        }
        if (!isMondayFirstDayOfTheWeek) {
            const sunday = days.pop();
            days.unshift(sunday);
        }
        return days;
    }, [isMondayFirstDayOfTheWeek]);

    // Calculate adjusted current day index based on display order
    const adjustedCurrentDay = useMemo(() => {
        if (isMondayFirstDayOfTheWeek) {
            // When Monday is first (0-6, Monday is 0)
            return currentDay === 0 ? 6 : currentDay - 1;
        } else {
            // When Sunday is first (0-6, Sunday is 0)
            return currentDay;
        }
    }, [currentDay, isMondayFirstDayOfTheWeek]);

    const { standardOpeningHours } = openingHours || {};

    // Helper function that takes a time string (e.g., "09:00") and returns a formatted time string
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: isAmFormat
        });
    };

    // Helper function that takes a date object (day) and returns the opening hours information for that specific day.
    const getOpeningHoursForDay = (day) => {
        const dayName = day.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        const dayData = standardOpeningHours?.[dayName];
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

    // Determines if a location is currently open based on its operating hours
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

    /**
     * Determines if the location is currently open or closed based on the current day's operating hours.
     * Uses toLocaleString to convert a Date object into a weekday string (e.g., "monday", "tuesday", etc.)
     */
    const getCurrentDayStatus = useCallback(() => {
        const currentDayName = weekdays[adjustedCurrentDay]
            .toLocaleString('en-US', { weekday: 'long' })
            .toLowerCase();

        const isOpen = isCurrentlyOpen(standardOpeningHours?.[currentDayName]);

        return isOpen ? t('Open') : t('Closed');
    }, [standardOpeningHours, weekdays, adjustedCurrentDay, isCurrentlyOpen, t]);

    const currentDayOpeningHours = getCurrentDayStatus();

    return (
        <div className="opening-hours">
            <ul className="opening-hours__list">
                <li className="opening-hours__list-item opening-hours__list-item--current" onClick={() => setIsExpanded(!isExpanded)}>
                    <span className="opening-hours__time">
                        <div className="opening-hours__icon-wrapper">
                            <ClockIcon />
                        </div>
                        {getOpeningHoursForDay(weekdays[adjustedCurrentDay]).text}
                    </span>
                    <span className={`opening-hours__status-text opening-hours__status-text--${currentDayOpeningHours.toLowerCase()}`}>
                        {currentDayOpeningHours}
                        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </span>
                </li>

                {isExpanded && weekdays.map((day) => {
                    const hours = getOpeningHoursForDay(day);
                    return (
                        <li key={day} className="opening-hours__list-item">
                            <span className="opening-hours__day">{day.toLocaleString(undefined, { weekday: 'long' })}</span>
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

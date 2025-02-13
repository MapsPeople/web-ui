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
 * A component that displays opening hours in an expandable list format.
 * Shows current day's status (Open/Closed) and allows users to view full weekly schedule.
 * Supports both 12-hour (AM/PM) and 24-hour time formats, and can adjust whether week starts on Monday or Sunday.
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

    /**
     * Gets the current day of the week (0-6, where Sunday is 0)
     * Used to determine which day's opening hours to highlight
     * @type {number}
     */
    const currentDay = new Date().getDay();

    /**
     * Creates an array of weekdays in the correct display order
     * Adjusts the order based on whether Monday or Sunday is considered first day
     * @type {Date[]}
     */
    const weekdays = useMemo(() => {
        /**
         * Creates reference week array starting from Jan 1st 2024 (Monday)
         * Used for locale-specific day name formatting
         * @type {Date[]} Array of dates [Mon-Sun] or [Sun-Sat] based on isMondayFirstDayOfTheWeek
         * @note Reorders array to start with Sunday if isMondayFirstDayOfTheWeek=false
         */
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
    const isLocationCurrentlyOpen = useCallback((dayData) => {
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
     * Determines if the business location is currently open or closed based on the current day's opening hours.
     * @returns {'Open'|'Closed'} Returns 'Open' if the location is currently open, or 'Closed' if it is not.
     */
    const getCurrentDayStatus = useCallback(() => {
        const currentDayName = weekdays[adjustedCurrentDay]
            .toLocaleString('en-US', { weekday: 'long' })
            .toLowerCase();

        const isOpen = isLocationCurrentlyOpen(standardOpeningHours?.[currentDayName]);

        return isOpen ? 'Open' : 'Closed';
    }, [standardOpeningHours, weekdays, adjustedCurrentDay, isLocationCurrentlyOpen, t]);

    const currentDayOpeningHours = getCurrentDayStatus();

    return (
        <div className="opening-hours">
            <ul className="opening-hours__list">
                <li className="opening-hours__list-item opening-hours__list-item--current" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="opening-hours__time">
                        <div className="opening-hours__icon-wrapper">
                            <ClockIcon />
                        </div>
                        {getOpeningHoursForDay(weekdays[adjustedCurrentDay]).text}
                    </div>
                    <span className={`opening-hours__status-text opening-hours__status-text--${currentDayOpeningHours.toLowerCase()}`}>
                        {t(currentDayOpeningHours)}
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

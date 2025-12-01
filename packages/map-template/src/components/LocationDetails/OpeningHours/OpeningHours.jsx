import { memo, useCallback, useState, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './OpeningHours.scss';
import { ReactComponent as ClockIcon } from '../../../assets/clock-light.svg';
import { ReactComponent as ChevronDownIcon } from '../../../assets/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from '../../../assets/chevron-up.svg';
import languageState from '../../../atoms/languageState';

OpeningHours.propTypes = {
    openingHours: PropTypes.object,
    isMondayFirstDayOfTheWeek: PropTypes.bool,
    onExpand: PropTypes.func
};

/**
 * A component that displays opening hours in an expandable list format.
 * Shows current day's status (Open/Closed) and allows users to view full weekly schedule.
 * Supports both 12-hour (AM/PM) and 24-hour time formats, and can adjust whether week starts on Monday or Sunday.
 * 
 * @param {object} props
 * @param {object} props.openingHours // Opening hours data
 * @param {boolean} [props.isMondayFirstDayOfTheWeek] // Whether Monday is the first day of the week
 * @returns 
 */
function OpeningHours({ openingHours, isMondayFirstDayOfTheWeek = true, onExpand }) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const currentLanguage = useRecoilValue(languageState);
    const languageToUse = currentLanguage ?? navigator.language;

    /**
     * Determines if the locale uses 12-hour time format
     * @returns {boolean} True if the locale uses 12-hour time format, false if it uses 24-hour format
     */
    const uses12HourFormat = useMemo(() => {
        // Test if the locale uses 12-hour format by checking if AM/PM appears
        const test = new Date(2020, 0, 1, 13).toLocaleTimeString(languageToUse);
        return test.match(/AM|PM/) !== null;
    }, [languageToUse]);

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
        return new Date(0, 0, 0, hours, minutes).toLocaleTimeString(languageToUse, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: uses12HourFormat
        });
    };

    /**
     * @note We use 'en-US' locale in both getOpeningHoursForDay() and getCurrentDayStatus() 
     * to generate consistent lowercase English day names as keys (e.g. "monday", "tuesday").
     * These keys must match the standardOpeningHours object structure.
     * 
     * Then we can use toLocaleString in the JSX return to show weekdays based on the browser's locale, 
     * but internal lookups need standardized English keys.
     * 
     * Helper function that takes a date object (day) and returns the opening hours information for that specific day.
     */
    const getOpeningHoursForDay = (day) => {
        const dayName = day.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        const dayData = standardOpeningHours?.[dayName];

        // If no opening hours are available for the day, or the location is closed all day, return 'Closed'
        if (!dayData?.startTime || !dayData?.endTime || dayData.closedAllDay) {
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
        /*
         * We mark the location as closed if there's no data for the day, it's
         * closed all day, or valid start/end times are missing.
         */
        if (!dayData || dayData.closedAllDay || !dayData.startTime || !dayData.endTime) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHours, startMinutes] = dayData.startTime.split(':');
        const [endHours, endMinutes] = dayData.endTime.split(':');

        const startTime = parseInt(startHours, 10) * 60 + parseInt(startMinutes, 10);
        const endTime = parseInt(endHours, 10) * 60 + parseInt(endMinutes, 10);

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

    /**
     * Utility function to capitalize the first letter
     * @param {string} string - The string to capitalize
     * @returns {string} The input string with its first letter capitalized
     */
    const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

    /**
     * Toggles the expanded state of the opening hours list.
     * When expanded, the full weekly schedule is shown.
     */
    const handleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    /**
     * Calls the onExpand callback prop (if provided) when the opening hours list is expanded.
     * This is used to notify the parent component so it can update scroll indicators or perform other actions
     * that depend on the expanded content being rendered in the DOM.
     */
    useEffect(() => {
        if (isExpanded && typeof onExpand === 'function') {
            onExpand();
        }
    }, [isExpanded, onExpand]);

    return (
        <div className="opening-hours">
            <button
                className="contact-action-button contact-action-button--opening-hours"
                onClick={handleExpand}
                aria-label={t(isExpanded ? 'Collapse opening hours' : 'Expand opening hours')}
                aria-expanded={isExpanded}>
                <div className="contact-action-button__icon-wrapper">
                    <ClockIcon />
                </div>
                <div className="contact-action-button__text">
                    {getOpeningHoursForDay(weekdays[adjustedCurrentDay]).text}
                </div>
                <span
                    className={`contact-action-button--opening-hours__status contact-action-button--opening-hours__status--${currentDayOpeningHours.toLowerCase()}`}>
                    {t(currentDayOpeningHours)}
                </span>
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>

            {isExpanded && (
                <ul className="opening-hours__list">
                    {weekdays.map((day) => {
                        const hours = getOpeningHoursForDay(day);
                        return (
                            <li key={day} className="opening-hours__list-item">
                                <span className="opening-hours__day">
                                    {capitalizeFirstLetter(day.toLocaleString(languageToUse, { weekday: 'long' }))}
                                </span>
                                <span
                                    className={`opening-hours__hours ${hours.isClosed ? 'opening-hours__hours--closed' : ''}`}>
                                    {hours.text}
                                </span>
                            </li>);
                    })}
                </ul>
            )}
        </div>
    );
}

export default memo(OpeningHours);

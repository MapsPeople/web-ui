import './LocationDetails.css';
import PropTypes from 'prop-types';
import { ReactComponent as CloseIcon } from '../assets/close.svg';
import { useEffect, useRef } from 'react';

LocationDetails.propTypes = {
    location: PropTypes.object,
    onRequestClose: PropTypes.func,
    onHeightChanged: PropTypes.func
};

/**
 * Component to show details for a MapsIndoors Location.
 *
 * @param {object} props
 * @param {object} props.location - The MapsIndoors Location object.
 * @param {function} props.onRequestClose - Callback function to request closing the Location details editor.
 * @param {function} props.onHeightChanged - Callback function to notify the parent component that the height of the Location details editor has changed.
 */
function LocationDetails({ location, onRequestClose, onHeightChanged }) {

    const elementRef = useRef(null);

    /**
     * Fire callback to request closing the Location details editor
     */
    function close() {
        if (typeof onRequestClose === 'function') {
            onRequestClose();
        }
    }

    /*
     * When the location prop changes, we want to calculate the height of the Location details editor.
     * This is used to calculate padding on the map, so that the Location details editor does not overlap the map.
     */
    useEffect(() => {
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect && typeof onHeightChanged === 'function') {
            onHeightChanged(rect.height ?? 0);
        }
    }, [location]);

    return location && <div ref={elementRef} className="location-details">
        <div className="location-details__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <h1 className="location-details__heading">
                {location.properties.name}
            </h1>
            <button className="location-details__close-button" onClick={() => close()}><CloseIcon /></button>
        </div>

        { /*
            If the Location appears to be a Meeting Room, show some "fake" measurements:
            - Occupancy (1/6)
            - Temperature (22°C)
            - CO2 level (1226 ppm)

            Those measurements are completely mocked here, and could be replaced with
            measurements from a real sensor system.

            Beware that the temperature is hardcoded to be shown in celcius for now.
        */ }
        {location.properties.type.startsWith('MeetingRoom') && <ul className="location-details__measurements">
            <li>
                <img alt="" src="data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIC8+Cjwvc3ZnPgo=" />
                1/6
            </li>
            <li>
                <img alt="" src="data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTQgNHYxMC41NGE0IDQgMCAxIDEtNCAwVjRhMiAyIDAgMCAxIDQgMFoiIC8+Cjwvc3ZnPgo=" />
                22&deg;C
            </li>
            <li>
                <img alt="" src="data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGNsYXNzPSJoLTYgdy02IG1yLTIiIGhlaWdodD0iMWVtIiB3aWR0aD0iMWVtIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiPjwvcGF0aD48cGF0aCBkPSJNMTQgOWgtM2MtLjU1IDAtMSAuNDUtMSAxdjRjMCAuNTUuNDUgMSAxIDFoM2MuNTUgMCAxLS40NSAxLTF2LTRjMC0uNTUtLjQ1LTEtMS0xem0tLjUgNC41aC0ydi0zaDJ2M3pNOCAxM3YxYzAgLjU1LS40NSAxLTEgMUg0Yy0uNTUgMC0xLS40NS0xLTF2LTRjMC0uNTUuNDUtMSAxLTFoM2MuNTUgMCAxIC40NSAxIDF2MUg2LjV2LS41aC0ydjNoMlYxM0g4em0xMi41IDIuNWgtMnYxaDNWMThIMTd2LTIuNWMwLS41NS40NS0xIDEtMWgydi0xaC0zVjEyaDMuNWMuNTUgMCAxIC40NSAxIDF2MS41YzAgLjU1LS40NSAxLTEgMXoiPjwvcGF0aD48L3N2Zz4=" />
                1226 ppm
            </li>
        </ul>}
    </div>;
}

export default LocationDetails;

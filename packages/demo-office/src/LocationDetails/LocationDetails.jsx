import './LocationDetails.css';
import PropTypes from 'prop-types';
import { ReactComponent as CloseIcon } from '../assets/close.svg';
import { ReactComponent as PinIcon} from '../assets/pin.svg';
import { ReactComponent as PersonIcon } from '../assets/person.svg';
import { ReactComponent as ThermometerIcon } from '../assets/thermometer.svg';
import { ReactComponent as CO2Icon } from '../assets/co2.svg';
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
            <PinIcon />
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

            Beware that the temperature is hardcoded to be shown in celsius for now.
        */ }
        {location.properties.type.startsWith('MeetingRoom') && <ul className="location-details__measurements">
            <li>
                <PersonIcon />
                1/6
            </li>
            <li>
                <ThermometerIcon />
                22&deg;C
            </li>
            <li>
                <CO2Icon />
                1226 ppm
            </li>
        </ul>}
    </div>;
}

export default LocationDetails;

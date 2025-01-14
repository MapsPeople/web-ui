import './LocationDetails.css';
import PropTypes from 'prop-types';
import { ReactComponent as CloseIcon } from '../assets/close.svg';

LocationDetails.propTypes = {
    location: PropTypes.object,
    onRequestClose: PropTypes.func
};

/**
 * Component to show details for a MapsIndoors Location.
 *
 * @param {object} props
 * @param {object} props.location - The MapsIndoors Location object.
 * @param {function} props.onRequestClose - Callback function to request closing the Location details editor.
 */
function LocationDetails({ location, onRequestClose }) {

    /**
     * Fire callback to request closing the Location details editor
     */
    function close() {
        if (typeof onRequestClose === 'function') {
            onRequestClose();
        }
    }

    return location && <div className="location-details">
        <div className="location-details__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <h1 className="location-details__heading">
                {location.properties.name}
            </h1>
            <button className="location-details__close-button" onClick={() => close()}><CloseIcon /></button>
        </div>
    </div>;
}

export default LocationDetails;

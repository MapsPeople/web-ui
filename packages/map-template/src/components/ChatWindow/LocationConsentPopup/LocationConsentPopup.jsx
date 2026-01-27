import PropTypes from 'prop-types';
import './LocationConsentPopup.scss';

/**
 * A popup component that requests user consent for location access.
 *
 * @description
 * This component is displayed when the Assistant needs the user's location
 * to provide personalized directions and nearby discovery features. Location access is optional;
 * users can decline and still use the chat by manually specifying a start point.
 *
 * The popup presents two options:
 * - "Allow" - grants sending location data
 * - "Decline" - skips sending location data
 *
 * @param {Object} props
 * @param {Function} props.onAccept - Callback fired when the user clicks "Allow"
 * @param {Function} props.onDecline - Callback fired when the user clicks "Decline"
 * @returns {JSX.Element} The location consent popup component
 */
function LocationConsentPopup({ onAccept, onDecline }) {
    return (
        <div className="location-consent-popup">
            <p className="location-consent-popup__message">
                To provide personalized directions and help you discover what&apos;s nearby, MapsIndoors AI Assistant would like to access your location. The chat will still work without knowing your location, but instead you&apos;ll need to specify a start point.
            </p>
            <div className="location-consent-popup__buttons">
                <button
                    type="button"
                    className="location-consent-popup__button location-consent-popup__button--decline"
                    onClick={onDecline}
                >
                    Decline
                </button>
                <button
                    type="button"
                    className="location-consent-popup__button location-consent-popup__button--accept"
                    onClick={onAccept}
                >
                    Allow
                </button>
            </div>
        </div>
    );
}

LocationConsentPopup.propTypes = {
    onAccept: PropTypes.func.isRequired,
    onDecline: PropTypes.func.isRequired
};

export default LocationConsentPopup;

import PropTypes from 'prop-types';
import './LocationConsentPopup.scss';

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

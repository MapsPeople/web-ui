import PropTypes from 'prop-types';
import './UsageConsentOverlay.scss';

/**
 * @param {Object} props
 * @param {Function} props.onAccept - Callback fired when the user clicks "I understand"
 * @param {Function} props.onDecline - Callback fired when the user clicks "Decline"
 */
function UsageConsentOverlay({ onAccept, onDecline }) {
    return (
        <div className="usage-consent-overlay">
            <div className="usage-consent-overlay__card">
                <h3 className="usage-consent-overlay__title">
                    Ask with AI - Usage Consent
                </h3>
                <p className="usage-consent-overlay__message">
                    Ask with AI helps you find places and navigate this venue using artificial intelligence.
                    While we strive for accuracy, the AI may sometimes get things wrong. Please double-check
                    important details before heading out.
                </p>
                <div className="usage-consent-overlay__buttons">
                    <button
                        type="button"
                        className="usage-consent-overlay__button usage-consent-overlay__button--accept"
                        onClick={onAccept}>
                        I understand
                    </button>
                    <button
                        type="button"
                        className="usage-consent-overlay__button usage-consent-overlay__button--decline"
                        onClick={onDecline}>
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
}

UsageConsentOverlay.propTypes = {
    onAccept: PropTypes.func.isRequired,
    onDecline: PropTypes.func.isRequired
};

export default UsageConsentOverlay;

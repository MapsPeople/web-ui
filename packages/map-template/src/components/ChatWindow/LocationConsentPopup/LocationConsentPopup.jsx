import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

    return (
        <div className="location-consent-popup">
            <div className="location-consent-popup__card">
                <p className="location-consent-popup__message">
                    {t('Location consent message')}
                </p>
                <div className="location-consent-popup__buttons">
                    <button
                        type="button"
                        className="location-consent-popup__button location-consent-popup__button--accept"
                        onClick={onAccept}
                    >
                        {t('Location consent accept')}
                    </button>
                    <button
                        type="button"
                        className="location-consent-popup__button location-consent-popup__button--decline"
                        onClick={onDecline}
                    >
                        {t('Location consent decline')}
                    </button>
                </div>
            </div>
        </div>
    );
}

LocationConsentPopup.propTypes = {
    onAccept: PropTypes.func.isRequired,
    onDecline: PropTypes.func.isRequired
};

export default LocationConsentPopup;

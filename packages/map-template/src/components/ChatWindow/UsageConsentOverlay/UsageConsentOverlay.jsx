import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './UsageConsentOverlay.scss';

/**
 * @param {Object} props
 * @param {Function} props.onAccept - Callback fired when the user clicks "I understand"
 * @param {Function} props.onDecline - Callback fired when the user clicks "Decline"
 */
function UsageConsentOverlay({ onAccept, onDecline }) {
    const { t } = useTranslation();

    return (
        <div className="usage-consent-overlay">
            <div className="usage-consent-overlay__card">
                <h3 className="usage-consent-overlay__title">
                    {t('Usage consent title')}
                </h3>
                <p className="usage-consent-overlay__message">
                    {t('Usage consent message')}
                </p>
                <div className="usage-consent-overlay__buttons">
                    <button
                        type="button"
                        className="usage-consent-overlay__button usage-consent-overlay__button--accept"
                        onClick={onAccept}>
                        {t('Usage consent accept')}
                    </button>
                    <button
                        type="button"
                        className="usage-consent-overlay__button usage-consent-overlay__button--decline"
                        onClick={onDecline}>
                        {t('Usage consent decline')}
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

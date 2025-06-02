import './MissingTokensModal.scss';
import { useIsDesktop } from '../../hooks/useIsDesktop.js';
import { ReactComponent as WarningIcon } from '../../assets/warning-icon.svg';

/**
 * Shows missing tokens modal.
 */
function MissingTokensModal() {
    const isDesktop = useIsDesktop();

    return (
        <div className={`notification-modal ${isDesktop ? 'desktop' : 'mobile'}`}>
            <div className="notification-modal__content">
                {isDesktop ? (
                    <>
                        <strong className="notification-modal__headline"><WarningIcon className="notification-modal__icon" />For demoing purposes only</strong>
                        <p>This web app is for demo purposes only. Reach out to us <a target="_blank" rel="noopener noreferrer" href="https://mapspeople.atlassian.net/servicedesk/customer/portal/2"> here</a> to get a version you can use as your own.</p>
                    </>
                ) : (
                    <>
                        <WarningIcon className="notification-modal__icon" />
                        <strong className="notification-modal__headline">For demoing purposes only</strong>
                        <p>
                            This web app is for demo purposes only. Reach out to us <a target="_blank" rel="noopener noreferrer" href="https://mapspeople.atlassian.net/servicedesk/customer/portal/2"> here</a> to get a version you can use as your own.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default MissingTokensModal;
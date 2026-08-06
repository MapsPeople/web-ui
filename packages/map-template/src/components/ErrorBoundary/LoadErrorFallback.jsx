import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './LoadErrorFallback.scss';

LoadErrorFallback.propTypes = {
    /** i18n key of the title describing what failed to load. */
    titleKey: PropTypes.string.isRequired,
    /** 'chat' sits inside the sidebar modal or mobile sheet, 'map' covers the splash screen. */
    variant: PropTypes.oneOf(['chat', 'map']).isRequired,
    /** Dismisses the failed view. Omit when there is nothing to go back to, as for the map. */
    onClose: PropTypes.func
};

/**
 * Shown when a lazily loaded bundle could not be fetched - typically a stale chunk in a tab
 * that was left open across a redeploy. Such a chunk keeps failing for the lifetime of the
 * page, so reloading is the only thing that recovers the feature. We offer it as a button
 * rather than reloading on our own, since the Map Template can be embedded in a host page
 * that we should not navigate.
 *
 * Reloading does lose the current map state, which is why closing is offered alongside it
 * where the rest of the app is still usable.
 */
function LoadErrorFallback({ titleKey, variant, onClose }) {
    const { t } = useTranslation();

    return (
        <div className={`load-error-fallback load-error-fallback--${variant}`} role="alert">
            <div className="load-error-fallback__card">
                <p className="load-error-fallback__title">{t(titleKey)}</p>
                <div className="load-error-fallback__buttons">
                    {onClose && (
                        <button className="load-error-fallback__button load-error-fallback__button--secondary" onClick={onClose}>
                            {t('Close')}
                        </button>
                    )}
                    <button className="load-error-fallback__button load-error-fallback__button--primary" onClick={() => window.location.reload()}>
                        {t('Reload')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoadErrorFallback;

import { useState, useEffect } from 'react';
import { FocusTrap } from 'focus-trap-react';
import { useTranslation } from 'react-i18next';
import styles from './InactivityWarning.module.scss';

const COUNTDOWN_SECONDS = 60;

export function InactivityWarning() {
    const { t } = useTranslation();
    const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <FocusTrap>
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="inactivity-title"
                aria-describedby="inactivity-desc"
                className={styles.overlay}
            >
                <div className={styles.dialog}>
                    <h2 id="inactivity-title">{t('Still here?')}</h2>
                    <p id="inactivity-desc" aria-live="polite" aria-atomic="true">
                        {t('This screen will reset in {{seconds}} seconds.', { seconds })}
                    </p>
                    <button
                        className={styles.stayButton}
                        onClick={() => window.dispatchEvent(new PointerEvent('pointerup'))}
                    >
                        {t('Stay')}
                    </button>
                </div>
            </div>
        </FocusTrap>
    );
}

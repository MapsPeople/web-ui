import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FocusTrap } from 'focus-trap-react';
import { useTranslation } from 'react-i18next';
import ClockWarningIcon from '../../assets/clock-warning.svg?react';
import styles from './InactivityWarning.module.scss';

InactivityWarning.propTypes = {
    onStartOver: PropTypes.func,
};

const COUNTDOWN_SECONDS = 60;

export function InactivityWarning({ onStartOver }) {
    const { t } = useTranslation();
    const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    function keepBrowsing() {
        window.dispatchEvent(new PointerEvent('pointerup'));
    }

    function startOver() {
        window.dispatchEvent(new PointerEvent('pointerup'));
        onStartOver?.();
    }

    const progress = (seconds / COUNTDOWN_SECONDS) * 100;
    const isUrgent = seconds <= 10;

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
                    <div className={styles.iconCircle}>
                        <ClockWarningIcon aria-hidden="true" />
                    </div>
                    <h2 id="inactivity-title" className={styles.title}>{t('Still here?')}</h2>
                    <p id="inactivity-desc" className={styles.description}>
                        {t('We\'ll return to the home screen and clear your search in')}
                    </p>
                    <div className={styles.countdown} role="timer" aria-live="off" aria-atomic="true">
                        <span className={styles.countdownNumber}>{seconds}</span>
                        <span className={styles.countdownUnit}>s</span>
                    </div>
                    <div className={styles.progressBar} aria-hidden="true">
                        <div
                            className={`${styles.progressFill}${isUrgent ? ` ${styles.urgent}` : ''}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className={styles.buttons}>
                        <button className={styles.startOverButton} onClick={startOver}>
                            {t('Start over')}
                        </button>
                        <button className={styles.keepBrowsingButton} onClick={keepBrowsing}>
                            {t('Keep browsing')}
                        </button>
                    </div>
                    <p className={styles.hint}>{t('Touch the map anywhere to stay')}</p>
                </div>
            </div>
        </FocusTrap>
    );
}

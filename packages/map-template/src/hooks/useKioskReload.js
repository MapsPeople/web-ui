import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useIsKioskContext } from './useIsKioskContext';
import isMapReadyState from '../atoms/isMapReadyState';

const DEFAULT_RELOAD_TIME = 600;
const MIN_RELOAD_TIME = 300;
const WARNING_OFFSET_MS = 60000;

export function useKioskReload(enabled, timerSeconds) {
    const isKiosk = useIsKioskContext();
    const isMapReady = useRecoilValue(isMapReadyState);
    const [isWarning, setIsWarning] = useState(false);

    useEffect(() => {
        if (!enabled || !isKiosk || !isMapReady) {
            return;
        }

        const validSeconds = Number.isFinite(timerSeconds) && timerSeconds > 0 ? timerSeconds : DEFAULT_RELOAD_TIME;
        const timeoutMs = Math.max(MIN_RELOAD_TIME, validSeconds) * 1000;
        let warningTimer;
        let reloadTimer;

        const scheduleTimers = () => {
            if (timeoutMs > WARNING_OFFSET_MS) {
                warningTimer = window.setTimeout(() => setIsWarning(true), timeoutMs - WARNING_OFFSET_MS);
            }
            reloadTimer = window.setTimeout(() => window.location.reload(), timeoutMs);
        };

        const handleUserEvent = () => {
            setIsWarning(false);
            window.clearTimeout(warningTimer);
            window.clearTimeout(reloadTimer);
            scheduleTimers();
        };

        scheduleTimers();

        window.addEventListener('mousemove', handleUserEvent);
        window.addEventListener('mousedown', handleUserEvent);
        window.addEventListener('resize', handleUserEvent);
        window.addEventListener('keydown', handleUserEvent);
        window.addEventListener('touchstart', handleUserEvent);
        window.addEventListener('wheel', handleUserEvent);
        window.addEventListener('pointerup', handleUserEvent);

        return () => {
            window.removeEventListener('mousemove', handleUserEvent);
            window.removeEventListener('mousedown', handleUserEvent);
            window.removeEventListener('resize', handleUserEvent);
            window.removeEventListener('keydown', handleUserEvent);
            window.removeEventListener('touchstart', handleUserEvent);
            window.removeEventListener('wheel', handleUserEvent);
            window.removeEventListener('pointerup', handleUserEvent);
            window.clearTimeout(warningTimer);
            window.clearTimeout(reloadTimer);
        };
    }, [enabled, isKiosk, isMapReady, timerSeconds]);

    return { isWarning };
}

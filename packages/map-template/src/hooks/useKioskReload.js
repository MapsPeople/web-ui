import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useIsKioskContext } from './useIsKioskContext';
import isMapReadyState from '../atoms/isMapReadyState';

const DEFAULT_RELOAD_TIME = 600;
const MIN_RELOAD_TIME = 300;

export function useKioskReload(enabled, timerSeconds) {
    const isKiosk = useIsKioskContext();
    const isMapReady = useRecoilValue(isMapReadyState);

    useEffect(() => {
        if (!enabled || !isKiosk || !isMapReady) {
            return;
        }

        const validSeconds = Number.isFinite(timerSeconds) && timerSeconds > 0 ? timerSeconds : DEFAULT_RELOAD_TIME;
        const timeout = Math.max(MIN_RELOAD_TIME, validSeconds);
        let timer;

        const handleUserEvent = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => window.location.reload(), timeout * 1000);
        };

        timer = window.setTimeout(() => window.location.reload(), timeout * 1000);

        window.addEventListener('mousemove', handleUserEvent);
        window.addEventListener('mousedown', handleUserEvent);
        window.addEventListener('resize', handleUserEvent);
        window.addEventListener('keydown', handleUserEvent);
        window.addEventListener('touchstart', handleUserEvent);
        window.addEventListener('wheel', handleUserEvent);

        return () => {
            window.removeEventListener('mousemove', handleUserEvent);
            window.removeEventListener('mousedown', handleUserEvent);
            window.removeEventListener('resize', handleUserEvent);
            window.removeEventListener('keydown', handleUserEvent);
            window.removeEventListener('touchstart', handleUserEvent);
            window.removeEventListener('wheel', handleUserEvent);
            window.clearTimeout(timer);
        };
    }, [enabled, isKiosk, isMapReady, timerSeconds]);
}

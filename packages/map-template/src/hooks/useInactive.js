import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import isMapReadyState from '../atoms/isMapReadyState';
import timeoutState from '../atoms/timoutState';

const WARNING_OFFSET_MS = 60000; // 60 seconds before timeout

/**
 * Detect user inactivity and sets state to be inactive after a specified amount of seconds.
 * Also emits an `isWarning` state 60 seconds before the timeout fires.
 *
 * Heavily inspired by useIdle from https://www.npmjs.com/package/@uidotdev/usehooks
 *
 * @returns {{ isInactive: boolean, isWarning: boolean }}
 */
export function useInactive() {
    const [isInactive, setIsInactive] = useState(false);
    const [isWarning, setIsWarning] = useState(false);

    const isMapReady = useRecoilValue(isMapReadyState);
    const timeout = useRecoilValue(timeoutState);

    useEffect(() => {
        if (!isMapReady || !timeout) {
            return;
        }

        const timeoutMs = timeout * 1000;
        let warningTimer;
        let inactiveTimer;

        const handleUserEvent = () => {
            setIsWarning(false);
            setIsInactive(false);

            window.clearTimeout(warningTimer);
            window.clearTimeout(inactiveTimer);

            if (timeoutMs > WARNING_OFFSET_MS) {
                warningTimer = window.setTimeout(() => setIsWarning(true), timeoutMs - WARNING_OFFSET_MS);
            }
            inactiveTimer = window.setTimeout(() => setIsInactive(true), timeoutMs);
        };

        if (timeoutMs > WARNING_OFFSET_MS) {
            warningTimer = window.setTimeout(() => setIsWarning(true), timeoutMs - WARNING_OFFSET_MS);
        }
        inactiveTimer = window.setTimeout(() => setIsInactive(true), timeoutMs);

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
            window.clearTimeout(inactiveTimer);
        };
    }, [timeout, isMapReady]);

    return { isInactive, isWarning };
}

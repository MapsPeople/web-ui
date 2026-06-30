import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import isMapReadyState from '../atoms/isMapReadyState';
import timeoutState from '../atoms/timoutState';

/**
 * Detect user inactivity and sets state to be inactive after a specified amount of seconds.
 *
 * Heavily inspired by useIdle from https://www.npmjs.com/package/@uidotdev/usehooks
 *
 * @returns {{ isInactive: boolean }}
 */
export function useInactive() {
    const [isInactive, setIsInactive] = useState(false);

    const isMapReady = useRecoilValue(isMapReadyState);
    const timeout = useRecoilValue(timeoutState);

    useEffect(() => {
        if (!isMapReady || !timeout) {
            return;
        }

        const timeoutMs = timeout * 1000;
        let inactiveTimer;

        const handleUserEvent = () => {
            setIsInactive(false);
            window.clearTimeout(inactiveTimer);
            inactiveTimer = window.setTimeout(() => setIsInactive(true), timeoutMs);
        };

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
            window.clearTimeout(inactiveTimer);
        };
    }, [timeout, isMapReady]);

    return { isInactive };
}

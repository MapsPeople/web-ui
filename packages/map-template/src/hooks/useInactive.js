import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import isMapReadyState from '../atoms/isMapReadyState';
import timeoutState from '../atoms/timoutState';

/**
 * Detect user inactivity and sets state to be inactive after a specified amount of seconds.
 *
 * Heavily inspired by useIdle from https://www.npmjs.com/package/@uidotdev/usehooks
 *
 * @returns {boolean}
 */
export function useInactive() {
    const [isInactive, setIsInactive] = useState(false);

    const isMapReady = useRecoilValue(isMapReadyState);
    const timeout = useRecoilValue(timeoutState);

    useEffect(() => {
        if (!isMapReady || !timeout) {
            return;
        }

        let timer;

        const handleUserEvent = () => {
            setIsInactive(false);

            window.clearTimeout(timer);
            timer = window.setTimeout(handleTimeout, timeout*1000);
        };

        const handleTimeout = () => {
            setIsInactive(true);
        };

        timer = window.setTimeout(handleTimeout, timeout*1000);

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
    }, [timeout, isMapReady]);

    return isInactive;
}

import { useState, useEffect, useRef } from 'react';

/**
 * Hook for observing size of an element
 *
 * https://github.com/infodusha/react-hook-size/blob/master/src/index.js
 *
 * @param {object} ref - Element reference (useRef)
 */
function useSize(ref) {

    const obs = useRef();
    const [ignored, setIgnored] = useState(0);
    const [size, setSize] = useState({ width: null, height: null });

    useEffect(() => {
        function observe(entries) {
            const { width, height } = entries[0].contentRect;
            setSize((s) => s.width !== width || s.height !== height ? { width, height } : s);
        }
        const RObserver = window.ResizeObserver;
        obs.current = new RObserver(observe);
        return () => obs.current.disconnect();
    }, []);

    useEffect(() => {
        const forceUpdate = () => setIgnored((c) => c + 1);
        const item = ref.current;
        if(item) {
            obs.current.observe(item);
            window.setTimeout(forceUpdate, 0);
        }
        return () => item && obs.current.unobserve(item);
    }, [obs, ref]);

    return size;

}

export default useSize;

import { useEffect, useRef } from 'react';

/**
 * React wrapper around the custom element <mi-dropdown>.
 *
 * @param {object} props
 * @param {function} travelModeChanged - Function that is called when the travel mode is changed.
 */
function Dropdown({ travelModeChanged, children }) {
    const elementRef = useRef();

    useEffect(() => {
        const clickHandler = customEvent => travelModeChanged(customEvent.detail);

        const { current } = elementRef;

        current.addEventListener('change', clickHandler);

        return () => current.removeEventListener('change', clickHandler);

    }, [travelModeChanged]);


    return <mi-dropdown ref={elementRef}>{children}</mi-dropdown>
}

export default Dropdown;

import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

Dropdown.propTypes = {
    selectionChanged: PropTypes.func,
    children: PropTypes.node
};

/**
 * React wrapper around the custom element <mi-dropdown>.
 *
 * @param {object} props
 * @param {function} selectionChanged - Triggers an event when the selection is changed.
 * @param {React.ReactNode} children - The content to be displayed inside the dropdown.
 */
function Dropdown({ selectionChanged, children }) {
    const elementRef = useRef();

    useEffect(() => {
        const clickHandler = customEvent => selectionChanged(customEvent.detail);

        const { current } = elementRef;

        current.addEventListener('change', clickHandler);

        return () => current.removeEventListener('change', clickHandler);

    }, [selectionChanged]);


    return <mi-dropdown ref={elementRef}>{children}</mi-dropdown>
}

export default Dropdown;

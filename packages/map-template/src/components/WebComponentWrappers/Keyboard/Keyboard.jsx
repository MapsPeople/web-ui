import { useEffect, useRef } from 'react';

/**
 * React wrapper around the custom element <mi-keyboard>.
 *
 * @param {object} props
 * @param {object} props.searchInputElement 
 * 
 */
function Keyboard({ searchInputElement }) {
    const elementRef = useRef();

    useEffect(() => {
        const { current } = elementRef;

        if (searchInputElement) {
            current.inputElement = searchInputElement
        }
    }, [searchInputElement]);

    return <mi-keyboard ref={elementRef}></mi-keyboard>
}

export default Keyboard;

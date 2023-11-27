import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

/**
 * React wrapper around the custom element <mi-keyboard>.
 * Listen to changes in the searchInputElement and set the inputElement property on the mi-keyboard element.
 *
 * @param {object} props
 * @param {object} props.searchInputElement 
 * 
 */
const Keyboard = forwardRef(({ searchInputElement }, ref) => {
    const elementRef = useRef();

    /**
     * Methods that can be triggered on the mi-search element.
     */
    useImperativeHandle(ref, () => ({
        clearInputField() {
            elementRef.current.clearInputField();
        }
    }));

    useEffect(() => {
        const { current } = elementRef;

        if (searchInputElement) {
            current.inputElement = searchInputElement
        }
    }, [searchInputElement]);

    return <mi-keyboard ref={elementRef}></mi-keyboard>
});

export default Keyboard;

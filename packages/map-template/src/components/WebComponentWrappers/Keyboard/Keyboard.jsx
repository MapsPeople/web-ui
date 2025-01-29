import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useRecoilValue } from 'recoil';
import languageState from '../../../atoms/languageState';
import PropTypes from 'prop-types';

/**
 * React wrapper around the custom element <mi-keyboard>.
 * Listen to changes in the searchInputElement and set the inputElement property on the mi-keyboard element.
 *
 * @param {object} props
 * @param {HTMLInputElement} props.searchInputElement
 *
 */
const Keyboard = forwardRef(function KeyboardComponent(props, ref) {
    const { searchInputElement } = props;
    const elementRef = useRef();

    const language = useRecoilValue(languageState);

    /**
     * Methods that can be triggered on the mi-keyboard element.
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

    return <mi-keyboard language={language} ref={elementRef}></mi-keyboard>
});

Keyboard.propTypes = {
    searchInputElement: PropTypes.instanceOf(HTMLInputElement)
};

export default Keyboard;

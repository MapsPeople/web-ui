import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRecoilValue } from 'recoil';
import useKeyboardState from '../../../../atoms/useKeyboardState';
import searchInputState from '../../../../atoms/searchInputState';
import { useIsDesktop } from '../../../../hooks/useIsDesktop';
import Keyboard from '../../../WebComponentWrappers/Keyboard/Keyboard';
import isNullOrUndefined from '../../../../helpers/isNullOrUndefined';
import PropTypes from 'prop-types';

/**
 * KioskKeyboard component handles the visibility and functionality of the on-screen keyboard
 * in kiosk mode. It manages keyboard show/hide state based on user interactions and provides
 * methods to clear the keyboard input field.
 *
 * @param {Object} props
 * @param {function} props.onKeyboardVisibilityChange - Callback fired when keyboard visibility changes
 */
const KioskKeyboard = forwardRef(({ onKeyboardVisibilityChange }, ref) => {
    const keyboardRef = useRef();
    const useKeyboard = useRecoilValue(useKeyboardState);
    const searchInput = useRecoilValue(searchInputState);
    const isDesktop = useIsDesktop();

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    /**
     * Clear the keyboard input field if keyboard is available and enabled
     */
    const clearInputField = () => {
        // Only attempt to clear if keyboard is enabled and available
        if (useKeyboard && !isNullOrUndefined(keyboardRef.current)) {
            keyboardRef.current.clearInputField();
        }
        // Silently ignore if keyboard is disabled - this is expected behavior
    };

    // Always expose methods to parent component for consistent API
    // The methods handle their own availability checks internally
    useImperativeHandle(ref, () => ({
        clearInputField
    }), [clearInputField]);

    /*
     * When useKeyboard parameter is present, add click event listener which determines when the keyboard should be shown or not.
     */
    useEffect(() => {
        if (useKeyboard) {
            const onClick = (event) => {
                // Use the closest() method to check if the element that has been clicked traverses the element and its parents
                // until it finds a node that matches the 'mi-keyboard' selector.
                // If the user clicks on the keyboard or the search fields, the keyboard should stay visible.
                if (event.target.closest('mi-keyboard') ||
                    event.target.tagName.toUpperCase() === 'MI-SEARCH' ||
                    event.target.tagName.toUpperCase() === 'INPUT') {
                    setIsKeyboardVisible(true);
                } else {
                    setIsKeyboardVisible(false);
                }
            };

            window.addEventListener('click', onClick, false);
            return () => {
                window.removeEventListener('click', onClick, false);
            };
        }
    }, [useKeyboard]);

    /*
     * Notify parent component when keyboard visibility changes
     */
    useEffect(() => {
        if (typeof onKeyboardVisibilityChange === 'function') {
            onKeyboardVisibilityChange(isKeyboardVisible);
        }
    }, [isKeyboardVisible, onKeyboardVisibilityChange]);

    // Only render the actual keyboard if conditions are met, but always mount the component
    // This ensures the ref API is always available to parent components
    const shouldRenderKeyboard = useKeyboard && isKeyboardVisible && isDesktop;

    return shouldRenderKeyboard ? <Keyboard ref={keyboardRef} searchInputElement={searchInput} /> : null;
});

KioskKeyboard.displayName = 'KioskKeyboard';

KioskKeyboard.propTypes = {
    onKeyboardVisibilityChange: PropTypes.func
};

export default KioskKeyboard;

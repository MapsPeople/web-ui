import { useRef, useEffect } from 'react';

/**
 * Saves the currently focused element when the panel opens,
 * and returns focus to it when the panel closes.
 * @param {boolean} isOpen - whether the panel is currently open
 */
export function useReturnFocus(isOpen) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);
}

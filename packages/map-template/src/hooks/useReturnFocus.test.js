import { renderHook, act } from '@testing-library/react';
import { useReturnFocus } from './useReturnFocus';

test('useReturnFocus returns focus to the element that was active when isOpen became true', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = renderHook(({ isOpen }) => useReturnFocus(isOpen), {
        initialProps: { isOpen: true },
    });

    const other = document.createElement('input');
    document.body.appendChild(other);
    other.focus();
    expect(document.activeElement).toBe(other);

    act(() => rerender({ isOpen: false }));
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
    document.body.removeChild(other);
});

import { renderHook, act } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { useInactive } from './useInactive';
import isMapReadyState from '../atoms/isMapReadyState';
import timeoutState from '../atoms/timoutState';

function wrapper({ children }) {
    return (
        <RecoilRoot initializeState={(snap) => {
            snap.set(isMapReadyState, true);
            snap.set(timeoutState, 120);
        }}>
            {children}
        </RecoilRoot>
    );
}

test('useInactive emits isWarning before isInactive', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useInactive(), { wrapper });

    expect(result.current.isWarning).toBe(false);
    expect(result.current.isInactive).toBe(false);

    act(() => jest.advanceTimersByTime(60_000));
    expect(result.current.isWarning).toBe(true);
    expect(result.current.isInactive).toBe(false);

    act(() => jest.advanceTimersByTime(60_000));
    expect(result.current.isInactive).toBe(true);

    jest.useRealTimers();
});

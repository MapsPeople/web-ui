import { renderHook, act } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { useMapLoadingProgress } from './useMapLoadingProgress';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import isMapReadyState from '../atoms/isMapReadyState';
import notificationMessageState from '../atoms/notificationMessageState';

function createSdkInstance(initialProgress = { phase: 'fetching_locations', progress: 0.35 }) {
    const listeners = new Map();
    return {
        getLoadingProgress: () => initialProgress,
        on: (event, handler) => {
            const current = listeners.get(event) ?? [];
            current.push(handler);
            listeners.set(event, current);
        },
        off: (event, handler) => {
            const current = listeners.get(event) ?? [];
            listeners.set(event, current.filter(item => item !== handler));
        },
        emit: (event, payload) => {
            for (const handler of listeners.get(event) ?? []) {
                handler(payload);
            }
        }
    };
}

function wrapperWith(instance, isMapReady = false) {
    return function Wrapper({ children }) {
        return (
            <RecoilRoot initializeState={({ set }) => {
                set(mapsIndoorsInstanceState, instance);
                set(isMapReadyState, isMapReady);
            }}>
                {children}
            </RecoilRoot>
        );
    };
}

function wrapperWithReadyControls(instance, controls, isMapReady = false) {
    function ReadyControls() {
        controls.setReady = useSetRecoilState(isMapReadyState);
        return null;
    }

    return function Wrapper({ children }) {
        return (
            <RecoilRoot initializeState={({ set }) => {
                set(mapsIndoorsInstanceState, instance);
                set(isMapReadyState, isMapReady);
            }}>
                <ReadyControls />
                {children}
            </RecoilRoot>
        );
    };
}

describe('useMapLoadingProgress', () => {
    test('reads the SDK snapshot and follows loading_progress events', () => {
        const instance = createSdkInstance();
        const { result } = renderHook(
            () => useMapLoadingProgress({ mapsindoorsSDKAvailable: true, appConfig: {} }),
            { wrapper: wrapperWith(instance) }
        );

        expect(result.current.phase).toBe('fetching_locations');
        expect(result.current.progress).toBe(0.35);
        expect(result.current.showSplash).toBe(true);

        act(() => {
            instance.emit('loading_progress', { phase: 'loading_3d_models', progress: 0.88 });
        });

        expect(result.current.phase).toBe('loading_3d_models');
        expect(result.current.seenPhases.has('loading_3d_models')).toBe(true);
    });

    test('hides the splash after content_ready', () => {
        jest.useFakeTimers();
        const instance = createSdkInstance();
        const { result } = renderHook(
            () => useMapLoadingProgress({ mapsindoorsSDKAvailable: true, appConfig: {} }),
            { wrapper: wrapperWith(instance) }
        );

        act(() => {
            instance.emit('content_ready');
        });

        expect(result.current.phase).toBe('complete');
        expect(result.current.isFading).toBe(true);

        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(result.current.showSplash).toBe(false);
        jest.useRealTimers();
    });

    test('hides the splash after 60s if content_ready never arrives', () => {
        jest.useFakeTimers();
        const instance = createSdkInstance({ phase: 'fetching_locations', progress: 0.35 });
        const { result } = renderHook(
            () => useMapLoadingProgress({ mapsindoorsSDKAvailable: true, appConfig: {} }),
            { wrapper: wrapperWith(instance) }
        );

        expect(result.current.showSplash).toBe(true);

        act(() => {
            jest.advanceTimersByTime(60000);
        });

        expect(result.current.phase).toBe('complete');

        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(result.current.showSplash).toBe(false);
        jest.useRealTimers();
    });

    test('ignores late loading_progress after the hard timeout so the splash still hides', () => {
        jest.useFakeTimers();
        const instance = createSdkInstance({ phase: 'fetching_locations', progress: 0.35 });
        const { result } = renderHook(
            () => useMapLoadingProgress({ mapsindoorsSDKAvailable: true, appConfig: {} }),
            { wrapper: wrapperWith(instance) }
        );

        act(() => {
            jest.advanceTimersByTime(60000);
        });

        expect(result.current.phase).toBe('complete');
        expect(result.current.isFading).toBe(true);

        act(() => {
            instance.emit('loading_progress', { phase: 'applying_to_map', progress: 0.95 });
        });

        expect(result.current.phase).toBe('complete');

        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(result.current.showSplash).toBe(false);
        jest.useRealTimers();
    });

    test('re-arms the hard timeout after a map reset before and after 60s', () => {
        jest.useFakeTimers();
        const instance = createSdkInstance({ phase: 'fetching_locations', progress: 0.35 });
        const controls = {};
        const { result } = renderHook(
            () => useMapLoadingProgress({ mapsindoorsSDKAvailable: true, appConfig: {} }),
            { wrapper: wrapperWithReadyControls(instance, controls) }
        );

        act(() => {
            jest.advanceTimersByTime(50000);
        });

        expect(result.current.showSplash).toBe(true);
        expect(result.current.phase).toBe('fetching_locations');

        act(() => {
            controls.setReady(true);
        });
        act(() => {
            controls.setReady(false);
        });

        expect(result.current.showSplash).toBe(true);
        expect(result.current.phase).toBe('initializing');

        act(() => {
            instance.emit('loading_progress', { phase: 'fetching_locations', progress: 0.4 });
        });

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        expect(result.current.phase).not.toBe('complete');
        expect(result.current.showSplash).toBe(true);

        act(() => {
            jest.advanceTimersByTime(50000);
        });

        expect(result.current.phase).toBe('complete');

        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(result.current.showSplash).toBe(false);

        act(() => {
            controls.setReady(true);
        });
        act(() => {
            controls.setReady(false);
        });

        expect(result.current.showSplash).toBe(true);

        act(() => {
            instance.emit('loading_progress', { phase: 'applying_to_map', progress: 0.9 });
        });

        act(() => {
            jest.advanceTimersByTime(59999);
        });

        expect(result.current.phase).toBe('applying_to_map');
        expect(result.current.showSplash).toBe(true);

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(result.current.phase).toBe('complete');

        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(result.current.showSplash).toBe(false);
        jest.useRealTimers();
    });

    test('keeps the map-ready fallback after a reset when the SDK does not report progress', () => {
        jest.useFakeTimers();
        const instance = createSdkInstance({ phase: 'fetching_locations', progress: 0.35 });
        const controls = {};
        const { result } = renderHook(
            () => useMapLoadingProgress({ mapsindoorsSDKAvailable: true, appConfig: {} }),
            { wrapper: wrapperWithReadyControls(instance, controls) }
        );

        act(() => {
            controls.setReady(true);
        });
        act(() => {
            controls.setReady(false);
        });

        expect(result.current.phase).toBe('initializing');
        expect(result.current.showSplash).toBe(true);

        act(() => {
            controls.setReady(true);
        });

        act(() => {
            jest.advanceTimersByTime(2500);
        });

        expect(result.current.phase).toBe('complete');

        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(result.current.showSplash).toBe(false);
        jest.useRealTimers();
    });

    test('hides the splash as soon as a map load error is reported', () => {
        const instance = createSdkInstance({ phase: 'fetching_locations', progress: 0.35 });
        const controls = {};

        function ErrorControls() {
            controls.setError = useSetRecoilState(notificationMessageState);
            return null;
        }

        function Wrapper({ children }) {
            return (
                <RecoilRoot initializeState={({ set }) => {
                    set(mapsIndoorsInstanceState, instance);
                    set(isMapReadyState, false);
                }}>
                    <ErrorControls />
                    {children}
                </RecoilRoot>
            );
        }

        const { result } = renderHook(
            () => useMapLoadingProgress({ mapsindoorsSDKAvailable: true, appConfig: {} }),
            { wrapper: Wrapper }
        );

        expect(result.current.showSplash).toBe(true);

        act(() => {
            controls.setError({
                text: 'Please provide a Mapbox Access Token or Google Maps API key to show a map.',
                type: 'error'
            });
        });

        expect(result.current.showSplash).toBe(false);
        expect(result.current.isFading).toBe(false);
    });
});

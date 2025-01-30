import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useAppHistory } from './useAppHistory';

describe('useAppHistory', () => {
    beforeEach(() => {
        window.history.pushState = jest.fn();
        window.history.back = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('App View Navigation', () => {
        it('should initialize with undefined view', () => {
            const { result } = renderHook(() => useAppHistory());
            expect(result.current[2]).toBeUndefined();
        });

        it('should reset to undefined view when going back', async () => {
            const { result } = renderHook(() => useAppHistory());
            const [pushAppView, goBack] = result.current;

            await pushAppView('LOCATION_DETAILS');
            await goBack();
            window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
            
            expect(result.current[2]).toBeUndefined();
        });
        
        it('should update to LOCATION_DETAILS view then reset to undefined', () => {
            const { result } = renderHook(() => useAppHistory());
            const [pushAppView, ,] = result.current;
    
            act(() => {
                pushAppView('LOCATION_DETAILS');
            });
            
            // First verify LOCATION_DETAILS is set
            expect(result.current[2]).toBe('LOCATION_DETAILS');
            
            // Simulate state reset
            act(() => {
                window.dispatchEvent(new PopStateEvent('popstate', {
                    state: null
                }));
            });
            
            // Verify view reset to undefined
            expect(result.current[2]).toBeUndefined();
        });

        it('should update to WAYFINDING view then reset to undefined', () => {
            const { result } = renderHook(() => useAppHistory());
            const [pushAppView, ,] = result.current;
    
            act(() => {
                pushAppView('WAYFINDING');
            });
            
            // First verify WAYFINDING is set
            expect(result.current[2]).toBe('WAYFINDING');
            
            // Simulate state reset
            act(() => {
                window.dispatchEvent(new PopStateEvent('popstate', {
                    state: null
                }));
            });
            
            // Verify view reset to undefined
            expect(result.current[2]).toBeUndefined();
        });
    });
});
import { renderHook, act } from '@testing-library/react'; // Fixed import
import { useAppHistory } from '../../hooks/useAppHistory';

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

    it('should reset to undefined view when going back', () => {
      const { result } = renderHook(() => useAppHistory());
      const [pushAppView, goBack] = result.current;
      
      act(() => {
        pushAppView('LOCATION_DETAILS');
      });

      act(() => {
        goBack();
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      });

      expect(result.current[2]).toBeUndefined();
    });

    it('should update to LOCATION_DETAILS view then reset to undefined', () => {
      const { result } = renderHook(() => useAppHistory());
      const [pushAppView] = result.current;

      act(() => {
        pushAppView('LOCATION_DETAILS');
      });

      expect(result.current[2]).toBe('LOCATION_DETAILS');

      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      });

      expect(result.current[2]).toBeUndefined();
    });

    it('should update to WAYFINDING view then reset to undefined', () => {
      const { result } = renderHook(() => useAppHistory());
      const [pushAppView] = result.current;

      act(() => {
        pushAppView('WAYFINDING');
      });

      expect(result.current[2]).toBe('WAYFINDING');

      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      });

      expect(result.current[2]).toBeUndefined();
    });
  });
});
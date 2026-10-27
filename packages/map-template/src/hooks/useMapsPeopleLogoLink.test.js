import { renderHook, fireEvent } from '@testing-library/react';
import { useMapsPeopleLogoLink } from './useMapsPeopleLogoLink';

const createLogo = () => {
    const logo = document.createElement('img');
    logo.id = 'mi_map_logo';
    document.body.appendChild(logo);
    return logo;
};

describe('useMapsPeopleLogoLink', () => {
    beforeEach(() => {
        window.open = jest.fn();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('binds when the logo is already in the DOM', () => {
        const logo = createLogo();
        renderHook(() => useMapsPeopleLogoLink(true, {}));

        expect(logo.style.cursor).toBe('pointer');
        expect(logo.getAttribute('role')).toBe('link');
        expect(logo.getAttribute('tabindex')).toBe('0');
        expect(logo.getAttribute('aria-label')).toBe('MapsPeople website');
    });

    it('binds when the logo is added after mount', async () => {
        renderHook(() => useMapsPeopleLogoLink(true, {}));
        const logo = createLogo();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(logo.getAttribute('role')).toBe('link');
        fireEvent.click(logo);
        expect(window.open).toHaveBeenCalledTimes(1);
    });

    it('opens the MapsPeople website on click', () => {
        const logo = createLogo();
        renderHook(() => useMapsPeopleLogoLink(true, {}));

        fireEvent.click(logo);

        expect(window.open).toHaveBeenCalledWith('https://www.mapspeople.com/', '_blank', 'noopener,noreferrer');
    });

    it('opens on Enter keydown only', () => {
        const logo = createLogo();
        renderHook(() => useMapsPeopleLogoLink(true, {}));

        fireEvent.keyDown(logo, { key: ' ' });
        fireEvent.keyDown(logo, { key: 'Escape' });
        expect(window.open).not.toHaveBeenCalled();

        fireEvent.keyDown(logo, { key: 'Enter' });
        expect(window.open).toHaveBeenCalledWith('https://www.mapspeople.com/', '_blank', 'noopener,noreferrer');
    });

    it('does not bind when disabled', () => {
        const logo = createLogo();
        renderHook(() => useMapsPeopleLogoLink(false, {}));

        fireEvent.click(logo);

        expect(logo.getAttribute('role')).toBeNull();
        expect(logo.style.cursor).toBe('');
        expect(window.open).not.toHaveBeenCalled();
    });

    it('removes attributes and listeners on unmount', () => {
        const logo = createLogo();
        const { unmount } = renderHook(() => useMapsPeopleLogoLink(true, {}));

        unmount();
        fireEvent.click(logo);
        fireEvent.keyDown(logo, { key: 'Enter' });

        expect(logo.getAttribute('role')).toBeNull();
        expect(logo.getAttribute('tabindex')).toBeNull();
        expect(logo.getAttribute('aria-label')).toBeNull();
        expect(logo.style.cursor).toBe('');
        expect(window.open).not.toHaveBeenCalled();
    });

    describe('observer lifecycle', () => {
        const createInstance = (mapView) => {
            const handlers = {};
            return {
                handlers,
                getMapView: () => mapView,
                once: jest.fn((event, handler) => {
                    handlers[event] = handler;
                }),
                off: jest.fn(),
            };
        };

        it('disconnects the observer on instance ready when the map view is ready and no logo exists', async () => {
            const disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
            const instance = createInstance({ isReady: true });
            renderHook(() => useMapsPeopleLogoLink(true, instance));

            instance.handlers.ready();
            expect(disconnect).toHaveBeenCalled();

            const logo = createLogo();
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(logo.getAttribute('role')).toBeNull();
            disconnect.mockRestore();
        });

        it('waits for the map view ready when it is not ready yet', () => {
            const mapViewHandlers = {};
            const mapView = {
                isReady: false,
                once: jest.fn((event, handler) => {
                    mapViewHandlers[event] = handler;
                }),
                off: jest.fn(),
            };
            const instance = createInstance(mapView);
            const disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
            renderHook(() => useMapsPeopleLogoLink(true, instance));

            instance.handlers.ready();
            expect(mapView.once).toHaveBeenCalledWith('ready', expect.any(Function));
            expect(disconnect).not.toHaveBeenCalled();

            mapViewHandlers.ready();
            expect(disconnect).toHaveBeenCalled();
            disconnect.mockRestore();
        });

        it('removes the ready listeners on unmount', () => {
            const mapView = { isReady: false, once: jest.fn(), off: jest.fn() };
            const instance = createInstance(mapView);
            const { unmount } = renderHook(() => useMapsPeopleLogoLink(true, instance));

            unmount();

            expect(instance.off).toHaveBeenCalledWith('ready', instance.once.mock.calls[0][1]);
            expect(mapView.off).toHaveBeenCalledWith('ready', expect.any(Function));
        });
    });
});

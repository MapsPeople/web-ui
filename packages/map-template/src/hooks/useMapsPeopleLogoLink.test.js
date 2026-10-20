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

        await new Promise(resolve => setTimeout(resolve, 0));

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
});

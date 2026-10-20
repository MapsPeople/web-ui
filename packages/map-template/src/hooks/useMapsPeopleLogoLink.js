import { useEffect } from 'react';

const LOGO_ID = 'mi_map_logo';
const MAPSPEOPLE_URL = 'https://www.mapspeople.com/';

const openMapsPeopleWebsite = () => window.open(MAPSPEOPLE_URL, '_blank', 'noopener,noreferrer');

const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
        openMapsPeopleWebsite();
    }
};

const bindLogo = (logo) => {
    logo.style.cursor = 'pointer';
    logo.setAttribute('role', 'link');
    logo.setAttribute('tabindex', '0');
    logo.setAttribute('aria-label', 'MapsPeople website');
    logo.addEventListener('click', openMapsPeopleWebsite);
    logo.addEventListener('keydown', handleKeyDown);
};

const unbindLogo = (logo) => {
    logo.style.cursor = '';
    logo.removeAttribute('role');
    logo.removeAttribute('tabindex');
    logo.removeAttribute('aria-label');
    logo.removeEventListener('click', openMapsPeopleWebsite);
    logo.removeEventListener('keydown', handleKeyDown);
};

export function useMapsPeopleLogoLink(enabled, mapsIndoorsInstance) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const observer = new MutationObserver(() => {
            const logo = document.getElementById(LOGO_ID);
            if (logo) {
                bindLogo(logo);
                observer.disconnect();
            }
        });

        const existingLogo = document.getElementById(LOGO_ID);
        if (existingLogo) {
            bindLogo(existingLogo);
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        return () => {
            observer.disconnect();
            const logo = document.getElementById(LOGO_ID);
            if (logo) {
                unbindLogo(logo);
            }
        };
    }, [enabled, mapsIndoorsInstance]);
}

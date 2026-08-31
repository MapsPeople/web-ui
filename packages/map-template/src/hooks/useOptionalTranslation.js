import { useEffect, useState } from 'react';
import i18n from 'i18next';

/**
 * Translate a key without `useTranslation`.
 *
 * i18n is initialized late in MapTemplate (after the SDK loads). `useTranslation`
 * takes a different hook path before and after that, which crashes any component
 * that is already mounted — SplashScreen is one of those.
 */
export function useOptionalTranslation() {
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const bump = () => setRevision(current => current + 1);

        if (i18n.isInitialized) {
            bump();
        }

        i18n.on('initialized', bump);
        i18n.on('languageChanged', bump);

        return () => {
            i18n.off('initialized', bump);
            i18n.off('languageChanged', bump);
        };
    }, []);

    return (key) => (revision >= 0 && i18n.isInitialized ? i18n.t(key) : key);
}

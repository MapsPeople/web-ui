import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.js';
import da from './da.js';
import de from './de.js';
import fr from './fr.js';
import it from './it.js';
import es from './es.js';

export default function initI18n(language) {
    i18n
        .use(initReactI18next)
        .init({
            resources: {
                en: {
                    translation: en
                },
                da: {
                    translation: da
                },
                de: {
                    translation: de
                },
                fr: {
                    translation: fr
                }, 
                it: {
                    translation: it
                }, 
                es: {
                    translation: es
                }
            },
            lng: language,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
            }
        });
}

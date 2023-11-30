import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en.js'; // TODO: Default exports
import { da } from './da.js';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: en
            },
            da: {
                translation: da
            }
        },
        lng: navigator.language, // TODO: Improve to support variants.
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
    });
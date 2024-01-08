import { selector } from 'recoil';
import languageState from '../atoms/languageState.js';

/**
 * Selector to get unit system for distances (imperial, metric) based on the current language.
 */
const distanceUnitSystemSelector = selector({
    key: 'unitSystem',
    get: ({ get }) => {
        const language = get(languageState);
        return language === 'en-US' ? 'imperial' : 'metric';
    }
});

export default distanceUnitSystemSelector;

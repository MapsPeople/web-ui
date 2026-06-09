declare const mapsindoors;

/**
 * Built-in fallback translations for the "Level" word used by location-info and
 * list-item-location web components when the consumer does not pass an explicit
 * `level` prop. Keys must match the canonical BCP-47 tags returned by the
 * MapsIndoors SDK after normalization (e.g. `zh-CN` is normalized to `zh-Hans`).
 */
const LEVEL_TRANSLATIONS: Record<string, string> = {
    en: 'Level',
    da: 'Etage',
    de: 'Etage',
    fr: 'Niveau',
    it: 'Livello',
    es: 'Nivel',
    nl: 'Niveau',
    'zh-Hans': '楼层',
    'zh-Hant': '樓層',
};

/**
 * Returns the localized default for the "Level" word based on the language
 * currently configured on the MapsIndoors SDK. Falls back to English when the
 * global `mapsindoors` is unavailable or the language has no entry.
 */
export function getLevelDefault(): string {
    const lang = typeof mapsindoors !== 'undefined'
        ? mapsindoors?.MapsIndoors?.getLanguage?.()
        : undefined;
    return LEVEL_TRANSLATIONS[lang] ?? LEVEL_TRANSLATIONS.en;
}

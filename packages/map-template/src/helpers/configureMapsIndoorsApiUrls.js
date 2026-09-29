const apiUrlsStorageKey = 'mi:apiUrls';
const managedApiUrlsStorageKey = 'mi:mapTemplateApiUrlsManaged';

export function normalizeMapsIndoorsApiUrls(apiUrls) {
    return `${apiUrls || ''}`
        .split(/[;,]/)
        .map(apiUrl => apiUrl.trim())
        .filter(Boolean)
        .map(apiUrl => {
            const url = new URL(apiUrl);
            return url.toString().replace(/\/+$/, '');
        });
}

export default function configureMapsIndoorsApiUrls(apiUrls) {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    let normalizedApiUrls;
    try {
        normalizedApiUrls = normalizeMapsIndoorsApiUrls(apiUrls);
    } catch {
        return;
    }

    try {
        if (normalizedApiUrls.length > 0) {
            window.localStorage.setItem(apiUrlsStorageKey, normalizedApiUrls.join(';'));
            window.localStorage.setItem(managedApiUrlsStorageKey, 'true');
            return;
        }

        if (window.localStorage.getItem(managedApiUrlsStorageKey) === 'true') {
            window.localStorage.removeItem(apiUrlsStorageKey);
            window.localStorage.removeItem(managedApiUrlsStorageKey);
        }
    } catch {
        return;
    }
}

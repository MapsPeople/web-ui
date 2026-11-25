/**
 * Returns the chat server base URL without trailing slashes, or '' when no value is set.
 *
 * @param {string} [url] - Normally import.meta.env.VITE_CHAT_API_URL.
 * @returns {string}
 */
export function resolveChatApiUrl(url) {
    return (url?.trim() ?? '').replace(/\/+$/, '');
}

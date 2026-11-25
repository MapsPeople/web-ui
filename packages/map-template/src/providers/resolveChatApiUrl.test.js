import { resolveChatApiUrl } from './resolveChatApiUrl';

describe('resolveChatApiUrl', () => {
    it('uses the given URL', () => {
        expect(resolveChatApiUrl('http://localhost:4000')).toBe('http://localhost:4000');
    });

    it('returns an empty string when unset or empty', () => {
        expect(resolveChatApiUrl(undefined)).toBe('');
        expect(resolveChatApiUrl('')).toBe('');
        expect(resolveChatApiUrl('  ')).toBe('');
    });

    it('strips trailing slashes', () => {
        expect(resolveChatApiUrl(' https://example.com// ')).toBe('https://example.com');
    });
});

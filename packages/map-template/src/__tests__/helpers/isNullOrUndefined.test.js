import isNullOrUndefined from '../../helpers/isNullOrUndefined';

describe('isNullOrUndefined', () => {
    test('returns true for null', () => {
        expect(isNullOrUndefined(null)).toBe(true);
    });

    test('returns true for undefined', () => {
        expect(isNullOrUndefined(undefined)).toBe(true);
    });

    test('returns false for zero', () => {
        expect(isNullOrUndefined(0)).toBe(false);
    });

    test('returns false for empty string', () => {
        expect(isNullOrUndefined('')).toBe(false);
    });

    test('returns false for false', () => {
        expect(isNullOrUndefined(false)).toBe(false);
    });

    test('returns false for objects', () => {
        expect(isNullOrUndefined({})).toBe(false);
    });

    test('returns false for arrays', () => {
        expect(isNullOrUndefined([])).toBe(false);
    });
});
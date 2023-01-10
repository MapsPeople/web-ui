import { format, isNumber } from './utils';

describe('format', () => {
    it('returns empty string for no names defined', () => {
        expect(format(undefined, undefined, undefined)).toEqual('');
    });

    it('formats just first names', () => {
        expect(format('Joseph', undefined, undefined)).toEqual('Joseph');
    });

    it('formats first and last names', () => {
        expect(format('Joseph', undefined, 'Publique')).toEqual('Joseph Publique');
    });

    it('formats first, middle and last names', () => {
        expect(format('Joseph', 'Quincy', 'Publique')).toEqual(
            'Joseph Quincy Publique'
        );
    });
});

describe('isNumber', () => {
    it('returns false for "abc"', () => {
        expect(isNumber("abc")).toBe(false);
    });
    it('returns false for ""', () => {
        expect(isNumber('')).toBe(false);
    });
    it('returns true for "123"', () => {
        expect(isNumber("123")).toBe(true);
    });
    it('returns true for 456', () => {
        expect(isNumber(456)).toBe(true);
    });
    it('returns true for "def789"', () => {
        expect(isNumber("def789")).toBe(false);
    });
});

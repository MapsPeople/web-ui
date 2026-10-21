import { format, getBiasPoint, isNumber } from './utils';

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

describe('getBiasPoint', () => {
    it('uses userPosition as longitude,latitude', () => {
        expect(getBiasPoint('12.5,55.7', undefined)).toEqual({ lat: 55.7, lng: 12.5 });
    });

    it('uses miNear as latitude,longitude when userPosition is not set', () => {
        expect(getBiasPoint(undefined, '52.36,13.5')).toEqual({ lat: 52.36, lng: 13.5 });
    });

    it('prefers userPosition over miNear', () => {
        expect(getBiasPoint('12.5,55.7', '52.36,13.5')).toEqual({ lat: 55.7, lng: 12.5 });
    });

    it('returns undefined when neither is set', () => {
        expect(getBiasPoint(undefined, undefined)).toBeUndefined();
    });

    it('returns undefined when miNear is not a coordinate', () => {
        expect(getBiasPoint(undefined, 'venue:abc')).toBeUndefined();
    });

    it('handles whitespace after the comma', () => {
        expect(getBiasPoint(undefined, '52.36, 13.5')).toEqual({ lat: 52.36, lng: 13.5 });
    });
});

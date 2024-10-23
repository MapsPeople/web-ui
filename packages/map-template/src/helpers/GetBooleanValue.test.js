import getBooleanValue from "./GetBooleanValue";

describe('getBooleanValue', () => {
    // Test cases for supportsUrlParameters === true
    it('should return true when supportsUrlParameters is true and queryParameterValue is true', () => {
        expect(getBooleanValue(true, false, false, true)).toBe(true);
        expect(getBooleanValue(true, false, false, 'true')).toBe(true);
    });
    it('should return false when supportsUrlParameters is true and queryParameterValue is false', () => {
        expect(getBooleanValue(true, true, true, false)).toBe(false);
        expect(getBooleanValue(true, true, true, 'false')).toBe(false);
    });
    it('should return false when supportsUrlParameters is true and queryParameterValue is not "true"', () => {
        expect(getBooleanValue(true, true, true, 'something_else')).toBe(false);
        expect(getBooleanValue(true, true, true, null)).toBe(false);
        expect(getBooleanValue(true, true, true, undefined)).toBe(false);
    });
    // Test cases for when queryParameterValue is null or undefined
    it('should return propValue when queryParameterValue is null/undefined and propValue is a boolean', () => {
        expect(getBooleanValue(true, false, true, null)).toBe(true);
        expect(getBooleanValue(true, false, false, undefined)).toBe(false);
    });
    it('should return false when queryParameterValue is null/undefined and propValue is not a boolean', () => {
        expect(getBooleanValue(true, false, 'not_boolean', null)).toBe(false);
        expect(getBooleanValue(true, false, 123, undefined)).toBe(false);
    });
    // Test cases for when propValue is null or undefined
    it('should return defaultValue when propValue is null/undefined and defaultValue is provided', () => {
        expect(getBooleanValue(false, true, null, null)).toBe(true);
        expect(getBooleanValue(false, false, undefined, undefined)).toBe(false);
    });
    it('should return undefined when propValue and defaultValue are null/undefined', () => {
        expect(getBooleanValue(false, undefined, null, null)).toBe(undefined);
    });
    // Test cases for when supportsUrlParameters is false
    it('should return propValue when supportsUrlParameters is false and propValue is a boolean', () => {
        expect(getBooleanValue(false, true, true, 'false')).toBe(true);
        expect(getBooleanValue(false, true, false, 'true')).toBe(false);
    });
    it('should return defaultValue when supportsUrlParameters is false and propValue is null/undefined', () => {
        expect(getBooleanValue(false, true, null, 'false')).toBe(true);
        expect(getBooleanValue(false, false, null, 'true')).toBe(false);
    });
});
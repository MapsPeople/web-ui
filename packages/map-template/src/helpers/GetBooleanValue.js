import isNullOrUndefined from "./isNullOrUndefined";

/**
 * Determines the boolean value based on several parameters.
 * 
 * Test Scenarios for the function:
 * 
 * If `queryParameterValue` is `true`, then the result is `true`.
 * If `queryParameterValue` is `false`, then the result is `false`.
 * If `queryParameterValue` is anything other than the string `'true'`, then the result is `false`.
 * If `queryParameterValue` is `null` or `undefined` and `propValue` is boolean `true`, then the result is `true`.
 * If `queryParameterValue` is `null` or `undefined` and `propValue` is boolean `false`, then the result is `false`.
 * If `queryParameterValue` is `null` or `undefined` and `propValue` is present but not a boolean, then the result is `false`.
 * If both `queryParameterValue` and `propValue` are `null` or `undefined`, then the function falls back to `defaultValue`.
 *
 * @param {boolean} supportsUrlParameters - A boolean indicating if URL parameters should be considered.
 * @param {object} defaultValue - The default boolean value to use if no other valid value is found.
 * @param {object} propValue - A property value that can override the default.
 * @param {object} queryParameterValue - A URL query parameter value that can override both default and prop values.
 *
 * @returns {boolean} - The final boolean result based on the input values.
 */
export default function getBooleanValue(supportsUrlParameters, defaultValue, propValue, queryParameterValue) {
    let result;

    // Check if URL parameters are supported and the query parameter is not null or undefined
    if (supportsUrlParameters === true && !isNullOrUndefined(queryParameterValue)) {
        // Set result based on the query parameter value
        if (queryParameterValue === true || queryParameterValue === 'true') {
            result = true;
        } else if (queryParameterValue === false || queryParameterValue !== 'true') {
            result = false;
        }
    } 
    // If propValue is defined, use it if it's a boolean
    else if (!isNullOrUndefined(propValue)) {
        result = typeof propValue === 'boolean' ? propValue : false;
    } 
    // Fallback to defaultValue if it's defined
    else if (!isNullOrUndefined(defaultValue)) {
        result = defaultValue;
    }

    return result;
}

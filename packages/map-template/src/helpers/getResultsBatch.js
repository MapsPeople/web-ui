export const RESULTS_BATCH_SIZE = 100;

const compareByName = (a, b) => (a.properties?.name || '')
    .localeCompare(b.properties?.name || '', undefined, { numeric: true });

/**
 * Get the revealed part of a result set. When sorting, the full set is sorted before slicing.
 *
 * @param {Array} results - All results.
 * @param {number} count - Number of results to reveal.
 * @param {boolean} sortAlphabetically - Sort the full set by name before slicing.
 * @returns {Array}
 */
export default function getResultsBatch(results, count, sortAlphabetically) {
    const ordered = sortAlphabetically ? [...results].sort(compareByName) : results;
    return ordered.slice(0, count);
}

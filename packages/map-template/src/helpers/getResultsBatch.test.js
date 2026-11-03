import getResultsBatch, { RESULTS_BATCH_SIZE } from './getResultsBatch';

const makeResults = (count, nameOf = index => `Location ${index}`) =>
    Array.from({ length: count }, (_, index) => ({ id: String(index), properties: { name: nameOf(index) } }));

describe('getResultsBatch', () => {
    it('uses a batch size of 100', () => {
        expect(RESULTS_BATCH_SIZE).toBe(100);
    });

    it('returns all results when there are fewer than the count', () => {
        const results = makeResults(40);
        expect(getResultsBatch(results, RESULTS_BATCH_SIZE, false)).toEqual(results);
    });

    it('returns all results when there are exactly as many as the count', () => {
        const results = makeResults(100);
        expect(getResultsBatch(results, 100, false)).toEqual(results);
    });

    it('returns only the first batch when there are more results than the count', () => {
        const results = makeResults(250);
        expect(getResultsBatch(results, 100, false)).toEqual(results.slice(0, 100));
    });

    it('returns the first two batches cumulatively', () => {
        const results = makeResults(250);
        expect(getResultsBatch(results, 200, false)).toEqual(results.slice(0, 200));
    });

    it('sorts the full result set before slicing across the batch boundary', () => {
        const results = makeResults(150, index => `Name ${String(150 - index).padStart(3, '0')}`);
        const batch = getResultsBatch(results, 100, true);
        expect(batch).toHaveLength(100);
        expect(batch[0].properties.name).toBe('Name 001');
        expect(batch[99].properties.name).toBe('Name 100');
    });

    it('sorts numerically and tolerates missing names', () => {
        const results = [
            { id: 'a', properties: { name: 'Room 10' } },
            { id: 'b', properties: {} },
            { id: 'c', properties: { name: 'Room 2' } },
        ];
        expect(getResultsBatch(results, 100, true).map(result => result.id)).toEqual(['b', 'c', 'a']);
    });

    it('keeps the original order and does not mutate the input when not sorting', () => {
        const results = makeResults(3, index => `Z${3 - index}`);
        const copy = [...results];
        expect(getResultsBatch(results, 100, false)).toEqual(copy);
        expect(results).toEqual(copy);
    });
});

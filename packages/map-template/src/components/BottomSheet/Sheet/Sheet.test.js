// import { snapPoints } from '../../../constants/snapPoints';
// import { calculateSnapPoint } from './Sheet';




// To run the tests manually while we still have no test framework set up:

// 1. Copy the snapPoints constant to this file and remove this empty one:
const snapPoints = {};
// 2. Copy the calculateSnapPoint function to this file and remove this empty one:
function calculateSnapPoint() { }

describe('findSnapPoint', () => {
    it('Should return the current snap point if the swipe length is less than the minimum of 60 px', () => {
        const result = calculateSnapPoint('UP', 30, 'ANY_SNAP_POINT', 100, 100);
        expect(result).toBe('ANY_SNAP_POINT');
    });

    // From MIN

    describe('swiping UP from MIN', () => {
        it('Should return the FIT snap point when the content height is more than the minimum height', () => {
            const result = calculateSnapPoint('UP', 100, snapPoints.MIN, 100, 80, 300);
            expect(result).toBe(snapPoints.FIT);
        });

        it('Should return the MAX snap point when the content height is more than the max height', () => {
            const result = calculateSnapPoint('UP', 100, snapPoints.MIN, 400, 80, 300);
            expect(result).toBe(snapPoints.MAX);
         });

         it('Should return the MAX snap point when the content height is less than the min height', () => {
            const result = calculateSnapPoint('UP', 100, snapPoints.MIN, 60, 80, 300);
            expect(result).toBe(snapPoints.MAX);
         });
    });

    describe('swiping DOWN from MIN', () => {
        it('Should return undefined', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.MIN, 100, 100);
            expect(result).toBe(undefined);
        });
    });

    // From FIT

    describe('swiping UP from FIT', () => {
        it('Should return the MAX snap point', () => {
            const result = calculateSnapPoint('UP', 100, snapPoints.FIT, 100, 80);
            expect(result).toBe(snapPoints.MAX);
        });
    });

    describe('swiping DOWN from FIT', () => {
        it('Should return the MIN snap point', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.FIT, 40, 80);
            expect(result).toBe(snapPoints.MIN);
        });
    });

    // From MAX

    describe('swiping UP from MAX', () => {
        it('Should return undefined', () => {
            const result = calculateSnapPoint('UP', 100, snapPoints.MAX, 100, 100);
            expect(result).toBe(undefined);
        });
    });

    describe('swiping DOWN from MAX', () => {
        it('Should return the FIT snap point when the content height is less than full available height and more than min height', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.MAX, 600, 100, 1000);
            expect(result).toBe(snapPoints.FIT);
        });

        it('Should return the MIN snap point when the content height is less than full available height and less than min height', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.MAX, 40, 100, 600);
            expect(result).toBe(snapPoints.MIN);
        });

        it('Should return the MIN snap point when the content height is equal or more than full available height', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.MAX, 1000, 100, 600);
            expect(result).toBe(snapPoints.MIN);
        });
    });
});

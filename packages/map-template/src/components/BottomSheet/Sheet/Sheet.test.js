// import { snapPoints } from '../../../constants/snapPoints';
// import { calculateSnapPoint } from './Sheet';




// To run the tests manually while we still have no test framework set up:

// 1. Copy the snapPoints constant to this file and remove this empty one:
const snapPoints = {};
// 2. Copy the calculateSnapPoint and hasScrollableContent functions to this file and remove these empty ones:
function calculateSnapPoint() { }
function hasScrollableContent() { } // eslint-disable-line no-unused-vars

// DOM element mock
const mockElement = {
    scrollHeight: 0,
    clientHeight: 0,
    children: []
};

describe('findSnapPoint', () => {
    it('Should return the current snap point if the swipe length is less than the minimum of 60 px', () => {
        const result = calculateSnapPoint('UP', 30, 'ANY_SNAP_POINT', 100, 100, mockElement);
        expect(result).toBe('ANY_SNAP_POINT');
    });

    // From MIN

    describe('swiping UP from MIN', () => {
        it('Should return the FIT snap point when the content height is more than the minimum height', () => {
            const element = JSON.parse(JSON.stringify(mockElement));
            element.clientHeight = 120;
            element.scrollHeight = 120;
            const result = calculateSnapPoint('UP', 100, snapPoints.MIN, 100, 720, element);
            expect(result).toBe(snapPoints.FIT);
        });

        it('Should return the MAX snap point when the content height is more than the max height', () => {
            const element = JSON.parse(JSON.stringify(mockElement));
            element.clientHeight = 1000;
            element.scrollHeight = 1000;
            const result = calculateSnapPoint('UP', 100, snapPoints.MIN, 100, 720, element);
            expect(result).toBe(snapPoints.MAX);
        });

        it('Should return the MAX snap point when the content height is less than the min height', () => {
            const element = JSON.parse(JSON.stringify(mockElement));
            element.clientHeight = 50;
            element.scrollHeight = 50;
            const result = calculateSnapPoint('UP', 100, snapPoints.MIN, 60, 80, element);
            expect(result).toBe(snapPoints.MAX);
        });
    });

    describe('swiping DOWN from MIN', () => {
        it('Should return undefined', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.MIN, 100, 720, mockElement);
            expect(result).toBe(undefined);
        });
    });

    // From FIT

    describe('swiping UP from FIT', () => {
        it('Should return the MAX snap point', () => {
            const result = calculateSnapPoint('UP', 100, snapPoints.FIT, 100, 720, mockElement);
            expect(result).toBe(snapPoints.MAX);
        });
    });

    describe('swiping DOWN from FIT', () => {
        it('Should return the MIN snap point', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.FIT, 40, 720, mockElement);
            expect(result).toBe(snapPoints.MIN);
        });
    });

    // From MAX

    describe('swiping UP from MAX', () => {
        it('Should return undefined', () => {
            const result = calculateSnapPoint('UP', 100, snapPoints.MAX, 100, 720, mockElement);
            expect(result).toBe(undefined);
        });
    });

    describe('swiping DOWN from MAX', () => {
        it('Should return the FIT snap point when the content height is less than full available height and more than min height', () => {
            const element = JSON.parse(JSON.stringify(mockElement));
            element.clientHeight = 600;
            element.scrollHeight = 600;
            const result = calculateSnapPoint('DOWN', 100, snapPoints.MAX, 100, 720, element);
            expect(result).toBe(snapPoints.FIT);
        });

        it('Should return the MIN snap point when the content height is less than full available height and less than min height', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.MAX, 40, 720, mockElement);
            expect(result).toBe(snapPoints.MIN);
        });

        it('Should return the MIN snap point when the content height is equal or more than full available height', () => {
            const result = calculateSnapPoint('DOWN', 100, snapPoints.MAX, 1000, 100, mockElement);
            expect(result).toBe(snapPoints.MIN);
        });
    });
});

import {
    SEARCH_COLLAPSED_HEIGHT_PX,
    LOCATION_DETAILS_COLLAPSED_HEIGHT_PX,
    SNAP_POINTS_DEFAULT,
    SNAP_POINTS_SEARCH,
    SNAP_POINTS_LOCATION_DETAILS,
    SNAP_POINTS_LOCATIONS_LIST
} from './bottomSheetSnapPoints';

describe('bottom sheet snap points', () => {
    it('keeps the search sheet snap contract', () => {
        expect(SEARCH_COLLAPSED_HEIGHT_PX).toBe(80);
        expect(SNAP_POINTS_SEARCH).toEqual([0, 80, 1]);
    });

    it('keeps the location details sheet snap contract', () => {
        expect(LOCATION_DETAILS_COLLAPSED_HEIGHT_PX).toBe(180);
        expect(SNAP_POINTS_LOCATION_DETAILS).toEqual([0, 180, 0.5, 1]);
    });

    it('keeps the locations list sheet snap contract', () => {
        expect(SNAP_POINTS_LOCATIONS_LIST).toEqual([0, 200, 1]);
    });

    it('keeps the default content sheet snap contract', () => {
        expect(SNAP_POINTS_DEFAULT).toEqual([0, 1]);
    });
});

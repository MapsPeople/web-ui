import { atom } from 'recoil';

/**
 * Lightweight venue descriptors for all venues in the current solution.
 * Each item contains { id, name, displayName, image } — no geometry or SDK-specific fields.
 * `name` is the internal venue identifier used for comparisons (matches appConfig and SDK).
 * `displayName` is the localized/user-facing name from venueInfo, used only for UI rendering.
 * Used for display (VenueSelector), name→id lookups, and default venue resolution.
 *
 * @type {{ id: string, name: string, displayName: string, image: string|undefined }[]}
 */
const venueListState = atom({
    key: 'venueList',
    default: []
});

export default venueListState;

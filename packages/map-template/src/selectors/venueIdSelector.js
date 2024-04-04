import { selector } from 'recoil';
import loadVenueState from '../atoms/loadVenueState.js';
import venueInfoState from '../atoms/venueInfoState.js';
import currentVenueNameState from '../atoms/currentVenueNameState.js';

/**
 * Selector to get the sorted fields based on the kioskLocationState.
 */
const venueIdSelector = selector({
    key: 'venueId',
    get: ({ get }) => {
        const loadVenue = get(loadVenueState);
        const venueInfo = get(venueInfoState);
        const currentVenueName = get(currentVenueNameState);

        let venueIdToSync;

        if (venueInfo && loadVenue === true) {
            console.log('venue id', loadVenue, venueInfo, currentVenueName);
            // console.log('venue info', venueInfo)
            // Get the id of the venue that is the current venue
            const venueId = venueInfo.find(venue => venue.name === currentVenueName)?.id;
            venueIdToSync = venueId;
        }

        return venueIdToSync;
    }
});

export default venueIdSelector;

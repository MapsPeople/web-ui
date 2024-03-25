import { atom } from 'recoil';

const loadVenueState = atom({
    key: 'loadVenue',
    default: false
});

export default loadVenueState;
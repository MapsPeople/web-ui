import { atom } from 'recoil';

const showVenueSelectorState = atom({
    key: 'showVenueSelector',
    default: true
});

export default showVenueSelectorState;
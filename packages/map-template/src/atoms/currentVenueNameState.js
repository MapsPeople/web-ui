import { atom } from 'recoil';

const currentVenueNameState = atom({
    key: 'currentVenueName',
    default: null
});

export default currentVenueNameState;

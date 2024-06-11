// Used for the useCurrentVenue hook

import { atom } from 'recoil';

const venueNameState = atom({
    key: 'venueNameState',
    default: null
});

export default venueNameState;

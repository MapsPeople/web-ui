import { atom } from 'recoil';

const filteredLocationsByExternalIDState = atom({
    key: 'filteredLocationsByExternalID',
    default: undefined
});

export default filteredLocationsByExternalIDState;

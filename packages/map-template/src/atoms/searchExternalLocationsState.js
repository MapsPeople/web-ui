import { atom } from 'recoil';

const searchExternalLocationsState = atom({
    key: 'searchExternalLocations',
    default: false
});

export default searchExternalLocationsState;
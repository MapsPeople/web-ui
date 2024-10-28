import { atom } from 'recoil';

const searchExternalLocationsState = atom({
    key: 'searchExternalLocations',
    default: true
});

export default searchExternalLocationsState;
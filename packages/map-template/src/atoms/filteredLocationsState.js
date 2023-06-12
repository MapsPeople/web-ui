import { atom } from 'recoil';

const filteredLocationsState = atom({
    key: 'filteredLocations',
    default: undefined
});

export default filteredLocationsState;

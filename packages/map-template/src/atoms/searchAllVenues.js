import { atom } from 'recoil';

const searchAllVenuesState = atom({
    key: 'searchAllVenues',
    default: false
});

export default searchAllVenuesState;
import { atom } from 'recoil';

const venuesState = atom({
    key: 'venues',
    default: []
});

export default venuesState;

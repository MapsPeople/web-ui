import { atom } from 'recoil';

const locationIdState = atom({
    key: 'locationId',
    default: undefined
});

export default locationIdState;

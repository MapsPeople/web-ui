import { atom } from 'recoil';

const currentLocationState = atom({
    key: 'currentLocation',
    default: null
});

export default currentLocationState;

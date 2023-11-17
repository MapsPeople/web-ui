import { atom } from 'recoil';

const currentKioskLocationState = atom({
    key: 'currentKioskLocation',
    default: null
});

export default currentKioskLocationState;
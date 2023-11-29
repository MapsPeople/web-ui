import { atom } from 'recoil';

const kioskLocationState = atom({
    key: 'kioskLocation',
    default: null
});

export default kioskLocationState;
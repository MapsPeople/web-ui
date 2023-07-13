import { atom } from 'recoil';

const logoState = atom({
    key: 'logo',
    default: undefined
});

export default logoState;

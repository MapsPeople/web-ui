import { atom } from 'recoil';

const bearingState = atom({
    key: 'bearing',
    default: null
});

export default bearingState;

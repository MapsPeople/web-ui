import { atom } from 'recoil';

const bearingState = atom({
    key: 'bearing',
    default: 0
});

export default bearingState;

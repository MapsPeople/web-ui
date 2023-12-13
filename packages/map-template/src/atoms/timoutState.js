import { atom } from 'recoil';

const timeoutState = atom({
    key: 'timeout',
    default: undefined
});

export default timeoutState;

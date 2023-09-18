import { atom } from 'recoil';

const sessionTokenState = atom({
    key: 'sessionToken',
    default: undefined
});

export default sessionTokenState;

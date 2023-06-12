import { atom } from 'recoil';

const userPositionState = atom({
    key: 'userPosition',
    default: null
});

export default userPositionState;

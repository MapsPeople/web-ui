import { atom } from 'recoil';

const venueSyncedState = atom({
    key: 'venueSynced',
    default: undefined
});

export default venueSyncedState;

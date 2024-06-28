import { atom } from 'recoil';

const showExternalIDsState = atom({
    key: 'showExternalIDs',
    default: false
});

export default showExternalIDsState;
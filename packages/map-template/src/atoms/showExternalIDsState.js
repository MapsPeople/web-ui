import { atom } from 'recoil';

const showExternalIDs = atom({
    key: 'showExternalIDs',
    default: false
});

export default showExternalIDs;
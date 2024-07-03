import { atom } from 'recoil';

const skipGoState = atom({
    key: 'skipGo',
    default: false
});

export default skipGoState;

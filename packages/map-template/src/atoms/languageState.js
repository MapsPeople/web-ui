import { atom } from 'recoil';

const languageState = atom({
    key: 'language',
    default: undefined
});

export default languageState;

import { atom } from 'recoil';

const appConfigState = atom({
    key: 'appConfig',
    default: undefined
});

export default appConfigState;

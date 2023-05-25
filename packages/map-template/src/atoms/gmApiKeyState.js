import { atom } from 'recoil';

const gmApiKeyState = atom({
    key: 'gmApiKey',
    default: null
});

export default gmApiKeyState;

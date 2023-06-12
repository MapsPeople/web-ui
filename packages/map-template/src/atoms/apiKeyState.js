import { atom } from 'recoil';

const apiKeyState = atom({
    key: 'apiKey',
    default: null
});

export default apiKeyState;

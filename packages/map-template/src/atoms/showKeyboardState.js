import { atom } from 'recoil';

const showKeyboardState = atom({
    key: 'showKeyboard',
    default: false
});

export default showKeyboardState;
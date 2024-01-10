import { atom } from 'recoil';

const useKeyboardState = atom({
    key: 'useKeyboard',
    default: false
});

export default useKeyboardState;
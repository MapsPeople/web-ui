import { atom } from 'recoil';

const accessibilityState = atom({
    key: 'accessibility',
    default: false
});

export default accessibilityState;

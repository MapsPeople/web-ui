import { atom } from 'recoil';

const accessibilityOnState = atom({
    key: 'accessibilityOn',
    default: false
});

export default accessibilityOnState;

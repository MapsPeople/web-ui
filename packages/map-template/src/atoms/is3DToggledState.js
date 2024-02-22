import { atom } from 'recoil';

const is3DToggledState = atom({
    key: 'is3DToggled',
    default: true
});

export default is3DToggledState;
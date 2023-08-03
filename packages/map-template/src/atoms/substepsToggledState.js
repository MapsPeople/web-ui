import { atom } from 'recoil';

const substepsToggledState = atom({
    key: 'substepsToggled',
    default: false
});

export default substepsToggledState;
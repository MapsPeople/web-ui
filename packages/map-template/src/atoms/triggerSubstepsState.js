import { atom } from 'recoil';

const triggerSubstepsState = atom({
    key: 'triggerSubsteps',
    default: false
});

export default triggerSubstepsState;
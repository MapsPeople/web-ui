import { atom } from 'recoil';

const venuesInSolutionState = atom({
    key: 'venues',
    default: []
});

export default venuesInSolutionState;

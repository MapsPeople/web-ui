import { atom } from 'recoil';

const solutionState = atom({
    key: 'solution',
    default: null,
    dangerouslyAllowMutability: true // Solution info needs mutability.
});

export default solutionState;

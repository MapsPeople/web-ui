import { atom } from 'recoil';

const isDestinationStepState = atom({
    key: 'isDestinationStep',
    default: false
});

export default isDestinationStepState;

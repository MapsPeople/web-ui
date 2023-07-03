import { atom } from 'recoil';

const activeStepState = atom({
    key: 'activeStep',
    default: 0
});

export default activeStepState;

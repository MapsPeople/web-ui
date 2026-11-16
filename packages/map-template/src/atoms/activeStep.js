import { atomWithReset } from 'jotai/utils';

const activeStepState = atomWithReset(0);

export default activeStepState;

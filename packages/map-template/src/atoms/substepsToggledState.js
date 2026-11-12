import { atomWithReset } from 'jotai/utils';

const substepsToggledState = atomWithReset(false);

export default substepsToggledState;
import { atomWithReset } from 'jotai/utils';

const currentLocationState = atomWithReset(null);

export default currentLocationState;

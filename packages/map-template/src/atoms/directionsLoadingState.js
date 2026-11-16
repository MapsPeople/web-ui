import { atomWithReset } from 'jotai/utils';

const directionsLoadingState = atomWithReset(false);

export default directionsLoadingState;

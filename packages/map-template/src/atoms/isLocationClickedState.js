import { atomWithReset } from 'jotai/utils';

const isLocationClickedState = atomWithReset(false);

export default isLocationClickedState;
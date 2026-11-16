import { atomWithReset } from 'jotai/utils';

const hasFoundRouteState = atomWithReset(true);

export default hasFoundRouteState;
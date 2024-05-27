import { atom } from 'recoil';

const hideNonMatchesState = atom({
    key: 'hideNonMatches',
    default: false
});

export default hideNonMatchesState;
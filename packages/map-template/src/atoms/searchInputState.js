import { atom } from 'recoil';

const searchInputState = atom({
    key: 'searchInput',
    default: undefined
});

export default searchInputState;

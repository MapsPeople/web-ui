import { atom } from 'recoil';

const searchResultsState = atom({
    key: 'searchResults',
    default: []
});

export default searchResultsState;

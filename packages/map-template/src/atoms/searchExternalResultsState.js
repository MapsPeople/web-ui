import { atom } from 'recoil';

const searchExternalResultsState = atom({
    key: 'searchExternalResults',
    default: false
});

export default searchExternalResultsState;
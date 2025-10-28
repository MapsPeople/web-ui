import { atom } from 'recoil';

const chatHistoryState = atom({
    key: 'chatHistoryState',
    default: []
});

export default chatHistoryState;

import { atom } from 'recoil';

const showRoadNamesState = atom({
    key: 'showRoadNames',
    default: true
});

export default showRoadNamesState;

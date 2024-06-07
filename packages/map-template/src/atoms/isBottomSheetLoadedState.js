import { atom } from 'recoil';

const isBottomSheetLoadedState = atom({
    key: 'isBottomSheetLoaded',
    default: false
});

export default isBottomSheetLoadedState;
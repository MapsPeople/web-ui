import { atom } from 'recoil';

const useAppTitleState = atom({
    key: 'useAppTitle',
    default: false
});

export default useAppTitleState;

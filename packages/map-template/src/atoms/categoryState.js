import { atom } from 'recoil';

const categoryState = atom({
    key: 'category',
    default: undefined
});

export default categoryState;
import { atom } from 'recoil';

const categoriesState = atom({
    key: 'categories',
    default: []
});

export default categoriesState;

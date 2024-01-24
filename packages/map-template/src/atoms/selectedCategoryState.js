import { atom } from 'recoil';

const selectedCategoryState = atom({
    key: 'selectedCategory',
    default: undefined
});

export default selectedCategoryState;

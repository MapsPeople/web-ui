import { atom } from 'recoil';

const hasCategoryPropState = atom({
    key: 'hasCategoryProp',
    default: false
});

export default hasCategoryPropState;
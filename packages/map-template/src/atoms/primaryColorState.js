import { atom } from 'recoil';

// The HEX value refers to the --brand-colors-dark-pine-100 from MIDT
const primaryColorState = atom({
    key: 'primaryColor',
    default: '#005655'
});

export default primaryColorState;

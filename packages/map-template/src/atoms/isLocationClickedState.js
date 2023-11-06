import { atom } from 'recoil';

const isLocationClickedState = atom({
    key: 'isLocationClicked',
    default: false
});

export default isLocationClickedState;
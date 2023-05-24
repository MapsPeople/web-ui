import { atom } from 'recoil';

const isMapReadyState = atom({
    key: 'isMapReady',
    default: false
});

export default isMapReadyState;
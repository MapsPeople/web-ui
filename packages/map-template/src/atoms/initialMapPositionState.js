import { atom } from 'recoil';

const initialMapPositionState = atom({
    key: 'initialMapPosition',
    default: {
        lat: undefined,
        lng: undefined,
        zoom: undefined,
        floor: undefined
    }
});

export default initialMapPositionState;

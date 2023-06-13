import { atom } from 'recoil';

const directionsResponseState = atom({
    key: 'directionsResponse',
    default: null
});

export default directionsResponseState;

import { atom } from 'recoil';

const directionsServiceState = atom({
    key: 'directionsService',
    default: null
});

export default directionsServiceState;

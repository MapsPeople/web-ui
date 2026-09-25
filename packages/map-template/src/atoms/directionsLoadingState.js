import { atom } from 'recoil';

const directionsLoadingState = atom({
    key: 'directionsLoading',
    default: false
});

export default directionsLoadingState;

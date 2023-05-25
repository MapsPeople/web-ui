import { atom } from 'recoil';

const mapsIndoorsInstanceState = atom({
    key: 'mapsIndoorsInstance',
    default: null,
    dangerouslyAllowMutability: true
});

export default mapsIndoorsInstanceState;

import { atom } from 'recoil';

const mapsIndoorsInstanceState = atom({
    key: 'mapsIndoorsInstance',
    default: null,
    dangerouslyAllowMutability: true // A MapsIndoors instance contains state. Needs mutability.
});

export default mapsIndoorsInstanceState;

import { atom } from 'recoil';

const positionControlState = atom({
    key: 'positionControl',
    default: null,
    dangerouslyAllowMutability: true // A MapsIndoors PositonControl contains state. Needs mutability.
});

export default positionControlState;

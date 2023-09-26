import { atom } from 'recoil';

const mapboxSessionTokenState = atom({
    key: 'mapboxSessionToken',
    default: undefined
});

export default mapboxSessionTokenState;

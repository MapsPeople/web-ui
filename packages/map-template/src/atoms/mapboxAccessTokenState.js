import { atom } from 'recoil';

const mapboxAccessTokenState = atom({
    key: 'mapboxAccessToken',
    default: null
});

export default mapboxAccessTokenState;

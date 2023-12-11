import { atom } from 'recoil';

const hasFoundRouteState = atom({
    key: 'hasFoundRoute',
    default: true
});

export default hasFoundRouteState;
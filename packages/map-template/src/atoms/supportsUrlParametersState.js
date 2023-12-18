import { atom } from 'recoil';

const supportsUrlParametersState = atom({
    key: 'supportsUrlParameters',
    default: false
});

export default supportsUrlParametersState;
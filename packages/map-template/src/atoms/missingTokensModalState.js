import { atom } from 'recoil';

const missingTokensModalState = atom({
    key: 'missingTOkensModal',
    default: true
});

export default missingTokensModalState;
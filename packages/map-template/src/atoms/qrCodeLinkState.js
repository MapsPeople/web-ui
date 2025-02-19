import { atom } from 'recoil';

const qrCodeLinkState = atom({
    key: 'qrCodeLink',
    default: null
});

export default qrCodeLinkState;

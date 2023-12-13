import { atom } from 'recoil';

const showQRCodeDialogState = atom({
    key: 'showQRCodeDialog',
    default: false
});

export default showQRCodeDialogState;
import { atom } from 'recoil';

const notificationMessageState = atom({
    key: 'notificationMessage',
    default: null
});

export default notificationMessageState;

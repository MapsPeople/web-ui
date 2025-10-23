import { atom } from 'recoil';

const shuttleBusOnState = atom({
    key: 'shuttleBusOn',
    default: false
});

export default shuttleBusOnState;

import { atom } from 'recoil';

// Possible values: null (not asked), 'granted', 'denied'
const userLocationShareState = atom({
    key: 'userLocationShare',
    default: null
});

export default userLocationShareState;

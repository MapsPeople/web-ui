import { atom } from 'jotai';

// Possible values: null (not asked), 'granted', 'denied'
const userLocationShareState = atom(null);

export default userLocationShareState;

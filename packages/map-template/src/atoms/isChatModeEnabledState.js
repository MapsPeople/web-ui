import { atom } from 'recoil';

/**
 * State to track whether chat mode is currently enabled.
 * This is used to control map highlighting behavior.
 */
const isChatModeEnabledState = atom({
    key: 'isChatModeEnabledState',
    default: false
});

export default isChatModeEnabledState;

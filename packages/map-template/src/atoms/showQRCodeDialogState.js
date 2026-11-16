import { atomWithReset } from 'jotai/utils';

const showQRCodeDialogState = atomWithReset(false);

export default showQRCodeDialogState;
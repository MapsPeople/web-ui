import { atomWithReset } from 'jotai/utils';

const isLegendDialogVisibleState = atomWithReset(false);

export default isLegendDialogVisibleState;
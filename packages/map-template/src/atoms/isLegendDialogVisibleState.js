import { atom } from 'recoil';

const isLegendDialogVisibleState = atom({
    key: 'isLegendDialogVisible',
    default: false
});

export default isLegendDialogVisibleState;
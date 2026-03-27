/* eslint-disable no-unused-vars */
// TODO: usePreventSwipe was removed from scrollable panels; re-check touch scroll vs sheet drag if regressions appear
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Sheet } from 'react-modal-sheet';
import { snapPoints } from '../../constants/snapPoints';
import Search from '../Search/Search';
import './BottomSheetNew.scss';
import styles from './BottomSheetNew.module.scss';

// Library expects ascending snapPoints including 0 (hidden) and 1 (full height); values > 1 are px from bottom.
const MIN_SNAP_HEIGHT_PX = 80;

BottomSheetNew.propTypes = {
    directionsFromLocation: PropTypes.string,
    directionsToLocation: PropTypes.string,
    pushAppView: PropTypes.func.isRequired,
    currentAppView: PropTypes.string,
    appViews: PropTypes.object.isRequired,
    onRouteFinished: PropTypes.func.isRequired
};

function BottomSheetNew({ pushAppView, currentAppView, appViews }) {
    const sheetRef = useRef(null);
    const [mountEl, setMountEl] = useState(null);
    const isOpen = currentAppView !== appViews.VENUE_SELECTOR;

    const modalSnapPoints = [0, MIN_SNAP_HEIGHT_PX, 1];

    function snapConstantToModalIndex(constant) {
        if (constant === snapPoints.MAX) {
            return 2;
        }
        if (constant === snapPoints.FIT) {
            return 2;
        }
        return 1;
    }

    function handleSearchSetSize(size) {
        sheetRef.current?.snapTo(snapConstantToModalIndex(size));
    }

    return (
        <div ref={setMountEl} className="bottom-sheets">
            {mountEl && <Sheet
                mountPoint={mountEl}
                ref={sheetRef}
                className="bottom-sheet-new"
                isOpen={isOpen}
                onClose={() => pushAppView(appViews.SEARCH)}
                disableScrollLocking
                snapPoints={modalSnapPoints}
                // Open at 80px (index 1), not fully hidden (index 0). snapTo(0) still means onClose in the library.
                initialSnap={1}
                // Drag dismiss snaps to first snap with height > 0 instead of calling onClose.
                disableDismiss
                unstyled
            >
                <Sheet.Container className={styles.sheetContainer}>
                    <Sheet.Header className={styles.sheetHeader} />
                    <Sheet.Content className={styles.sheetContent} unstyled>
                        {currentAppView === appViews.SEARCH && (
                            <Search
                                isOpen={true}
                                onSetSize={handleSearchSetSize}
                                onOpenChat={() => pushAppView(appViews.CHAT)}
                            />
                        )}
                    </Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop className={styles.sheetBackdrop} />
            </Sheet>}
        </div>
    );
}

export default BottomSheetNew;

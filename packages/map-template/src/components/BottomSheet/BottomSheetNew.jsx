/* eslint-disable no-unused-vars */
// TODO: usePreventSwipe was removed from scrollable panels; re-check touch scroll vs sheet drag if regressions appear
import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Sheet } from 'react-modal-sheet';
import { useRecoilState } from 'recoil';
import { snapPoints } from '../../constants/snapPoints';
import currentLocationState from '../../atoms/currentLocationState';
import Search from '../Search/Search';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import './BottomSheetNew.scss';
import styles from './BottomSheetNew.module.scss';

// Library expects ascending snapPoints including 0 (hidden) and 1 (full height); values > 1 are px from bottom.
const MIN_SNAP_HEIGHT_PX = 80;
const LOCATION_DETAILS_MIN_SNAP_HEIGHT_PX = 180;
const WAYFINDING_MIN_SNAP_HEIGHT_PX = 190;
const DIRECTIONS_MIN_SNAP_HEIGHT_PX = 273;

BottomSheetNew.propTypes = {
    directionsFromLocation: PropTypes.string,
    directionsToLocation: PropTypes.string,
    pushAppView: PropTypes.func.isRequired,
    currentAppView: PropTypes.string,
    appViews: PropTypes.object.isRequired,
    onRouteFinished: PropTypes.func.isRequired
};

function BottomSheetNew({ directionsFromLocation, directionsToLocation, pushAppView, currentAppView, appViews, onRouteFinished }) {
    const sheetRef = useRef(null);
    const [mountEl, setMountEl] = useState(null);
    const isOpen = currentAppView !== appViews.VENUE_SELECTOR;
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);

    useEffect(() => {
        if (currentLocation) {
            pushAppView(appViews.LOCATION_DETAILS);
        }
    }, [currentLocation]);

    function snapTo(sheetSnapPoints, constant) {
        if (constant === snapPoints.MAX) {
            sheetRef.current?.snapTo(sheetSnapPoints.length - 1);
        }
        // FIT and MIN are no-ops — detent="content" handles natural height
    }

    function sheetProps(mountPoint) {
        return {
            key: currentAppView,
            mountPoint,
            ref: sheetRef,
            className: 'bottom-sheet-new',
            isOpen,
            initialSnap: 1,
            unstyled: true,
        };
    }

    function renderSheet() {
        if (!mountEl) return null;

        switch (currentAppView) {
            case appViews.SEARCH: {
                const sp = [0, 1];
                return (
                    <Sheet {...sheetProps(mountEl)} snapPoints={sp} detent="content">
                        <Sheet.Container className={styles.sheetContainer}>
                            <Sheet.Header className={styles.sheetHeader}>
                                <div className={styles.dragHandle} />
                            </Sheet.Header>
                            <Sheet.Content className={styles.sheetContent} unstyled>
                                <Search
                                    isOpen={true}
                                    onSetSize={size => snapTo(sp, size)}
                                    onOpenChat={() => pushAppView(appViews.CHAT)}
                                />
                            </Sheet.Content>
                        </Sheet.Container>
                        <Sheet.Backdrop className={styles.sheetBackdrop} />
                    </Sheet>
                );
            }
            case appViews.LOCATION_DETAILS: {
                const sp = [0, 1];
                return (
                    <Sheet {...sheetProps(mountEl)} snapPoints={sp} detent="content">
                        <Sheet.Container className={styles.sheetContainer}>
                            <Sheet.Header className={styles.sheetHeader}>
                                <div className={styles.dragHandle} />
                            </Sheet.Header>
                            <Sheet.Content className={styles.sheetContent} unstyled>
                                <LocationDetails
                                    isOpen={true}
                                    onSetSize={size => snapTo(sp, size)}
                                    onBack={() => { setCurrentLocation(); pushAppView(appViews.SEARCH); }}
                                    onStartWayfinding={() => pushAppView(appViews.WAYFINDING)}
                                    onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                                />
                            </Sheet.Content>
                        </Sheet.Container>
                        <Sheet.Backdrop className={styles.sheetBackdrop} />
                    </Sheet>
                );
            }
            case appViews.WAYFINDING: {
                const sp = [0, 1];
                return (
                    <Sheet {...sheetProps(mountEl)} snapPoints={sp} detent="content">
                        <Sheet.Container className={styles.sheetContainer}>
                            <Sheet.Header className={styles.sheetHeader}>
                                <div className={styles.dragHandle} />
                            </Sheet.Header>
                            <Sheet.Content className={styles.sheetContent} unstyled>
                                <Wayfinding
                                    onSetSize={size => snapTo(sp, size)}
                                    onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                                    directionsToLocation={directionsToLocation}
                                    directionsFromLocation={directionsFromLocation}
                                    onBack={() => pushAppView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                                    isActive={true}
                                />
                            </Sheet.Content>
                        </Sheet.Container>
                        <Sheet.Backdrop className={styles.sheetBackdrop} />
                    </Sheet>
                );
            }
            case appViews.DIRECTIONS: {
                const sp = [0, 1];
                return (
                    <Sheet {...sheetProps(mountEl)} snapPoints={sp} detent="content" disableDrag>
                        <Sheet.Container className={styles.sheetContainer}>
                            <Sheet.Header className={styles.sheetHeader}>
                                <div className={styles.dragHandle} />
                            </Sheet.Header>
                            <Sheet.Content className={styles.sheetContent} unstyled>
                                <Directions
                                    onSetSize={size => snapTo(sp, size)}
                                    isOpen={true}
                                    onBack={() => pushAppView(appViews.WAYFINDING)}
                                    onRouteFinished={() => onRouteFinished()}
                                />
                            </Sheet.Content>
                        </Sheet.Container>
                        <Sheet.Backdrop className={styles.sheetBackdrop} />
                    </Sheet>
                );
            }
            default:
                return null;
        }
    }

    return (
        <div ref={setMountEl} className="bottom-sheets">
            {renderSheet()}
        </div>
    );
}

export default BottomSheetNew;

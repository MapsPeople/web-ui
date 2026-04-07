/**
 * Bottom sheets for map-template app views, built on react-modal-sheet.
 *
 * Library: https://github.com/Temzasse/react-modal-sheet
 * Docs & examples: https://temzasse.github.io/react-modal-sheet
 * npm: https://www.npmjs.com/package/react-modal-sheet
 *
 * Compound API: `Sheet`, `Sheet.Container`, `Sheet.Header`, `Sheet.Content`, `Sheet.Backdrop`.
 * Imperative ref: `sheetRef.current.snapTo(index)` — documented in the library README as **Methods and properties** → `snapTo(index)` (https://github.com/Temzasse/react-modal-sheet#%EF%B8%8F-methods-and-properties).
 */
import { useRef, useState, useEffect } from 'react';
import { useSnapState } from '../../hooks/useSnapState';
import PropTypes from 'prop-types';
import { Sheet } from 'react-modal-sheet';
import { useRecoilState } from 'recoil';
import { snapPoints } from '../../constants/snapPoints';
import currentLocationState from '../../atoms/currentLocationState';
import Search from '../Search/Search';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import ChatWindow from '../ChatWindow/ChatWindow';
import { useChatLocations, useChatDirections } from '../../hooks/useChat';
import './BottomSheetNew.scss';
import styles from './BottomSheetNew.module.scss';

/** Snap array for Search: `[0, px, 1]` — library requires ascending points; `0` = hidden, `1` = full height, middle values are px from bottom. */
const MIN_SNAP_HEIGHT_PX = 80;
const LOCATION_DETAILS_MIN_SNAP_HEIGHT_PX = 180;
/** Two-point sheet: closed → full (see `computeSnapPoints` in react-modal-sheet). */
const SP_DEFAULT = [0, 1];
/** Three-point sheet for Search: closed → 80px → full. */
const SP_SEARCH = [0, MIN_SNAP_HEIGHT_PX, 1];
/** Four-point sheet for LocationDetails: closed → 180px → half → full. */
const SP_LOCATION_DETAILS = [0, LOCATION_DETAILS_MIN_SNAP_HEIGHT_PX, 0.5, 1];

BottomSheetNew.propTypes = {
    directionsFromLocation: PropTypes.string,
    directionsToLocation: PropTypes.string,
    pushAppView: PropTypes.func.isRequired,
    currentAppView: PropTypes.string,
    appViews: PropTypes.object.isRequired,
    onRouteFinished: PropTypes.func.isRequired
};

/**
 * Renders the map overlay bottom sheet (react-modal-sheet) or chat for the current app view.
 *
 * @param {object} props - Root props object.
 * @param {string} [props.directionsFromLocation] - Origin location id or label for directions.
 * @param {string} [props.directionsToLocation] - Destination location id or label for directions.
 * @param {function(string): void} props.pushAppView - Navigates to an app view by key.
 * @param {string} props.currentAppView - Active view key (e.g. search, location details).
 * @param {object} props.appViews - Map of view name constants to route keys.
 * @param {function(): void} props.onRouteFinished - Called when an in-map route completes (e.g. directions done).
 * @returns {JSX.Element}
 */
function BottomSheetNew({ directionsFromLocation, directionsToLocation, pushAppView, currentAppView, appViews, onRouteFinished }) {
    const sheetRef = useRef(null);
    const [mountEl, setMountEl] = useState(null);
    const { handleSnap, isAtMaxSnap } = useSnapState(currentAppView);
    const isOpen = currentAppView !== appViews.VENUE_SELECTOR;
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const handleChatLocations = useChatLocations();
    const handleChatShowRoute = useChatDirections(pushAppView, appViews);

    useEffect(() => {
        if (currentLocation) {
            pushAppView(appViews.LOCATION_DETAILS);
        }
    }, [currentLocation]);

    /**
     * Builds an `onSetSize` handler for children: when the app requests `snapPoints.MAX`, calls `sheetRef.current.snapTo(lastIndex)` (react-modal-sheet).
     *
     * @param {number[]} sp - Same snap array passed to `Sheet` as `snapPoints`.
     * @returns {(size: string) => void} Callback for child `onSetSize`.
     */
    const expandToMax = (sp) => (size) => {
        if (size === snapPoints.MAX) {
            sheetRef.current?.snapTo(sp.length - 1);
        }
    };

    /**
     * Default props for `Sheet`: portal `mountPoint`, `ref`, `isOpen`, `unstyled` + local SCSS, `disableDismiss` (no swipe-to-close).
     *
     * @param {HTMLElement | null} mountPoint - DOM node used as `mountPoint` for the sheet portal.
     * @returns {object} Props object to spread onto `Sheet`.
     */
    function baseSheetProps(mountPoint) {
        return {
            key: currentAppView,
            mountPoint,
            ref: sheetRef,
            className: 'bottom-sheet-new',
            isOpen,
            initialSnap: 1,
            unstyled: true,
            disableDismiss: true,
            onClose: () => {},
        };
    }

    /**
     * One `Sheet` with `Sheet.Container` / `Header` / `Content` / `Backdrop` (react-modal-sheet compound components).
     *
     * @param {object} extraProps - Additional `Sheet` props (`snapPoints`, `detent`, `initialSnap`, `disableDrag`, …).
     * @param {React.ReactNode} inner - Content rendered inside `Sheet.Content`.
     * @returns {JSX.Element}
     */
    function sheetLayout(extraProps, inner) {
        return (
            <Sheet {...baseSheetProps(mountEl)} {...extraProps}>
                <Sheet.Container className={styles.sheetContainer}>
                    <Sheet.Header className={styles.sheetHeader}>
                        <div className={styles.dragHandle} />
                    </Sheet.Header>
                    <Sheet.Content className={styles.sheetContent} unstyled>
                        {inner}
                    </Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop className={styles.sheetBackdrop} />
            </Sheet>
        );
    }

    /**
     * Picks the sheet or chat tree for `currentAppView`. Search uses default `detent` and `[0, 80px, 1]` snaps; other sheets use `detent="content"` unless noted.
     *
     * @returns {JSX.Element | null} `null` until `mountEl` exists (except `CHAT`, which does not use the sheet portal mount).
     */
    function renderSheet() {
        if (!mountEl && currentAppView !== appViews.CHAT) return null;

        switch (currentAppView) {
            case appViews.SEARCH:
                return sheetLayout(
                    { initialSnap: 1, snapPoints: SP_SEARCH, onSnap: handleSnap },
                    <Search
                        isOpen={true}
                        isSheetExpanded={isAtMaxSnap(SP_SEARCH)}
                        onSetSize={expandToMax(SP_SEARCH)}
                        onOpenChat={() => pushAppView(appViews.CHAT)}
                    />
                );
            case appViews.LOCATION_DETAILS:
                return sheetLayout(
                    { snapPoints: SP_LOCATION_DETAILS, initialSnap: 1 },
                    <LocationDetails
                        isOpen={true}
                        onSetSize={expandToMax(SP_LOCATION_DETAILS)}
                        onBack={() => { setCurrentLocation(); pushAppView(appViews.SEARCH); }}
                        onStartWayfinding={() => pushAppView(appViews.WAYFINDING)}
                        onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                    />
                );
            case appViews.WAYFINDING:
                return sheetLayout(
                    { snapPoints: SP_DEFAULT, detent: 'content' },
                    <Wayfinding
                        onSetSize={expandToMax(SP_DEFAULT)}
                        onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                        directionsToLocation={directionsToLocation}
                        directionsFromLocation={directionsFromLocation}
                        onBack={() => pushAppView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                        isActive={true}
                    />
                );
            case appViews.DIRECTIONS:
                return sheetLayout(
                    { snapPoints: SP_DEFAULT, detent: 'content', disableDrag: true },
                    <Directions
                        onSetSize={expandToMax(SP_DEFAULT)}
                        isOpen={true}
                        onBack={() => pushAppView(appViews.WAYFINDING)}
                        onRouteFinished={() => { setCurrentLocation(); onRouteFinished(); pushAppView(appViews.SEARCH); }}
                    />
                );
            case appViews.CHAT:
                return (
                    <ChatWindow
                        isVisible
                        onClose={() => pushAppView(appViews.SEARCH)}
                        onSearchResults={handleChatLocations}
                        onShowRoute={handleChatShowRoute}
                    />
                );
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

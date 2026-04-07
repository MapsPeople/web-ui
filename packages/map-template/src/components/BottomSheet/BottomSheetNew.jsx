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
import { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Sheet } from 'react-modal-sheet';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { snapPoints } from '../../constants/snapPoints';
import currentLocationState from '../../atoms/currentLocationState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import locationIdState from '../../atoms/locationIdState';
import { useSnapState } from '../../hooks/useSnapState';
import { useChatLocations, useChatDirections } from '../../hooks/useChat';
import Search from '../Search/Search';
import LocationDetails from '../LocationDetails/LocationDetails';
import LocationsList from '../LocationsList/LocationsList';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import ChatWindow from '../ChatWindow/ChatWindow';
import './BottomSheetNew.scss';
import styles from './BottomSheetNew.module.scss';

/** Snap arrays: `0` = hidden, `1` = full height, middle values are px from bottom (library requires ascending order). */
const SEARCH_COLLAPSED_HEIGHT_PX = 80;
const LOCATION_DETAILS_COLLAPSED_HEIGHT_PX = 180;
/** Two-point sheet: closed → full (see `computeSnapPoints` in react-modal-sheet). */
const SNAP_POINTS_DEFAULT = [0, 1];
/** Three-point sheet for Search: closed → 80px → full. */
const SNAP_POINTS_SEARCH = [0, SEARCH_COLLAPSED_HEIGHT_PX, 1];
/** Four-point sheet for LocationDetails: closed → 180px → half → full. */
const SNAP_POINTS_LOCATION_DETAILS = [0, LOCATION_DETAILS_COLLAPSED_HEIGHT_PX, 0.5, 1];
/** Three-point sheet for LocationsList: closed → 200px → full. */
const SNAP_POINTS_LOCATIONS_LIST = [0, 200, 1];

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
    const [sheetMountPoint, setSheetMountPoint] = useState(null);
    const { handleSnap, isAtMaxSnap } = useSnapState(currentAppView);
    const isOpen = currentAppView !== appViews.VENUE_SELECTOR;
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const [filteredLocationsByExternalIDs, setFilteredLocationsByExternalID] = useRecoilState(filteredLocationsByExternalIDState);
    const setLocationId = useSetRecoilState(locationIdState);
    const handleChatLocations = useChatLocations();
    const handleChatShowRoute = useChatDirections(pushAppView, appViews);

    /**
     * The single place to run logic before switching to a new view.
     * Add a case here whenever a view transition requires setup or teardown — keeping that logic out of individual callbacks.
     *
     * @param {string} view - The target view key from `appViews`.
     */
    function navigateToView(view) {
        switch (view) {
            case appViews.SEARCH:
                setCurrentLocation(); // Clear selected location when returning to search.
                break;
        }
        pushAppView(view);
    }

    useEffect(() => {
        if (currentLocation) {
            navigateToView(appViews.LOCATION_DETAILS);
        }
    }, [currentLocation]);

    /*
     * Auto-navigate to Wayfinding when directionsFrom/To props are set externally (e.g. via web component attributes).
     * Guard against re-triggering while already in Directions.
     */
    useEffect(() => {
        if (directionsFromLocation && directionsToLocation && currentAppView === appViews.DIRECTIONS) return;
        if (directionsFromLocation || directionsToLocation) {
            navigateToView(appViews.WAYFINDING);
        }
    }, [directionsFromLocation, directionsToLocation]);

    /*
     * When multiple locations share an external ID, show the list view.
     * When exactly one matches, treat it as a direct location selection.
     */
    useEffect(() => {
        if (filteredLocationsByExternalIDs?.length > 1) {
            navigateToView(appViews.EXTERNALIDS);
        } else if (filteredLocationsByExternalIDs?.length === 1) {
            setCurrentLocation(filteredLocationsByExternalIDs[0]);
            setLocationId(filteredLocationsByExternalIDs[0].id);
        }
    }, [filteredLocationsByExternalIDs]);

    /*
     * Navigate back from LocationDetails — returns to the locations list if the user arrived via
     * multiple external ID matches, otherwise returns to search.
     */
    function closeLocationDetails() {
        if (filteredLocationsByExternalIDs?.length > 1) {
            navigateToView(appViews.EXTERNALIDS);
        } else {
            if (filteredLocationsByExternalIDs?.length === 1) setFilteredLocationsByExternalID([]);
            navigateToView(appViews.SEARCH);
        }
    }

    /*
     * Navigate back from LocationsList — clears the external ID filter and returns to search.
     */
    function closeLocationsList() {
        setFilteredLocationsByExternalID([]);
        navigateToView(appViews.SEARCH);
    }

    /**
     * Builds an `onSetSize` handler for children: when the app requests `snapPoints.MAX`, calls `sheetRef.current.snapTo(lastIndex)` (react-modal-sheet).
     *
     * @param {number[]} sp - Same snap array passed to `Sheet` as `snapPoints`.
     * @returns {(size: string) => void} Callback for child `onSetSize`.
     */
    const expandToMax = useCallback((sp) => (size) => {
        if (size === snapPoints.MAX) {
            sheetRef.current?.snapTo(sp.length - 1);
        }
    }, []);

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
            onClose: () => { },
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
            <Sheet {...baseSheetProps(sheetMountPoint)} {...extraProps}>
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
     * @returns {JSX.Element | null} `null` until `sheetMountPoint` exists (except `CHAT`, which does not use the sheet portal mount).
     */
    function renderSheet() {
        if (!sheetMountPoint && currentAppView !== appViews.CHAT) return null;

        switch (currentAppView) {
            case appViews.SEARCH:
                return sheetLayout(
                    { snapPoints: SNAP_POINTS_SEARCH, onSnap: handleSnap },
                    <Search
                        isOpen={true}
                        isSheetExpanded={isAtMaxSnap(SNAP_POINTS_SEARCH)}
                        onSetSize={expandToMax(SNAP_POINTS_SEARCH)}
                        onOpenChat={() => navigateToView(appViews.CHAT)}
                    />
                );
            case appViews.EXTERNALIDS:
                return sheetLayout(
                    { snapPoints: SNAP_POINTS_LOCATIONS_LIST, onSnap: handleSnap },
                    <LocationsList
                        onSetSize={expandToMax(SNAP_POINTS_LOCATIONS_LIST)}
                        onBack={() => closeLocationsList()}
                        locations={filteredLocationsByExternalIDs}
                        onLocationClick={location => setCurrentLocation(location)}
                    />
                );
            case appViews.LOCATION_DETAILS:
                return sheetLayout(
                    { snapPoints: SNAP_POINTS_LOCATION_DETAILS },
                    <LocationDetails
                        isOpen={true}
                        onSetSize={expandToMax(SNAP_POINTS_LOCATION_DETAILS)}
                        onBack={() => closeLocationDetails()}
                        onStartWayfinding={() => navigateToView(appViews.WAYFINDING)}
                        onStartDirections={() => navigateToView(appViews.DIRECTIONS)}
                    />
                );
            case appViews.WAYFINDING:
                return sheetLayout(
                    { snapPoints: SNAP_POINTS_DEFAULT, detent: 'content' },
                    <Wayfinding
                        onSetSize={expandToMax(SNAP_POINTS_DEFAULT)}
                        onStartDirections={() => navigateToView(appViews.DIRECTIONS)}
                        directionsToLocation={directionsToLocation}
                        directionsFromLocation={directionsFromLocation}
                        onBack={() => navigateToView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                        isActive={true}
                    />
                );
            case appViews.DIRECTIONS:
                return sheetLayout(
                    { snapPoints: SNAP_POINTS_DEFAULT, detent: 'content', disableDrag: true },
                    <Directions
                        onSetSize={expandToMax(SNAP_POINTS_DEFAULT)}
                        isOpen={true}
                        onBack={() => navigateToView(appViews.WAYFINDING)}
                        onRouteFinished={() => { onRouteFinished(); navigateToView(appViews.SEARCH); }}
                    />
                );
            case appViews.CHAT:
                return (
                    <ChatWindow
                        isVisible
                        onClose={() => navigateToView(appViews.SEARCH)}
                        onSearchResults={handleChatLocations}
                        onShowRoute={handleChatShowRoute}
                    />
                );
            default:
                return null;
        }
    }

    return (
        <div ref={setSheetMountPoint} className="bottom-sheets">
            {renderSheet()}
        </div>
    );
}

export default BottomSheetNew;

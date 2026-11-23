/**
 * Sets the floor once the map view is ready, and keeps it while the map is still loading.
 * Before the map view is ready the SDK replays its own default floor after a queued setFloor, so the default floor would win.
 *
 * @param {object} mapsIndoorsInstance - MapsIndoors instance.
 * @param {string|number} floor - Floor index to set.
 * @param {function} isCurrent - Checked before setting the floor later; return false to skip it and stop keeping the floor.
 */
export default function setFloorWhenMapReady(mapsIndoorsInstance, floor, isCurrent) {
    const mapView = mapsIndoorsInstance.getMapView();
    if (!mapView || mapView.isReady) {
        mapsIndoorsInstance.setFloor(floor);
        keepFloorWhileLoading(mapsIndoorsInstance, floor, isCurrent);
        return;
    }

    // One microtask later runs after all of the SDK's own 'ready' listeners.
    // setFloor can throw during early map load.
    mapView.once('ready', () => {
        Promise.resolve()
            .then(() => {
                if (!isCurrent()) return;
                mapsIndoorsInstance.setFloor(floor);
                keepFloorWhileLoading(mapsIndoorsInstance, floor, isCurrent);
            })
            .catch(error => warnFloorNotSet(floor, error));
    });
}

/**
 * The SDK picks its first building a moment later and switches to that building's default floor when it lacks this floor.
 * So until the initial load is complete, set the floor again whenever a building that has it comes into focus.
 */
function keepFloorWhileLoading(mapsIndoorsInstance, floor, isCurrent) {
    const phase = mapsIndoorsInstance.getLoadingProgress?.()?.phase;
    if (!phase || phase === 'complete') return;

    const stop = () => {
        mapsIndoorsInstance.removeListener('building_changed', onBuildingChanged);
        mapsIndoorsInstance.removeListener('content_ready', stop);
    };
    const onBuildingChanged = building => {
        if (!isCurrent()) return stop();
        if (!building?.floors?.[floor] || mapsIndoorsInstance.getFloor() === String(floor)) return;
        try {
            mapsIndoorsInstance.setFloor(floor);
        } catch (error) {
            warnFloorNotSet(floor, error);
        }
    };
    mapsIndoorsInstance.addListener('building_changed', onBuildingChanged);
    mapsIndoorsInstance.addListener('content_ready', stop);
}

function warnFloorNotSet(floor, error) {
    console.warn(`[MapTemplate] Could not set floor ${floor}.`, error);
}

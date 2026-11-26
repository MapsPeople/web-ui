/**
 * Sets the floor once the map view is ready, and keeps it while the map is still loading.
 * Before the map view is ready the SDK replays its own default floor after a queued setFloor, so the default floor would win.
 *
 * @param {object} mapsIndoorsInstance - MapsIndoors instance.
 * @param {string|number} floor - Floor index to set.
 * @param {function} isCurrent - Checked before setting the floor later; return false to skip it and stop keeping the floor.
 * @param {boolean} [onlyIfBuildingInViewHasFloor] - Skip the floor while the building in view doesn't have it; it is still set if a building that has it comes into focus during loading.
 *   With no building in view yet the floor is set: the SDK switches to a building's default floor itself when it picks one without it.
 */
export default function setFloorWhenMapReady(mapsIndoorsInstance, floor, isCurrent, onlyIfBuildingInViewHasFloor = false) {
    const applyFloor = () => {
        const building = onlyIfBuildingInViewHasFloor ? mapsIndoorsInstance.getBuilding() : null;
        if (!building || building.floors?.[floor]) mapsIndoorsInstance.setFloor(floor);
        keepFloorWhileLoading(mapsIndoorsInstance, floor, isCurrent);
    };

    const mapView = mapsIndoorsInstance.getMapView();
    if (!mapView || mapView.isReady) {
        applyFloor();
        return;
    }

    // One microtask later runs after all of the SDK's own 'ready' listeners.
    // setFloor can throw during early map load.
    mapView.once('ready', () => {
        Promise.resolve()
            .then(() => {
                if (isCurrent()) applyFloor();
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

/**
 * Sets the floor again when the given building comes into view, once.
 * Use it when the camera moves to a Location: on the way there the SDK switches to the default floor of each
 * building it passes that lacks this floor, and after the initial load nothing else sets the floor again.
 * This happens when the map switches to another Venue after the first Venue finished loading.
 *
 * @param {object} mapsIndoorsInstance - MapsIndoors instance.
 * @param {string|number} floor - Floor index to set.
 * @param {string} buildingId - ID of the building the floor belongs to. Nothing happens without it.
 * @param {function} isCurrent - Return false to stop waiting for the building.
 */
export function keepFloorUntilBuildingInView(mapsIndoorsInstance, floor, buildingId, isCurrent) {
    if (!buildingId) return;
    if (mapsIndoorsInstance.getBuilding()?.id === buildingId && mapsIndoorsInstance.getFloor() === String(floor)) return;

    const stop = () => mapsIndoorsInstance.removeListener('building_changed', onBuildingChanged);
    const onBuildingChanged = building => {
        if (!isCurrent()) return stop();
        if (building?.id !== buildingId) return;
        stop();
        if (mapsIndoorsInstance.getFloor() === String(floor)) return;
        try {
            mapsIndoorsInstance.setFloor(floor);
        } catch (error) {
            warnFloorNotSet(floor, error);
        }
    };
    mapsIndoorsInstance.addListener('building_changed', onBuildingChanged);
}

function warnFloorNotSet(floor, error) {
    console.warn(`[MapTemplate] Could not set floor ${floor}.`, error);
}

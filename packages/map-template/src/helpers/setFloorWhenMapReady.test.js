import { EventEmitter } from 'events';
import setFloorWhenMapReady from './setFloorWhenMapReady';

function createMapView(isReady) {
    const listeners = [];
    return {
        isReady,
        once: (event, listener) => listeners.push({ event, listener }),
        emit(event) {
            this.isReady = true;
            listeners.filter(entry => entry.event === event).forEach(entry => entry.listener());
        }
    };
}

function createMapsIndoorsInstance(mapView, phase = 'initializing') {
    return Object.assign(new EventEmitter(), {
        getMapView: () => mapView,
        getLoadingProgress: () => ({ phase }),
        getBuilding: jest.fn(),
        getFloor: jest.fn(),
        setFloor: jest.fn()
    });
}

const flushMicrotasks = () => new Promise(resolve => setTimeout(resolve, 0));
const keepListenerCount = instance => instance.listenerCount('building_changed') + instance.listenerCount('content_ready');
const buildingWithFloor = { floors: { 20: {} } };
const buildingWithoutFloor = { floors: { 0: {} } };

describe('setFloorWhenMapReady', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('sets the floor right away when the map view is ready', () => {
        const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));

        setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);

        expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20');
    });

    it('sets the floor right away when there is no map view', () => {
        const mapsIndoorsInstance = createMapsIndoorsInstance(undefined);

        setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);

        expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20');
    });

    it('lets a synchronous setFloor error reach the caller when the map view is ready', () => {
        const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));
        mapsIndoorsInstance.setFloor.mockImplementation(() => { throw new Error('terrain'); });

        expect(() => setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true)).toThrow('terrain');
    });

    it('waits for the map view to be ready before setting the floor', async () => {
        const mapView = createMapView(false);
        const mapsIndoorsInstance = createMapsIndoorsInstance(mapView);

        setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
        await flushMicrotasks();
        expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();

        mapView.emit('ready');
        await flushMicrotasks();

        expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20');
    });

    it('sets the floor after a default floor that the SDK replays on ready', async () => {
        const mapView = createMapView(false);
        const mapsIndoorsInstance = createMapsIndoorsInstance(mapView);

        setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
        mapView.once('ready', () => mapsIndoorsInstance.setFloor('0'));
        mapView.emit('ready');
        await flushMicrotasks();

        expect(mapsIndoorsInstance.setFloor.mock.calls).toEqual([['0'], ['20']]);
    });

    it('does not set the floor when the caller is no longer current on ready', async () => {
        const mapView = createMapView(false);
        const mapsIndoorsInstance = createMapsIndoorsInstance(mapView);

        setFloorWhenMapReady(mapsIndoorsInstance, '20', () => false);
        mapView.emit('ready');
        await flushMicrotasks();

        expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();
        expect(keepListenerCount(mapsIndoorsInstance)).toBe(0);
    });

    it('warns about a setFloor error after the map view is ready', async () => {
        const mapView = createMapView(false);
        const mapsIndoorsInstance = createMapsIndoorsInstance(mapView);
        const error = new Error('terrain');
        mapsIndoorsInstance.setFloor.mockImplementation(() => { throw error; });
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
        expect(() => mapView.emit('ready')).not.toThrow();
        await flushMicrotasks();

        expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20');
        expect(warn).toHaveBeenCalledWith('[MapTemplate] Could not set floor 20.', error);
    });

    describe('while the map is loading', () => {
        it('sets the floor again when the SDK focuses a building that has it on another floor', () => {
            const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
            mapsIndoorsInstance.getFloor.mockReturnValue('0');
            mapsIndoorsInstance.emit('building_changed', buildingWithFloor);

            expect(mapsIndoorsInstance.setFloor.mock.calls).toEqual([['20'], ['20']]);
        });

        it('keeps the floor once the map view gets ready', async () => {
            const mapView = createMapView(false);
            const mapsIndoorsInstance = createMapsIndoorsInstance(mapView);

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
            mapView.emit('ready');
            await flushMicrotasks();
            mapsIndoorsInstance.getFloor.mockReturnValue('0');
            mapsIndoorsInstance.emit('building_changed', buildingWithFloor);

            expect(mapsIndoorsInstance.setFloor.mock.calls).toEqual([['20'], ['20']]);
        });

        it('does not set the floor when the SDK focuses a building without it', () => {
            const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
            mapsIndoorsInstance.getFloor.mockReturnValue('0');
            mapsIndoorsInstance.emit('building_changed', buildingWithoutFloor);

            expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledTimes(1);
        });

        it('does not set the floor again when the map already shows it', () => {
            const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
            mapsIndoorsInstance.getFloor.mockReturnValue('20');
            mapsIndoorsInstance.emit('building_changed', buildingWithFloor);

            expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledTimes(1);
        });

        it('stops keeping the floor when the map content is ready', () => {
            const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
            mapsIndoorsInstance.emit('content_ready');
            mapsIndoorsInstance.getFloor.mockReturnValue('0');
            mapsIndoorsInstance.emit('building_changed', buildingWithFloor);

            expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledTimes(1);
            expect(keepListenerCount(mapsIndoorsInstance)).toBe(0);
        });

        it('stops keeping the floor when the caller is no longer current', () => {
            const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));
            let isCurrent = true;

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => isCurrent);
            isCurrent = false;
            mapsIndoorsInstance.getFloor.mockReturnValue('0');
            mapsIndoorsInstance.emit('building_changed', buildingWithFloor);

            expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledTimes(1);
            expect(keepListenerCount(mapsIndoorsInstance)).toBe(0);
        });

        it('does not keep the floor when the map has already loaded', () => {
            const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true), 'complete');

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);

            expect(keepListenerCount(mapsIndoorsInstance)).toBe(0);
        });

        it('does not keep the floor with an SDK that does not report loading progress', () => {
            const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));
            delete mapsIndoorsInstance.getLoadingProgress;

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);

            expect(keepListenerCount(mapsIndoorsInstance)).toBe(0);
        });

        it('warns about a setFloor error instead of throwing into the SDK', () => {
            const mapsIndoorsInstance = createMapsIndoorsInstance(createMapView(true));
            const error = new Error('terrain');
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true);
            mapsIndoorsInstance.setFloor.mockImplementation(() => { throw error; });
            mapsIndoorsInstance.getFloor.mockReturnValue('0');

            expect(() => mapsIndoorsInstance.emit('building_changed', buildingWithFloor)).not.toThrow();
            expect(warn).toHaveBeenCalledWith('[MapTemplate] Could not set floor 20.', error);
        });
    });

    describe.each([
        ['the map view is ready', true],
        ['the map view gets ready', false]
    ])('with a building in view when %s', (_, isReady) => {
        // The building in view is only known once the map view is ready, so it is set after the call on the deferred path.
        async function setFloorWithBuildingInView(building, onlyIfBuildingInViewHasFloor) {
            const mapView = createMapView(isReady);
            const mapsIndoorsInstance = createMapsIndoorsInstance(mapView);
            mapsIndoorsInstance.getBuilding.mockReturnValue(isReady ? building : undefined);

            setFloorWhenMapReady(mapsIndoorsInstance, '20', () => true, onlyIfBuildingInViewHasFloor);
            mapsIndoorsInstance.getBuilding.mockReturnValue(building);
            mapView.emit('ready');
            await flushMicrotasks();

            return mapsIndoorsInstance;
        }

        it('does not set the floor when the building in view lacks it, but sets it once a building that has it comes into focus', async () => {
            const mapsIndoorsInstance = await setFloorWithBuildingInView(buildingWithoutFloor, true);
            expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();

            mapsIndoorsInstance.getFloor.mockReturnValue('0');
            mapsIndoorsInstance.emit('building_changed', buildingWithFloor);

            expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20');
        });

        it('sets the floor when the building in view has it', async () => {
            const mapsIndoorsInstance = await setFloorWithBuildingInView(buildingWithFloor, true);

            expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20');
        });

        it('sets the floor when no building is in view yet', async () => {
            const mapsIndoorsInstance = await setFloorWithBuildingInView(undefined, true);

            expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20');
        });

        it('sets the floor whatever the building in view when not asked to check it', async () => {
            const mapsIndoorsInstance = await setFloorWithBuildingInView(buildingWithoutFloor);

            expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20');
        });
    });
});

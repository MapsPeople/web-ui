import { act, renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import { createStore, Provider } from 'jotai';
import useMapBoundsDeterminer from './useMapBoundsDeterminer';
import { useIsDesktop } from './useIsDesktop';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import locationIdState from '../atoms/locationIdState';
import kioskOriginLocationIdState from '../atoms/kioskOriginLocationIdState';

jest.mock('./useIsDesktop', () => ({ useIsDesktop: jest.fn() }));
jest.mock('../helpers/GetDesktopPaddingBottom', () => ({ __esModule: true, default: () => Promise.resolve(0) }));
jest.mock('../helpers/GetDesktopPaddingLeft', () => ({ __esModule: true, default: () => Promise.resolve(0) }));
jest.mock('../helpers/GetMobilePaddingBottom', () => ({ __esModule: true, default: () => Promise.resolve(0) }));

const point = { type: 'Point', coordinates: [10, 55] };
const venue = { id: 'venue-1', name: 'Campus', geometry: point };
const location = { id: 'location-1', properties: { floor: '10' }, geometry: point };
const kioskLocation = { id: 'kiosk-1', properties: { floor: '20' }, geometry: point };

function createDeferred() {
    let resolve;
    const promise = new Promise(resolvePromise => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
}

function createMapsIndoorsInstance() {
    const mapView = {
        getCenter: jest.fn(() => ({ lat: 55, lng: 10 })),
        setCenter: jest.fn(),
        tilt: jest.fn(),
        rotate: jest.fn()
    };

    return {
        getMapView: () => mapView,
        setFloor: jest.fn(),
        setZoom: jest.fn(),
        goTo: jest.fn(),
        getDisplayRule: jest.fn(() => ({ iconSize: { width: 10, height: 10 } })),
        setDisplayRule: jest.fn()
    };
}

function renderUseMapBoundsDeterminer(store) {
    function Wrapper({ children }) {
        return <Provider store={store}>{children}</Provider>;
    }

    Wrapper.propTypes = {
        children: PropTypes.node
    };

    return renderHook(() => useMapBoundsDeterminer(), { wrapper: Wrapper });
}

describe('useMapBoundsDeterminer', () => {
    let mapsIndoorsInstance;
    let store;

    beforeEach(() => {
        useIsDesktop.mockReturnValue(false);
        window.mapsindoors = {
            services: {
                LocationsService: { getLocation: jest.fn() }
            }
        };

        mapsIndoorsInstance = createMapsIndoorsInstance();
        store = createStore();
        store.set(mapsIndoorsInstanceState, mapsIndoorsInstance);
        store.set(currentVenueNameState, venue.name);
        store.set(venuesInSolutionState, [venue]);
    });

    afterEach(() => {
        delete window.mapsindoors;
    });

    it('goes to the Location when it has loaded', async () => {
        const locationRequest = createDeferred();
        window.mapsindoors.services.LocationsService.getLocation.mockReturnValue(locationRequest.promise);
        store.set(locationIdState, location.id);

        renderUseMapBoundsDeterminer(store);
        await act(async () => locationRequest.resolve(location));

        expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith(location.properties.floor);
        expect(mapsIndoorsInstance.goTo).toHaveBeenCalledTimes(1);
    });

    it('does not move the map when the Location loads after unmount', async () => {
        const locationRequest = createDeferred();
        window.mapsindoors.services.LocationsService.getLocation.mockReturnValue(locationRequest.promise);
        store.set(locationIdState, location.id);

        const { unmount } = renderUseMapBoundsDeterminer(store);
        unmount();
        await act(async () => locationRequest.resolve(location));

        expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();
        expect(mapsIndoorsInstance.goTo).not.toHaveBeenCalled();
    });

    it('does not reset the kiosk Location Display Rule when the kiosk Location loads after unmount', async () => {
        useIsDesktop.mockReturnValue(true);
        window.mapsindoors.services.LocationsService.getLocation.mockResolvedValue(kioskLocation);
        store.set(kioskOriginLocationIdState, kioskLocation.id);

        const { unmount } = renderUseMapBoundsDeterminer(store);
        await waitFor(() => expect(mapsIndoorsInstance.setDisplayRule).toHaveBeenCalledTimes(1));

        const kioskLocationRequest = createDeferred();
        window.mapsindoors.services.LocationsService.getLocation.mockReturnValue(kioskLocationRequest.promise);
        window.mapsindoors.services.LocationsService.getLocation.mockClear();
        act(() => store.set(kioskOriginLocationIdState, undefined));
        expect(window.mapsindoors.services.LocationsService.getLocation).toHaveBeenCalledTimes(1);
        expect(window.mapsindoors.services.LocationsService.getLocation).toHaveBeenCalledWith(kioskLocation.id);

        unmount();
        await act(async () => kioskLocationRequest.resolve(kioskLocation));

        expect(mapsIndoorsInstance.setDisplayRule).toHaveBeenCalledTimes(1);
    });

    it('does not reset the kiosk Location Display Rule on a replaced MapsIndoors instance', async () => {
        useIsDesktop.mockReturnValue(true);
        window.mapsindoors.services.LocationsService.getLocation.mockResolvedValue(kioskLocation);
        store.set(kioskOriginLocationIdState, kioskLocation.id);

        renderUseMapBoundsDeterminer(store);
        await waitFor(() => expect(mapsIndoorsInstance.setDisplayRule).toHaveBeenCalledTimes(1));

        const kioskLocationRequest = createDeferred();
        window.mapsindoors.services.LocationsService.getLocation.mockReturnValue(kioskLocationRequest.promise);
        window.mapsindoors.services.LocationsService.getLocation.mockClear();
        act(() => store.set(kioskOriginLocationIdState, undefined));
        expect(window.mapsindoors.services.LocationsService.getLocation).toHaveBeenCalledTimes(1);
        expect(window.mapsindoors.services.LocationsService.getLocation).toHaveBeenCalledWith(kioskLocation.id);

        const replacingMapsIndoorsInstance = createMapsIndoorsInstance();
        act(() => store.set(mapsIndoorsInstanceState, replacingMapsIndoorsInstance));
        await act(async () => kioskLocationRequest.resolve(kioskLocation));

        expect(mapsIndoorsInstance.setDisplayRule).toHaveBeenCalledTimes(1);
        expect(replacingMapsIndoorsInstance.setDisplayRule).not.toHaveBeenCalled();

        window.mapsindoors.services.LocationsService.getLocation.mockResolvedValue(kioskLocation);
        act(() => store.set(kioskOriginLocationIdState, kioskLocation.id));

        await waitFor(() => expect(replacingMapsIndoorsInstance.setDisplayRule).toHaveBeenCalledTimes(1));
        expect(replacingMapsIndoorsInstance.setDisplayRule).toHaveBeenCalledWith(kioskLocation.id, expect.objectContaining({ clickable: false }));
    });

    it('sets the kiosk Location Display Rule on a MapsIndoors instance that replaces one in kiosk mode', async () => {
        useIsDesktop.mockReturnValue(true);
        window.mapsindoors.services.LocationsService.getLocation.mockResolvedValue(kioskLocation);
        store.set(kioskOriginLocationIdState, kioskLocation.id);

        renderUseMapBoundsDeterminer(store);
        await waitFor(() => expect(mapsIndoorsInstance.setDisplayRule).toHaveBeenCalledTimes(1));

        const replacingMapsIndoorsInstance = createMapsIndoorsInstance();
        act(() => store.set(mapsIndoorsInstanceState, replacingMapsIndoorsInstance));

        await waitFor(() => expect(replacingMapsIndoorsInstance.setDisplayRule).toHaveBeenCalledTimes(1));
        expect(replacingMapsIndoorsInstance.setDisplayRule).toHaveBeenCalledWith(kioskLocation.id, expect.objectContaining({ clickable: false }));
    });

    it('does not restore the kiosk Location Display Rule on a replacing MapsIndoors instance that has not overridden it', async () => {
        useIsDesktop.mockReturnValue(true);
        window.mapsindoors.services.LocationsService.getLocation.mockResolvedValue(kioskLocation);
        store.set(kioskOriginLocationIdState, kioskLocation.id);

        renderUseMapBoundsDeterminer(store);
        await waitFor(() => expect(mapsIndoorsInstance.setDisplayRule).toHaveBeenCalledTimes(1));

        const kioskLocationRequest = createDeferred();
        window.mapsindoors.services.LocationsService.getLocation.mockReturnValue(kioskLocationRequest.promise);
        const replacingMapsIndoorsInstance = createMapsIndoorsInstance();
        act(() => store.set(mapsIndoorsInstanceState, replacingMapsIndoorsInstance));
        act(() => store.set(kioskOriginLocationIdState, undefined));
        await act(async () => kioskLocationRequest.resolve(kioskLocation));

        expect(replacingMapsIndoorsInstance.setDisplayRule).not.toHaveBeenCalled();
    });
});

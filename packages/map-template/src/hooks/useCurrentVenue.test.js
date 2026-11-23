import { act, renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import { createStore, Provider } from 'jotai';
import { useCurrentVenue } from './useCurrentVenue';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import venueListState from '../atoms/venueListState';
import appConfigState from '../atoms/appConfigState';
import floorState from '../atoms/floorState';
import directionsFromState from '../atoms/directionsFromState';

const venue = { id: 'venue-1', name: 'Campus' };

function createMapsIndoorsInstance() {
    const mapView = { isReady: false, once: jest.fn() };
    return {
        setVenue: jest.fn(),
        getVenue: jest.fn(() => venue),
        getMapView: () => mapView,
        getBuilding: jest.fn(),
        setFloor: jest.fn()
    };
}

function renderUseCurrentVenue(mapsIndoorsInstance = { setVenue: jest.fn() }, floor = null, directionsFrom = undefined) {
    const store = createStore();
    store.set(mapsIndoorsInstanceState, mapsIndoorsInstance);
    store.set(floorState, floor);
    store.set(directionsFromState, directionsFrom);
    store.set(currentVenueNameState, venue.name);
    store.set(venuesInSolutionState, [venue]);
    store.set(venueListState, [venue]);
    store.set(appConfigState, { menuInfo: { mainmenu: [] } });

    function Wrapper({ children }) {
        return <Provider store={store}>{children}</Provider>;
    }

    Wrapper.propTypes = {
        children: PropTypes.node
    };

    return renderHook(() => useCurrentVenue(), { wrapper: Wrapper });
}

describe('useCurrentVenue', () => {
    beforeEach(() => {
        window.mapsindoors = {
            MapsIndoors: {
                addVenuesToSync: jest.fn(),
                removeVenuesToSync: jest.fn()
            },
            services: {
                SolutionsService: { getCategories: jest.fn().mockResolvedValue([]) },
                LocationsService: { getLocations: jest.fn().mockResolvedValue([]) },
                VenuesService: { getBuildings: jest.fn().mockResolvedValue([{ floors: { 20: {} } }]) }
            }
        };
    });

    afterEach(() => {
        delete window.mapsindoors;
    });

    it('removes the synced Venue when it unmounts, so the next Map Template can load every Venue', async () => {
        const { unmount } = renderUseCurrentVenue();

        await waitFor(() => expect(window.mapsindoors.MapsIndoors.addVenuesToSync).toHaveBeenCalledWith(venue.id));
        expect(window.mapsindoors.MapsIndoors.removeVenuesToSync).not.toHaveBeenCalled();

        unmount();

        expect(window.mapsindoors.MapsIndoors.removeVenuesToSync).toHaveBeenCalledWith(venue.id);
    });

    it('applies the floor prop once the map is ready, so the default floor does not replace it', async () => {
        const mapsIndoorsInstance = createMapsIndoorsInstance();
        const mapView = mapsIndoorsInstance.getMapView();

        renderUseCurrentVenue(mapsIndoorsInstance, '20');
        await waitFor(() => expect(mapView.once).toHaveBeenCalledWith('ready', expect.any(Function)));
        expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();

        mapView.isReady = true;
        mapView.once.mock.calls[0][1]();

        await waitFor(() => expect(mapsIndoorsInstance.setFloor).toHaveBeenCalledWith('20'));
    });

    it('does not apply the floor prop when the map gets ready after unmount', async () => {
        const mapsIndoorsInstance = createMapsIndoorsInstance();
        const mapView = mapsIndoorsInstance.getMapView();

        const { unmount } = renderUseCurrentVenue(mapsIndoorsInstance, '20');
        await waitFor(() => expect(mapView.once).toHaveBeenCalledWith('ready', expect.any(Function)));
        unmount();

        mapView.isReady = true;
        await act(async () => mapView.once.mock.calls[0][1]());

        expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();
    });

    it('does not apply the floor prop when the Venue has changed before the map gets ready', async () => {
        const mapsIndoorsInstance = createMapsIndoorsInstance();
        const mapView = mapsIndoorsInstance.getMapView();

        renderUseCurrentVenue(mapsIndoorsInstance, '20');
        await waitFor(() => expect(mapView.once).toHaveBeenCalledWith('ready', expect.any(Function)));
        mapsIndoorsInstance.getVenue.mockReturnValue({ id: 'venue-2' });

        mapView.isReady = true;
        await act(async () => mapView.once.mock.calls[0][1]());

        expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();
    });

    it('does not apply the floor prop when directionsFrom is set', async () => {
        const mapsIndoorsInstance = createMapsIndoorsInstance();
        const mapView = mapsIndoorsInstance.getMapView();

        renderUseCurrentVenue(mapsIndoorsInstance, '20', 'location-1');
        await waitFor(() => expect(mapsIndoorsInstance.setVenue).toHaveBeenCalledWith(venue));

        expect(window.mapsindoors.services.VenuesService.getBuildings).not.toHaveBeenCalled();
        expect(mapView.once).not.toHaveBeenCalled();
        expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();
    });

    it('keeps the default floor of the building in view when it does not have the floor prop', async () => {
        const mapsIndoorsInstance = createMapsIndoorsInstance();
        const mapView = mapsIndoorsInstance.getMapView();
        mapsIndoorsInstance.getBuilding.mockReturnValue({ floors: { 0: {} } });

        renderUseCurrentVenue(mapsIndoorsInstance, '20');
        await waitFor(() => expect(mapView.once).toHaveBeenCalledWith('ready', expect.any(Function)));

        mapView.isReady = true;
        await act(async () => mapView.once.mock.calls[0][1]());

        expect(mapsIndoorsInstance.setFloor).not.toHaveBeenCalled();
    });
});

import { renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import { createStore, Provider } from 'jotai';
import { useCurrentVenue } from './useCurrentVenue';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import venueListState from '../atoms/venueListState';
import appConfigState from '../atoms/appConfigState';

const venue = { id: 'venue-1', name: 'Campus' };

function renderUseCurrentVenue() {
    const store = createStore();
    store.set(mapsIndoorsInstanceState, { setVenue: jest.fn() });
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
                LocationsService: { getLocations: jest.fn().mockResolvedValue([]) }
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
});

import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import LocationDetails from './LocationDetails';
import currentLocationState from '../../atoms/currentLocationState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import showExternalIDsState from '../../atoms/showExternalIDsState';
import initI18n from '../../i18n/initialize.js';

jest.mock('../../assets/close.svg?react', () => () => null, {
    virtual: true
});
jest.mock('./OpeningHours/OpeningHours', () => () => null);
jest.mock('./ShareLocationLink/ShareLocationLink', () => () => null);
jest.mock('../ContactActionButton/ContactActionButton', () => () => null);
jest.mock('../../hooks/useIsDesktop', () => ({ useIsDesktop: () => true }));

function renderLocationDetails(showExternalIDs) {
    const store = createStore();
    store.set(showExternalIDsState, showExternalIDs);
    store.set(mapsIndoorsInstanceState, {
        getMap: () => ({}),
        getBuilding: () => ({ floors: { 0: {}, 1: {} } }),
        getDisplayRule: () => null
    });
    store.set(currentLocationState, {
        id: 'location-1',
        properties: { name: 'Meeting room', categories: {}, externalId: 'MR-1' }
    });

    return render(
        <Provider store={store}>
            <LocationDetails onBack={() => {}} isOpen={true} />
        </Provider>
    );
}

describe('LocationDetails', () => {
    beforeAll(() => {
        initI18n('en');
    });

    test.each([false, true])('passes show-external-id="%s" to mi-location-info', showExternalIDs => {
        const { container } = renderLocationDetails(showExternalIDs);

        expect(container.querySelector('mi-location-info')).toHaveAttribute('show-external-id', String(showExternalIDs));
    });
});

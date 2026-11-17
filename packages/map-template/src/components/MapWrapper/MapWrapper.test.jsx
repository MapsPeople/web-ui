import { act, render, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import MapWrapper from './MapWrapper';
import { mapTypes } from '../../constants/mapTypes';
import apiKeyState from '../../atoms/apiKeyState';
import mapTypeState from '../../atoms/mapTypeState';
import isMapReadyState from '../../atoms/isMapReadyState';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';

jest.mock('@mapsindoors/components/dist/components/index.js', () => ({ defineCustomElements: jest.fn() }), { virtual: true });
jest.mock('../../hooks/useLivedata', () => () => {});
jest.mock('../../hooks/useMapBoundsDeterminer', () => () => [false, false]);
jest.mock('../../hooks/useIsKioskContext', () => ({ useIsKioskContext: () => false }));
jest.mock('../ViewSelector/ViewSelector', () => () => null);
jest.mock('../LanguageSelector/LanguageSelector.jsx', () => () => null);
jest.mock('../ResetKioskViewButton/ResetKioskViewButton.jsx', () => () => null);
jest.mock('../MIMap/MapControls/MapControls', () => {
    const { useEffect } = require('react');
    return function MockMapControls({ onPositionControl }) {
        useEffect(() => {
            onPositionControl({ on: jest.fn() });
        }, []);
        return null;
    };
});
jest.mock('../MIMap/MapboxMap/MapboxMap', () => {
    const { useEffect } = require('react');
    return {
        __esModule: true,
        default: function MockMapboxMap({ onInitialized }) {
            useEffect(() => {
                onInitialized({});
            }, []);
            return null;
        }
    };
});
jest.mock('../MIMap/GoogleMapsMap/GoogleMapsMap', () => {
    const { useEffect } = require('react');
    return {
        __esModule: true,
        default: function MockGoogleMapsMap({ onInitialized }) {
            useEffect(() => {
                onInitialized({});
            }, []);
            return null;
        }
    };
});

function createMapsIndoorsInstance() {
    const instance = {
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        setDisplayRule: jest.fn(),
        getMapView: jest.fn(() => ({ tilt: jest.fn(), rotate: jest.fn() })),
        getMap: jest.fn(() => null),
        highlight: jest.fn(),
        filter: jest.fn(),
        deallocate: jest.fn(() => {
            instance.isDeallocated = true;
        })
    };
    return instance;
}

describe('MapWrapper', () => {
    let store;
    let mapsIndoorsInstances;

    function renderMapWrapper() {
        return render(
            <Provider store={store}>
                <MapWrapper
                    onMapPositionKnown={jest.fn()}
                    onMapPositionInvestigating={jest.fn()}
                    onViewModeSwitchKnown={jest.fn()}
                    useMapProviderModule={false}
                    resetCount={0}
                />
            </Provider>
        );
    }

    beforeEach(() => {
        mapsIndoorsInstances = [];
        const MapsIndoors = jest.fn(() => {
            const instance = createMapsIndoorsInstance();
            mapsIndoorsInstances.push(instance);
            return instance;
        });
        MapsIndoors.setMapsIndoorsApiKey = jest.fn();
        window.mapsindoors = {
            MapsIndoors,
            directions: { MapboxProvider: jest.fn(), GoogleMapsProvider: jest.fn() },
            services: {
                DirectionsService: jest.fn(),
                SolutionsService: { getSolution: jest.fn().mockResolvedValue({ modules: [] }) },
                AppConfigService: { getConfig: jest.fn().mockResolvedValue({}) }
            }
        };

        store = createStore();
        store.set(apiKeyState, 'api-key');
        store.set(mapTypeState, mapTypes.Mapbox);
        store.set(isMapReadyState, true);
        store.set(filteredLocationsState, [{ id: 'location-id' }]);
    });

    afterEach(() => {
        delete window.mapsindoors;
        delete window.mapsIndoorsInstance;
    });

    it.each([
        ['map type', mapTypeState, undefined],
        ['API key', apiKeyState, null]
    ])('stops using the MapsIndoors instance once the map is removed because the %s is unset', async (_, atomToUnset, unsetValue) => {
        renderMapWrapper();

        await waitFor(() => expect(store.get(mapsIndoorsInstanceState)).toBe(mapsIndoorsInstances[0]));
        const [mapsIndoorsInstance] = mapsIndoorsInstances;
        const getMapAfterDeallocate = jest.fn();
        mapsIndoorsInstance.getMap.mockImplementation(() => {
            if (mapsIndoorsInstance.isDeallocated) getMapAfterDeallocate();
            return null;
        });

        act(() => store.set(atomToUnset, unsetValue));

        expect(mapsIndoorsInstance.deallocate).toHaveBeenCalledTimes(1);
        expect(getMapAfterDeallocate).not.toHaveBeenCalled();
        expect(store.get(mapsIndoorsInstanceState)).toBeNull();
    });

    it('keeps the MapsIndoors instance that replaces a deallocated one', async () => {
        renderMapWrapper();

        await waitFor(() => expect(store.get(mapsIndoorsInstanceState)).toBe(mapsIndoorsInstances[0]));

        act(() => store.set(mapTypeState, mapTypes.Google));

        await waitFor(() => expect(mapsIndoorsInstances[0].deallocate).toHaveBeenCalledTimes(1));
        expect(store.get(mapsIndoorsInstanceState)).toBe(mapsIndoorsInstances[1]);
        expect(mapsIndoorsInstances[1].deallocate).not.toHaveBeenCalled();
    });
});

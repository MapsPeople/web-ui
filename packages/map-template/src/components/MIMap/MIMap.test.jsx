import { act, render, waitFor } from '@testing-library/react';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';
import MIMap from './MIMap';
import { mapTypes } from '../../constants/mapTypes';

jest.mock('@googlemaps/js-api-loader', () => ({ Loader: jest.fn() }));
jest.mock('@mapsindoors/components/dist/components/index.js', () => ({ defineCustomElements: jest.fn() }), { virtual: true });
jest.mock('./MapControls/MapControls', () => () => null);
jest.mock('./MapboxMap/MapboxMap', () => {
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

describe('MIMap', () => {
    let mapsIndoorsInstance;
    let resolveGoogleMapsLoad;

    beforeEach(() => {
        GoogleMapsApiLoader.mockReset();
        GoogleMapsApiLoader.mockImplementation(() => ({
            load: () => new Promise(resolve => {
                resolveGoogleMapsLoad = resolve;
            })
        }));
        mapsIndoorsInstance = {
            once: jest.fn(),
            on: jest.fn(),
            setDisplayRule: jest.fn(),
            deallocate: jest.fn()
        };
        const MapsIndoors = jest.fn(() => mapsIndoorsInstance);
        MapsIndoors.setMapsIndoorsApiKey = jest.fn();
        window.mapsindoors = {
            MapsIndoors,
            mapView: { GoogleMapsView: jest.fn(() => ({})) },
            services: {
                SolutionsService: { getSolution: jest.fn().mockResolvedValue({ modules: [] }) },
                AppConfigService: { getConfig: jest.fn().mockResolvedValue({}) }
            }
        };
    });

    afterEach(() => {
        delete window.mapsindoors;
        delete window.mapsIndoorsInstance;
    });

    it('deallocates the MapsIndoors instance when it unmounts', async () => {
        const onDeallocated = jest.fn();
        const { unmount } = render(<MIMap apiKey="api-key" mapType={mapTypes.Mapbox} onDeallocated={onDeallocated} />);

        await waitFor(() => expect(window.mapsindoors.MapsIndoors).toHaveBeenCalledTimes(1));
        window.mapsIndoorsInstance = mapsIndoorsInstance;
        expect(mapsIndoorsInstance.deallocate).not.toHaveBeenCalled();

        unmount();

        expect(mapsIndoorsInstance.deallocate).toHaveBeenCalledTimes(1);
        expect(onDeallocated).toHaveBeenCalledWith(mapsIndoorsInstance);
        expect(window.mapsIndoorsInstance).toBeUndefined();
    });

    it('deallocates the MapsIndoors instance of a Google Maps map when it unmounts', async () => {
        const { unmount } = render(<MIMap apiKey="api-key" mapType={mapTypes.Google} gmApiKey="gm-api-key" />);

        await waitFor(() => expect(GoogleMapsApiLoader).toHaveBeenCalledTimes(1));
        await act(async () => resolveGoogleMapsLoad());
        expect(window.mapsindoors.MapsIndoors).toHaveBeenCalledTimes(1);

        unmount();

        expect(mapsIndoorsInstance.deallocate).toHaveBeenCalledTimes(1);
    });

    it('does not create a MapsIndoors instance when the Google Maps API finishes loading after unmount', async () => {
        const { unmount } = render(<MIMap apiKey="api-key" mapType={mapTypes.Google} gmApiKey="gm-api-key" />);

        await waitFor(() => expect(GoogleMapsApiLoader).toHaveBeenCalledTimes(1));
        unmount();
        await act(async () => resolveGoogleMapsLoad());

        expect(window.mapsindoors.mapView.GoogleMapsView).not.toHaveBeenCalled();
        expect(window.mapsindoors.MapsIndoors).not.toHaveBeenCalled();
    });
});

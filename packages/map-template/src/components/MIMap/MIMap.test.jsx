import { render, waitFor } from '@testing-library/react';
import MIMap from './MIMap';
import { mapTypes } from '../../constants/mapTypes';

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

    beforeEach(() => {
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
        const { unmount } = render(<MIMap apiKey="api-key" mapType={mapTypes.Mapbox} />);

        await waitFor(() => expect(window.mapsindoors.MapsIndoors).toHaveBeenCalledTimes(1));
        window.mapsIndoorsInstance = mapsIndoorsInstance;
        expect(mapsIndoorsInstance.deallocate).not.toHaveBeenCalled();

        unmount();

        expect(mapsIndoorsInstance.deallocate).toHaveBeenCalledTimes(1);
        expect(window.mapsIndoorsInstance).toBeUndefined();
    });
});

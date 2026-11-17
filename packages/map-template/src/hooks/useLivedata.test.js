import { renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import { createStore, Provider } from 'jotai';
import useLiveData from './useLivedata';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';

function renderUseLiveData() {
    const store = createStore();
    store.set(mapsIndoorsInstanceState, {});

    function Wrapper({ children }) {
        return <Provider store={store}>{children}</Provider>;
    }

    Wrapper.propTypes = {
        children: PropTypes.node
    };

    return renderHook(({ apiKey }) => useLiveData(apiKey), { wrapper: Wrapper, initialProps: { apiKey: 'api-key' } });
}

function createLiveDataManager() {
    return {
        LiveDataInfo: { activeDomainTypes: jest.fn().mockResolvedValue(['occupancy', 'availability']) },
        enableLiveData: jest.fn().mockResolvedValue(),
        disableLiveData: jest.fn()
    };
}

describe('useLiveData', () => {
    let liveDataManagers;

    function useSdkWithDeallocate() {
        window.mapsindoors.LiveDataManager.mockImplementation(() => {
            const liveDataManager = { ...createLiveDataManager(), deallocate: jest.fn() };
            liveDataManagers.push(liveDataManager);
            return liveDataManager;
        });
    }

    beforeEach(() => {
        liveDataManagers = [];
        window.mapsindoors = {
            LiveDataManager: jest.fn(() => {
                const liveDataManager = createLiveDataManager();
                liveDataManagers.push(liveDataManager);
                return liveDataManager;
            })
        };
    });

    afterEach(() => {
        delete window.mapsindoors;
    });

    it('deallocates the LiveDataManager when it unmounts', async () => {
        useSdkWithDeallocate();
        const { unmount } = renderUseLiveData();
        const [liveDataManager] = liveDataManagers;
        await waitFor(() => expect(liveDataManager.enableLiveData).toHaveBeenCalledTimes(2));

        unmount();

        expect(liveDataManager.deallocate).toHaveBeenCalledTimes(1);
        expect(liveDataManager.disableLiveData).not.toHaveBeenCalled();
    });

    it('deallocates the LiveDataManager it replaces when the API key changes', async () => {
        useSdkWithDeallocate();
        const { rerender } = renderUseLiveData();
        await waitFor(() => expect(liveDataManagers[0].enableLiveData).toHaveBeenCalledTimes(2));

        rerender({ apiKey: 'other-api-key' });

        expect(liveDataManagers[0].deallocate).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(liveDataManagers[1].enableLiveData).toHaveBeenCalledTimes(2));
        expect(liveDataManagers[1].deallocate).not.toHaveBeenCalled();
    });

    it('stops enabling Live Data when it unmounts mid-way', async () => {
        useSdkWithDeallocate();
        let finishFirstDomainType;
        const { unmount } = renderUseLiveData();
        const [liveDataManager] = liveDataManagers;
        liveDataManager.enableLiveData
            .mockImplementationOnce(() => new Promise(resolve => { finishFirstDomainType = resolve; }));
        await waitFor(() => expect(liveDataManager.enableLiveData).toHaveBeenCalledTimes(1));

        unmount();
        finishFirstDomainType();

        await waitFor(() => expect(liveDataManager.deallocate).toHaveBeenCalledTimes(1));
        await new Promise(resolve => setTimeout(resolve));
        expect(liveDataManager.enableLiveData).toHaveBeenCalledTimes(1);
    });

    describe('with an SDK without LiveDataManager.deallocate()', () => {
        it('disables the enabled Live Data domain types when it unmounts', async () => {
            const { unmount } = renderUseLiveData();
            const [liveDataManager] = liveDataManagers;

            await waitFor(() => expect(liveDataManager.enableLiveData).toHaveBeenCalledTimes(2));
            expect(liveDataManager.disableLiveData).not.toHaveBeenCalled();

            unmount();

            expect(liveDataManager.disableLiveData).toHaveBeenCalledWith('occupancy');
            expect(liveDataManager.disableLiveData).toHaveBeenCalledWith('availability');
        });

        it('stops enabling Live Data and disables what was enabled when it unmounts mid-way', async () => {
            let finishFirstDomainType;
            const { unmount } = renderUseLiveData();
            const [liveDataManager] = liveDataManagers;
            liveDataManager.enableLiveData
                .mockImplementationOnce(() => new Promise(resolve => { finishFirstDomainType = resolve; }));
            await waitFor(() => expect(liveDataManager.enableLiveData).toHaveBeenCalledTimes(1));

            unmount();
            finishFirstDomainType();

            await waitFor(() => expect(liveDataManager.disableLiveData).toHaveBeenCalledWith('occupancy'));
            expect(liveDataManager.disableLiveData).toHaveBeenCalledTimes(1);
            expect(liveDataManager.enableLiveData).toHaveBeenCalledTimes(1);
        });
    });
});

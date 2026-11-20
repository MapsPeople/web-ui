import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';

/**
 * Custom hook for showing default Live Data badges on the map.
 *
 * @param {string} apiKey
 */
const useLiveData = (apiKey) => {
    const mapsIndoorsInstance = useAtomValue(mapsIndoorsInstanceState);

    /*
     * Handle enabling and disabling of MapsIndoors Live Data.
     *
     * Will instantiate a new LiveDataManager whenever the API key or MapsIndoors instance changes,
     * and enable the Live Data domain types that are available for the solution.
     * The LiveDataManager is released when they change or the Map Template unmounts,
     * so a removed map does not keep receiving updates or leave listeners on the SDK behind.
     */
    useEffect(() => {
        if (!mapsIndoorsInstance || !apiKey) return undefined;

        const liveDataManager = new window.mapsindoors.LiveDataManager(mapsIndoorsInstance);
        const enabledLiveDataDomainTypes = [];
        let isReleased = false;

        const show = async () => {
            const activeDomainTypes = await liveDataManager.LiveDataInfo.activeDomainTypes();
            for (const domainType of activeDomainTypes) {
                if (isReleased) return;
                await liveDataManager.enableLiveData(domainType);
                enabledLiveDataDomainTypes.push(domainType);
                if (isReleased && !liveDataManager.deallocate) {
                    liveDataManager.disableLiveData(domainType);
                }
            }
        };

        show();

        return () => {
            isReleased = true;
            // SDK versions before LiveDataManager.deallocate() can only disable the domains.
            if (liveDataManager.deallocate) {
                liveDataManager.deallocate();
            } else {
                for (const domainType of enabledLiveDataDomainTypes) {
                    liveDataManager.disableLiveData(domainType);
                }
            }
        };
    }, [apiKey, mapsIndoorsInstance]);
};

export default useLiveData;

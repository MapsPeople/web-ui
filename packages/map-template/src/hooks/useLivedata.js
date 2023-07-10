import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';

/**
 * Custom hook for showing default Live Data badges on the map.
 *
 * @param {string} apiKey
 */
const useLiveData = (apiKey) => {
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const liveDataManager = useRef();

    const [enabledLiveDataDomainTypes, setEnabledLiveDataDomainTypes] = useState([]);

    useEffect(() => {
        /*
         * Handle enabling and disabling of MapsIndoors Live Data.
         *
         * Will instantiate a new LiveDataManager whenever API key changes,
         * and will handle disabling any existing Live Data before enabling the Live Data
         * domain types that are available for the solution.
         */
        const show = async () => {
            if (mapsIndoorsInstance && apiKey) {

                // First, unsubscribe any existing live data domains
                for (const domainType of enabledLiveDataDomainTypes) {
                    liveDataManager.current.disableLiveData(domainType);
                }

                liveDataManager.current = new window.mapsindoors.LiveDataManager(mapsIndoorsInstance);
                const activeDomainTypes = await liveDataManager.current.LiveDataInfo.activeDomainTypes();
                for (const domainType of activeDomainTypes) {
                    await liveDataManager.current.enableLiveData(domainType);
                }
                setEnabledLiveDataDomainTypes(activeDomainTypes);
            }
        };

        show();
    }, [apiKey, mapsIndoorsInstance]); /* eslint-disable-line react-hooks/exhaustive-deps */
    // We ignore eslint warnings about missing dependencies because changes enabledLiveDataDomainTypes should not trigger re-run.
};

export default useLiveData;

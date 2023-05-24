import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import isMapReadyState from '../atoms/isMapReadyState';

/**
 * Hook that updates coordinates (center of the map) whenever map changes.
 */
const useNear = () => {
    const [near, setNear] = useState();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const mapReady = useRecoilValue(isMapReadyState);

    useEffect(() => {
        function centerHandler() {
            const center = mapsIndoorsInstance.getMapView().getCenter();
            setNear(center.lat + ',' + center.lng);
        }

        if (mapsIndoorsInstance && mapReady) {
            mapsIndoorsInstance.getMapView().addListener('idle', centerHandler);
            centerHandler();
        } else if (mapsIndoorsInstance) {
            mapsIndoorsInstance.getMapView().removeListener('idle', centerHandler);
        }

        return () => {
            if (mapsIndoorsInstance) {
                mapsIndoorsInstance.getMapView().removeListener('idle', centerHandler);
            }
        };
    }, [mapsIndoorsInstance, mapReady]);

    return near;
};

export default useNear;

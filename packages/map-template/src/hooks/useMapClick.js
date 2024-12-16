import { useEffect, useState } from 'react';
import mapTypeState from '../atoms/mapTypeState';
import { useRecoilValue } from 'recoil';

const MAP_PROVIDERS = {
    MAPBOX: 'mapbox',
    GOOGLE: 'google'
}

export default function useMapClick(mapsIndoorsInstance) {
    const mapType = useRecoilValue(mapTypeState);
    const [clickedOutside, setClickedOutside] = useState(false);
    
   useEffect(() => {

    if(mapType === MAP_PROVIDERS.MAPBOX) {
        const map = mapsIndoorsInstance.getMap();

        const handleMapClick = (clickResult) => {
            const features = mapsIndoorsInstance.getMap().queryRenderedFeatures(clickResult.point);

            if (features.length) {
                // Clicked on venue feature
                setClickedOutside(false);
                
            } else if (!features.length ) {
                setClickedOutside(true);
                // Clicked outside venue
                // TODO Remove console.log after review
                console.log('Clicked Nothing');
            }
        };

        // Add event listener
        map.on('click', handleMapClick);
    }

    if(mapType === MAP_PROVIDERS.GOOGLE) {
        const map = mapsIndoorsInstance.getMap();

    mapsIndoorsInstance.addListener('click', (clickResult) => {
        setClickedOutside(false);
        // TODO Remove console.log after review
        console.log('Clicked on a MapsIndoors location:', clickResult);
    });

    map.addListener('click', (clickResult) => {
        // TODO Remove console.log after review
        setClickedOutside(true);
        console.log('Clicked on a Google Maps Place:', clickResult);
    });
    }
    
   }, [mapsIndoorsInstance]);

   return clickedOutside;
}
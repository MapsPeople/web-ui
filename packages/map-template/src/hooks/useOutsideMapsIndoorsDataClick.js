import { useEffect, useState } from 'react';
import mapTypeState from '../atoms/mapTypeState';
import { useRecoilValue } from 'recoil';
import { mapTypes } from '../constants/mapTypes';

/**
 * Custom hook that handles map click events and determines whether the user clicked outside MapsIndoors data.
 *
 * @param {Object} mapsIndoorsInstance - The MapsIndoors instance.
 * @param {boolean} isOpen - Whether the sidebar or bottom sheet is open or not.
 * @returns {boolean} Returns `true` if the user clicked outside MapsIndoors data, `false` otherwise.
 */
export default function useOutsideMapsIndoorsDataClick(mapsIndoorsInstance, isOpen) {
    const mapType = useRecoilValue(mapTypeState);
    const [clickedOutside, setClickedOutside] = useState(false);
    const map = mapsIndoorsInstance.getMap();

    // Reset clickedOutside state when the sidebar is opened
    useEffect(() => {
        if (isOpen) {
            setClickedOutside(false);
        }
    }, [isOpen]);

    useEffect(() => {
        let mapboxClickHandler;
        let googleMapsClickHandler;
        let googleMapsIndoorsClickHandler;

        if (mapType === mapTypes.Mapbox) {
            mapboxClickHandler = (clickResult) => {
                if (!isOpen) return;
                const features = mapsIndoorsInstance.getMap().queryRenderedFeatures(clickResult.point);

                if (features.length) {
                    // Clicked on venue
                    // TODO Remove console.log after review
                    console.log('Clicked on MapsIndoors data:', features[0]);
                    setClickedOutside(false);
                } else if (!features.length) {
                    setClickedOutside(true);
                    // Clicked outside venue
                    // TODO Remove console.log after review
                    console.log('Clicked Nothing');
                }
            };
            // Add event listener
            map.on('click', mapboxClickHandler);
        }

        if (mapType === mapTypes.Google) {
            googleMapsClickHandler = (clickResult) => {
                if (!isOpen) return;
                setClickedOutside(false);
                // TODO Remove console.log after review
                console.log('Clicked on a MapsIndoors location:', clickResult);
            };

            googleMapsIndoorsClickHandler = (clickResult) => {
                if (!isOpen) return;
                // TODO Remove console.log after review
                setClickedOutside(true);
                console.log('Clicked on a Google Maps Place:', clickResult);
            }

            mapsIndoorsInstance.addListener('click', googleMapsClickHandler);

            map.addListener('click', googleMapsIndoorsClickHandler);
        }

        return () => {
            if (mapType === mapTypes.Mapbox) {
                map.off('click', mapboxClickHandler);
                console.log('Removed Mapbox click handler');
            }
            if (mapType === mapTypes.Google) {
                mapsIndoorsInstance.removeListener('click', googleMapsClickHandler);
                map.removeListener('click', googleMapsIndoorsClickHandler);
            }
        };

    }, [mapsIndoorsInstance, isOpen]);

    return clickedOutside;
}
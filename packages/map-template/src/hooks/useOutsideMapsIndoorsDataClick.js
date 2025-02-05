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

    // Reset clickedOutside state when the sidebar or bottom sheet is opened
    useEffect(() => {
        if (isOpen) {
            setClickedOutside(false);
        }
    }, [isOpen]);

    /**
     * Attaches click listeners to a Mapbox map instance to handle clicks on MapsIndoors data.
     *
     * @param {Object} map - The Mapbox map instance.
     * @param {Object} mapsIndoorsInstance - The MapsIndoors instance.
     * @param {boolean} isOpen - Whether the sidebar or bottom sheet is open or not.
     * @param {Function} setClickedOutside - A function to set the state when a click occurs outside MapsIndoors data.
     * @returns {Function} A cleanup function to remove the attached listeners.
     */
    function attachMapboxClickListeners(map, mapsIndoorsInstance, isOpen, setClickedOutside) {
        const mapboxClickHandler = (clickResult) => {
            if (!isOpen) return;
            const features = mapsIndoorsInstance.getMap().queryRenderedFeatures(clickResult.point);

            if (features.length) {
                setClickedOutside(false);
            } else {
                setClickedOutside(true);
            }
        };
        map.on('click', mapboxClickHandler);

        return () => {
            map.off('click', mapboxClickHandler);
        };
    }

    /**
     * Attaches click listeners to the Google Maps and MapsIndoors instances.
     *
     * @param {object} map - The Google Maps instance.
     * @param {object} mapsIndoorsInstance - The MapsIndoors instance.
     * @param {boolean} isOpen - Whether the sidebar or bottom sheet is open or not.
     * @param {function} setClickedOutside - A function to set the state when a click occurs outside MapsIndoors.
     * @returns {function} A cleanup function to remove the attached listeners.
     */
    function attachGoogleClickListeners(map, mapsIndoorsInstance, isOpen, setClickedOutside) {
        const googleMapsClickHandler = () => {
            if (!isOpen) return;
            setClickedOutside(false);
        };

        const googleMapsIndoorsClickHandler = () => {
            if (!isOpen) return;
            setClickedOutside(true);
        };

        mapsIndoorsInstance.addListener('click', googleMapsClickHandler);
        const mapListener = map.addListener('click', googleMapsIndoorsClickHandler);

        return () => {
            mapsIndoorsInstance.removeListener('click', googleMapsClickHandler);
            mapListener.remove();
        };
    }

    useEffect(() => {
        let detachMapClickListeners;
        if (mapType === mapTypes.Mapbox) {
            detachMapClickListeners = attachMapboxClickListeners(map, mapsIndoorsInstance, isOpen, setClickedOutside);
        }
        if (mapType === mapTypes.Google) {
            detachMapClickListeners = attachGoogleClickListeners(map, mapsIndoorsInstance, isOpen, setClickedOutside);
        }
        return () => detachMapClickListeners?.();
    }, [mapsIndoorsInstance, isOpen]);

    return clickedOutside;
}
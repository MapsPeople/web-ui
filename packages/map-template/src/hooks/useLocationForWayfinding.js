import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import userPositionState from '../atoms/userPositionState';
import positionControlState from '../atoms/positionControlState';
import generateMyPositionLocation from '../helpers/MyPositionLocation';

/**
 * Hook for a Location that can be both a MapsIndoors Location or a GeoJSON feature
 * that contains the user's position.
 *
 * @param {string} locationID - MapsIndoors Location ID or the keyword "USER_POSITION"
 * @param {object} positionControl - A MapsIndoors PositionControl object.
 */
const useLocationForWayfinding = (locationID) => {
    const [location, setLocation] = useState();
    const userPosition = useRecoilValue(userPositionState);
    const positionControl = useRecoilValue(positionControlState);

    useEffect(() => {
        if (positionControl && locationID) {
            if (locationID === 'USER_POSITION' && !userPosition) {
                // Set a magic value for the location, so components can know that a position may come at some point.
                setLocation('USER_POSITION_PENDING');
                positionControl.watchPosition();
            } else if (locationID !== 'USER_POSITION') {
                window.mapsindoors.services.LocationsService.getLocation(locationID)
                    .then(mapsIndoorsLocation => setLocation(mapsIndoorsLocation));
            }

            // When we want to use the user position and the position is known,
            // make a GeoJSON feature for that position and set it as the location.
            if (userPosition && locationID === 'USER_POSITION') {
                setLocation(generateMyPositionLocation(userPosition));
            }
        }
    }, [locationID, userPosition, positionControl])

    return location;
}

export default useLocationForWayfinding;

import { useEffect, useState } from 'react';
import getLocationPoint from '../helpers/GetLocationPoint';
import { useRecoilState } from 'recoil';
import directionsResponseState from '../atoms/directionsResponseState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';

/*
 * Hook to handle when both origin location and destination location are selected,
 * and have geometry, call the MapsIndoors SDK to get information about the route.
 */
const useDirectionsInfo = (originLocation, destinationLocation, directionsService, travelMode, accessibilityOn) => {
    const [totalDistance, setTotalDistance] = useState()
    const [totalTime, setTotalTime] = useState();
    const [hasFoundRoute, setHasFoundRoute] = useRecoilState(hasFoundRouteState);
    const [, setDirectionsResponse] = useRecoilState(directionsResponseState);
    const [isDirectionReady, setIsDirectionReady] = useState()

    useEffect(() => {
        setIsDirectionReady(false);
        if (originLocation?.geometry && destinationLocation?.geometry) {
            directionsService.getRoute({
                origin: getLocationPoint(originLocation),
                destination: getLocationPoint(destinationLocation),
                travelMode: travelMode,
                avoidStairs: accessibilityOn
            }).then(directionsResult => {
                if (directionsResult && directionsResult.legs) {
                    setHasFoundRoute(true);
                    // Calculate total distance and time
                    const totalDistance = directionsResult.legs.reduce((accumulator, current) => accumulator + current.distance.value, 0);
                    const totalTime = directionsResult.legs.reduce((accumulator, current) => accumulator + current.duration.value, 0);

                    setTotalDistance(totalDistance);
                    setTotalTime(totalTime);

                    setDirectionsResponse({
                        originLocation,
                        destinationLocation,
                        totalDistance,
                        totalTime,
                        directionsResult
                    });
                    setIsDirectionReady(true)
                } else {
                    setHasFoundRoute(false);
                }
            }, () => {
                setHasFoundRoute(false);
            });
        }
    }, [originLocation, destinationLocation, directionsService, accessibilityOn, travelMode]);

    return [totalDistance, totalTime, hasFoundRoute, isDirectionReady];
}

export default useDirectionsInfo;

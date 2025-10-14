import { useEffect, useState } from 'react';
import getLocationPoint from '../helpers/GetLocationPoint';
import { useRecoilState, useRecoilValue } from 'recoil';
import directionsResponseState from '../atoms/directionsResponseState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';
import shuttleBusOnState from '../atoms/shuttleBusOnState';

/*
 * Hook to handle when both origin location and destination location are selected,
 * and have geometry, call the MapsIndoors SDK to get information about the route.
 */
const useDirectionsInfo = (originLocation, destinationLocation, directionsService, travelMode, accessibilityOn) => {
    const [totalDistance, setTotalDistance] = useState()
    const [totalTime, setTotalTime] = useState();
    const [hasFoundRoute, setHasFoundRoute] = useRecoilState(hasFoundRouteState);
    const [, setDirectionsResponse] = useRecoilState(directionsResponseState);
    const [areDirectionsReady, setAreDirectionReady] = useState();
    const shuttleBusOn = useRecoilValue(shuttleBusOnState);

    useEffect(() => {
        setAreDirectionReady(false);
        let isActive = true; // This flag will help us ignore outdated responses
        if (originLocation?.geometry && destinationLocation?.geometry) {
            directionsService.getRoute({
                origin: getLocationPoint(originLocation),
                destination: getLocationPoint(destinationLocation),
                travelMode: travelMode,
                avoidStairs: accessibilityOn,
                excludeHighwayTypes: shuttleBusOn ? [] : ['busway']
            }).then(directionsResult => {
                if (!isActive) return;

                if (directionsResult && directionsResult.legs) {
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
                    setHasFoundRoute(true);
                    setAreDirectionReady(true);
                } else {
                    setHasFoundRoute(false);
                }
            }, () => {
                if (!isActive) return;
                setHasFoundRoute(false);
            });
        }

        return () => {
            isActive = false;
        }
    }, [originLocation, destinationLocation, directionsService, accessibilityOn, travelMode, shuttleBusOn]);

    return [totalDistance, totalTime, hasFoundRoute, areDirectionsReady];
}

export default useDirectionsInfo;

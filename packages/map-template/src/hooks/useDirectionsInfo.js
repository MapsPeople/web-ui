import { useEffect, useState } from 'react';
import getLocationPoint from '../helpers/GetLocationPoint';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import directionsResponseState from '../atoms/directionsResponseState';
import directionsLoadingState from '../atoms/directionsLoadingState';
import hasFoundRouteState from '../atoms/hasFoundRouteState';
import shuttleBusOnState from '../atoms/shuttleBusOnState';

/*
 * Hook to handle when both origin location and destination location are selected,
 * and have geometry, call the MapsIndoors SDK to get information about the route.
 */
// Several mounted views call this hook. Only an in-flight request may clear the spinner,
// otherwise a view without a route sets loading back to false in the same turn.
let directionsRequestsInFlight = 0;

const useDirectionsInfo = (originLocation, destinationLocation, directionsService, travelMode, accessibilityOn) => {
    const [totalDistance, setTotalDistance] = useState()
    const [totalTime, setTotalTime] = useState();
    const [hasFoundRoute, setHasFoundRoute] = useRecoilState(hasFoundRouteState);
    const setDirectionsResponse = useSetRecoilState(directionsResponseState);
    const setDirectionsLoading = useSetRecoilState(directionsLoadingState);
    const [areDirectionsReady, setAreDirectionReady] = useState();
    const shuttleBusOn = useRecoilValue(shuttleBusOnState);

    useEffect(() => {
        setAreDirectionReady(false);
        let isActive = true; // This flag will help us ignore outdated responses
        if (originLocation?.geometry && destinationLocation?.geometry && directionsService) {
            directionsRequestsInFlight += 1;
            setDirectionsLoading(true);
            Promise.resolve(directionsService.getRoute({
                origin: getLocationPoint(originLocation),
                destination: getLocationPoint(destinationLocation),
                travelMode: travelMode,
                avoidStairs: accessibilityOn,
                excludeHighwayTypes: shuttleBusOn ? [] : ['busway']
            })).then(directionsResult => {
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
            }).finally(() => {
                directionsRequestsInFlight = Math.max(0, directionsRequestsInFlight - 1);
                if (directionsRequestsInFlight === 0) {
                    setDirectionsLoading(false);
                }
            });
        }

        return () => {
            isActive = false;
        }
    }, [originLocation, destinationLocation, directionsService, accessibilityOn, travelMode, shuttleBusOn, setDirectionsLoading]);

    return [totalDistance, totalTime, hasFoundRoute, areDirectionsReady];
}

export default useDirectionsInfo;

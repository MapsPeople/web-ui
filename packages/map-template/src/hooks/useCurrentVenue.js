import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import venueNameStateAt from '../atoms/venueNameStateForVenueHook';
import venueState from '../atoms/venueStateForVenueHook';

export const useCurrentVenue = () => {

    const [venueName, setVenueName] = useRecoilState(venueNameStateAt);
    const [venue, setVenue] = useRecoilState(venueState);
    const venuesInSolution = useRecoilValue(venuesInSolutionState);

    useEffect(() => {
        if (venueName && venuesInSolution?.length) {
            setVenue(venuesInSolution.find(venue => venue.name === venueName));
        }
    }, [venueName, venuesInSolution]);

    /**
     *
     * @param {string} venueName
     */
    const setCurrentVenueName = venueName => {
        setVenueName(venueName);
        // TODO: setVenue on the SDK
    };

    return [setCurrentVenueName, venue];
}

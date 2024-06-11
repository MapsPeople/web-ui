import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import venueNameState from '../atoms/venueNameStateForVenueHook';
import venueState from '../atoms/venueStateForVenueHook';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';

export const useCurrentVenue = () => {

    const [venueName, setVenueName] = useRecoilState(venueNameState);
    const [venue, setVenue] = useRecoilState(venueState);
    const venuesInSolution = useRecoilValue(venuesInSolutionState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    /*
     * Responsible for setting the Venue state whenever venueName changes (and all Venues in the Solution are loaded).
     */
    useEffect(() => {
        if (venueName && venuesInSolution?.length && venueName !== venue?.name) {
            setVenue(venuesInSolution.find(venue => venue.name === venueName));
        } else if (!venueName && venuesInSolution.length) {
            setVenueName(getVenueToSet(venuesInSolution)?.name);
        }
    }, [venueName, venuesInSolution]);

    /**
     * Make sure to instruct the MapsIndoors SDK to internally change venue.
     */
    useEffect(() => {
        if (mapsIndoorsInstance && venue) {
            mapsIndoorsInstance.setVenue(venue);
        }
    }, [mapsIndoorsInstance, venue]);

    /**
     * Set the current venue
     *
     * @param {string} venueName - the name of the venue (called "Administrative ID" in the MapsIndoors CMS)
     */
    const setCurrentVenueName = venueName => {
        setVenueName(venueName);
    };

    return [setCurrentVenueName, venue];
}

/**
 * Used when there is no set venue.
 * Calculates which venue to set based on number of venues, localStorage and alphabetic order.
 */
function getVenueToSet(venuesInSolution) {
    // If there's only one venue, early return with that.
    if (venuesInSolution.length === 1) {
        return venuesInSolution[0];
    }

    // TODO: Re-implement
    // // If last selected venue is set in localStorage, use that.
    // const lastSetVenue = window.localStorage.getItem(localStorageKeyForVenue);
    // if (lastSetVenue) {
    //     const venue = venues.find(v => v.name === lastSetVenue);
    //     if (venue) {
    //         return venue;
    //     }
    // }

    // Else take first venue sorted alphabetically
    return [...venuesInSolution].sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); })[0];
}

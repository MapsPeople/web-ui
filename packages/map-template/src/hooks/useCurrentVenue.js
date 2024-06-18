import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import venueNameState from '../atoms/venueNameStateForVenueHook';
import venueState from '../atoms/venueStateForVenueHook';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import apiKeyState from '../atoms/apiKeyState';
import appConfigState from '../atoms/appConfigState';
import categoriesState from '../atoms/categoriesState';
import searchResultsState from '../atoms/searchResultsState';
import searchInputState from '../atoms/searchInputState';

export const useCurrentVenue = () => {

    const [venueName, setVenueName] = useRecoilState(venueNameState);
    const [venue, setVenue] = useRecoilState(venueState);
    const apiKey = useRecoilValue(apiKeyState);
    const [localStorageKey, setLocalStorageKey] = useState();
    const venuesInSolution = useRecoilValue(venuesInSolutionState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const appConfig = useRecoilValue(appConfigState);
    const [, setCategories] = useRecoilState(categoriesState);
    const [, setSearchResults] = useRecoilState(searchResultsState);
    const searchInput = useRecoilValue(searchInputState);

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

    /*
     * When apiKey changes, set the local storage key name that we use to store the
     * last selected venue with. We need to have the apiKey as part of the key in order
     * to avoid cross-solution issues.
     */
    useEffect(() => {
        if (apiKey) {
            setLocalStorageKey('MI-MAP-TEMPLATE-LAST-VENUE-' + apiKey);
        }
    }, [apiKey]);

    /*
     * Apply side effects when the venue changes:
     *  - Instruct the MapsIndoors SDK to internally change Venue.
     *  - Update Categories. We only want to show categories for which Locations in the current Venue exist.
     *  - Clear search results.
     *  - Clear search input field.
     */
    useEffect(() => {
        if (mapsIndoorsInstance && venue && appConfig) {
            mapsIndoorsInstance.setVenue(venue);
            updateCategories();
            setSearchResults([]);
            if (searchInput) {
                searchInput.value = '';
            }
        }
    }, [mapsIndoorsInstance, venue, appConfig]);

    /**
     * Set the current venue.
     * Also set it in localStorage for it to be re-selected after next reload.
     *
     * @param {string} venueName - the name of the venue (called "Administrative ID" in the MapsIndoors CMS)
     */
    const setCurrentVenueName = venueName => {
        if (venueName && localStorageKey) {
            window.localStorage.setItem(localStorageKey, venueName);
        }
        setVenueName(venueName);
    };

    /**
     * Used when there is no set venue.
     * Calculates which venue to set based on number of venues, localStorage and alphabetic order.
     */
    const getVenueToSet = () => {
        // If there's only one venue, early return with that.
        if (venuesInSolution.length === 1) {
            return venuesInSolution[0];
        }

        // If last selected venue is set in localStorage, use that.
        // TODO: This feature may be scrapped. Ongoing discussion.
        const lastSetVenue = window.localStorage.getItem(localStorageKey);
        if (lastSetVenue) {
            const venue = venuesInSolution.find(v => v.name === lastSetVenue);
            if (venue) {
                return venue;
            }
        }

        // Else take first venue sorted alphabetically
        return [...venuesInSolution].sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); })[0];
    };

    /**
     * Generate list of categories that exist on Locations in the current Venue.
     */
    const updateCategories = () => {
        window.mapsindoors.services.LocationsService.getLocations({ venue: venue.name }).then(locationsInVenue => {
            let uniqueCategories = new Map();
            for (const location of locationsInVenue) {
                const keys = Object.keys(location.properties.categories);

                for (const key of keys) {
                    // Get the categories from the App Config that have a matching key.
                    const appConfigCategory = appConfig?.menuInfo.mainmenu.find(category => category.categoryKey === key);

                    if (uniqueCategories.has(key)) {
                        let count = uniqueCategories.get(key).count;
                        uniqueCategories.set(key, { count: ++count, displayName: location.properties.categories[key], iconUrl: appConfigCategory?.iconUrl });
                    } else {
                        uniqueCategories.set(key, { count: 1, displayName: location.properties.categories[key], iconUrl: appConfigCategory?.iconUrl });
                    }
                }
            }

            // Sort the categories according to most locations associated.
            uniqueCategories = Array.from(uniqueCategories).sort((a, b) => b[1].count - a[1].count);

            setCategories(uniqueCategories);
        });
    };

    return [setCurrentVenueName, venue, updateCategories];
}

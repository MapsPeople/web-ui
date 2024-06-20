import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import appConfigState from '../atoms/appConfigState';
import categoriesState from '../atoms/categoriesState';
import searchResultsState from '../atoms/searchResultsState';
import searchInputState from '../atoms/searchInputState';

/**
 * Hook to handle the current Venue in the app based on the venue prop or other ways to set the Venue.
 *
 * Handles side effects when a Venue changes.
 *
 * @returns {[function, function]} - Function to set the current Venue (by providing the Venue name) and a function to force Categories to be updated.
 */
export const useCurrentVenue = () => {

    const [currentVenueName, setCurrentVenueName] = useRecoilState(currentVenueNameState);
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
        if (!currentVenueName && venuesInSolution.length) {
            setCurrentVenueName(getVenueToSet(venuesInSolution)?.name);
        }
    }, [currentVenueName, venuesInSolution]);

    /*
     * Apply side effects when the venue changes:
     *  - Instruct the MapsIndoors SDK to internally change Venue.
     *  - Update Categories. We only want to show categories for which Locations in the current Venue exist.
     *  - Clear search results.
     *  - Clear search input field.
     */
    useEffect(() => {
        if (mapsIndoorsInstance && venuesInSolution && currentVenueName && appConfig) {
            mapsIndoorsInstance.setVenue(venuesInSolution.find(venue => venue.name === currentVenueName));
            updateCategories();
            setSearchResults([]);
            if (searchInput) {
                searchInput.value = '';
            }
        }
    }, [mapsIndoorsInstance, currentVenueName, venuesInSolution, appConfig]);

    /**
     * Used when there is no set venue.
     * Calculates which venue to set based on number of venues and alphabetic order.
     */
    const getVenueToSet = () => {
        // If there's only one venue, early return with that.
        if (venuesInSolution.length === 1) {
            return venuesInSolution[0];
        }

        // Else take first venue sorted alphabetically
        return [...venuesInSolution].sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); })[0];
    };

    /**
     * Generate list of categories that exist on Locations in the current Venue.
     */
    const updateCategories = () => {
        window.mapsindoors.services.LocationsService.getLocations({ venue: currentVenueName }).then(locationsInVenue => {
            let uniqueCategories = new Map();
            for (const location of locationsInVenue) {
                const keys = Object.keys(location.properties.categories);

                for (const key of keys) {
                    // Get the categories from the App Config that have a matching key.
                    const appConfigCategory = appConfig?.menuInfo.mainmenu.find(category => category.categoryKey === key);

                    if (appConfigCategory) {
                        uniqueCategories.set(appConfigCategory.categoryKey, { displayName: location.properties.categories[key], iconUrl: appConfigCategory?.iconUrl })
                    }
                }
            }

            // Sort categories by the place in the mainmenu array. Use index to do that.
            const sortedCategories = Array.from(uniqueCategories).sort((a, b) => {
                const orderA = appConfig.menuInfo.mainmenu.findIndex(category => category.categoryKey === a[0]);
                const orderB = appConfig.menuInfo.mainmenu.findIndex(category => category.categoryKey === b[0]);
                return orderA - orderB;
            });

            setCategories(sortedCategories);
        });
    };

    return [setCurrentVenueName, updateCategories];
}

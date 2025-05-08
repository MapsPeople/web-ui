import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import appConfigState from '../atoms/appConfigState';
import categoriesState from '../atoms/categoriesState';
import searchResultsState from '../atoms/searchResultsState';
import searchInputState from '../atoms/searchInputState';
import initialVenueNameState from '../atoms/initialVenueNameState';

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
    const [initialVenueName, setInitialVenueName] = useRecoilState(initialVenueNameState);
    
    /*
     * Responsible for setting the Venue state whenever venueName changes (and all Venues in the Solution are loaded).
     */
    useEffect(() => {
        if (!currentVenueName && venuesInSolution.length) {
            setCurrentVenueName(getVenueToSet(venuesInSolution)?.name);
        }
    }, [currentVenueName, venuesInSolution]);

    /*
     * Make sure to store the initial venue for later use when eg. resetting.
     */
    useEffect(() => {
        if (currentVenueName && !initialVenueName) {
            setInitialVenueName(currentVenueName);
        }
    }, [currentVenueName]);

    /*
     * Apply side effects when the venue changes:
     *  - Instruct the MapsIndoors SDK to internally change Venue.
     *  - Update Categories. We only want to show categories for which Locations in the current Venue exist.
     *  - Clear search results.
     *  - Clear search input field.
     */
    useEffect(() => {
        if (mapsIndoorsInstance && venuesInSolution.length && currentVenueName && appConfig) {
            mapsIndoorsInstance.setVenue(venuesInSolution.find(venue => venue.name.toLowerCase() === currentVenueName.toLowerCase()));
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
        return [...venuesInSolution].sort(function (a, b) { return (a.venueInfo.name > b.venueInfo.name) ? 1 : ((b.venueInfo.name > a.venueInfo.name) ? -1 : 0); })[0];
    };

    /**
     * Generates a list of categories that exist on Locations in the current Venue.
     * To obtain `childKeys`, we fetch all categories from `SolutionsService.getCategories()`.
     * We then compare category keys from `mainMenu` and the fetched categories, and apply the corresponding `childKeys` to the relevant items.
     */
    const updateCategories = async () => {
        const categories = await window?.mapsindoors?.services?.SolutionsService?.getCategories();
        const mainMenu = appConfig?.menuInfo?.mainmenu ?? [];
        const categoriesMap = new Map(
            categories.map(category => [category.key, category.childKeys])
        );

        const categoriesWithChildKeys = mainMenu.map(item => ({
            ...item,
            childKeys: categoriesMap.get(item.categoryKey) ?? []
        }));

        // The venue parameter in the SDK's getLocations method is case sensitive.
        // So when the currentVenueName is set based on a Locations venue property, the casing may differ.
        // Thus we need to find the exact venue name.
        const venueName = venuesInSolution.find(venue => venue.name.toLowerCase() === currentVenueName.toLowerCase())?.name;
        window.mapsindoors.services.LocationsService.getLocations({ venue: venueName }).then(locationsInVenue => {
            let uniqueCategories = new Map();
            for (const location of locationsInVenue) {
                const keys = Object.keys(location.properties.categories);

                for (const key of keys) {
                    // Get the categories from the App Config that have a matching key.
                    if (mainMenu) {
                        const appConfigCategory = categoriesWithChildKeys.find(category => category.categoryKey === key);

                        if (appConfigCategory) {
                            uniqueCategories.set(appConfigCategory.categoryKey, { displayName: location.properties.categories[key], iconUrl: appConfigCategory?.iconUrl, childKeys: appConfigCategory?.childKeys ?? [] })
                        }
                    }
                }
            }

            // Sort categories by the place in the mainmenu array. Use index to do that.
            const sortedCategories = Array.from(uniqueCategories).sort((a, b) => {
                const orderA = appConfig.menuInfo?.mainmenu?.findIndex(category => category.categoryKey === a[0]);
                const orderB = appConfig.menuInfo?.mainmenu?.findIndex(category => category.categoryKey === b[0]);
                return orderA - orderB;
            });

            setCategories(sortedCategories);
        });
    };

    return [setCurrentVenueName, updateCategories];
}

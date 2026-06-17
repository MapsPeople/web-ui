import { useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import venuesInSolutionState from '../atoms/venuesInSolutionState';
import currentVenueNameState from '../atoms/currentVenueNameState';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import appConfigState from '../atoms/appConfigState';
import categoriesState from '../atoms/categoriesState';
import searchResultsState from '../atoms/searchResultsState';
import searchInputState from '../atoms/searchInputState';
import initialVenueNameState from '../atoms/initialVenueNameState';
import venueListState from '../atoms/venueListState';

/**
 * Hook to handle the current Venue in the app based on the venue prop or other ways to set the Venue.
 *
 * Handles side effects when a Venue changes.
 *
 * @returns {[function, function]} - Function to set the current Venue (by providing the Venue name) and a function to force Categories to be updated.
 */
export const useCurrentVenue = () => {

    const [currentVenueName, setCurrentVenueName] = useRecoilState(currentVenueNameState);
    const [venuesInSolution, setVenuesInSolution] = useRecoilState(venuesInSolutionState);
    const venueList = useRecoilValue(venueListState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const appConfig = useRecoilValue(appConfigState);
    const setCategories = useSetRecoilState(categoriesState);
    const setSearchResults = useSetRecoilState(searchResultsState);
    const searchInput = useRecoilValue(searchInputState);
    const [initialVenueName, setInitialVenueName] = useRecoilState(initialVenueNameState);
    const syncedVenueIdRef = useRef(null);
    
    /*
     * Responsible for setting the Venue state whenever venueName changes (and all Venues in the Solution are loaded).
     */
    useEffect(() => {
        if (!currentVenueName && venueList.length) {
            setCurrentVenueName(getVenueToSet()?.name);
        }
    }, [currentVenueName, venueList]);

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
        if (!mapsIndoorsInstance || !currentVenueName || !appConfig) return;

        const fullVenue = venuesInSolution.find(v => v.name?.toLowerCase() === currentVenueName.toLowerCase());

        if (fullVenue) {
            if (syncedVenueIdRef.current && syncedVenueIdRef.current !== fullVenue.id) {
                window.mapsindoors.MapsIndoors.removeVenuesToSync(syncedVenueIdRef.current);
            }
            window.mapsindoors.MapsIndoors.addVenuesToSync(fullVenue.id);
            syncedVenueIdRef.current = fullVenue.id;
            mapsIndoorsInstance.setVenue(fullVenue);
            updateCategories();
            setSearchResults([]);
            if (searchInput) searchInput.value = '';
        } else if (venueList.length) {
            // Full object not loaded yet — fetch on demand, add to state, re-trigger this effect
            const venueEntry = venueList.find(v => v.name?.toLowerCase() === currentVenueName.toLowerCase());
            if (venueEntry && !venuesInSolution.some(v => v.id === venueEntry.id)) {
                window.mapsindoors.services.VenuesService.getVenue(venueEntry.id).then(venue => {
                    if (venue) {
                        setVenuesInSolution(prev => [...prev, venue]);
                    } else {
                        console.warn(`[useCurrentVenue] Failed to fetch venue for id: ${venueEntry.id}`);
                    }
                });
            }
        }
    }, [mapsIndoorsInstance, currentVenueName, venuesInSolution, appConfig]);

    /**
     * Used when there is no set venue.
     * Calculates which venue to set based on number of venues and alphabetic order.
     */
    const getVenueToSet = () => {
        if (venueList.length === 1) {
            return venueList[0];
        }
        return [...venueList].sort((a, b) => a.name.localeCompare(b.name))[0];
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
        // Thus we look up the venue case-insensitively and prefer its id, which is not subject to casing issues.
        if (!currentVenueName) {
            setCategories([]);
            return;
        }
        const venueEntry = venueList.find(v => v.name?.toLowerCase() === currentVenueName.toLowerCase());
        const venueIdentifier = venueEntry?.id ?? venueEntry?.name ?? currentVenueName;
        window.mapsindoors.services.LocationsService.getLocations({ venue: venueIdentifier }).then(locationsInVenue => {
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

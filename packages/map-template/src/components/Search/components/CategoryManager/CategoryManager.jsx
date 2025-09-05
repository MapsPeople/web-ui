import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import selectedCategoryState from '../../../../atoms/selectedCategoryState';
import categoriesState from '../../../../atoms/categoriesState';
import searchAllVenuesState from '../../../../atoms/searchAllVenues';
import venuesInSolutionState from '../../../../atoms/venuesInSolutionState';
import currentVenueNameState from '../../../../atoms/currentVenueNameState';
import languageState from '../../../../atoms/languageState';
import { snapPoints } from '../../../../constants/snapPoints';
import Categories from '../../Categories/Categories';
import PropTypes from 'prop-types';

/**
 * CategoryManager component that handles category selection, filtering, tree navigation, and UI rendering
 * 
 * @param {Object} props
 * @param {function} props.onResults - Callback fired when category results are received
 * @param {function} props.onSetSize - Callback to communicate size changes to parent
 * @param {object} props.searchFieldRef - Reference to search field component
 * @param {function} props.setSearchResults - Function to update search results state
 * @param {function} props.setFilteredLocations - Function to update filtered locations state
 * @param {boolean} props.showCategories - Whether to show the categories UI
 * @param {boolean} props.showNotFoundMessage - Whether search shows not found message
 * @param {array} props.searchResults - Current search results array
 */
const CategoryManager = forwardRef(({ onResults, onSetSize, searchFieldRef, setSearchResults, setFilteredLocations, showCategories = false, showNotFoundMessage = false, searchResults = [] }, ref) => {

    const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);
    const categories = useRecoilValue(categoriesState);
    const searchAllVenues = useRecoilValue(searchAllVenuesState);
    const venuesInSolution = useRecoilValue(venuesInSolutionState);
    const currentVenueName = useRecoilValue(currentVenueNameState);
    const currentLanguage = useRecoilValue(languageState);

    const selectedCategoriesArray = useRef([]);
    const latestRequestId = useRef(0);
    const [childKeys, setChildKeys] = useState([]);

    /**
     * Handles go back function.
     */
    const handleBack = () => {
        // If selected categories tree has only parent category, then on back, we need to perform those clear functions.
        // Else, remove child category from selected categories tree array.
        if (selectedCategoriesArray.current.length === 1) {
            setSelectedCategory(null);
            setSearchResults([]);
            setFilteredLocations([]);
            onSetSize(snapPoints.FIT);

            // If there's a search term and it's not just whitespace, re-trigger the search without category filter
            const searchValue = searchFieldRef.current?.getValue()?.trim();
            if (searchValue) {
                searchFieldRef.current?.triggerSearch();
            } else {
                // If it's empty or just whitespace, clear the search field
                searchFieldRef.current?.clear();
            }
            selectedCategoriesArray.current.pop();
        } else {
            selectedCategoriesArray.current.pop();
            const parent = selectedCategoriesArray.current[selectedCategoriesArray.current.length - 1];
            setSelectedCategory(parent);
            getFilteredLocations(parent);
        }
    };

    /**
     * Get the locations and filter through them based on categories selected.
     *
     * @param {string} category
     */
    const getFilteredLocations = (category) => {
        // Creates a selected categories tree, where first category in the array is parent and second one is child
        // Ensure category is unique before pushing to selectedCategories.current
        if (!selectedCategoriesArray.current.includes(category)) {
            selectedCategoriesArray.current.push(category);
        }

        // If child category is being selected, we need to clear parent categories results in order to load proper data that belongs to child category.
        if (selectedCategory) {
            setSearchResults([]);
            setFilteredLocations([]);
        }
        setSelectedCategory(category);

        // Safety check: ensure MapsIndoors service is available
        if (!window?.mapsindoors?.services?.LocationsService?.getLocations) return;

        // Compute safe venue name
        const venueName = (searchAllVenues || !currentVenueName) ? undefined : venuesInSolution?.find(v => v?.name?.toLowerCase() === currentVenueName?.toLowerCase())?.name;

        // Ignore stale responses
        latestRequestId.current += 1;
        const requestId = latestRequestId.current;

        window.mapsindoors.services.LocationsService.getLocations({
            categories: category,
            venue: venueName,
        }).then(results => {
            if (requestId === latestRequestId.current) onResults(results || [], true);
        }).catch(error => {
            console.error('Failed to get filtered locations:', error);
            // Only update UI if this is still the latest request
            if (requestId === latestRequestId.current) {
                onResults([], true);
            }
        });
    };

    /**
     * Clear category selection and reset related state
     */
    const clearCategorySelection = () => {
        setSelectedCategory(null);
        selectedCategoriesArray.current = [];
    };

    // React on changes in the selected category state.
    // This handles external category selection (URL parameters, props, etc.)
    // but guards against duplicate calls from our own getFilteredLocations
    useEffect(() => {
        if (selectedCategory && !selectedCategoriesArray.current.includes(selectedCategory)) {
            getFilteredLocations(selectedCategory);
        }
    }, [selectedCategory]);

    // React on changes in the app language. Any existing category search needs to update with translated Locations.
    useEffect(() => {
        if (selectedCategory) {
            window.mapsindoors.services.LocationsService.once('update_completed', () => {
                searchFieldRef.current?.triggerSearch();
            });
        }
    }, [currentLanguage]);

    // Calculate child keys for the current selected category
    useEffect(() => {
        const childKeys = categories.find(([key]) => key === selectedCategory)?.[1]?.childKeys || [];
        setChildKeys(childKeys);
    }, [categories, selectedCategory]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        handleBack,
        getFilteredLocations,
        clearCategorySelection,
        selectedCategoriesArray,
        selectedCategory,
        childKeys
    }), [selectedCategory, childKeys]);

    // This component now renders Categories UI when appropriate
    return (
        <>
            {/* Vertical list of Categories */}
            {/* Show full category list only when searchResults are empty and conditions are met */}
            {showCategories && !showNotFoundMessage && categories.length > 0 && searchResults.length === 0 && (
                <Categories
                    onSetSize={onSetSize}
                    searchFieldRef={searchFieldRef}
                    getFilteredLocations={getFilteredLocations}
                    isOpen={!!selectedCategory}
                    topLevelCategory={true}
                />
            )}
        </>
    );
});

CategoryManager.displayName = 'CategoryManager';

CategoryManager.propTypes = {
    onResults: PropTypes.func.isRequired,
    onSetSize: PropTypes.func.isRequired,
    searchFieldRef: PropTypes.object.isRequired,
    setSearchResults: PropTypes.func.isRequired,
    setFilteredLocations: PropTypes.func.isRequired,
    showCategories: PropTypes.bool,
    showNotFoundMessage: PropTypes.bool,
    searchResults: PropTypes.array
};

export default CategoryManager;

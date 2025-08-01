import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import './Categories.scss';
import categoriesState from '../../../atoms/categoriesState';
import { snapPoints } from '../../../constants/snapPoints';
import searchResultsState from '../../../atoms/searchResultsState';
import filteredLocationsState from '../../../atoms/filteredLocationsState';
import selectedCategoryState from '../../../atoms/selectedCategoryState';
import { usePreventSwipe } from '../../../hooks/usePreventSwipe';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import getActiveCategory from '../../../helpers/GetActiveCategory';
import isBottomSheetLoadedState from '../../../atoms/isBottomSheetLoadedState';
import categoryState from '../../../atoms/categoryState';
import useOutsideMapsIndoorsDataClick from '../../../hooks/useOutsideMapsIndoorsDataClick';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import PropTypes from 'prop-types';
import { ReactComponent as ChevronLeft } from '../../../assets/chevron-left.svg';
import { useTranslation } from 'react-i18next';

Categories.propTypes = {
    onSetSize: PropTypes.func,
    getFilteredLocations: PropTypes.func,
    searchFieldRef: PropTypes.object,
    isOpen: PropTypes.bool,
    topLevelCategory: PropTypes.bool,
    handleBack: PropTypes.func,
    selectedCategoriesArray: PropTypes.object
};

/**
 * Show the categories list.
 *
 * @param {object} props
 * @param {function} props.onSetSize - Callback that is fired when the categories are clicked.
 * @param {function} props.getFilteredLocations - Function that gets the filtered locations based on the category selected.
 * @param {object} props.searchFieldRef - The reference to the search input field.
 * @param {boolean} props.isOpen - Determines wheteher the Categories window is open or not.
 * @param {boolean} props.topLevelCategory - If true, renders top-level categories; otherwise, renders sub-categories.
 * @param {function} props.handleBack - Callback function to handle back navigation between categories.
 * @param {Array<string>} props.selectedCategoriesArray - Array containing selected categories (e.g., top-level and sub-category).
 */
function Categories({ onSetSize, getFilteredLocations, searchFieldRef, isOpen, topLevelCategory, handleBack, selectedCategoriesArray }) {

    const categories = useRecoilValue(categoriesState);

    const isDesktop = useIsDesktop();

    const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);

    const [, setSearchResults] = useRecoilState(searchResultsState);

    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const [activeCategory, setActiveCategory] = useState();

    const isBottomSheetLoaded = useRecoilValue(isBottomSheetLoadedState);

    const category = useRecoilValue(categoryState);

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const clickedOutsideMapsIndoorsData = useOutsideMapsIndoorsDataClick(mapsIndoorsInstance, isOpen);

    const [categoriesToShow, setCategoriesToShow] = useState([]);

    const [selectedCategoryDisplayName, setSelectedCategoryDisplayName] = useState([])

    const { t } = useTranslation();

    /**
    * Communicate size change to parent component.
    *
    * @param {number} size
    */
    function setSize(size) {
        if (typeof onSetSize === 'function') {
            onSetSize(size);
        }
    }

    /**
     * Handles the click events on the categories list.
     *
     * @param {string} category
     */
    function categoryClicked(category) {
        setSelectedCategory(category);

        if (selectedCategory === category) {
            // If the clicked category is the same as currently selected, "deselect" it.
            setSearchResults([]);
            setSelectedCategory(null);

            // Pass an empty array to the filtered locations in order to reset the locations.
            setFilteredLocations([]);

            // Check if the search field has a value and trigger the search again.
            if (searchFieldRef.current.getValue()) {
                searchFieldRef.current.triggerSearch();
            }
        } else if (searchFieldRef.current.getValue()) {
            // If the search field has a value, trigger a research based on the new category.
            searchFieldRef.current.triggerSearch();
        } else {
            // If the search field is empty, show all locations with that category.
            getFilteredLocations(category);
        }
    }

    /**
     * Handles cleanup when user clicks outside MapsIndoors data area.
     * This effect will:
     * 1. Clear the currently selected category
     * 2. Reset all search/filter related states to empty
     * 3. Collapse the view back to fit size
     * 4. Clear any existing search input
     *
     * Only triggers when:
     * - There is a currently selected category and user clicks outside MapsIndoors data
     */
    useEffect(() => {
        if (clickedOutsideMapsIndoorsData && selectedCategory) {
            setSelectedCategory(null);
            setSearchResults([]);
            setFilteredLocations([]);

            // If search field has a value, clear the search field.
            if (searchFieldRef.current?.getValue()) {
                searchFieldRef.current.clear();
            }
        }
    }, [clickedOutsideMapsIndoorsData]);

    /*
     * Get the active category element.
     */
    useEffect(() => {
        if (selectedCategory) {
            getActiveCategory().then(activeCategory => setActiveCategory(activeCategory));
            setSize(snapPoints.MAX);
        }
    }, [selectedCategory]);

    /*
     * If the active category is a prop/query parameter and the bottom sheet is loaded,
     * then scroll into view and center the active category.
     */
    useEffect(() => {
        if (activeCategory && category !== undefined && (isDesktop || (!isDesktop && isBottomSheetLoaded))) {
            activeCategory.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeCategory, category, isBottomSheetLoaded]);

    /*
     * Filters and sets the categories to display based on whether top-level or sub-categories should be shown.
     * If `topLevelCategory` is true, it excludes categories that appear as children.
     * Otherwise, it includes only categories that are children.
     * 
     * Sets selected category display name, based on currently selected category.
     */
    useEffect(() => {
        let categoriesToDisplay = [];

        if (topLevelCategory) {
            // Show only top-level categories
            const allChildKeys = categories.flatMap(([, category]) => category.childKeys || []);
            categoriesToDisplay = categories.filter(([key]) => !allChildKeys.includes(key));
        } else if (selectedCategory) {
            // Show only the children of the selected category
            const selectedCategoryData = categories.find(([key]) => key === selectedCategory)?.[1];
            const selectedCategoryChildKeys = selectedCategoryData?.childKeys || [];
            categoriesToDisplay = categories.filter(([key]) => selectedCategoryChildKeys.includes(key));
        }

        setCategoriesToShow(categoriesToDisplay);

        const categoryDisplayName = categories.find(([key]) => key === selectedCategory)?.[1]?.displayName;
        setSelectedCategoryDisplayName(categoryDisplayName);
    }, [categories])

    return (
        <div className="categories prevent-scroll" {...scrollableContentSwipePrevent}>
            {categories.length > 0 && (
                <div className="categories__list">
                    {!topLevelCategory && (
                        <div className="categories__nav">
                            <button
                                aria-label={t('Back')}
                                type="button"
                                className="categories__nav-button"
                                onClick={handleBack}>
                                <ChevronLeft />
                            </button>
                            <div>{selectedCategoryDisplayName}</div>
                        </div>
                    )}

                    {categoriesToShow.map(([category, categoryInfo]) => {
                        if (!topLevelCategory && selectedCategoriesArray.current.length !== 1) {
                            return null;
                        }

                        return (
                            <div key={category} className="categories__category">
                                <button
                                    onClick={() =>
                                        topLevelCategory
                                            ? categoryClicked(category)
                                            : getFilteredLocations(category)
                                    }>
                                    <img src={categoryInfo.iconUrl} alt="" />
                                    {categoryInfo.displayName}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Categories;
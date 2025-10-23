import { useEffect, useState, useRef } from 'react';
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
import { ReactComponent as ChevronRight } from '../../../assets/chevron-right.svg';
import { useIsKioskContext } from '../../../hooks/useIsKioskContext';
import { useTranslation } from 'react-i18next';

Categories.propTypes = {
    onSetSize: PropTypes.func,
    getFilteredLocations: PropTypes.func,
    searchFieldRef: PropTypes.object,
    isOpen: PropTypes.bool,
    topLevelCategory: PropTypes.bool,
    handleBack: PropTypes.func,
    selectedCategoriesArray: PropTypes.object,
    categoryOrientation: PropTypes.oneOf(['horizontal', 'vertical'])
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
 * @param {string} props.categoryOrientation - Orientation for kiosk mode: 'horizontal' or 'vertical'.
 */
function Categories({ onSetSize, getFilteredLocations, searchFieldRef, isOpen, topLevelCategory, handleBack, selectedCategoriesArray, categoryOrientation }) {

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

    const isKiosk = useIsKioskContext();

    // Ref for horizontal scrolling in kiosk mode
    const categoriesListRef = useRef(null);

    // Add new state for tracking scroll position
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Scroll handler for kiosk horizontal mode
    const scrollHorizontalCategories = (direction) => {
        // Early exit if category buttons should not be shown
        if (!shouldShowKioskHorizontalNavButtons) {
            return;
        }
        
        if (categoriesListRef.current) {
            const scrollAmount = 200; // px to scroll per click
            categoriesListRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // Function to check scroll position and update chevron states
    const updateKioskHorizontalNavButtonStates = () => {
        if (categoriesListRef.current) {
            
            const { scrollLeft, scrollWidth, clientWidth } = categoriesListRef.current;
            const isAtStart = scrollLeft <= 0;
            const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1; // -1 for rounding errors
            
            setCanScrollLeft(!isAtStart);
            setCanScrollRight(!isAtEnd);
        }
    };

    // Determine if we are at the end of the subcategory chain (no more subcategories to show)
    // We don't show chevrons if we are at the end of the subcategory chain
    const atEndOfSubcategories = !topLevelCategory && categoriesToShow.length === 0;

    // Determine if we should show chevrons (only in horizontal kiosk mode)
    // Only visible in kiosk horizontal layout
    // They do not render if we are at the end of the subcategory chain
    const shouldShowKioskHorizontalNavButtons = isKiosk && categoryOrientation === 'horizontal' && !atEndOfSubcategories;

    // Add scroll event listener to track position changes
    useEffect(() => {
        // Early exit if category buttons should not be shown
        if (!shouldShowKioskHorizontalNavButtons) {
            return;
        }
        
        const categoriesList = categoriesListRef.current;
        if (categoriesList) {
            // Initial check
            updateKioskHorizontalNavButtonStates();
            
            // Add scroll event listener
            categoriesList.addEventListener('scroll', updateKioskHorizontalNavButtonStates);
            
            // Cleanup
            return () => {
                categoriesList.removeEventListener('scroll', updateKioskHorizontalNavButtonStates);
            };
        }
    }, [shouldShowKioskHorizontalNavButtons, categoriesToShow.length]);

    // Determines the main container class for Categories, dictating the look for kiosk mode or desktop mode
    // Based on the kioskOrientation prop, it will apply different styles for horizontal or vertical layouts
    // Default to horizontal if no orientation is provided
    const categoriesContainerClassName = `categories prevent-scroll${isKiosk ? ` categories--kiosk-${categoryOrientation || 'vertical'}` : ''}`;

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
        <div className={categoriesContainerClassName} {...scrollableContentSwipePrevent}>
            {categories.length > 0 && (
                <>
                    {/* Show nav above subcategories row if not topLevelCategory */}
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
                    <div className="categories__row">
                        {shouldShowKioskHorizontalNavButtons && (
                            <div className="categories__chevron categories__chevron--left">
                                <button
                                    aria-label={t('Previous categories')}
                                    type="button"
                                    disabled={!canScrollLeft}
                                    onClick={() => scrollHorizontalCategories('left')}>
                                    <ChevronLeft />
                                </button>
                            </div>
                        )}
                        <div className="categories__list" ref={isKiosk ? categoriesListRef : undefined}>
                            {categoriesToShow.map(([category, categoryInfo]) => {
                                if (!topLevelCategory && selectedCategoriesArray.current.length !== 1) {
                                    return null;
                                }

                                return (
                                    <div key={category} className="categories__category">
                                        <button
                                            onClick={() => topLevelCategory
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
                        {shouldShowKioskHorizontalNavButtons && (
                            <div className="categories__chevron categories__chevron--right">
                                <button
                                    aria-label={t('Next categories')}
                                    type="button"
                                    disabled={!canScrollRight}
                                    onClick={() => scrollHorizontalCategories('right')}>
                                    <ChevronRight />
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Categories;
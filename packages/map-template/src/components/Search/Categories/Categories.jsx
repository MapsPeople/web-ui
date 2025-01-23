import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import './Categories.scss';
import { ReactComponent as ChevronRight } from '../../../assets/chevron-right.svg';
import { ReactComponent as ChevronLeft } from '../../../assets/chevron-left.svg';
import categoriesState from "../../../atoms/categoriesState";
import primaryColorState from "../../../atoms/primaryColorState";
import { snapPoints } from "../../../constants/snapPoints";
import searchResultsState from "../../../atoms/searchResultsState";
import filteredLocationsState from "../../../atoms/filteredLocationsState";
import selectedCategoryState from "../../../atoms/selectedCategoryState";
import { usePreventSwipe } from '../../../hooks/usePreventSwipe';
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import getActiveCategory from "../../../helpers/GetActiveCategory";
import isBottomSheetLoadedState from "../../../atoms/isBottomSheetLoadedState";
import categoryState from "../../../atoms/categoryState";
import useOutsideMapsIndoorsDataClick from "../../../hooks/useOutsideMapsIndoorsDataClick";
import mapsIndoorsInstanceState from "../../../atoms/mapsIndoorsInstanceState";

/**
 * Show the categories list.
 *
 * @param {object} props
 * @param {function} props.onSetSize - Callback that is fired when the categories are clicked.
 * @param {function} props.getFilteredLocations - Function that gets the filtered locations based on the category selected.
 * @param {object} props.searchFieldRef - The reference to the search input field.
 * @param {boolean} props.isOpen - Determines wheteher the Categories window is open or not.
 */
function Categories({ onSetSize, getFilteredLocations, searchFieldRef, isOpen }) {
    /** Referencing the categories results container DOM element */
    const categoriesListRef = useRef();

    const categories = useRecoilValue(categoriesState);

    const isDesktop = useIsDesktop();

    const [isLeftButtonDisabled, setIsLeftButtonDisabled] = useState(true);

    const [isRightButtonDisabled, setIsRightButtonDisabled] = useState(false);

    const primaryColor = useRecoilValue(primaryColorState);

    const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);

    const [, setSearchResults] = useRecoilState(searchResultsState);

    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const [activeCategory, setActiveCategory] = useState();

    const isBottomSheetLoaded = useRecoilValue(isBottomSheetLoadedState);
    const category = useRecoilValue(categoryState);

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const clickedOutsideMapsIndoorsData = useOutsideMapsIndoorsDataClick(mapsIndoorsInstance, isOpen);

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
        setSize(snapPoints.MAX);

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
     * Update the state of the left and right scroll buttons
     */
    function updateScrollButtonsState() {
        const { scrollLeft, scrollWidth, clientWidth } = categoriesListRef?.current || {};

        // Disable or enable the scroll left button
        if (scrollLeft === 0) {
            setIsLeftButtonDisabled(true);
        } else if (isLeftButtonDisabled) {
            setIsLeftButtonDisabled(false);
        }

        // Disable or enable the scroll right button
        if (scrollWidth - scrollLeft === clientWidth) {
            setIsRightButtonDisabled(true);
        } else if (scrollWidth - scrollLeft > clientWidth) {
            setIsRightButtonDisabled(false);
        }
    }

    /**
     * Update the scroll position based on the value
     *
     * @param {number} value
     */
    function updateScrollPosition(value) {
        categoriesListRef?.current.scroll({
            left: categoriesListRef?.current.scrollLeft + value,
            behavior: 'smooth'
        });
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
            setSize(snapPoints.FIT);

            // If search field has a value, clear the search field.
            if (searchFieldRef.current?.getValue()) {
                searchFieldRef.current.clear();
            }
        }
    }, [clickedOutsideMapsIndoorsData]);

    /**
     * Add event listener for scrolling in the categories list
     */
    useEffect(() => {
        // When categoriesListRef.current element resizes, update scroll button states.
        const handleResize = () => {
            updateScrollButtonsState();
        };

        let resizeObserver;

        if (categoriesListRef.current) {
            // Because of timing issue, we need to listen to changes inside div element for categories.
            // Based on that we can handle disabling/enabling scroll buttons.
            // Read more: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
            resizeObserver = new ResizeObserver(handleResize)
            resizeObserver.observe(categoriesListRef.current);
            categoriesListRef.current.addEventListener('scroll', updateScrollButtonsState);
        }

        return () => {
            setActiveCategory();
            resizeObserver?.disconnect();
            categoriesListRef.current?.removeEventListener('scroll', updateScrollButtonsState);
        };
    }, []);

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

    return (
        <div className="categories prevent-scroll" {...scrollableContentSwipePrevent}>
            {categories.length > 0 &&
                <>
                    {isDesktop &&
                        <button className={`categories__scroll-button`}
                            onClick={() => updateScrollPosition(-300)}
                            disabled={isLeftButtonDisabled}>
                            <ChevronLeft />
                        </button>
                    }
                    <div ref={categoriesListRef} className="categories__list">
                        {categories?.map(([category, categoryInfo]) =>
                            <mi-chip
                                icon={categoryInfo.iconUrl}
                                background-color={primaryColor}
                                content={categoryInfo.displayName}
                                active={selectedCategory === category}
                                onClick={() => categoryClicked(category)}
                                key={category}>
                            </mi-chip>
                        )}
                    </div>
                    {isDesktop &&
                        <button className={`categories__scroll-button`}
                            onClick={() => updateScrollPosition(300)}
                            disabled={isRightButtonDisabled}>
                            <ChevronRight />
                        </button>
                    }
                </>}
        </div>
    )
}

export default Categories;
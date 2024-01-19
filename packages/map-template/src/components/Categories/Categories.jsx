import React, { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import './Categories.scss';
import categoriesState from "../../atoms/categoriesState";
import useMediaQuery from "../../hooks/useMediaQuery";
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg';
import primaryColorState from "../../atoms/primaryColorState";
import { snapPoints } from "../../constants/snapPoints";
import searchResultsState from "../../atoms/searchResultsState";
import selectedCategoryState from "../../atoms/selectedCategoryState";
import filteredLocationsState from "../../atoms/filteredLocationsState";

/**
 * Show the categories list.
 * 
 * @param {object} props
 * @param {function} props.onSetSize - Callback that is fired when the categories are clicked.
 * @param {function} props.getFilteredLocations - Function that gets the filtered locations based on the category selected.
 * @param {object} props.searchFieldRef - The reference to the search input field.
 */
function Categories({ onSetSize, getFilteredLocations, searchFieldRef }) {
    /** Referencing the categories results container DOM element */
    const categoriesListRef = useRef();

    const categories = useRecoilValue(categoriesState);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    const [isLeftButtonDisabled, setIsLeftButtonDisabled] = useState(true);

    const [isRightButtonDisabled, setIsRightButtonDisabled] = useState(false);

    const primaryColor = useRecoilValue(primaryColorState);

    const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);

    const [, setSearchResults] = useRecoilState(searchResultsState);

    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);

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
        // Disable or enable the scroll left button
        if (categoriesListRef?.current.scrollLeft === 0) {
            setIsLeftButtonDisabled(true);
        } else if (isLeftButtonDisabled) {
            setIsLeftButtonDisabled(false);
        }

        // Disable or enable the scroll right button
        if (categoriesListRef?.current.scrollWidth - categoriesListRef?.current.scrollLeft === categoriesListRef?.current.clientWidth) {
            setIsRightButtonDisabled(true);
        } else if (isRightButtonDisabled) {
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
     * Add event listener for scrolling in the categories list
     */
    if (categoriesListRef.current) {
        categoriesListRef.current.addEventListener('scroll', () => {
            updateScrollButtonsState();
        });
    }

    return (
        <div className="categories">
            {categories.length > 0 &&
                <>
                    {isDesktop &&
                        <button className={`categories__scroll-button`}
                            onClick={() => updateScrollPosition(-300)}
                            disabled={isLeftButtonDisabled}>
                            <ArrowLeft />
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
                            <ArrowRight />
                        </button>
                    }
                </>}
        </div>
    )
}

export default Categories;
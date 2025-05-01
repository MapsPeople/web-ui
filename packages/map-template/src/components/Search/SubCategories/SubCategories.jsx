import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import categoriesState from '../../../atoms/categoriesState';
import selectedCategoryState from '../../../atoms/selectedCategoryState';
import { usePreventSwipe } from '../../../hooks/usePreventSwipe';
import { ReactComponent as ChevronLeft } from '../../../assets/chevron-left.svg';
import './SubCategories.scss';

SubCategories.propTypes = {
    handleBack: PropTypes.func,
    getFilteredLocations: PropTypes.func,
    onLocationClicked: PropTypes.func,
    childKeys: PropTypes.array
};

/**
 * Show the sub-categories.
 *
 * @param {object} props
 * @param {function} props.handleBack - Callback when back button is clicked.
 * @param {function} props.getFilteredLocations - Function to fetch filtered locations by category.
 * @param {string[]} props.childKeys - List of child category keys.
 */
function SubCategories({ handleBack, getFilteredLocations, childKeys }) {
    const categories = useRecoilValue(categoriesState);

    const selectedCategory = useRecoilValue(selectedCategoryState);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const selectedCategoryDisplayName =
        categories.find(([key]) => key === selectedCategory)?.[1]?.displayName;

    return (
        <div className="subcategories prevent-scroll" {...scrollableContentSwipePrevent}>
            {/* Only show sub-categories, when top level category is selected. */}
            {selectedCategory && (
                <>
                    <div className="subcategories__nav">
                        <button aria-label="Back" type="button" className="subcategories__nav--button" onClick={handleBack}>
                            <ChevronLeft />
                        </button>
                        <div className="search__nav-text">{selectedCategoryDisplayName}</div>
                    </div>

                    <div className="subcategories__categories">
                        {categories
                            .filter(([key]) => childKeys.includes(key))
                            .map(([childKey, childInfo]) => (
                                <div key={childKey} className="categories__category">
                                    <button onClick={() => getFilteredLocations(childKey)}>
                                        <img src={childInfo.iconUrl} alt="" />
                                        {childInfo.displayName}
                                    </button>
                                </div>
                            ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default SubCategories;
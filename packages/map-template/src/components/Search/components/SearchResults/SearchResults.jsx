import './SearchResults.scss';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Categories from '../../Categories/Categories';
import ListItemLocation from '../../../WebComponentWrappers/ListItemLocation/ListItemLocation';

/**
 * SearchResults component handles the display of search results, including error states,
 * categories, and location lists. It manages the presentation of search outcomes
 * and user interactions with the results.
 *
 * @param {Object} props
 * @param {Array} props.searchResults - Array of search result locations
 * @param {boolean} props.showNotFoundMessage - Whether to show "nothing found" message
 * @param {string} props.selectedCategory - Currently selected category
 * @param {Array} props.childKeys - Child categories for the selected category
 * @param {Function} props.handleBack - Callback for back navigation
 * @param {Function} props.getFilteredLocations - Callback for getting filtered locations
 * @param {Object} props.locationHandlerRef - Reference to location handler component
 * @param {Object} props.hoveredLocation - Currently hovered location
 * @param {Object} props.selectedCategoriesArray - Reference to selected categories array
 * @param {Object} props.scrollableContentSwipePrevent - Swipe prevention props for scrollable content
 */
const SearchResults = ({
    searchResults,
    showNotFoundMessage,
    selectedCategory,
    childKeys,
    handleBack,
    getFilteredLocations,
    locationHandlerRef,
    hoveredLocation,
    selectedCategoriesArray,
    scrollableContentSwipePrevent
}) => {
    const { t } = useTranslation();

    return (
        <div className="search-results">
            {/* Message shown if no search results were found */}
            {showNotFoundMessage && (
                <p className="search-results__error">
                    {t('Nothing was found')}
                </p>
            )}

            {/* When search results are found (category is selected or search term is used) */}
            {searchResults.length > 0 && (
                <div className="search-results__container">

                    {/* Subcategories should only show if a top level category is selected and if that top level category has any childKeys */}
                    {selectedCategory && (
                        <Categories
                            handleBack={handleBack}
                            getFilteredLocations={(category) => getFilteredLocations(category)}
                            onLocationClicked={locationHandlerRef.current?.onLocationClicked}
                            childKeys={childKeys}
                            topLevelCategory={false}
                            selectedCategoriesArray={selectedCategoriesArray}
                        />
                    )}

                    {/* Show locations when there are any searchResults */}
                    <div className="search-results__locations prevent-scroll" {...scrollableContentSwipePrevent}>
                        {searchResults.map(location =>
                            <ListItemLocation
                                key={location.id}
                                location={location}
                                locationClicked={() => locationHandlerRef.current?.onLocationClicked(location)}
                                isHovered={location?.id === hoveredLocation?.id}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

SearchResults.displayName = 'SearchResults';

SearchResults.propTypes = {
    searchResults: PropTypes.array.isRequired,
    showNotFoundMessage: PropTypes.bool.isRequired,
    selectedCategory: PropTypes.string,
    childKeys: PropTypes.array.isRequired,
    handleBack: PropTypes.func.isRequired,
    getFilteredLocations: PropTypes.func.isRequired,
    locationHandlerRef: PropTypes.object.isRequired,
    hoveredLocation: PropTypes.object,
    selectedCategoriesArray: PropTypes.object.isRequired,
    scrollableContentSwipePrevent: PropTypes.object.isRequired
};

export default SearchResults;

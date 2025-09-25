import { useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import SearchFieldComponent from '../../../WebComponentWrappers/Search/Search';
import { ReactComponent as Legend } from '../../../../assets/legend.svg';
import isLegendDialogVisibleState from '../../../../atoms/isLegendDialogVisibleState';
import { useIsKioskContext } from '../../../../hooks/useIsKioskContext';
import { snapPoints } from '../../../../constants/snapPoints';
import PropTypes from 'prop-types';


/**
 * SearchField component that handles search input, events, and related UI
 * 
 * @param {Object} props
 * @param {string|array} props.selectedCategory - Currently selected category for filtering
 * @param {boolean} props.showLegendButton - Whether to show the legend button in kiosk mode
 * @param {function} props.onResults - Callback fired when search results are received
 * @param {function} props.onSetSize - Callback to communicate size changes to parent
 * @param {function} props.onClearResults - Callback fired when search is cleared
 * @param {function} props.onKeyDown - Callback fired when keydown events occur on the input field
 * @param {object} props.kioskKeyboardRef - Reference to kiosk keyboard component
 * @param {boolean} props.isInputFieldInFocus - Whether the search field is in focus
 * @param {function} props.setIsInputFieldInFocus - Function to set input field focus state
 * @param {boolean} props.isChatModeEnabled - Whether chat mode is currently enabled
 */
const SearchField = forwardRef(({ selectedCategory, showLegendButton, onResults, onSetSize, onClearResults, onKeyDown, kioskKeyboardRef, isInputFieldInFocus, setIsInputFieldInFocus, isChatModeEnabled }, ref) => {
    const { t } = useTranslation();

    /** Referencing the search field */
    const searchFieldRef = useRef();

    const [searchDisabled, setSearchDisabled] = useState(true);

    const isKioskContext = useIsKioskContext();
    const [, setShowLegendDialog] = useRecoilState(isLegendDialogVisibleState);

    // Determine placeholder text based on chat mode
    const placeholderText = isChatModeEnabled 
        ? t('Ask follow up...') 
        : t('Search by name, category, building...');

    /**
     * Clear results list when search field is cleared.
     */
    const cleared = useCallback(() => {
        onClearResults();

        // Clear the keyboard input field through KioskKeyboard component
        kioskKeyboardRef?.current?.clearInputField();
    }, [onClearResults, kioskKeyboardRef]);

    /**
     * When search field is clicked, maximize the sheet size and set focus on the input field.
     * Wait for any bottom sheet transition to end before focusing to avoid content jumping.
     */
    const searchFieldClicked = useCallback(() => {
        setSearchDisabled(false);
        searchFieldRef.current.getInputField();

        const sheet = searchFieldRef.current?.closest?.('.sheet');
        if (sheet) {
            sheet.addEventListener('transitionend', () => {
                searchFieldRef.current.focusInput();
                setIsInputFieldInFocus(true);
            }, { once: true });
        } else {
            searchFieldRef.current.focusInput();
            setIsInputFieldInFocus(true);
        }
    }, []);

    /**
     * Handle search results from the search field.
     *
     * @param {array} locations - An array of MapsIndoors Location objects.
     */
    const handleResults = useCallback((locations) => {
        // Expand the sheet to occupy the entire screen
        onSetSize(snapPoints.MAX);
        onResults(locations);
    }, [onResults, onSetSize]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        getValue: () => searchFieldRef.current?.getValue(),
        triggerSearch: () => searchFieldRef.current?.triggerSearch(),
        clear: () => searchFieldRef.current?.clear(),
        focusInput: () => searchFieldRef.current?.focusInput(),
        getInputField: () => searchFieldRef.current?.getInputField(),
        isInputFieldInFocus
    }), [isInputFieldInFocus]);

    return (
        <div className="search__info" style={{ gridTemplateColumns: isKioskContext && showLegendButton ? 'min-content 1fr' : 'auto' }}>
            {isKioskContext && showLegendButton && (
                <button className="search__legend" onClick={() => setShowLegendDialog(true)}>
                    <Legend />
                </button>
            )}

            {/* Search field that allows users to search for locations (MapsIndoors Locations and external) */}
            <label className="search__label">
                <span>{placeholderText}</span>
                <SearchFieldComponent
                    ref={searchFieldRef}
                    mapsindoors={true}
                    placeholder={placeholderText}
                    results={handleResults}
                    clicked={searchFieldClicked}
                    cleared={cleared}
                    category={selectedCategory}
                    onKeyDown={onKeyDown}
                    disabled={searchDisabled} // Disabled initially to prevent content jumping when clicking and changing sheet size.
                />
            </label>
        </div>
    );
});

SearchField.displayName = 'SearchField';

SearchField.propTypes = {
    selectedCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    showLegendButton: PropTypes.bool,
    onResults: PropTypes.func.isRequired,
    onSetSize: PropTypes.func.isRequired,
    onClearResults: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func,
    kioskKeyboardRef: PropTypes.object,
    isInputFieldInFocus: PropTypes.bool.isRequired,
    setIsInputFieldInFocus: PropTypes.func.isRequired,
    isChatModeEnabled: PropTypes.bool
};

export default SearchField;

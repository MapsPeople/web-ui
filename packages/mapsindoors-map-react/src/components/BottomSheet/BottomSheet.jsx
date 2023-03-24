import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ContainerContext } from './ContainerContext';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';

const BOTTOM_SHEETS = {
    SEARCH: 0,
    LOCATION_DETAILS: 1,
    WAYFINDING: 2,
    DIRECTIONS: 3
};

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {Object} props.setCurrentLocation - The setter for the currently selected MapsIndoors Location.
 * @param {Object} props.currentCategories - The unique categories displayed based on the existing locations.
 * @param {function} props.onLocationsFiltered - The list of locations after filtering through the categories.
 * @param {function} props.onHideFloorSelector - Trigger the visibility of the floor selector to be hidden.
 * @param {function} props.onShowFloorSelector- Trigger the visibility of the floor selector to be shown.
 * @param {function} props.onDisableLocations- Trigger the visibility of the floor selector to be shown.
 */
function BottomSheet({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered, onHideFloorSelector, onShowFloorSelector, onDisableLocations }) {

    const bottomSheetRef = useRef();
    const [activeBottomSheet, setActiveBottomSheet] = useState(null);

    const [locationDetailsSheetSize, setLocationDetailsSheetSize] = useState();
    const [locationDetailsSheetSwiped, setLocationDetailsSheetSwiped] = useState();

    const [directions, setDirections] = useState();
    const [wayfindingSheetSize, setWayfindingSheetSize] = useState();
    const [searchSheetSize, setSearchSheetSize] = useState();

    /*
     * React on changes on the current location.
     * Set the search bottom sheet to be active if there is no location selected.
     */
    useEffect(() => {
        setActiveBottomSheet(currentLocation ? BOTTOM_SHEETS.LOCATION_DETAILS : BOTTOM_SHEETS.SEARCH);
    }, [currentLocation]);

    /**
     * Set the active bottom sheet and trigger the visibility of the floor selector to be shown.
     *
     * @param {number} bottomSheet
     */
    function setBottomSheet(bottomSheet) {
        setActiveBottomSheet(bottomSheet);
        onShowFloorSelector();
    }

    /**
     * Navigate to the directions screen and trigger the visibility of the floor selector to be hidden.
     */
    function setDirectionsBottomSheet() {
        setActiveBottomSheet(BOTTOM_SHEETS.DIRECTIONS);
        onHideFloorSelector();
        onDisableLocations();
    }

    const bottomSheets = [
        <Sheet
            minHeight="144"
            preferredSizeSnapPoint={searchSheetSize}
            isOpen={activeBottomSheet === BOTTOM_SHEETS.SEARCH}
            key="A">
            <Search
                onSetSize={size => setSearchSheetSize(size)}
                onLocationClick={(location) => setCurrentLocation(location)}
                categories={currentCategories}
                onLocationsFiltered={(locations) => onLocationsFiltered(locations)}
            />
        </Sheet>,
        <Sheet
            minHeight="128"
            preferredSizeSnapPoint={locationDetailsSheetSize}
            isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS}
            key="B"
            onSwipedToSnapPoint={snapPoint => setLocationDetailsSheetSwiped(snapPoint)}>
            <LocationDetails
                onSetSize={size => setLocationDetailsSheetSize(size)}
                onStartWayfinding={() => setBottomSheet(BOTTOM_SHEETS.WAYFINDING)}
                location={currentLocation}
                onBack={() => setBottomSheet(BOTTOM_SHEETS.SEARCH)}
                snapPointSwiped={locationDetailsSheetSwiped}
            />
        </Sheet>,
        <Sheet
            minHeight="220"
            isOpen={activeBottomSheet === BOTTOM_SHEETS.WAYFINDING}
            preferredSizeSnapPoint={wayfindingSheetSize}
            key="C">
            <Wayfinding
                onSetSize={size => setWayfindingSheetSize(size)}
                onStartDirections={() => setDirectionsBottomSheet()}
                location={currentLocation}
                onDirections={result => setDirections(result)}
                onBack={() => setBottomSheet(BOTTOM_SHEETS.LOCATION_DETAILS)}
                isActive={activeBottomSheet === BOTTOM_SHEETS.WAYFINDING}
            />
        </Sheet>,
        <Sheet
            minHeight="220"
            isOpen={activeBottomSheet === BOTTOM_SHEETS.DIRECTIONS}
            key="D">
            <Directions
                isOpen={activeBottomSheet === BOTTOM_SHEETS.DIRECTIONS}
                directions={directions}
                onBack={() => setBottomSheet(BOTTOM_SHEETS.WAYFINDING)}
                isActive={activeBottomSheet === BOTTOM_SHEETS.DIRECTIONS}
            />
        </Sheet>
    ]

    return <div ref={bottomSheetRef} className='bottom-sheets'>
        <ContainerContext.Provider value={bottomSheetRef}>
            {bottomSheets}
        </ContainerContext.Provider>
    </div>
}

export default BottomSheet;
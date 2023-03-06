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
 */
function BottomSheet({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered }) {

    const bottomSheetRef = useRef();
    const [activeBottomSheet, setActiveBottomSheet] = useState(null);

    const [locationDetailsSheetSize, setLocationDetailsSheetSize] = useState();
    const [locationDetailsSheetSwiped, setLocationDetailsSheetSwiped] = useState();

    /*
     * React on changes on the current location.
     * Set the search bottom sheet to be active if there is no location selected.
     */
    useEffect(() => {
        setActiveBottomSheet(currentLocation ? BOTTOM_SHEETS.LOCATION_DETAILS : BOTTOM_SHEETS.SEARCH);
    }, [currentLocation]);

    const bottomSheets = [
        <Sheet
            minHeight="350"
            isOpen={activeBottomSheet === BOTTOM_SHEETS.SEARCH} key="A">
            <Search
                onLocationClick={(location) => setCurrentLocation(location)}
                categories={currentCategories}
                onLocationsFiltered={(locations) => onLocationsFiltered(locations)} />
        </Sheet>,
        <Sheet
            minHeight="128"
            preferredSizeSnapPoint={locationDetailsSheetSize}
            isOpen={activeBottomSheet === BOTTOM_SHEETS.LOCATION_DETAILS}
            key="B"
            onSwipedToSnapPoint={snapPoint => setLocationDetailsSheetSwiped(snapPoint)}
        >
            <LocationDetails
                onSetSize={size => setLocationDetailsSheetSize(size)}
                onStartWayfinding={() => setActiveBottomSheet(BOTTOM_SHEETS.WAYFINDING)}
                location={currentLocation}
                onBack={() => setActiveBottomSheet(BOTTOM_SHEETS.SEARCH)}
                snapPointSwiped={locationDetailsSheetSwiped}
            />
        </Sheet>,
        <Sheet
            minHeight="220"
            isOpen={activeBottomSheet === BOTTOM_SHEETS.WAYFINDING} key="C">
            <Wayfinding
                isActive={activeBottomSheet === BOTTOM_SHEETS.WAYFINDING}
                onStartDirections={() => setActiveBottomSheet(BOTTOM_SHEETS.DIRECTIONS)}
                location={currentLocation}
                onBack={() => setActiveBottomSheet(BOTTOM_SHEETS.LOCATION_DETAILS)} />
        </Sheet>,
        <Sheet
            minHeight="220"
            isOpen={activeBottomSheet === BOTTOM_SHEETS.DIRECTIONS} key="D">
            <Directions onBack={() => setActiveBottomSheet(BOTTOM_SHEETS.WAYFINDING)} />
        </Sheet>
    ]

    return <div ref={bottomSheetRef} className='bottom-sheets'>
        <ContainerContext.Provider value={bottomSheetRef}>
            {bottomSheets}
        </ContainerContext.Provider>
    </div>
}

export default BottomSheet;
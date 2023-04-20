import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ContainerContext } from './ContainerContext';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';
import LocationsList from '../LocationsList/LocationsList';

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {Object} props.setCurrentLocation - The setter for the currently selected MapsIndoors Location.
 * @param {Object} props.currentCategories - The unique categories displayed based on the existing locations.
 * @param {function} props.onLocationsFiltered - The list of locations after filtering through the categories.
 * @param {string} props.currentVenueName - The currently selected venue.
 * @param {function} props.pushAppView - Function to push to app view to browser history.
 * @param {string} props.currentAppView - Holds the current view/state of the Map Template.
 * @param {array} props.appViews - Array of all possible views.
 * @param {array} props.filteredLocationsByExternalIDs - Array of locations filtered based on the external ID.
 * @param {function} props.onLocationsFilteredByExternalIDs - The list of locations after filtering based on external ID.
 */
function BottomSheet({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered, currentVenueName, pushAppView, currentAppView, appViews, filteredLocationsByExternalIDs, onLocationsFilteredByExternalIDs }) {

    const bottomSheetRef = useRef();

    const [locationDetailsSheetSize, setLocationDetailsSheetSize] = useState();
    const [locationDetailsSheetSwiped, setLocationDetailsSheetSwiped] = useState();

    const [directions, setDirections] = useState();
    const [wayfindingSheetSize, setWayfindingSheetSize] = useState();
    const [searchSheetSize, setSearchSheetSize] = useState();


    /*
     * React on changes on the current location and the locations filtered by external ID.
     */
    useEffect(() => {
        if (currentLocation) {
            pushAppView(appViews.LOCATION_DETAILS, currentLocation);
        } else if (filteredLocationsByExternalIDs?.length > 0) {
            pushAppView(appViews.EXTERNALIDS);
        } else {
            pushAppView(appViews.SEARCH);
        }
    }, [currentLocation, filteredLocationsByExternalIDs]);


    /**
     * Close the location details page and navigate to either the Locations list page or the Search page.
     */
    function closeLocationDetails() {
        if (filteredLocationsByExternalIDs?.length > 0) {
            pushAppView(appViews.EXTERNALIDS);
            setCurrentLocation();
        } else {
            pushAppView(appViews.SEARCH);
            setCurrentLocation();
        }
    }

    /**
     * Close the Locations list page and navigate to the Search page, resetting the filtered locations.
     */
    function closeLocationsList() {
        pushAppView(appViews.SEARCH);
        setCurrentLocation();
        onLocationsFilteredByExternalIDs([]);
    }

    const bottomSheets = [
        <Sheet
            minHeight="144"
            preferredSizeSnapPoint={searchSheetSize}
            isOpen={currentAppView === appViews.SEARCH}
            key="A">
            <Search
                onSetSize={size => setSearchSheetSize(size)}
                onLocationClick={(location) => setCurrentLocation(location)}
                categories={currentCategories}
                onLocationsFiltered={(locations) => onLocationsFiltered(locations)}
                currentVenueName={currentVenueName}
            />
        </Sheet>,
        <Sheet
            minHeight="165"
            isOpen={currentAppView === appViews.EXTERNALIDS}
            key="B">
            <LocationsList
                onBack={() => closeLocationsList()}
                locations={filteredLocationsByExternalIDs}
                onLocationClick={(location) => setCurrentLocation(location)}
                onLocationsFiltered={(locations) => onLocationsFilteredByExternalIDs(locations)}
            />
        </Sheet>,
        <Sheet
            minHeight="128"
            preferredSizeSnapPoint={locationDetailsSheetSize}
            isOpen={currentAppView === appViews.LOCATION_DETAILS}
            key="C"
            onSwipedToSnapPoint={snapPoint => setLocationDetailsSheetSwiped(snapPoint)}>
            <LocationDetails
                onSetSize={size => setLocationDetailsSheetSize(size)}
                onStartWayfinding={() => pushAppView(appViews.WAYFINDING)}
                location={currentLocation}
                onBack={() => closeLocationDetails()}
                snapPointSwiped={locationDetailsSheetSwiped}
            />
        </Sheet>,
        <Sheet
            minHeight="238"
            isOpen={currentAppView === appViews.WAYFINDING}
            preferredSizeSnapPoint={wayfindingSheetSize}
            key="D">
            <Wayfinding
                onSetSize={size => setWayfindingSheetSize(size)}
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                location={currentLocation}
                onDirections={result => setDirections(result)}
                onBack={() => pushAppView(appViews.LOCATION_DETAILS)}
                isActive={currentAppView === appViews.WAYFINDING}
            />
        </Sheet>,
        <Sheet
            minHeight="220"
            isOpen={currentAppView === appViews.DIRECTIONS}
            key="E">
            <Directions
                isOpen={currentAppView === appViews.DIRECTIONS}
                directions={directions}
                onBack={() => pushAppView(appViews.WAYFINDING)}
                isActive={currentAppView === appViews.DIRECTIONS}
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
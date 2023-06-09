import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ContainerContext } from './ContainerContext';
import { useRecoilState, useRecoilValue } from 'recoil';
import currentLocationState from '../../atoms/currentLocationState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import categoriesState from '../../atoms/categoriesState';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';
import LocationsList from '../LocationsList/LocationsList';
import { travelModes } from '../../constants/travelModes';

/**
 * @param {Object} props
 * @param {string} props.directionsFromLocation - Origin Location to be used to instantly show directions.
 * @param {string} props.directionsToLocation - Destination Location to be used to instantly show directions.
 * @param {function} props.pushAppView - Function to push to app view to browser history.
 * @param {string} props.currentAppView - Holds the current view/state of the Map Template.
 * @param {array} props.appViews - Array of all possible views.
 */
function BottomSheet({ directionsFromLocation, directionsToLocation, pushAppView, currentAppView, appViews }) {

    const bottomSheetRef = useRef();

    const [locationDetailsSheetSize, setLocationDetailsSheetSize] = useState();
    const [locationDetailsSheetSwiped, setLocationDetailsSheetSwiped] = useState();

    const [directions, setDirections] = useState();
    const [wayfindingSheetSize, setWayfindingSheetSize] = useState();
    const [searchSheetSize, setSearchSheetSize] = useState();
    const [locationsListSheetSize, setLocationsListSheetSize] = useState();
    const categories = useRecoilValue(categoriesState);
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const [filteredLocationsByExternalIDs, setFilteredLocationsByExternalID] = useRecoilState(filteredLocationsByExternalIDState);
    const [travelMode, setTravelMode] = useState(travelModes.WALKING);

    /*
     * React on changes on the current location and directions locations and set relevant bottom sheet.
     */
    useEffect(() => {
        if (directionsFromLocation && directionsToLocation && currentAppView === appViews.DIRECTIONS) return; // Never change sheet when dependencies change within Directions.

        if (directionsFromLocation && directionsToLocation) {
            pushAppView(appViews.WAYFINDING);
        } else if (currentLocation) {
            pushAppView(appViews.LOCATION_DETAILS, currentLocation);
        } else if (filteredLocationsByExternalIDs?.length > 0) {
            pushAppView(appViews.EXTERNALIDS);
        } else {
            pushAppView(appViews.SEARCH);
        }
    }, [currentLocation, directionsFromLocation, directionsToLocation, filteredLocationsByExternalIDs]);

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
        setFilteredLocationsByExternalID([]);
    }

    const bottomSheets = [
        <Sheet
            minHeight={categories.length > 0 ? "136" : "80"}
            preferredSizeSnapPoint={searchSheetSize}
            isOpen={currentAppView === appViews.SEARCH}
            key="A">
            <Search
                onSetSize={size => setSearchSheetSize(size)}
                onLocationClick={(location) => setCurrentLocation(location)}
            />
        </Sheet>,
        <Sheet
            minHeight="200"
            isOpen={currentAppView === appViews.EXTERNALIDS}
            preferredSizeSnapPoint={locationsListSheetSize}
            key="B">
            <LocationsList
                onSetSize={size => setLocationsListSheetSize(size)}
                onBack={() => closeLocationsList()}
                locations={filteredLocationsByExternalIDs}
                onLocationClick={(location) => setCurrentLocation(location)}
                onLocationsFiltered={(locations) => setFilteredLocationsByExternalID(locations)}
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
                directionsToLocation={directionsToLocation}
                directionsFromLocation={directionsFromLocation}
                onDirections={result => setDirections(result)}
                onBack={() => pushAppView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                isActive={currentAppView === appViews.WAYFINDING}
                setSelectedTravelMode={travelMode => setTravelMode(travelMode)}
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
                selectedTravelMode={travelMode}
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
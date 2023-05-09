import { useEffect, useState } from 'react';
import Modal from './Modal/Modal';
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';

/**
 * @param {Object} props
 * @param {Object} props.currentLocation - The currently selected MapsIndoors Location.
 * @param {Object} props.setCurrentLocation - The setter for the currently selected MapsIndoors Location.
 * @param {Object} props.currentCategories - The unique categories displayed based on the existing locations.
 * @param {function} props.onLocationsFiltered - The list of locations after filtering through the categories.
 * @param {string} props.currentVenueName - The currently selected venue.
 * @param {string} props.directionsFromLocation - Origin Location to be used to instantly show directions.
 * @param {string} props.directionsToLocation - Destination Location to be used to instantly show directions.
 * @param {function} props.pushAppView - Function to push to app view to browser history.
 * @param {string} props.currentAppView - Holds the current view/state of the Map Template.
 * @param {array} props.appViews - Array of all possible views.
 * @param {string} props.selectedMapType - The currently selected map type.
 *
 */
function Sidebar({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered, currentVenueName, directionsFromLocation, directionsToLocation, pushAppView, currentAppView, appViews, selectedMapType }) {
    const [directions, setDirections] = useState();

    /*
     * React on changes on the current location and directions locations and set relevant bottom sheet.
     */
    useEffect(() => {
        if (directionsFromLocation && directionsToLocation) {
            pushAppView(appViews.WAYFINDING);
        } else if (currentLocation && currentAppView !== appViews.LOCATION_DETAILS) {
            pushAppView(appViews.LOCATION_DETAILS, currentLocation);
        } else {
            pushAppView(appViews.SEARCH);
        }
    }, [currentLocation, directionsFromLocation, directionsToLocation]);

    /**
     * Navigate to the search page and reset the location that has been previously selected.
     */
     function setSearchPage() {
        pushAppView(appViews.SEARCH);
        setCurrentLocation();
    }

    const pages = [
        <Modal isOpen={currentAppView === appViews.SEARCH} key="A">
            <Search
                onLocationClick={(location) => setCurrentLocation(location)}
                categories={currentCategories}
                onLocationsFiltered={(locations) => onLocationsFiltered(locations)}
                currentVenueName={currentVenueName}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.LOCATION_DETAILS} key="B">
            <LocationDetails
                onStartWayfinding={() => pushAppView(appViews.WAYFINDING)}
                location={currentLocation}
                onBack={() => setSearchPage()}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.WAYFINDING} key="C">
            <Wayfinding
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                to={currentLocation || directionsToLocation}
                from={directionsFromLocation}
                onDirections={result => setDirections(result)}
                onBack={() => pushAppView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                isActive={currentAppView === appViews.WAYFINDING}
                selectedMapType={selectedMapType}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.DIRECTIONS} key="D">
            <Directions
                isOpen={currentAppView === appViews.DIRECTIONS}
                directions={directions}
                onBack={() => pushAppView(appViews.WAYFINDING)}
            />
        </Modal>
    ]

    return (
        <div>
            {pages}
        </div>
    )
}

export default Sidebar;
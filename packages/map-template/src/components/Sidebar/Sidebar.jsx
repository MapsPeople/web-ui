import { useEffect, useState } from 'react';
import Modal from './Modal/Modal';
import LocationDetails from "../LocationDetails/LocationDetails";
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
 * @param {string} props.directionsFromLocation - Origin Location to be used to instantly show directions.
 * @param {string} props.directionsToLocation - Destination Location to be used to instantly show directions.
 * @param {function} props.pushAppView - Function to push to app view to browser history.
 * @param {string} props.currentAppView - Holds the current view/state of the Map Template.
 * @param {array} props.appViews - Array of all possible views.
 * @param {string} props.selectedMapType - The currently selected map type.
 * @param {array} props.filteredLocationsByExternalIDs - Array of locations filtered based on the external ID.
 * @param {function} props.onLocationsFilteredByExternalIDs - The list of locations after filtering based on external ID.
 *
 */
function Sidebar({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered, currentVenueName, directionsFromLocation, directionsToLocation, pushAppView, currentAppView, appViews, selectedMapType, filteredLocationsByExternalIDs, onLocationsFilteredByExternalIDs }) {
    const [directions, setDirections] = useState();

    /*
     * React on changes on the current location and directions locations and set relevant bottom sheet.
     */
    useEffect(() => {
        if (directionsFromLocation && directionsToLocation) {
            pushAppView(appViews.WAYFINDING);
        } else if (currentLocation && currentAppView !== appViews.LOCATION_DETAILS) {
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
        onLocationsFilteredByExternalIDs([]);
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
        <Modal isOpen={currentAppView === appViews.EXTERNALIDS} key="B">
            <LocationsList
                onBack={() => closeLocationsList()}
                locations={filteredLocationsByExternalIDs}
                onLocationClick={(location) => setCurrentLocation(location)}
                onLocationsFiltered={(locations) => onLocationsFilteredByExternalIDs(locations)}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.LOCATION_DETAILS} key="C">
            <LocationDetails
                onStartWayfinding={() => pushAppView(appViews.WAYFINDING)}
                location={currentLocation}
                onBack={() => closeLocationDetails()}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.WAYFINDING} key="D">
            <Wayfinding
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                currentLocation={currentLocation}
                to={directionsToLocation}
                from={directionsFromLocation}
                onDirections={result => setDirections(result)}
                onBack={() => pushAppView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                isActive={currentAppView === appViews.WAYFINDING}
                selectedMapType={selectedMapType}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.DIRECTIONS} key="E">
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
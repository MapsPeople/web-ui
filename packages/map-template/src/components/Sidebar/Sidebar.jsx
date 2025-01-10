import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import currentLocationState from '../../atoms/currentLocationState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import Modal from './Modal/Modal';
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';
import LocationsList from '../LocationsList/LocationsList';
import locationIdState from '../../atoms/locationIdState';
import kioskLocationState from '../../atoms/kioskLocationState';

/**
 * @param {Object} props
 * @param {string} props.directionsFromLocation - Origin Location to be used to instantly show directions.
 * @param {string} props.directionsToLocation - Destination Location to be used to instantly show directions.
 * @param {function} props.pushAppView - Function to push to app view to browser history.
 * @param {string} props.currentAppView - Holds the current view/state of the Map Template.
 * @param {array} props.appViews - Array of all possible views.
 * @param {array} props.filteredLocationsByExternalIDs - Array of locations filtered based on the external ID.
 * @param {function} props.onRouteFinished - Callback that fires when the route has finished.
 *
 */
function Sidebar({ directionsFromLocation, directionsToLocation, pushAppView, currentAppView, appViews, onRouteFinished }) {
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const [filteredLocationsByExternalIDs, setFilteredLocationsByExternalID] = useRecoilState(filteredLocationsByExternalIDState);
    const [, setLocationId] = useRecoilState(locationIdState);
    const kioskLocation = useRecoilValue(kioskLocationState)

    /*
     * React on changes on the current location and directions locations and set relevant bottom sheet.
     */
    useEffect(() => {
        if (directionsFromLocation && directionsToLocation && currentAppView === appViews.DIRECTIONS) return; // Never change modal when dependencies change within Directions.

        if (directionsFromLocation && directionsToLocation) {
            pushAppView(appViews.WAYFINDING);
        } else if (directionsFromLocation) {
            pushAppView(appViews.WAYFINDING);
        } else if (currentLocation) {
            pushAppView(appViews.LOCATION_DETAILS, currentLocation);
        } else if (filteredLocationsByExternalIDs?.length > 1) {
            pushAppView(appViews.EXTERNALIDS);
            // If there is only one external ID, behave the same as having the location ID prop. 
        } else if (filteredLocationsByExternalIDs?.length === 1) {
            setCurrentLocation(filteredLocationsByExternalIDs[0])
            setLocationId(filteredLocationsByExternalIDs[0].id)
        } else {
            pushAppView(appViews.SEARCH);
        }
    }, [currentLocation, directionsFromLocation, directionsToLocation, filteredLocationsByExternalIDs]);

    /**
     * Close the location details page and navigate to either the Locations list page or the Search page.
     */
    function closeLocationDetails() {
        if (filteredLocationsByExternalIDs?.length > 1) {
            pushAppView(appViews.EXTERNALIDS);
            setCurrentLocation();
        } else if (filteredLocationsByExternalIDs?.length === 1) {
            pushAppView(appViews.SEARCH);
            setCurrentLocation();
            setFilteredLocationsByExternalID([]);
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

    /**
     * Close the Directions page and navigate to the different pages based on the kioskLocation.
     */
    function closeDirections() {
        if (kioskLocation) {
            pushAppView(appViews.LOCATION_DETAILS)
        } else {
            pushAppView(appViews.WAYFINDING)
        }
    }

    const pages = [
        <Modal isOpen={currentAppView === appViews.SEARCH} key="A">
            <Search isOpen={currentAppView === appViews.SEARCH} />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.EXTERNALIDS} key="B">
            <LocationsList
                onBack={() => closeLocationsList()}
                locations={filteredLocationsByExternalIDs}
                onLocationClick={(location) => setCurrentLocation(location)}
                onLocationsFiltered={(locations) => setFilteredLocationsByExternalID(locations)}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.LOCATION_DETAILS} key="C">
            <LocationDetails
                onStartWayfinding={() => pushAppView(appViews.WAYFINDING)}
                onBack={() => closeLocationDetails()}
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                isOpen={currentAppView === appViews.LOCATION_DETAILS}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.WAYFINDING} key="D">
            <Wayfinding
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                directionsToLocation={directionsToLocation}
                directionsFromLocation={directionsFromLocation}
                onBack={() => pushAppView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                isActive={currentAppView === appViews.WAYFINDING}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.DIRECTIONS} key="E">
            <Directions
                isOpen={currentAppView === appViews.DIRECTIONS}
                onBack={() => closeDirections()}
                onRouteFinished={() => onRouteFinished()}
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
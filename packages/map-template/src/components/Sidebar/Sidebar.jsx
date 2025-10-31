import { useEffect, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import currentLocationState from '../../atoms/currentLocationState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import Modal from './Modal/Modal';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';
import LocationsList from '../LocationsList/LocationsList';
import ChatWindow from '../ChatWindow/ChatWindow';
import locationIdState from '../../atoms/locationIdState';
import kioskLocationState from '../../atoms/kioskLocationState';
import PropTypes from 'prop-types';

Sidebar.propTypes = {
    directionsFromLocation: PropTypes.string,
    directionsToLocation: PropTypes.string,
    pushAppView: PropTypes.func,
    currentAppView: PropTypes.string,
    appViews: PropTypes.object,
    filteredLocationsByExternalIDs: PropTypes.array,
    onRouteFinished: PropTypes.func
};

/**
 * The Sidebar component is responsible for rendering other components (Search, Wayfinding etc.) in a sidebar.
 * It is used on larger screens. On smaller screens, the BottomSheet component is used.
 *
 * On kiosk screens, the sidebar is centered in the middle of the screen.
 *
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
    const [, setFilteredLocations] = useRecoilState(filteredLocationsState);
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

    /**
     * Handle chat search results by fetching Location objects from IDs and setting them in filteredLocations state.
     * This will trigger the MapWrapper to highlight these locations on the map.
     *
     * @param {Array<string>} locationIds - Array of MapsIndoors location IDs
     */
    const handleChatSearchResults = useCallback(async (locationIds) => {
        if (!locationIds || locationIds.length === 0) {
            setFilteredLocations([]);
            return;
        }

        try {
            const promises = locationIds.map(id =>
                window.mapsindoors.services.LocationsService.getLocation(id)
            );
            const locations = await Promise.all(promises);
            const validLocations = locations.filter(location => location !== null);

            // Set the locations in filteredLocations state
            // MapWrapper will automatically watch this state and highlight the locations on the map
            setFilteredLocations(validLocations);
        } catch (error) {
            setFilteredLocations([]);
        }
    }, [setFilteredLocations]);

    const pages = [
        <Modal isOpen={currentAppView === appViews.SEARCH} key="SEARCH">
            <Search 
                isOpen={currentAppView === appViews.SEARCH} 
                onOpenChat={() => pushAppView(appViews.CHAT)}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.EXTERNALIDS} key="EXTERNALIDS">
            <LocationsList
                onBack={() => closeLocationsList()}
                locations={filteredLocationsByExternalIDs}
                onLocationClick={(location) => setCurrentLocation(location)}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.LOCATION_DETAILS} key="LOCATION_DETAILS">
            <LocationDetails
                onStartWayfinding={() => pushAppView(appViews.WAYFINDING)}
                onBack={() => closeLocationDetails()}
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                isOpen={currentAppView === appViews.LOCATION_DETAILS}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.WAYFINDING} key="WAYFINDING">
            <Wayfinding
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                directionsToLocation={directionsToLocation}
                directionsFromLocation={directionsFromLocation}
                onBack={() => pushAppView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                isActive={currentAppView === appViews.WAYFINDING}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.DIRECTIONS} key="DIRECTIONS">
            <Directions
                isOpen={currentAppView === appViews.DIRECTIONS}
                onBack={() => closeDirections()}
                onRouteFinished={() => onRouteFinished()}
            />
        </Modal>,
        <Modal isOpen={currentAppView === appViews.CHAT} key="CHAT">
            <ChatWindow
                isVisible={currentAppView === appViews.CHAT}
                onClose={() => pushAppView(appViews.SEARCH)}
                onSearchResults={handleChatSearchResults}
                onShowRoute={(directionIds) => {
                    console.log('Sidebar: Received chat directions:', directionIds);
                    // TODO: Implement wayfinding with origin/destination location IDs
                }}
            />
        </Modal>
    ];

    return (
        <div>
            {pages}
        </div>
    )
}

export default Sidebar;
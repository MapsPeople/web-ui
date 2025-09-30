import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ContainerContext } from './ContainerContext';
import { useRecoilState } from 'recoil';
import currentLocationState from '../../atoms/currentLocationState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import Sheet from './Sheet/Sheet';
import './BottomSheet.scss';
import LocationDetails from '../LocationDetails/LocationDetails';
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';
import LocationsList from '../LocationsList/LocationsList';
import locationIdState from '../../atoms/locationIdState';
import chatDirectionsState from '../../atoms/chatDirectionsState';
import directionsResponseState from '../../atoms/directionsResponseState';
import useDirectionsFromChat from '../../hooks/useDirectionsFromChat';
import PropTypes from 'prop-types';
import { snapPoints } from '../../constants/snapPoints';

BottomSheet.propTypes = {
    directionsFromLocation: PropTypes.string,
    directionsToLocation: PropTypes.string,
    pushAppView: PropTypes.func.isRequired,
    currentAppView: PropTypes.string,
    appViews: PropTypes.object,
    onRouteFinished: PropTypes.func.isRequired
};
/**
 * The BottomSheet component is responsible for rendering other components (Search, Wayfinding etc.) in a bottom sheet.
 * It is used on smaller screens. On larger screens, the Sidebar component is used.
 *
 * All components are wrapped in a Sheet component, which handles user interactions (swiping to control the sheet size etc.).
 *
 * @param {Object} props
 * @param {string} props.directionsFromLocation - Origin Location to be used to instantly show directions.
 * @param {string} props.directionsToLocation - Destination Location to be used to instantly show directions.
 * @param {function} props.pushAppView - Function to push to app view to browser history.
 * @param {string} props.currentAppView - Holds the current view/state of the Map Template.
 * @param {array} props.appViews - Array of all possible views.
 * @param {function} props.onRouteFinished - Callback that fires when the route has finished.
 *
 */
function BottomSheet({ directionsFromLocation, directionsToLocation, pushAppView, currentAppView, appViews, onRouteFinished }) {

    const bottomSheetRef = useRef();

    // References to the Sheet components for each individual component.
    const searchSheetRef = useRef();
    const locationsListSheetRef = useRef();
    const locationDetailsSheetRef = useRef();
    const wayfindingSheetRef = useRef();
    const directionsSheetRef = useRef();

    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);

    // Holds boolean depicting if the current Location contains more information than just the basic info that is shown in minimal height bottom sheet.
    const [currentLocationIsDetailed, setCurrentLocationIsDetailed] = useState(false);

    const [filteredLocationsByExternalIDs, setFilteredLocationsByExternalID] = useRecoilState(filteredLocationsByExternalIDState);

    const [, setLocationId] = useRecoilState(locationIdState);
    const [chatDirections, setChatDirections] = useRecoilState(chatDirectionsState);
    const [, setDirectionsResponse] = useRecoilState(directionsResponseState);

    // Hook for handling directions from chat
    const { resolveDirectionsFromChat } = useDirectionsFromChat();

    /*
     * React on changes on the current location and directions locations and set relevant bottom sheet.
     */
    useEffect(() => {
        if (directionsFromLocation && directionsToLocation && currentAppView === appViews.DIRECTIONS) return; // Never change sheet when dependencies change within Directions.

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

    /*
     * Clear chat directions when navigating away from wayfinding.
     */
    useEffect(() => {
        if (currentAppView !== appViews.WAYFINDING && currentAppView !== appViews.DIRECTIONS) {
            // Clear chat directions when not in wayfinding or directions mode
            if (chatDirections.originLocation || chatDirections.destinationLocation) {
                setChatDirections({ originLocation: null, destinationLocation: null });
            }
        }
    }, [currentAppView, chatDirections, setChatDirections]);

    /*
     * React on changes on the current location and check if it contains more information than just the basic info that is shown in minimal height bottom sheet.
     * If that is the case, we show a little more to indicate to the user that there is more information to be seen.
     */
    useEffect(() => {
        if (currentLocation) {
            const isDetailed = currentLocation.properties.imageURL
                || currentLocation.properties.description
                || currentLocation.properties.additionalDetails
                || Object.keys(currentLocation.properties.categories).length > 0;

            setCurrentLocationIsDetailed(isDetailed);
        }
    }, [currentLocation]);

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
            // Reset the search sheet height to its minimum size when closing location details
            searchSheetRef.current.setSnapPoint(snapPoints.MIN);
        } else {
            pushAppView(appViews.SEARCH);
            setCurrentLocation();
            searchSheetRef.current.setSnapPoint(snapPoints.MIN);
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
     * Handle "Show Route" button click from chat window.
     * Navigates immediately to directions view and resolves locations in the background.
     *
     * @param {Object} locationIds - Object containing originLocationId and destinationLocationId
     */
    async function handleShowRoute(locationIds) {
        try {
            console.log('Starting route resolution for:', locationIds);
            
            // Resolve locations in the background (non-blocking)
            const resolvedLocations = await resolveDirectionsFromChat(locationIds);

            // Navigate to the directions view
            pushAppView(appViews.DIRECTIONS);
            
            if (resolvedLocations && (resolvedLocations.originLocation || resolvedLocations.destinationLocation)) {
                console.log('Successfully resolved locations in background:', resolvedLocations);
                
                // Set the resolved locations in the chat directions state
                setChatDirections({
                    originLocation: resolvedLocations.originLocation,
                    destinationLocation: resolvedLocations.destinationLocation
                });
                
                // If we have directions data, set it in the directions response state
                if (resolvedLocations.directionsResult && resolvedLocations.totalDistance && resolvedLocations.totalTime) {
                    setDirectionsResponse({
                        originLocation: resolvedLocations.originLocation,
                        destinationLocation: resolvedLocations.destinationLocation,
                        totalDistance: resolvedLocations.totalDistance,
                        totalTime: resolvedLocations.totalTime,
                        directionsResult: resolvedLocations.directionsResult
                    });
                }
            } else {
                console.error('Failed to resolve locations for wayfinding');
            }
        } catch (error) {
            console.error('Error handling show route:', error);
        }
    }

    const bottomSheets = [
        <Sheet
            minimizedHeight={80}
            initialSnapPoint={snapPoints.MIN}
            key="SEARCH"
            isOpen={currentAppView === appViews.SEARCH}
            ref={searchSheetRef}
        >
            <Search
                isOpen={currentAppView === appViews.SEARCH}
                onSetSize={size => searchSheetRef.current.setSnapPoint(size)}
                onShowRoute={handleShowRoute}
            />
        </Sheet>,
        <Sheet
            minimizedHeight={200}
            isOpen={currentAppView === appViews.EXTERNALIDS}
            initialSnapPoint={snapPoints.MIN}
            key="EXTERNALIDS"
            ref={locationsListSheetRef}
        >
            <LocationsList
                onSetSize={size => locationsListSheetRef.current.setSnapPoint(size)}
                onBack={() => closeLocationsList()}
                locations={filteredLocationsByExternalIDs}
                onLocationClick={location => setCurrentLocation(location)}
            />
        </Sheet>,
        <Sheet
            minimizedHeight={currentLocationIsDetailed ? 180 : 136}
            key="LOCATION_DETAILS"
            initialSnapPoint={snapPoints.MIN}
            isOpen={currentAppView === appViews.LOCATION_DETAILS}
            ref={locationDetailsSheetRef}
        >
            <LocationDetails
                onSetSize={size => locationDetailsSheetRef.current.setSnapPoint(size)}
                onStartWayfinding={() => pushAppView(appViews.WAYFINDING)}
                onBack={() => closeLocationDetails()}
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                isOpen={currentAppView === appViews.LOCATION_DETAILS}
            />
        </Sheet>,
        <Sheet
            minimizedHeight={190}
            key="WAYFINDING"
            initialSnapPoint={snapPoints.FIT}
            isOpen={currentAppView === appViews.WAYFINDING}
            ref={wayfindingSheetRef}
        >
            <Wayfinding
                onSetSize={size => wayfindingSheetRef.current.setSnapPoint(size)}
                onStartDirections={() => pushAppView(appViews.DIRECTIONS)}
                directionsToLocation={chatDirections.destinationLocation || directionsToLocation}
                directionsFromLocation={chatDirections.originLocation || directionsFromLocation}
                onBack={() => pushAppView(currentLocation ? appViews.LOCATION_DETAILS : appViews.SEARCH)}
                isActive={currentAppView === appViews.WAYFINDING}
            ></Wayfinding>
        </Sheet>,
        <Sheet
            minimizedHeight={273}
            isOpen={currentAppView === appViews.DIRECTIONS}
            initialSnapPoint={snapPoints.FIT}
            ref={directionsSheetRef}
            key="DIRECTIONS"
        >
            <Directions
                onSetSize={size => directionsSheetRef.current.setSnapPoint(size)}
                isOpen={currentAppView === appViews.DIRECTIONS}
                onBack={() => pushAppView(appViews.WAYFINDING)}
                onRouteFinished={() => onRouteFinished()}
            />
        </Sheet>
    ];

    return <div ref={bottomSheetRef} className="bottom-sheets">
        <ContainerContext.Provider value={bottomSheetRef}>
            {bottomSheets}
        </ContainerContext.Provider>
    </div>
}

export default BottomSheet;
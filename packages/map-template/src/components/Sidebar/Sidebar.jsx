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
import currentVenueNameState from '../../atoms/currentVenueNameState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import { calculateBounds } from '../../helpers/CalculateBounds';
import { booleanWithin, bboxPolygon } from '@turf/turf';
import startZoomLevelState from '../../atoms/startZoomLevelState';
import setMapZoomLevel from '../../helpers/SetMapZoomLevel';

/**
 * @param {Object} props
 * @param {string} props.directionsFromLocation - Origin Location to be used to instantly show directions.
 * @param {string} props.directionsToLocation - Destination Location to be used to instantly show directions.
 * @param {function} props.pushAppView - Function to push to app view to browser history.
 * @param {string} props.currentAppView - Holds the current view/state of the Map Template.
 * @param {array} props.appViews - Array of all possible views.
 * @param {array} props.filteredLocationsByExternalIDs - Array of locations filtered based on the external ID.
 *
 */
function Sidebar({ directionsFromLocation, directionsToLocation, pushAppView, currentAppView, appViews }) {
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const [currentVenue, setCurrentVenueName] = useRecoilState(currentVenueNameState);
    const [filteredLocationsByExternalIDs, setFilteredLocationsByExternalID] = useRecoilState(filteredLocationsByExternalIDState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const startZoomLevel = useRecoilValue(startZoomLevelState);

    /*
     * React on changes on the current location and directions locations and set relevant bottom sheet.
     */
    useEffect(() => {
        if (directionsFromLocation && directionsToLocation && currentAppView === appViews.DIRECTIONS) return; // Never change modal when dependencies change within Directions.

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


    /**
     * Get left padding for directions on desktop.
     */
    function getDesktopPaddingLeft() {
        // The width of the sidebar plus adequate padding
        const sidebar = document.querySelector('.modal--open');
        return sidebar.offsetWidth + sidebar.offsetLeft * 2;
    }

    /**
     * Handle locations clicked on the map.
     */
    function onLocationClicked(location) {
        setCurrentLocation(location);

        // Set the current venue to be the selected location venue.
        if (location.properties.venueId !== currentVenue) {
            setCurrentVenueName(location.properties.venueId);
        }

        const currentFloor = mapsIndoorsInstance.getFloor();
        const locationFloor = location.properties.floor;

        // Set the floor to the one that the location belongs to.
        if (locationFloor !== currentFloor) {
            mapsIndoorsInstance.setFloor(locationFloor);
            const floorSelectorElement = document.querySelector('mi-floor-selector');
            floorSelectorElement.onFloorChanged(locationFloor)
        }

        // Get the map view bounds
        const mapViewBounds = mapsIndoorsInstance.getMapView().getBounds();
        // Calculate the map view bbox
        const mapViewBbox = [mapViewBounds.west, mapViewBounds.south, mapViewBounds.east, mapViewBounds.north];
        // Calculate the location bbox
        const locationBbox = calculateBounds(location.geometry)

        // Convert the location and map view to bbox polygon
        const locationBboxPolygon = bboxPolygon(locationBbox);
        const mapViewBboxPolygon = bboxPolygon(mapViewBbox);

        // Check if the selected location is in the map view
        const isLocationWithinMapView = booleanWithin(locationBboxPolygon, mapViewBboxPolygon);

        // The selected location geometry
        const locationGeometry = location.geometry.type === 'Point' ? location.geometry.coordinates : location.properties.anchor.coordinates;

        if (!isLocationWithinMapView) {
            
            // If there is a startZoomLevel, set the map zoom to that
            // Else call the function to check the max zoom level supported on the solution
            if (startZoomLevel) {
                mapsIndoorsInstance?.setZoom(startZoomLevel);
            } else {
                setMapZoomLevel(mapsIndoorsInstance);
            }

            console.log('not in map view')
            mapsIndoorsInstance.getMapView().setCenter({ lat: locationGeometry[1], lng: locationGeometry[0] });
        } else {

            console.log('in map view')
            const padding = 200;
            let coordinates = { west: locationBbox[0], south: locationBbox[1], east: locationBbox[2], north: locationBbox[3] }
            mapsIndoorsInstance.getMapView().fitBounds(coordinates, { top: padding, right: padding, bottom: padding, left: getDesktopPaddingLeft() });
        }
    }

    const pages = [
        <Modal isOpen={currentAppView === appViews.SEARCH} key="A">
            <Search
                onLocationClick={(location) => onLocationClicked(location)}
            />
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
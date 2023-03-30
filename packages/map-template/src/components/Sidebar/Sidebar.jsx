import { useEffect, useState } from 'react';
import Modal from './Modal/Modal';
import LocationDetails from "../LocationDetails/LocationDetails";
import Wayfinding from '../Wayfinding/Wayfinding';
import Directions from '../Directions/Directions';
import Search from '../Search/Search';

const VIEWS = {
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
 * @param {function} props.onLocationsFiltered - The list of locations after filtering through the categories.
 * @param {function} props.onDirectionsOpened - Check if the directions page state is open.
 * @param {function} props.onDirectionsClosed - Check if the directions page state is closed.
 *
*/
function Sidebar({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered, onDirectionsOpened, onDirectionsClosed }) {
    const [activePage, setActivePage] = useState(null);

    const [directions, setDirections] = useState();

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : VIEWS.SEARCH);
    }, [currentLocation]);

    /**
     * Set the active page and trigger the visibility of the floor selector to be shown.
     *
     * @param {number} page
     */
    function setPage(page) {
        setActivePage(page);
        onDirectionsClosed();
    }

    /**
     * Navigate to the directions page and trigger the visibility of the floor selector to be hidden.
     */
    function setDirectionsPage() {
        setActivePage(VIEWS.DIRECTIONS);
        onDirectionsOpened();

    }

    const pages = [
        <Modal isOpen={activePage === VIEWS.SEARCH} key="A">
            <Search
                onLocationClick={(location) => setCurrentLocation(location)}
                categories={currentCategories}
                onLocationsFiltered={(locations) => onLocationsFiltered(locations)}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.LOCATION_DETAILS} key="B">
            <LocationDetails
                onStartWayfinding={() => setPage(VIEWS.WAYFINDING)}
                location={currentLocation}
                onBack={() => setPage(VIEWS.SEARCH)}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.WAYFINDING} key="C">
            <Wayfinding
                onStartDirections={() => setDirectionsPage()}
                location={currentLocation}
                onDirections={result => setDirections(result)}
                onBack={() => setPage(VIEWS.LOCATION_DETAILS)}
                isActive={activePage === VIEWS.WAYFINDING}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.DIRECTIONS} key="D">
            <Directions
                isOpen={activePage === VIEWS.DIRECTIONS}
                directions={directions}
                onBack={() => setPage(VIEWS.WAYFINDING)}
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
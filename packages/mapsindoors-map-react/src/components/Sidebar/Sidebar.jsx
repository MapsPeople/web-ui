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
 * @param {function} props.onLocationsSearched - The list of locations after search is performed.
*/
function Sidebar({ currentLocation, setCurrentLocation, currentCategories, onLocationsFiltered, onLocationsSearched }) {
    const [activePage, setActivePage] = useState(null);

    /*
    * React on changes on the current location.
    */
    useEffect(() => {
        setActivePage(currentLocation ? VIEWS.LOCATION_DETAILS : VIEWS.SEARCH);
    }, [currentLocation]);

    const pages = [
        <Modal isOpen={activePage === VIEWS.SEARCH} key="A">
            <Search
                onLocationClick={(location) => setCurrentLocation(location)}
                categories={currentCategories}
                onLocationsFiltered={(locations) => onLocationsFiltered(locations)}
                onLocationsSearched={(locations) => onLocationsSearched(locations)}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.LOCATION_DETAILS} key="B">
            <LocationDetails
                onStartWayfinding={() => setActivePage(VIEWS.WAYFINDING)}
                location={currentLocation}
                onBack={() => setActivePage(VIEWS.SEARCH)}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.WAYFINDING} key="C">
            <Wayfinding
                onStartDirections={() => setActivePage(VIEWS.DIRECTIONS)}
                location={currentLocation}
                onBack={() => setActivePage(VIEWS.LOCATION_DETAILS)}
            />
        </Modal>,
        <Modal isOpen={activePage === VIEWS.DIRECTIONS} key="D">
            <Directions onBack={() => setActivePage(VIEWS.WAYFINDING)} />
        </Modal>
    ]

    return (
        <div>
            {pages}
        </div>
    )
}

export default Sidebar;
import React from "react";
import './LocationsList.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import ListItemLocation from "../WebComponentWrappers/ListItemLocation/ListItemLocation";

/**
 * Show list of locations.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location is clicked.
 * @param {function} props.onBack - Function that is run when the user navigates to the previous page.
 * @param {array} props.filteredLocationsByExternalIDs - Array of locations filtered based on the external ID.
 * @param {function} props.onLocationsFilteredByExternalIDs - Function that handles the filtered locations by external ID on the map.
 *
 */
function LocationsList({ onBack, onLocationClick, filteredLocationsByExternalIDs, onLocationsFilteredByExternalIDs }) {

    /**
     * Close the external ID page and navigate to the search.
     * Clear the filtered locations by external ID on the map.
     */
    function back() {
        onBack();
        onLocationsFilteredByExternalIDs([]);
    }

    return (
        <div className="locations-list">
            <div className="locations-list__header">
                <div className="locations-list__title">{filteredLocationsByExternalIDs?.length} Locations</div>
                <button className="locations-list__close" onClick={() => back()} aria-label="Close">
                    <CloseIcon />
                </button>
            </div>
            <div className="locations-list__list">
                {filteredLocationsByExternalIDs?.map(location =>
                    <ListItemLocation
                        key={location.id}
                        location={location}
                        locationClicked={e => onLocationClick(e)}
                    />
                )}
            </div>
        </div>
    )
}

export default LocationsList;

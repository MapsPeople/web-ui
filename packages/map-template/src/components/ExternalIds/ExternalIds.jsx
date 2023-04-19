import React from "react";
import './ExternalIDs.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import ListItemLocation from "../WebComponentWrappers/ListItemLocation/ListItemLocation";

/**
 * Show list of locations filtered based on external IDs.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location is clicked.
 * @param {function} props.onBack - Function that is run when the user navigates to the previous page.
 * @param {array} props.filteredLocationsByExternalIDs - Array of locations filtered based on the external ID.
 * @param {function} props.onLocationsFilteredByExternalIDs - Function that handles the filtered locations by external ID on the map.
 *
 */

function ExternalIDs({ onBack, onLocationClick, filteredLocationsByExternalIDs, onLocationsFilteredByExternalIDs }) {

    /**
     * Close the external ID page and navigate to the search.
     * Clear the filtered locations by external ID on the map.
     */
    function back() {
        onBack();
        onLocationsFilteredByExternalIDs([]);
    }

    return (
        <div className="externalIDs">
            <div className="externalIDs__header">
                <div className="externalIDs__title">{filteredLocationsByExternalIDs?.length} Locations</div>
                <button className="externalIDs__close" onClick={() => back()} aria-label="Close">
                    <CloseIcon />
                </button>
            </div>
            <div className="externalIDs__list">
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

export default ExternalIDs;

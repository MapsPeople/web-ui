import React from "react";
import './ExternalIds.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import ListItemLocation from "../WebComponentWrappers/ListItemLocation/ListItemLocation";

/**
 * Show list of location filtered based on external ids.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location is clicked.
 * @param {function} props.onBack - Function that is run when the user navigates to the previous page.
 * @param {array} props.filteredLocationsByExternalIds - Array of locations filtered based on the external id.
 *
 */
function ExternalIds({ onBack, onLocationClick, filteredLocationsByExternalIds }) {
    return (
        <div className="externalIds">
            <div className="externalIds__header">
                <div className="externalIds__title">External Ids</div>
                <button className="externalIds__close" onClick={() => onBack()} aria-label="Close">
                    <CloseIcon />
                </button>
            </div>
            <div className="externalIds__list">
                {filteredLocationsByExternalIds?.map(location => <ListItemLocation
                    key={location.id}
                    location={location}
                    locationClicked={e => onLocationClick(e)} />)}
            </div>
        </div>
    )
}

export default ExternalIds;
